/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState, useRef } from 'react';

import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useQuery } from '@tanstack/react-query';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { ButtonType } from '@enums/button';
import { formatDate, parseDateStringToDate } from '@utils/dashboardFunction';
import { VDivider } from 'lib/components/blocks/divider';
import { GlobalContainer } from 'lib/context/globalContext';
import HolidaySidebar from './holidaySidebar';
import DeleteSidebar from './deleteSidebar';
import { getCompanyDetails } from '@utils/companyDetailsGetter';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { useParams } from 'next/navigation';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import axios from 'axios';
import { classNames } from 'primereact/utils';
interface HolidaySideBarConfig {
  isHoliday: boolean;
  title: string;
  submitBtnText?: string;
  action: string;
  rowData?: object;
  holidayId?: string;
  isOpen: boolean;
}

function Holidays() {
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [valueSearchText, setValueSearchText] = useState('');

  const [holidaySideBarConfig, setHolidaySideBarConfig] =
    useState<HolidaySideBarConfig>({
      isHoliday: true,
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      holidayId: '',
      isOpen: false,
    });

  const [deleteSidebarConfig, setDeleteSidebarConfig] =
    useState<DeleteSidebarConfig>({
      header: '',
      subHeader: '',
      submitText: '',
      cancelText: '',
      rowData: {},
      isOpen: false,
    });

  const [companyId, setCompanyId] = useState('');
  const context = React.useContext(GlobalContainer);
  const toast = useRef<Toast>(null);
  const [first, setFirst] = useState(0);
  const params = useParams();

  useEffect(() => {
    async function getCompanyId() {
      let id = null;
      if (
        context?.authRole === 'SUPER_ADMIN' &&
        params?.companyId !== undefined
      ) {
        id = Number(params.companyId);
      } else {
        if ('companyId' in context?.userData) {
          const userData = context?.userData;
          if ('companyId' in userData) {
            id = userData.companyId;
          }
        }
      }

      setCompanyId(id);
    }

    getCompanyId();
  }, [params, params?.companyId]);

  const fetchHolidays = async ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) => {
    try {
      const response = await fetch(
        `/api/holidays?limit=${limit}&offset=${offset}&search=${valueSearchText}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );

      if (response) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['holidays', pagination],
    refetchOnMount: false,
    queryFn: async () => fetchHolidays(pagination),
  });

  useEffect(() => {
    refetch();
  }, [valueSearchText]);

  function renderActions(rowData: any) {
    if (isLoading) return <Skeleton />;
    return (
      <div className="flex flex-row">
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          onClick={async () => {
            const res = await axios.get(
              `/api/holidays/${rowData.holidayId}/validate?action=edit`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            if (res.data.success) {
              if (res.data.message.hasPendingPayroll) {
                toast.current?.replace({
                  severity: 'error',
                  summary: 'Holiday Edit',
                  detail:
                    'Holiday cannot be updated as it has pending payroll data relying on this holiday. Please unpost pending payroll data and try again.',
                  life: 10000,
                });
              } else if (res.data.message.hasPostedPayroll) {
                toast.current?.replace({
                  severity: 'error',
                  summary: 'Holiday Edit',
                  detail:
                    'Holiday cannot be updated as it has posted payroll data relying on this holiday.',
                  life: 5000,
                });
              } else {
                setHolidaySideBarConfig({
                  isHoliday: true,
                  title: 'Update Holiday   ',
                  submitBtnText: 'Update',
                  action: 'edit',
                  rowData: rowData,
                  holidayId: rowData.holidayId,
                  isOpen: true,
                });
              }
              // setHolidaySideBarConfig({
              //   isHoliday: true,
              //   title: 'Update Holiday  ',
              //   submitBtnText: 'Update',
              //   action: 'edit',
              //   rowData: rowData,
              //   holidayId: rowData.holidayId,
              //   isOpen: true,
              // });
            }
          }}
        />
        <VDivider />
        <Button
          type="button"
          text
          icon="pi pi-trash"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={async () => {
            const res = await axios.get(
              `/api/holidays/${rowData.holidayId}/validate?action=delete`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                },
              }
            );
            if (res.data.success) {
              if (res.data.message.hasPostedPayroll) {
                toast.current?.replace({
                  severity: 'error',
                  summary: 'Holiday Deletion',
                  detail:
                    'Holiday cannot be deleted as it has posted payroll data relying on this holiday.',
                  life: 5000,
                });
              } else {
                setDeleteSidebarConfig({
                  header: `Delete ${rowData.holidayName}`,
                  subHeader:
                    'Removing this holiday cannot be undone. Deleting the holiday will also unpost attendance data that contains this holiday. Are you sure you want to continue?',
                  submitText: 'Delete',
                  cancelText: 'Cancel',
                  rowData: rowData,
                  isOpen: true,
                });
              }
            }
            // setDeleteSidebarConfig({
            //   header: `Delete ${rowData.holidayName}`,
            //   subHeader:
            //     'Removing this holiday cannot be undone. Are you sure you want to continue?',
            //   submitText: 'Delete',
            //   cancelText: 'Cancel',
            //   rowData: rowData,
            //   isOpen: true,
            // });
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Company > Holidays"
        buttons={[
          {
            label: 'Add Holiday',
            type: ButtonType.Red,
            isDropdown: false,
            isIcon: false,
            handler: () => {
              setHolidaySideBarConfig({
                isHoliday: true,
                title: 'Add New Holiday  ',
                submitBtnText: 'Create',
                action: 'add',
                isOpen: true,
              });
            },
          },
        ]}
        searchPlaceholder=""
        isShowSearch={true}
        valueSearchText={valueSearchText}
        setValueSearchText={setValueSearchText}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {error ? (
            <ErrorDialog />
          ) : (
            <DataTable
              value={
                isLoading
                  ? [
                      {
                        dummy: '',
                      },
                      {
                        dummy: '',
                      },
                      {
                        dummy: '',
                      },
                    ]
                  : data.message.rows
              }
              selectionMode={'single'}
              onSelectionChange={(e) => {
                if (isLoading) return null;
                const rowData = e.value;
                setHolidaySideBarConfig({
                  isHoliday: true,
                  title: 'View Holiday',
                  action: 'view',
                  rowData: e.value,
                  isOpen: true,
                  holidayId: rowData.holidayId,
                });
              }}
              rowsPerPageOptions={[5, 10, 25]}
              tableStyle={{ minWidth: '50rem' }}
            >
              <Column
                field="holidayDate"
                header="Holiday Date"
                body={(rowData) => {
                  if (isLoading) return <Skeleton />;
                  return rowData.holidayDate;
                }}
              />
              <Column
                field="holidayType"
                header="Holiday Type"
                body={(rowData) => {
                  if (isLoading) return <Skeleton />;
                  return rowData.holidayType;
                }}
              />
              <Column
                field="holidayName"
                header="Holiday Name"
                body={(rowData) => {
                  if (isLoading) return <Skeleton />;
                  return rowData.holidayName;
                }}
              />
              <Column
                field="actions"
                header="Actions"
                body={renderActions}
                headerClassName="w-10rem"
              />
            </DataTable>
          )}
          <Button
            className="w-full hover:!bg-[#dfffdf]"
            text
            onClick={() => {
              refetch();
            }}
            style={{
              display: 'block',
              background: '#edffed',
              color: '#4CAF50',
              textAlign: 'center',
            }}
            disabled={isRefetching}
          >
            <i
              className={classNames('pi pi-sync text-[12px]', {
                'pi pi-spin pi-spinner': isRefetching,
              })}
            ></i>{' '}
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Paginator
            first={first}
            rows={pagination.limit}
            totalRecords={data && data.message.count}
            rowsPerPageOptions={[5, 15, 25, 50, 100]}
            onPageChange={(event) => {
              const { page, rows, first }: any = event;
              setFirst(first);
              setPagination({
                offset: rows * page,
                limit: rows,
              });
            }}
          />
        </React.Fragment>
      </div>

      <HolidaySidebar
        configuration={holidaySideBarConfig}
        setSideBarConfig={setHolidaySideBarConfig}
        refetchDataFromParent={refetch}
        companyId={companyId}
      />

      <DeleteSidebar
        deleteSidebarConfig={deleteSidebarConfig}
        setDeleteSidebarConfig={setDeleteSidebarConfig}
        refetch={refetch}
        companyId={companyId}
      />
      <Toast ref={toast} position="bottom-left" />
    </div>
  );
}

export default Holidays;
