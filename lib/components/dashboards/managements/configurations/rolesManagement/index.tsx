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

const RolesManagement = ({ companyId }: { companyId: string }) => {
  const context = useContext(GlobalContainer);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [action, setAction] = useState('view');
  const [buttonText, setButtonText] = useState('');
  const [sidebarTitle, setSidebarTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const isDefaultAdmin =
    context && context?.userData && context?.userData.isDefault;
  const { data, refetch, isFetching } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['userRolesData'],
    queryFn: async () => {
      const response: any = await axios(`/api/user_roles`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      return response.data.message;
    },
  });

  if (!isDefaultAdmin) {
    return <></>;
  }
  return (
    <div className="mt-[0px]">
      <div className="flex justify-between">
        <div className="flex items-center">
          <i className="pi pi-users mr-2"></i>
          <p className="font-bold text-[18px]">User Roles Management</p>
        </div>
        <Button
          rounded
          className="min-w-[200px] flex justify-center items-center gap-3"
          onClick={() => {
            // console.log(context?.moduleAccess);
            setIsNewOpen(true);
          }}
        >
          Add New Role
        </Button>
      </div>

      <div
        className="flex mt-6 p-[40px] rounded-lg justify-start flex-col gap-5"
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
              : data
          }
          selectionMode={'single'}
          onSelectionChange={(e) => {
            setIsSidebarOpen(true);
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
      </div>

      <NewRoleSidebar
        configuration={{
          isOpen: isNewOpen,
          setIsOpen: setIsNewOpen,
        }}
        refetch={refetch}
        companyId={companyId}
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
          />
          <RoleSidebar
            isDefaultAdmin={isDefaultAdmin}
            configuration={{
              action: action,
              isOpen: isSidebarOpen,
              setIsOpen: setIsSidebarOpen,
            }}
            selectedRole={selectedRole}
            refetch={refetch}
            companyId={companyId}
          />
        </>
      )}
    </div>
  );
};

export default RolesManagement;
