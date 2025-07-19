'use client';

import { checkDuplicateRoleName } from '@utils/checkDuplicates';
import axios from 'axios';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';

const RoleSidebar = ({
  configuration: { action, isOpen, setIsOpen },
  selectedRole,
  refetch,
  companyId,
  isDefaultAdmin,
  userRefetch,
  allRolesQuery,
}: {
  configuration: any;
  selectedRole: number | null;
  refetch: () => void;
  companyId: string;
  isDefaultAdmin: boolean;
  userRefetch: () => void;
  allRolesQuery: any;
}) => {
  const [modules, setModules] = useState<any[]>([]);

  const [currentRoleName, setCurrentRoleName] = useState<any>('');
  const [roleName, setRoleName] = useState<any>('');
  const [moduleAccess, setModuleAccess] = useState<any>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);
  const [attendanceActions, setAttendanceActions] = useState<any>([]);
  const [payrollActions, setPayrollActions] = useState<any>([]);
  const [isAttendanceActionsDisabled, setIsAttendanceActionsDisabled] =
    useState(true);
  const [isPayrollActionsDisabled, setIsPayrollActionsDisabled] =
    useState(true);
  const checkAccess = (moduleName: string) => {
    if (moduleName === 'Dashboard') {
      if (moduleAccess.some((module: any) => module.moduleId == 1)) {
        // console.log('moduleAccess');
        return 'Admin';
      }

      if (moduleAccess.some((module: any) => module.moduleId == 16))
        return 'Employee';

      return 'None';
    }
    if (moduleName === 'Attendances') {
      if (moduleAccess.some((module: any) => module.moduleId == 2)) {
        return 'Admin';
      } else if (moduleAccess.some((module: any) => module.moduleId === 17)) {
        return 'Employee';
      } else {
        return 'None';
      }
    }
    if (moduleName === 'Attendance Applications') {
      if (moduleAccess.some((module: any) => module.moduleId === 3)) {
        return 'Admin';
      } else if (moduleAccess.some((module: any) => module.moduleId === 18)) {
        return 'Employee';
      } else {
        return 'None';
      }
    }
    if (moduleName === 'Payrolls') {
      if (moduleAccess.some((module: any) => module.moduleId === 4)) {
        return 'Admin';
      } else if (moduleAccess.some((module: any) => module.moduleId === 19)) {
        return 'Employee';
      } else {
        return 'None';
      }
    }
  };
  useEffect(() => {
    setIsLoading(true);
    if (isOpen) {
      axios
        .get(`/api/modules`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
        .then((response) => {
          const filteredModules = response.data.message.filter(
            (module: any) =>
              module.moduleName !== 'Employee Dashboard' &&
              module.moduleName !== 'Employee Attendances' &&
              module.moduleName !== 'Employee Attendance Applications' &&
              module.moduleName !== 'Employee Payrolls'
          );
          setModules(filteredModules);
        })
        .catch((err) => {
          // console.log('module');
          console.log(err);
        });

      axios
        .get(`/api/user_roles/${selectedRole}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
        .then((response) => {
          // console.log(response.data.message);
          // console.log(response.data.attendanceActions);
          // console.log(response.data.payrollActions);
          const attendanceActions = response.data.attendanceActions.map(
            (action: any) => {
              return action.moduleActionId;
            }
          );
          const payrollActions = response.data.payrollActions.map(
            (action: any) => {
              return action.moduleActionId;
            }
          );
          const parsedModuleAccess = JSON.parse(
            response.data.message.moduleAccess
          );
          setRoleName(response.data.message.roleName);
          setCurrentRoleName(response.data.message.roleName);
          setModuleAccess(parsedModuleAccess);
          setAttendanceActions(attendanceActions);
          setPayrollActions(payrollActions);
          let isAdminAttendanceModuleFound = false;
          let isAdminPayrollModuleFound = false;
          for (let i = 0; i < parsedModuleAccess.length; i++) {
            if (parsedModuleAccess[i].moduleId == 2) {
              isAdminAttendanceModuleFound = true;
            } else if (parsedModuleAccess[i].moduleId == 4) {
              isAdminPayrollModuleFound = true;
            }
          }
          // console.log(isAdminAttendanceModuleFound);
          setIsAttendanceActionsDisabled(!isAdminAttendanceModuleFound);
          setIsPayrollActionsDisabled(!isAdminPayrollModuleFound);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log('user_roles');
          console.log(err);
        });
    } else {
      setAttendanceActions([]);
      setPayrollActions([]);
    }
  }, [selectedRole, isOpen]);
  useEffect;

  const handleUpdate = async () => {
    if (roleName.length > 0) {
      const duplicateName = await checkDuplicateRoleName({
        companyId: Number.parseInt(companyId),
        roleName: roleName,
      });

      if (duplicateName && roleName !== currentRoleName) {
        toastInfo.current?.clear();
        toast.current?.show({
          severity: 'error',
          detail: 'Role Name already exists.',
          life: 5000,
        });
        setError('Role name already exists');
      } else {
        setIsUpdating(true);
        const update = await axios.patch(
          `/api/user_roles/${selectedRole}`,
          JSON.stringify({
            roleName: roleName,
            moduleAccess: JSON.stringify(moduleAccess),
            attendanceActions: attendanceActions,
            payrollActions: payrollActions,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        );
        setIsUpdating(false);
        if (update) {
          refetch();
          userRefetch();
          allRolesQuery.refetch();
          toastInfo.current?.clear();
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully updated',
            life: 5000,
          });
          setIsOpen(false);
        }
      }
    } else {
      setError('Role name is required');
    }
  };

  useEffect(() => {
    if (isUpdating) {
      toastInfo.current?.replace({
        severity: 'info',
        summary: 'Updating module access',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
    }
  }, [isUpdating]);

  useEffect(() => {
    if (roleName.length <= 0) {
      setError('Role name is required');
    } else {
      setError(null);
    }
  }, [roleName, setRoleName]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        closeOnEscape={true}
        dismissable={true}
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onHide={() => setIsOpen(false)}
      >
        {action === 'edit' ? (
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-5 gap-5 sm:gap-0">
            <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto">
              <label className="my-1">
                <span>Role Name</span>
              </label>
              <InputText
                disabled={
                  roleName === 'ADMIN' || roleName === 'EMPLOYEE' || isLoading
                }
                className="w-[250px] md:w-14rem"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
              {error && <span className="text-red-600">{error}</span>}
            </div>
          </div>
        ) : (
          <DashboardNav
            navTitle={`${roleName}`}
            buttons={[]}
            isShowSearch={false}
          />
        )}
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
              ]
              : modules
          }
          selectionMode={'single'}
          scrollable={true}
          scrollHeight="700px"
        >
          <Column
            field="date"
            header="Modules"
            className="w-2/5"
            body={(data) => {
              return isLoading ? <Skeleton /> : <span>{data.moduleName}</span>;
            }}
          />
          <Column
            field="access"
            header="Access Status"
            body={(data) => {
              const isAccessible = moduleAccess.some(
                (module: any) => module.moduleId === data.moduleId
              );
              return isLoading ? (
                <Skeleton />
              ) : (
                <div className="flex-row flex">
                  {data.moduleName === 'Dashboard' ||
                    data.moduleName === 'Attendances' ||
                    data.moduleName === 'Attendance Applications' ||
                    data.moduleName === 'Payrolls' ? (
                    <>
                      <Dropdown
                        disabled={
                          action === 'view' ||
                            roleName === 'ADMIN' ||
                            roleName === 'EMPLOYEE'
                            ? true
                            : false
                        }
                        options={
                          data.moduleName === 'Dashboard'
                            ? // removed none for dashboard since it is a default page and should emptied
                            [
                              { label: 'Admin', value: 'Admin' },
                              { label: 'Employee', value: 'Employee' },
                            ]
                            : [
                              { label: 'Admin', value: 'Admin' },
                              { label: 'Employee', value: 'Employee' },
                              { label: 'None', value: 'None' },
                            ]
                        }
                        value={checkAccess(data.moduleName)}
                        onChange={(e) => {
                          let filteredArr = [];
                          // dashboard dropdown module access
                          if (data.moduleName === 'Dashboard') {
                            filteredArr = moduleAccess.filter(
                              (module: any) =>
                                module.moduleId !== 1 && module.moduleId !== 16
                            );

                            if (e.value === 'Admin') {
                              filteredArr = [...filteredArr, { moduleId: 1 }];
                            } else if (e.value === 'Employee') {
                              filteredArr = [...filteredArr, { moduleId: 16 }];
                            } else {
                              filteredArr = filteredArr;
                            }
                          }
                          // attendances dropdown module access
                          else if (data.moduleName === 'Attendances') {
                            filteredArr = moduleAccess.filter(
                              (module: any) =>
                                module.moduleId !== 2 && module.moduleId !== 17
                            );
                            if (e.value === 'Admin') {
                              filteredArr = [...filteredArr, { moduleId: 2 }];
                              setIsAttendanceActionsDisabled(false);
                            } else if (e.value === 'Employee') {
                              filteredArr = [...filteredArr, { moduleId: 17 }];
                              setAttendanceActions([]);
                              setIsAttendanceActionsDisabled(true);
                            } else {
                              filteredArr = filteredArr;
                              setAttendanceActions([]);
                              setIsAttendanceActionsDisabled(true);
                            }
                          }
                          // attendance dropdown applications module access
                          else if (
                            data.moduleName === 'Attendance Applications'
                          ) {
                            filteredArr = moduleAccess.filter(
                              (module: any) =>
                                module.moduleId !== 3 && module.moduleId !== 18
                            );
                            if (e.value === 'Admin') {
                              filteredArr = [...filteredArr, { moduleId: 3 }];
                            } else if (e.value === 'Employee') {
                              filteredArr = [...filteredArr, { moduleId: 18 }];
                            } else {
                              filteredArr = filteredArr;
                            }
                          }
                          // payrolls dropdown module access
                          else if (data.moduleName === 'Payrolls') {
                            filteredArr = moduleAccess.filter(
                              (module: any) =>
                                module.moduleId !== 4 && module.moduleId !== 19
                            );
                            if (e.value === 'Admin') {
                              filteredArr = [...filteredArr, { moduleId: 4 }];
                              setIsPayrollActionsDisabled(false);
                            } else if (e.value === 'Employee') {
                              filteredArr = [...filteredArr, { moduleId: 19 }];
                              setPayrollActions([]);
                              setIsPayrollActionsDisabled(true);
                            } else {
                              filteredArr = filteredArr;
                              setPayrollActions([]);
                              setIsPayrollActionsDisabled(true);
                            }
                          }
                          setModuleAccess(
                            filteredArr.sort(
                              (a: any, b: any) => a.moduleId - b.moduleId
                            )
                          );
                        }}
                      ></Dropdown>
                    </>
                  ) : (
                    <InputSwitch
                      checked={isAccessible}
                      onChange={(e) => {
                        // console.log(checkAccess('Dashboard'));
                        const updatedAccess = isAccessible
                          ? moduleAccess.filter(
                            (module: any) => module.moduleId !== data.moduleId
                          )
                          : [...moduleAccess, { moduleId: data.moduleId }];
                        setModuleAccess(
                          updatedAccess.sort(
                            (a: any, b: any) => a.moduleId - b.moduleId
                          )
                        );
                        // console.log(updatedAccess);
                      }}
                      disabled={
                        action === 'view' ||
                          roleName === 'ADMIN' ||
                          roleName === 'EMPLOYEE'
                          ? true
                          : false
                      }
                    />
                  )}
                  {/* <InputSwitch
                    checked={isAccessible}
                    onChange={(e) => {
                      const updatedAccess = isAccessible
                        ? moduleAccess.filter(
                            (module: any) => module.moduleId !== data.moduleId
                          )
                        : [...moduleAccess, { moduleId: data.moduleId }];
                      setModuleAccess(
                        updatedAccess.sort(
                          (a: any, b: any) => a.moduleId - b.moduleId
                        )
                      );
                      console.log(updatedAccess);
                    }}
                    disabled={action === 'view' ? true : false}
                  /> */}
                </div>
              );
            }}
          />
          <Column
            field="actions"
            header="Module Actions"
            className="w-1/5"
            body={(data) => {
              if (isLoading) return <Skeleton />;
              switch (data.moduleName) {
                case 'Attendances':
                  return (
                    <>
                      <MultiSelect
                        disabled={
                          action === 'view' ||
                          roleName === 'ADMIN' ||
                          roleName === 'EMPLOYEE' ||
                          isAttendanceActionsDisabled
                          // ? true
                          // : false
                        }
                        className="w-[400px]"
                        options={data.module_actions.map((item: any) => ({
                          name: item.action,
                          value: item.moduleActionId,
                        }))}
                        value={attendanceActions}
                        optionLabel="name"
                        onChange={async (e) => {
                          await setAttendanceActions(e.value);
                          // console.log(attendanceActions);
                        }}
                      ></MultiSelect>
                    </>
                  );
                  break;
                case 'Payrolls':
                  return (
                    <div className="flex-row flex">
                      <MultiSelect
                        disabled={
                          action === 'view' ||
                            roleName === 'ADMIN' ||
                            roleName === 'EMPLOYEE' ||
                            isPayrollActionsDisabled
                            ? true
                            : false
                        }
                        className="w-[400px]"
                        options={data.module_actions.map((item: any) => ({
                          name: item.action,
                          value: item.moduleActionId,
                        }))}
                        optionLabel="name"
                        value={payrollActions}
                        onChange={async (e) => {
                          await setPayrollActions(e.value);
                          // console.log(payrollActions);
                        }}
                      ></MultiSelect>
                    </div>
                  );
                  break;
                default:
                  return <></>;
              }
            }}
          ></Column>
        </DataTable>

        <div className="mt-10 w-full flex justify-end">
          {action === 'edit' && (
            <>
              <Button
                type="button"
                severity="secondary"
                text
                label="Cancel"
                className="rounded-full px-10"
                onClick={() => setIsOpen(false)}
              />
              <Button
                label="Save"
                className="rounded-full px-10 p-button"
                onClick={handleUpdate}
              />
            </>
          )}
        </div>
      </Sidebar>
    </>
  );
};

export default RoleSidebar;
