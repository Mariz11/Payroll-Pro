/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { ButtonType } from '@enums/button';
import { VDivider } from 'lib/components/blocks/divider';
import { timeFormatter } from '@utils/dashboardFunction';
import { GlobalContainer } from 'lib/context/globalContext';
import DeleteSidebar from './deleteSidebar';
import ShiftSidebar from './shiftSidebar';
import { DataTable } from 'primereact/datatable';
import { getCompanyDetails } from '@utils/companyDetailsGetter';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import moment from '@constant/momentTZ';
import { convertMinsToHours } from '@utils/helper';
import { useParams } from 'next/navigation';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import { classNames } from 'primereact/utils';

interface ShiftSideBarConfig {
  isShift: boolean;
  title: string;
  submitBtnText?: string;
  action: string;
  rowData?: object;
  isOpen: boolean;
  shiftId?: string;
}

function Shifts() {
  const params = useParams();
  const [shiftSideBarConfig, setshiftSideBarConfig] =
    useState<ShiftSideBarConfig>({
      isShift: true,
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
      isOpen: false,
      shiftId: '',
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
  const context = React.useContext(GlobalContainer);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [valueSearchText, setValueSearchText] = useState('');
  const [companyId, setCompanyId] = useState('');
  const toast = useRef<Toast>(null);
  const [first, setFirst] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditDisabled, setIsEditDisabled] = useState<boolean>(false);
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

  useEffect(() => {
    shiftsRefetch();
  }, [companyId]);

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

  const fetchShifts = async ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) => {
    try {
      const response = await fetch(
        `/api/shifts?limit=${limit}&offset=${offset}&search=${valueSearchText}`,
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

  const {
    isLoading: shiftsIsLoading,
    error: shiftsError,
    data: shiftsData,
    refetch: shiftsRefetch,
    isRefetching,
  } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['shifts', pagination],
    refetchOnMount: false,
    queryFn: () => fetchShifts(pagination),
  });

  useEffect(() => {
    shiftsRefetch();
  }, [valueSearchText]);
  useEffect(() => {
    if (shiftsIsLoading || isRefetching) {
      setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    }
  }, [shiftsIsLoading, isRefetching]);
  function renderActions(rowData: any) {
    if (shiftsIsLoading || isRefetching) return <Skeleton />;
    return (
      <div className="flex flex-row">
        {/* // setshiftSideBarConfig({
                //   isShift: true,
                //   title: 'View Company',
                //   action: 'view',
                //   rowData: data,
                //   isOpen: true,
                //   shiftId: data.shiftId,
                // }); */}
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-eye"
          tooltip="View"
          tooltipOptions={{ position: 'top' }}
          onClick={() => {
            setshiftSideBarConfig({
              isShift: true,
              title: 'Update Shifts',
              action: 'view',
              rowData: rowData,
              isOpen: true,
              shiftId: rowData.shiftId,
            });
          }}
        />
        <VDivider />
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
          disabled={isEditDisabled}
          onClick={() => {
            setshiftSideBarConfig({
              isShift: true,
              title: 'Update Shifts',
              submitBtnText: 'Update',
              action: 'edit',
              rowData: rowData,
              isOpen: true,
              shiftId: rowData.shiftId,
            });
          }}
        />
        <VDivider />
        <Button
          type="button"
          text
          icon="pi pi-trash"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={() => {
            setDeleteType('single');
            setDeleteSidebarConfig({
              header: `Delete ${rowData.shiftName}`,
              subHeader:
                'Removing this shift cannot be undone. Are you sure you want to continue?',
              submitText: 'Delete',
              cancelText: 'Cancel',
              rowData: rowData,
              isOpen: true,
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Company > Shifts"
        buttons={[
          {
            label: 'Add Shift',
            type: ButtonType.Red,
            isDropdown: false,
            isIcon: false,
            handler: () =>
              setshiftSideBarConfig({
                isShift: true,
                title: 'New Shifts',
                submitBtnText: 'Create',
                action: 'add',
                isOpen: true,
              }),
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
          {shiftsError ? (
            <ErrorDialog />
          ) : (
            <>
              {
                <div className="flex gap-2 flex-row-reverse mb-2">
                  <Button
                    className="p-button-primary rounded-full"
                    onClick={() => {
                      if (selectedRows.length == 0) {
                        return;
                      }
                      setDeleteType('bulk');
                      setDeleteSidebarConfig({
                        header: 'Delete Selected Shift/s',
                        subHeader: `Removing this ${
                          selectedRows.length > 1 ? 'shifts' : 'shift'
                        } cannot be undone. Are you sure you want to continue?`,
                        submitText: 'Delete',
                        cancelText: 'Cancel',
                        rowData: selectedRows,
                        isOpen: true,
                      });
                    }}
                    disabled={
                      shiftsIsLoading ||
                      isRefetching ||
                      isDeleting ||
                      selectedRows.length == 0
                    }
                  >
                    <p>Delete All</p>
                  </Button>
                </div>
              }
              <DataTable
                value={
                  shiftsIsLoading || isRefetching
                    ? [
                        {
                          dummy: '',
                        },
                      ]
                    : shiftsData.message.rows
                }
                onSelectionChange={(e) => {
                  if (shiftsIsLoading || isRefetching) return null;
                  // const data = e.value[0] as any;
                  // setshiftSideBarConfig({
                  //   isShift: true,
                  //   title: 'View Company',
                  //   action: 'view',
                  //   rowData: data,
                  //   isOpen: true,
                  //   shiftId: data.shiftId,
                  // });
                  setSelectedRows(e.value);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                tableStyle={{ minWidth: '50rem' }}
                selectionMode={'multiple'}
                selection={selectedRows}
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: '3rem' }}
                ></Column>
                <Column
                  field="shiftName"
                  header="Shift Name"
                  body={(rowData) => {
                    if (shiftsIsLoading || isRefetching) return <Skeleton />;
                    return rowData.shiftName;
                  }}
                />
                <Column
                  field="timeIn"
                  header="Time In"
                  body={(rowData) => {
                    if (shiftsIsLoading || isRefetching) return <Skeleton />;
                    return moment(rowData.timeIn, 'HH:mm:ss').format('LT');
                  }}
                />
                <Column
                  field="lunchStart"
                  header="Lunch Start"
                  body={(rowData) => {
                    if (shiftsIsLoading || isRefetching) return <Skeleton />;
                    return moment(rowData.lunchStart, 'HH:mm:ss').format('LT');
                  }}
                />
                <Column
                  field="lunchEnd"
                  header="Lunch End"
                  body={(rowData) => {
                    if (shiftsIsLoading || isRefetching) return <Skeleton />;
                    return moment(rowData.lunchEnd, 'HH:mm:ss').format('LT');
                  }}
                />
                <Column
                  field="timeOut"
                  header="Time Out"
                  body={(rowData) => {
                    if (shiftsIsLoading || isRefetching) return <Skeleton />;
                    return moment(rowData.timeOut, 'HH:mm:ss').format('LT');
                  }}
                />
                <Column
                  field="workingHours"
                  header="Total Working Hours"
                  body={(rowData) => {
                    if (shiftsIsLoading || isRefetching) return <Skeleton />;
                    // return rowData.workingHours;
                    const workingHoursInMins =
                      Number(rowData.workingHours) * 60;
                    return convertMinsToHours({
                      minutes: workingHoursInMins,
                      withUnit: true,
                    });
                  }}
                />
                <Column
                  field="actions"
                  header="Actions"
                  body={renderActions}
                  headerClassName="w-[12rem]"
                />
              </DataTable>
            </>
          )}
          <Button
            className="w-full hover:!bg-[#dfffdf]"
            text
            onClick={() => {
              shiftsRefetch();
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
            totalRecords={shiftsData && shiftsData.message.count}
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

      {/* SIDEBAR DELETE */}
      {!isRefetching && (
        <DeleteSidebar
          deleteSidebarConfig={deleteSidebarConfig}
          setDeleteSidebarConfig={setDeleteSidebarConfig}
          refetch={shiftsRefetch}
          deleteType={deleteType}
          setSelectedRows={setSelectedRows}
          setIsDeleting={setIsDeleting}
        />
      )}
      {/* SIDEBAR EDIT AND CREATE */}
      <ShiftSidebar
        configuration={shiftSideBarConfig}
        setSideBarConfig={setshiftSideBarConfig}
        refetchDataFromParent={shiftsRefetch}
        companyId={companyId}
        setIsEditDisabled={setIsEditDisabled}
      />

      <Toast ref={toast} position="bottom-left" />
    </div>
  );
}

export default Shifts;
