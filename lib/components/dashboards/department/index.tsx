/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';
import { Column } from 'primereact/column';
import { VDivider } from 'lib/components/blocks/divider';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { ButtonType } from '@enums/button';
import { GlobalContainer } from 'lib/context/globalContext';
import { useQuery } from '@tanstack/react-query';
import DeleteSidebar from './deleteSidebar';
import { Toast } from 'primereact/toast';
import DepartmentsSidebar from './departmentsSidebar';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { getCompanyDetails } from '@utils/companyDetailsGetter';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { useParams } from 'next/navigation';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import { classNames } from 'primereact/utils';
import { isDepartmentExisting } from '@utils/departmentFunction';
interface DepartmentSideBarConfig {
  isDepartment: boolean;
  title: string;
  submitBtnText?: string;
  action: string;
  rowData?: object;
  isOpen: boolean;
  departmentId?: string;
}

function Index() {
  const params = useParams();
  const toast = useRef<Toast>(null);
  const context = React.useContext(GlobalContainer);
  const [companyId, setCompanyId] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [valueSearchText, setValueSearchText] = useState('');
  const [first, setFirst] = useState(0);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditDisabled, setIsEditDisabled] = useState<boolean>(false);
  const [isOpeningDeleteSidebar, setIsOpeningDeleteSidebar] =
    useState<boolean>(false);
  const [isOpeningDepartmentSidebar, setIsOpeningDepartmentSidebar] =
    useState<boolean>(false);
  const [departmentSideBarConfig, setDepartmentSideBarConfig] =
    useState<DepartmentSideBarConfig>({
      isDepartment: true,
      title: '',
      submitBtnText: '',
      action: '',
      rowData: {},
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

  const fetchDepartments = async ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) =>
    await fetch(
      `/api/departments?limit=${limit}&offset=${offset}&search=${valueSearchText}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    refetchOnWindowFocus: true,
    queryKey: ['department', pagination, valueSearchText],
    queryFn: () => fetchDepartments(pagination),
  });

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
    if (isLoading || isRefetching) {
      setDeleteSidebarConfig((prev: any) => ({ ...prev, isOpen: false }));
    }
  }, [isLoading, isRefetching]);

  function renderActions(rowData: any) {
    if (isLoading || isRefetching) return <Skeleton />;
    return (
      <div className="flex flex-nowrap gap-2">
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-eye"
          tooltip="View"
          tooltipOptions={{ position: 'top' }}
          onClick={async () => {
            const res = await isDepartmentExisting(rowData.departmentId);
            if (res) {
              setDepartmentSideBarConfig({
                isDepartment: true,
                title: 'View Department  ',
                action: 'view',
                rowData: rowData,
                departmentId: rowData.departmentId,
                isOpen: true,
              });
            } else {
              toast.current?.replace({
                severity: 'error',
                summary: 'Department not found.',
                life: 3000,
              });
              refetch();
            }
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
          disabled={isEditDisabled || isRefetching}
          onClick={async () => {
            if (isOpeningDepartmentSidebar || isOpeningDeleteSidebar) return;
            await setIsOpeningDepartmentSidebar(true);
            const res: any = await isDepartmentExisting(rowData.departmentId);
            // console.log(res);
            if (res) {
              await setDepartmentSideBarConfig({
                isDepartment: true,
                title: 'Update Department  ',
                submitBtnText: 'Update',
                action: 'edit',
                rowData: rowData,
                departmentId: rowData.departmentId,
                isOpen: true,
              });
            } else {
              toast.current?.replace({
                severity: 'error',
                summary: 'Department not found.',
                closable: true,
                life: 5000,
              });
              refetch();
            }
            setIsOpeningDepartmentSidebar(false);
          }}
        />
        <VDivider />
        <Button
          type="button"
          text
          icon="pi pi-trash"
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          disabled={isEditDisabled || isRefetching || isDeleting}
          onClick={async () => {
            if (isOpeningDeleteSidebar) return;
            await setIsOpeningDeleteSidebar(true);
            const res = await isDepartmentExisting(rowData.departmentId);
            if (res) {
              setDeleteType('single');

              await setDeleteSidebarConfig({
                header: `Delete ${rowData.departmentName}`,
                subHeader:
                  'Removing this department cannot be undone. Are you sure you want to continue?',
                submitText: 'Delete',
                cancelText: 'Cancel',
                rowData: rowData,
                isOpen: true,
              });
            } else {
              toast.current?.replace({
                severity: 'error',
                summary: 'Department not found.',
                life: 3000,
              });
              refetch();
            }
            setIsOpeningDeleteSidebar(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      {/* DASHBOARD NAV */}
      <DashboardNav
        navTitle="Department"
        buttons={[
          {
            label: 'Add Department',
            type: ButtonType.Red,
            isDropdown: false,
            isIcon: false,
            handler: () => {
              setDepartmentSideBarConfig({
                isDepartment: true,
                title: 'Company > Department  ',
                submitBtnText: 'Create',
                action: 'add',
                isOpen: true,
              });
            },
          },
        ]}
        isShowSearch={true}
        searchPlaceholder=""
        valueSearchText={valueSearchText}
        setValueSearchText={setValueSearchText}
      />

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5">
        <React.Fragment>
          {error ? (
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
                        header: 'Delete Selected Department/s',
                        subHeader: `Removing this ${
                          selectedRows.length > 1 ? 'departments' : 'department'
                        } cannot be undone. Are you sure you want to continue?`,
                        submitText: 'Delete',
                        cancelText: 'Cancel',
                        rowData: selectedRows,
                        isOpen: true,
                      });
                    }}
                    disabled={
                      isLoading ||
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
                  isLoading || isRefetching
                    ? [{ dummy: '' }]
                    : data.message.rows
                }
                selectionMode={'multiple'}
                selection={selectedRows}
                frozenWidth="95rem"
                scrollable={true}
                tableStyle={{ minWidth: '95rem' }}
                onSelectionChange={(e) => {
                  if (isLoading || isRefetching) return null;
                  // const data = e.value;
                  // setDepartmentSideBarConfig({
                  //   isDepartment: true,
                  //   title: 'View Department',
                  //   action: 'view',
                  //   rowData: e.value,
                  //   isOpen: true,
                  //   departmentId: data.departmentId,
                  // });
                  setSelectedRows(e.value);
                }}
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: '3rem' }}
                ></Column>
                <Column
                  field="departmentName"
                  header="Department Name"
                  body={(rowData) => {
                    if (isLoading || isRefetching) return <Skeleton />;
                    return rowData.departmentName;
                  }}
                />
                <Column
                  field="noOfAssignedEmployees"
                  header="No. of Assigned Employees"
                  body={(rowData) => {
                    if (isLoading || isRefetching) return <Skeleton />;
                    return rowData.employeeCount;
                  }}
                />
                <Column
                  field="actions"
                  header="Actions"
                  body={renderActions}
                  headerClassName="w-10rem"
                />
              </DataTable>
            </>
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
            totalRecords={data && data.message?.count}
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

      {departmentSideBarConfig.isOpen && <DepartmentsSidebar
        configuration={departmentSideBarConfig}
        setSideBarConfig={setDepartmentSideBarConfig}
        refetchDataFromParent={refetch}
        companyId={companyId}
        isEditDisabled={isEditDisabled}
        setIsEditDisabled={setIsEditDisabled}
      />}

      {!isRefetching && (
        <DeleteSidebar
          deleteSidebarConfig={deleteSidebarConfig}
          setDeleteSidebarConfig={setDeleteSidebarConfig}
          refetch={refetch}
          companyId={companyId}
          deleteType={deleteType}
          setSelectedRows={setSelectedRows}
          setIsDeleting={setIsDeleting}
          isEditDisabled={isEditDisabled}
          setIsEditDisabled={setIsEditDisabled}
        />
      )}
      <Toast ref={toast} position="bottom-left" />
    </div>
  );
}

export default Index;
