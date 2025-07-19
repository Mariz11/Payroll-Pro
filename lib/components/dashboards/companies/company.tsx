'use client';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';

import SideBar from 'lib/components/blocks/sideBar';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { ButtonType } from '@enums/button';
import { FormType } from '@enums/sidebar';
import { VDivider } from 'lib/components/blocks/divider';
import { formatAmount } from '@utils/dashboardFunction';
import CompanySidebar from './companySidebar';
import CompanyLogTrail from './companyLogTrail';
import { useQuery } from '@tanstack/react-query';
import { TreeNode } from 'primereact/treenode';
import { Toast } from 'primereact/toast';
import {
  DataTable,
  DataTableFilterMeta,
  DataTableStateEvent,
} from 'primereact/datatable';
import DeleteSidebar from './deleteSidebar';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Paginator } from 'primereact/paginator';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import ErrorDialog from 'lib/components/blocks/errorDialog';

function Company() {
  const [sideBarConfig, setSideBarConfig] = useState<SideBarConfig>({
    title: '',
    submitBtnText: '',
    action: '',
    rowData: {},
    isOpen: false,
  });
  const [logTrailConfig, setLogTrailConfig] = useState<SideBarConfig>({
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
  const [isDelete, setIsDelete] = useState(false);
  const [islogTrail, setIsLogTrail] = useState(false);
  const toast = useRef<Toast>(null);
  const [valueSearchText, setValueSearchText] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [first, setFirst] = useState(0);

  const fetchCompanies = ({
    limit,
    offset,
  }: {
    limit: number;
    offset: number;
  }) =>
    fetch(
      `/api/companies?limit=${limit}&offset=${offset}&search=${valueSearchText}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

  const { isLoading, error, data, refetch, isRefetching, isFetching } =
    useQuery({
      refetchOnWindowFocus: false,
      queryKey: ['companyListDashboard', pagination, valueSearchText],
      queryFn: () => fetchCompanies(pagination),
    });

  function renderActions(rowData: any) {
    return (
      <div className="flex flex-row">
        <Button
          data-testid={rowData.companyId}
          type="button"
          text
          severity="secondary"
          icon="pi pi-file-edit"
          tooltip="Edit"
          disabled={isLoading || isFetching || isRefetching}
          tooltipOptions={{ position: 'top' }}
          onClick={() =>
            setSideBarConfig({
              title: 'Edit Company',
              submitBtnText: 'Update',
              action: 'edit',
              rowData: rowData,
              isOpen: true,
            })
          }
        />
        <VDivider />
        <Button
          type="button"
          text
          severity="secondary"
          icon="pi pi-history"
          tooltip="History"
          disabled={isLoading || isFetching || isRefetching}
          tooltipOptions={{ position: 'top' }}
          onClick={() =>
            setLogTrailConfig({
              title: 'Edit Company',
              submitBtnText: 'Update',
              action: 'edit',
              rowData: rowData,
              isOpen: true,
            })
          }
        />
        <VDivider />
        <Button
          type="button"
          text
          icon="pi pi-trash"
          tooltip="Delete"
          disabled={isLoading || isFetching || isRefetching}
          tooltipOptions={{ position: 'top' }}
          onClick={() =>
            setDeleteSidebarConfig({
              header: `Delete ${rowData.companyName}`,
              subHeader:
                'Removing a company will also disable users from logging in to their payroll account. Users on this company will no longer have access on the payroll system.',
              submitText: 'Delete',
              cancelText: 'Cancel',
              rowData: rowData,
              isOpen: true,
            })
          }
        />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <div className="w-screen h-screen overflow-auto p-5">
        {/* DASHBOARD NAV */}
        <DashboardNav
          navTitle="Company Lists"
          setValueSearchText={setValueSearchText}
          valueSearchText={valueSearchText}
          searchPlaceholder=""
          buttons={[
            {
              label: 'Add New',
              type: ButtonType.Red,
              isDropdown: false,
              isIcon: false,
              handler: () =>
                setSideBarConfig({
                  title: 'New Company',
                  submitBtnText: 'Create',
                  action: 'add',
                  isOpen: true,
                }),
            },
          ]}
          isShowSearch={true}
        />

        <div className="line-container rounded-lg p-5">
          {/* MAIN CONTENT */}
          <DataTable
            selectionMode={'single'}
            value={
              isRefetching || isLoading
                ? [
                    {
                      companyName: '',
                    },
                  ]
                : data.rows
            }
            frozenWidth="95rem"
            scrollable={true}
            tableStyle={{ minWidth: '95rem' }}
            onSelectionChange={(e) => {
              if (isRefetching || isLoading) return;
              setSideBarConfig({
                title: 'View Company',
                action: 'view',
                rowData: e.value,
                isOpen: true,
              });
            }}
          >
            <Column
              field="companyName"
              header="Company Name"
              body={(row) =>
                isLoading || isRefetching ? (
                  <Skeleton />
                ) : (
                  <span className="text-red-600 font-semibold">
                    {row.companyName}
                  </span>
                )
              }
            />
            <Column
              field="maxEmployee"
              header="No. of Employees"
              body={(row) =>
                isLoading || isRefetching ? (
                  <Skeleton />
                ) : (
                  <span className="text-red-600 font-semibold">
                    {row.maxEmployee}
                  </span>
                )
              }
            />
            <Column
              field="mainAccount"
              header="ML Main Account"
              body={(row) =>
                isLoading || isRefetching ? (
                  <Skeleton />
                ) : (
                  <div className="flex flex-col gap-2 font-semibold">
                    <span>{row.accountId}</span>
                  </div>
                )
              }
            />
            <Column
              field="subAccount"
              header="ML Sub Account"
              body={(row) =>
                isLoading || isRefetching ? (
                  <Skeleton />
                ) : (
                  <div className="flex flex-col gap-2 font-semibold">
                    <span>{row.subAccountId}</span>
                  </div>
                )
              }
            />
            <Column
              field="emailAddress"
              header="Company Email"
              body={(row) =>
                isLoading || isRefetching ? (
                  <Skeleton />
                ) : (
                  <span className="text-red-600 font-semibold">
                    {row.emailAddress}
                  </span>
                )
              }
            />
            <Column
              field="status"
              header="Status"
              body={(row) => {
                if (isLoading || isRefetching) return <Skeleton />;
                if (row.isActive == 1) {
                  return (
                    <span className="py-2 px-5 rounded-full bg-green-200 text-green-700">
                      Active
                    </span>
                  );
                }
                if (row.isActive == 0) {
                  return (
                    <span className="py-2 px-5 rounded-full bg-red-200 text-red-700">
                      Inactive
                    </span>
                  );
                }
              }}
            />
            <Column
              field="actions"
              header="Actions"
              body={(row) =>
                isLoading || isRefetching ? <Skeleton /> : renderActions(row)
              }
              headerClassName="w-[12rem]"
            />
          </DataTable>
          <Paginator
            first={first}
            rows={pagination.limit}
            totalRecords={data && data.count}
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
        </div>
        {/* SIDEBAR */}
        <SideBar
          configuration={{
            isOpen: isDelete,
            setIsOpen: setIsDelete,
          }}
          label={{}}
          form={{
            forms: [
              {
                label: 'Delete ML Company Branch 2',
                type: FormType.Prompt,
                name: 'delete',
                options: [],
                placeholder: '',
                isVisible: true,
                isRequired: true,
                isDisabled: false,
              },
            ],
            buttons: [
              { label: 'Cancel', type: ButtonType.Transparent },
              {
                label: 'Delete',
                type: ButtonType.Red,
              },
            ],
          }}
        />

        {/* EDIT AND NEW SIDEBAR */}
        <CompanySidebar
          configuration={sideBarConfig}
          setSideBarConfig={setSideBarConfig}
          refetchDataFromParent={refetch}
        />

        {/* DELETE SIDEBAR */}
        <DeleteSidebar
          deleteSidebarConfig={deleteSidebarConfig}
          setDeleteSidebarConfig={setDeleteSidebarConfig}
          refetch={refetch}
        />

        {/* LOG TRAIL */}
        <CompanyLogTrail
          configuration={logTrailConfig}
          setSideBarConfig={setLogTrailConfig}
        />
      </div>
    </>
  );
}

export default Company;
