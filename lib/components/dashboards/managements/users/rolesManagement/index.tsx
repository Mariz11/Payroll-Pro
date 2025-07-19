import { Skeleton } from 'primereact/skeleton';
import { VDivider } from 'lib/components/blocks/divider';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useContext, useState } from 'react';
import RoleDeleteSidebar from './roleDeleteSidebar';
import NewRoleSidebar from './newRoleSidebar';
import RoleSidebar from './roleSidebar';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GlobalContainer } from 'lib/context/globalContext';
import { Paginator } from 'primereact/paginator';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { InputText } from 'primereact/inputtext';
import React from 'react';

const RolesManagement = ({
  companyId,
  query: { data, refetch, isFetching, error },
  pagination,
  setPagination,
  valueSearchText,
  setValueSearchText,
  isSidebarOpen,
  setIsSidebarOpen,
  action,
  setAction,
  selectedRole,
  setSelectedRole,
  isDefaultAdmin,
  allRolesQueryRefetch,
  userRefetch,
}: {
  companyId: string;
  query: any;
  pagination: any;
  setPagination: any;
  valueSearchText: string;
  setValueSearchText: any;
  isSidebarOpen: boolean;
  setIsSidebarOpen: any;
  action: string;
  setAction: any;
  selectedRole: number | null;
  setSelectedRole: any;
  isDefaultAdmin: boolean;
  allRolesQueryRefetch: () => void;
  userRefetch: () => void;
}) => {
  const context = useContext(GlobalContainer);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const [buttonText, setButtonText] = useState('');
  const [sidebarTitle, setSidebarTitle] = useState('');

  // if (!isDefaultAdmin) {
  //   return <></>;
  // }
  return (
    <div className="mt-[0px]">
      {/* <DashboardNav
        navTitle=""
        buttons={[]}
        searchPlaceholder=""
        isShowSearch={true}
        valueSearchText={valueSearchText}
        setValueSearchText={setValueSearchText}
      /> */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-5 sm:gap-3">
        {/* <div className="flex items-center">
          <i className="pi pi-users mr-2"></i>
          <p className="font-bold text-[18px]">User Roles Management</p>
        </div> */}
        <Button
          rounded
          className="min-w-[200px] flex justify-center items-center gap-3"
          onClick={() => {
            // console.log(context?.moduleAccess);
            // console.log(context?.userData.company.emailAddress);
            // console.log(context?.userData.emailAddress);
            setIsNewOpen(true);
          }}
        >
          Add New Role
        </Button>
        <div className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder={`Search`}
            value={valueSearchText || ''}
            onChange={(e) => {
              setValueSearchText && setValueSearchText(e.target.value);
            }}
          />
        </div>
      </div>

      <div
        // className="flex mt-6 p-[40px] rounded-lg justify-start flex-col gap-5"
        className="mt-6"
        style={{
          background: '#F2F3FE',
          backgroundColor: '#F2F3FE',
        }}
      >
        <DataTable
          value={
            isFetching
              ? [
                {
                  dummy: '',
                },
                {
                  dummy: '',
                },
              ]
              : data.rows
          }
          selectionMode={'single'}
          onSelectionChange={(e) => {
            setIsSidebarOpen(true);
            // console.log(e.value);
            setSelectedRole(e.value.userRoleId);
            setAction('view');
          }}
        >
          <Column
            field="name"
            header="Role Name"
            className="w-4/5"
            body={(data) => {
              return isFetching ? <Skeleton /> : <span>{data.roleName}</span>;
            }}
          />
          <Column
            field="name"
            header="Actions"
            body={(data) => {
              return isFetching ? (
                <Skeleton />
              ) : (
                <div className="flex-row flex">
                  {data.roleName !== 'ADMIN' &&
                    data.roleName !== 'EMPLOYEE' && (
                      <Button
                        type="button"
                        text
                        severity="secondary"
                        icon="pi pi-file-edit"
                        tooltip="Edit"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => {
                          setSelectedRole(data.userRoleId);
                          setIsSidebarOpen(true);
                          setAction('edit');
                        }}
                      />
                    )}
                  <VDivider />
                  {data.roleName !== 'ADMIN' &&
                    data.roleName !== 'EMPLOYEE' && (
                      <Button
                        type="button"
                        text
                        severity="danger"
                        icon="pi pi-trash"
                        tooltip="Delete"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => {
                          setIsDeleteOpen(true);
                          setButtonText('Are you sure you want to delete?');
                          setSidebarTitle('Delete Role');
                          setSelectedRole(data.userRoleId);
                        }}
                      />
                    )}
                </div>
              );
            }}
          />
        </DataTable>
        <Paginator
          first={pagination.first}
          rows={pagination.limit}
          totalRecords={data && data.count}
          rowsPerPageOptions={[5, 15, 25, 50]}
          onPageChange={(event) => {
            const { page, rows, first }: any = event;
            setPagination({
              offset: rows * page,
              limit: rows,
              first: first,
            });
          }}
        />
      </div>

      <NewRoleSidebar
        configuration={{
          isOpen: isNewOpen,
          setIsOpen: setIsNewOpen,
        }}
        refetch={refetch}
        companyId={companyId}
        allRolesQueryRefetch={allRolesQueryRefetch}
      />
      {selectedRole && (
        <>
          <RoleDeleteSidebar
            configuration={{
              isOpen: isDeleteOpen,
              setIsOpen: setIsDeleteOpen,
            }}
            label={{
              title: sidebarTitle,
              buttonText: buttonText,
            }}
            selectedRole={selectedRole}
            refetch={refetch}
            allRolesQueryRefetch={allRolesQueryRefetch}
            userRefetch={userRefetch}
          />
          {/* <RoleSidebar
            isDefaultAdmin={isDefaultAdmin}
            configuration={{
              action: action,
              isOpen: isSidebarOpen,
              setIsOpen: setIsSidebarOpen,
            }}
            selectedRole={selectedRole}
            refetch={refetch}
            companyId={companyId}
          /> */}
        </>
      )}
    </div>
  );
};

export default RolesManagement;
