'use client';
import React, { use, useContext, useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';

import { useQueries, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import { ButtonType } from '@enums/button';
import { yupResolver } from '@hookform/resolvers/yup';

import DashboardNav from 'lib/components/blocks/dashboardNav';
import { VDivider } from 'lib/components/blocks/divider';
import { GlobalContainer } from 'lib/context/globalContext';
import { UserFormValidator } from 'lib/validation/userFormValidator';
import UserSidebar from './userSidebar';
import { ParseDate, ParseDateStringtoFormatted } from '@utils/parseDate';
import { DataTable } from 'primereact/datatable';
import user from 'db/models/user';
import classNames from 'classnames';
import ConfirmationSidebar from './confirmationSidebar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Paginator } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import { useParams } from 'next/navigation';
import { properCasing } from '@utils/helper';
import ErrorDialog from 'lib/components/blocks/errorDialog';
import { employeeData } from '@constant/walletAssetData';
import { TabPanel, TabView } from 'primereact/tabview';
import RolesManagement from './rolesManagement';
import RoleSidebar from './rolesManagement/roleSidebar';

function Users() {
  const params = useParams();
  const context = useContext(GlobalContainer);
  const userData = context?.userData;
  const toast = useRef<Toast>(null);
  const companyEmail = context ? context.userData.company.emailAddress : '';
  const [userPagination, setUserPagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const isDefaultAdmin =
    context && context?.userData && context?.userData.isDefault;
  const [userSearchText, setUserSearchText] = useState('');
  const [roleSearchText, setRoleSearchText] = useState('');
  const [state, setState] = useState({
    dashboardNavButtons: [],
    offsit: 0,
    limit: 5,
    userId: -1,
    companyId: -1,
    employeeData: null,
  });
  const [isRoleSidebarOpen, setIsRoleSidebarOpen] = useState(false);
  // for role sidebar
  const [roleModuleAction, setRoleModuleAction] = useState('view');
  const [actions, setActions] = useState({
    userId: -1,
    isActive: false,
  });
  const [addUser, setAddUser] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [sidebarTitle, setSidebarTitle] = useState('');
  const [rolePagination, setRolePagination] = useState({
    offset: 0,
    limit: 5,
    first: 0,
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [isUserDefaultAdmin, setIsUserDefaultAdmin] = useState(false);
  useEffect(() => {
    // if (context?.authRole === 'ADMIN' || context?.authRole === 'SUPER_ADMIN') {
    setState((prev: any) => {
      return {
        ...prev,
        dashboardNavButtons: [
          {
            label: 'Add New',
            type: ButtonType.Red,
            isDropdown: false,
            isIcon: false,
            handler: () => {
              setIsUserDefaultAdmin(false);
              setValue('role', -1);
              handleSidebar('Save', 'Add User');
            },
          },
        ],
      };
    });
    // }

    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, context?.authRole]);

  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    queryKey: ['userList', userPagination, userSearchText],
    queryFn: () =>
      fetch(
        `/api/user?offset=${userPagination.offset}&limit=${userPagination.limit}&search=${userSearchText}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .catch((err) => console.error(err)),
  });

  const [userQuery, roleQuery, allRolesQuery] = useQueries({
    queries: [
      {
        queryKey: ['userList', userPagination, userSearchText],
        refetchOnWindowFocus: false,
        queryFn: async () =>
          fetch(
            `/api/user?offset=${userPagination.offset}&limit=${userPagination.limit}&search=${userSearchText}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          )
            .then((res) => res.json())
            .catch((err) => console.error(err)),
      },
      {
        queryKey: ['userRoles', rolePagination, roleSearchText],
        refetchOnWindowFocus: false,
        queryFn: () =>
          fetch(
            `/api/user_roles?offset=${rolePagination.offset}&limit=${rolePagination.limit}&search=${roleSearchText}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          )
            .then((res) => res.json())
            .catch((err) => console.error(err)),
      },
      {
        queryKey: ['allRoles', rolePagination, roleSearchText],
        refetchOnWindowFocus: false,
        queryFn: async () => {
          const response: any = await axios(`/api/user_roles/all`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          });

          const roles = response.data.map((role: any) => ({
            name: role.roleName,
            value: role.userRoleId,
          }));

          return roles;
        },
      },
    ],
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
    setValue,
    setError,
    clearErrors,
    watch,
    reset,
    control,
  } = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(UserFormValidator),
  });

  const countOnlyAdmin = userQuery.data?.data?.filter((userData: any) => {
    return userData.role === 'ADMIN';
  });

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <div className="line-container rounded-lg p-5">
        <TabView>
          <TabPanel header="User Management">
            {/* DASHBOARD NAV */}
            <DashboardNav
              navTitle=""
              buttons={[...state.dashboardNavButtons]}
              searchPlaceholder=""
              isShowSearch={true}
              valueSearchText={userSearchText}
              setValueSearchText={setUserSearchText}
            />

            {/* MAIN CONTENT */}

            <React.Fragment>
              {userQuery.error ? (
                <ErrorDialog />
              ) : (
                <>
                  <DataTable
                    value={
                      userQuery.isLoading
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
                        : userQuery.data.rows
                    }
                    tableStyle={{ minWidth: '90rem' }}
                    selectionMode={'single'}
                    onSelectionChange={(e) => {
                      if (userQuery.isLoading) return null;

                      const {
                        firstName,
                        middleName,
                        lastName,
                        suffix,
                        emailAddress,
                        contactNumber,
                        birthDate,
                        roleId,
                      } = e.value;
                      // console.log(roleId);
                      setValue('role', -1);
                      handleSidebar('Close', 'View User');

                      setValue('firstName', firstName);
                      setValue('middleName', middleName);
                      setValue('lastName', lastName);
                      setValue('suffix', suffix);
                      setValue('role', roleId);
                      setValue('emailAddress', emailAddress);
                      setValue('contactNumber', contactNumber);
                      setValue('birthDate', new Date(birthDate) as any);
                    }}
                  >
                    <Column
                      field="userFullName"
                      header="Full Name"
                      body={(data) => {
                        return userQuery.isLoading ? (
                          <Skeleton />
                        ) : (
                          data?.userFullName || ''
                        );
                      }}
                    />
                    <Column
                      field="emailAddress"
                      header="Email"
                      className="w-[350px]"
                      body={(data) => {
                        return userQuery.isLoading ? (
                          <Skeleton />
                        ) : (
                          data.emailAddress
                        );
                      }}
                    />
                    <Column
                      field="role"
                      header="Role"
                      body={(data) => {
                        return userQuery.isLoading ? (
                          <Skeleton />
                        ) : (
                          <span>{data.role.replace('_', ' ')}</span>
                        );
                      }}
                    />
                    <Column
                      field="companyAccess"
                      header="Company Access"
                      body={(data) => {
                        return userQuery.isLoading ? (
                          <Skeleton />
                        ) : (
                          <span className="text-red-600 font-bold">
                            {properCasing(data.company.companyName)}
                          </span>
                        );
                      }}
                    />
                    <Column
                      field="status"
                      header="Status"
                      body={(data) => {
                        return userQuery.isLoading ? (
                          <Skeleton />
                        ) : data.isActive ? (
                          <span className="py-2 px-5 rounded-full bg-green-200 text-green-700">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="py-2 px-5 rounded-full bg-gray-200 text-gray-700">
                            INACTIVE
                          </span>
                        );
                      }}
                    />

                    <Column
                      field="actions"
                      header="Actions"
                      body={(rowData) => {
                        const userId = rowData.userId;
                        return userQuery.isLoading ? (
                          <Skeleton />
                        ) : (
                          <div
                            className={classNames(
                              'flex-row flex'
                              // rowData.role === 'EMPLOYEE' ? 'hidden' : 'flex'
                            )}
                          >
                            {userData.role != 'EMPLOYEE' && (
                              <>
                                <VDivider />
                                <Button
                                  type="button"
                                  text
                                  severity="secondary"
                                  icon="pi pi-file-edit"
                                  tooltip="Edit"
                                  tooltipOptions={{ position: 'top' }}
                                  onClick={async () => {
                                    setValue('firstName', rowData.firstName);
                                    setValue('middleName', rowData.middleName);
                                    setValue('lastName', rowData.lastName);
                                    setValue('suffix', rowData.suffix);
                                    setValue(
                                      'emailAddress',
                                      rowData.emailAddress
                                    );
                                    setValue(
                                      'contactNumber',
                                      rowData.contactNumber
                                    );
                                    setValue(
                                      'birthDate',
                                      new Date(rowData.birthDate) as any
                                    );
                                    setValue('role', rowData.roleId);
                                    const isDefaultAdmin =
                                      rowData && rowData.isDefault;
                                    if (
                                      context?.authRole != 'SUPER_ADMIN' &&
                                      isDefaultAdmin
                                    ) {
                                      toast.current?.replace({
                                        severity: 'error',
                                        summary:
                                          'Cannot Edit Default Admin Account',
                                        life: 3000,
                                      });
                                      return;
                                    }
                                    handleSidebar('Save', 'Update User');
                                    setState((prev) => ({
                                      ...prev,
                                      userId: rowData.userId,
                                      companyId: rowData.companyId,
                                      employeeData: rowData.employee,
                                    }));
                                  }}
                                />
                                <VDivider />
                              </>
                            )}
                            {rowData.role != 'EMPLOYEE' &&
                              rowData.role !== 'ADMIN' &&
                              rowData.role != 'SUPER_ADMIN' &&
                              rowData.role != 'SUPER ADMIN' &&
                              userData.role !== 'SUPER_ADMIN' &&
                              rowData.roleId != null && (
                                <>
                                  <Button
                                    type="button"
                                    text
                                    severity="secondary"
                                    icon="pi pi-lock"
                                    tooltip="Edit Role Restrictions"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => {
                                      setSelectedRole(rowData.roleId);
                                      setIsRoleSidebarOpen(true);
                                      setRoleModuleAction('edit');
                                    }}
                                  />
                                  <VDivider />
                                </>
                              )}
                            {(context?.userData.role === 'SUPER_ADMIN' ||
                              context?.userData.role === 'ADMIN') &&
                              rowData.role !== 'EMPLOYEE' &&
                              rowData.emailAddress.toLowerCase() !==
                              companyEmail.toLowerCase() && (
                                <>
                                  <Button
                                    type="button"
                                    text
                                    icon="pi pi-trash"
                                    tooltip="Delete"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => {
                                      setIsOpen2(true);
                                      setButtonText(
                                        'Are you sure you want to delete?'
                                      );
                                      setSidebarTitle('Delete User');
                                      setActions((prev) => ({
                                        ...prev,
                                        userId: userId,
                                      }));
                                    }}
                                  />
                                  <VDivider />
                                </>
                              )}

                            {rowData.isActive && rowData.role !== 'EMPLOYEE'
                              ? rowData.emailAddress.toLowerCase() !==
                              companyEmail.toLowerCase() && (
                                <>
                                  <Button
                                    type="button"
                                    text
                                    severity="secondary"
                                    icon="pi pi-user-minus"
                                    tooltip="Deactivate"
                                    tooltipOptions={{ position: 'top' }}
                                    style={{ color: 'red' }}
                                    onClick={() => {
                                      setIsOpen2(true);
                                      setButtonText(
                                        'Are you sure you want to deactivate?'
                                      );
                                      setSidebarTitle('Deactivate User');
                                      setActions({
                                        userId: userId,
                                        isActive: rowData.isActive,
                                      });
                                    }}
                                  />
                                  <VDivider />
                                </>
                              )
                              : rowData.role !== 'EMPLOYEE' &&
                              rowData.emailAddress.toLowerCase() !==
                              companyEmail.toLowerCase() && (
                                <Button
                                  type="button"
                                  text
                                  severity="secondary"
                                  icon="pi pi-user-plus"
                                  tooltip="Activate"
                                  tooltipOptions={{ position: 'top' }}
                                  className="text-"
                                  onClick={() => {
                                    setIsOpen2(true);
                                    setButtonText(
                                      'Are you sure you want to activate?'
                                    );
                                    setSidebarTitle('Activate User');
                                    setActions({
                                      userId: userId,
                                      isActive: rowData.isActive,
                                    });
                                  }}
                                />
                              )}
                          </div>
                        );
                      }}
                      headerClassName="w-10rem"
                    />
                    {/* <Button
                      className="w-full hover:!bg-[#dfffdf]"
                      text
                      onClick={() => {
                        refetch();
                        toast.current?.replace({
                          severity: 'info',
                          summary: 'Refreshing table data',
                          detail: 'Please wait...',
                          life: 5000,
                        });
                      }}
                      style={{
                        display: 'block',
                        background: '#edffed',
                        color: '#4CAF50',
                        textAlign: 'center',
                      }}
                    >
                      <i className="pi pi-sync text-[12px]"></i> Refresh
                    </Button> */}
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
                first={userPagination.first}
                rows={userPagination.limit}
                totalRecords={userQuery.data && userQuery.data.count}
                rowsPerPageOptions={[5, 15, 25, 50]}
                onPageChange={(event) => {
                  const { page, rows, first }: any = event;
                  setUserPagination({
                    offset: rows * page,
                    limit: rows,
                    first: first,
                  });
                }}
              />
            </React.Fragment>

            {/* SIDEBAR */}
            <UserSidebar
              configuration={{
                isOpen: addUser,
                setIsOpen: setAddUser,
              }}
              label={{
                title: sidebarTitle,
                buttonText: buttonText,
              }}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              setValue={setValue}
              watch={watch}
              reset={reset}
              control={control}
              refetch={userQuery.refetch}
              userId={state.userId}
              companyId={state.companyId}
              context={context}
              isDirty={isDirty}
              isValid={isValid}
              paramsCompanyName={params?.companyId}
              clearErrors={clearErrors}
              toast={toast}
              setError={setError}
              employeeData={state.employeeData}
              allRolesQuery={allRolesQuery}
              isUserDefaultAdmin={isUserDefaultAdmin}
              userRefetch={userQuery.refetch}
            />

            <ConfirmationSidebar
              configuration={{
                isOpen: isOpen2,
                setIsOpen: setIsOpen2,
              }}
              label={{
                title: sidebarTitle,
                buttonText: buttonText,
              }}
              actionButton={() => {
                if (sidebarTitle === 'Delete User') {
                  let config = {
                    method: 'delete',
                    maxBodyLength: Infinity,
                    url: `/api/user/${actions.userId}`,
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                    },
                  };

                  axios
                    .request(config)
                    .then(() => {
                      (function () {
                        toast.current?.show({
                          severity: 'success',
                          summary: 'Successfully Deleted',
                          life: 3000,
                        });
                      })();

                      userQuery.refetch();
                    })
                    .catch((error) => {
                      (function () {
                        toast.current?.show({
                          severity: 'error',
                          summary: 'Error Occured',
                          life: 3000,
                        });
                      })();

                      userQuery.refetch();
                    });
                } else {
                  deactivateActivate(actions.userId, actions.isActive);
                }

                setIsOpen2(false);
              }}
            />
          </TabPanel>
          {context?.authRole !== 'SUPER_ADMIN' &&
            context?.authRole !== 'SUPER ADMIN' && (
              <TabPanel header="Role Management">
                <RolesManagement
                  companyId={userData.companyId}
                  isDefaultAdmin={isDefaultAdmin}
                  query={{
                    data: roleQuery.data,
                    refetch: roleQuery.refetch,
                    isFetching: roleQuery.isFetching,
                    error: roleQuery.error,
                  }}
                  allRolesQueryRefetch={allRolesQuery.refetch}
                  isSidebarOpen={isRoleSidebarOpen}
                  setIsSidebarOpen={setIsRoleSidebarOpen}
                  action={roleModuleAction}
                  setAction={setRoleModuleAction}
                  pagination={rolePagination}
                  setPagination={setRolePagination}
                  valueSearchText={roleSearchText}
                  setValueSearchText={setRoleSearchText}
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                  userRefetch={userQuery.refetch}
                />
              </TabPanel>
            )}
          {/* TOAST */}
        </TabView>
        <RoleSidebar
          isDefaultAdmin={isDefaultAdmin}
          configuration={{
            action: roleModuleAction,
            isOpen: isRoleSidebarOpen,
            setIsOpen: setIsRoleSidebarOpen,
          }}
          selectedRole={selectedRole}
          refetch={roleQuery.refetch}
          userRefetch={userQuery.refetch}
          allRolesQuery={allRolesQuery}
          companyId={userData.companyId}
        />
      </div>
      <Toast ref={toast} position="bottom-left" />
    </div>
  );

  // HANDLERS
  function deactivateActivate(userId: number, isActive: boolean) {
    let config = {
      method: 'patch',
      maxBodyLength: Infinity,
      url: `/api/user/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
      data: JSON.stringify({ isActive: isActive ? 0 : 1 }),
    };

    axios
      .request(config)
      .then(() => {
        (function () {
          toast.current?.show({
            severity: 'success',
            summary: isActive
              ? 'Successfully Deactivated'
              : 'Successfully Activated',
            // detail: 'User Status successfully updated',
            life: 3000,
          });
        })();

        userQuery.refetch();
      })
      .catch((error) => {
        (function () {
          toast.current?.show({
            severity: 'error',
            summary: 'Error Occured',
            // detail: `${error.response.data.message}`,
            life: 3000,
          });
        })();

        userQuery.refetch();
      });
  }

  function handleSidebar(button: string, title: string) {
    setAddUser(true);
    setButtonText(button);
    setSidebarTitle(title);
  }
}

export default Users;
