/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { Toast } from 'primereact/toast';
import { GlobalContainer } from 'lib/context/globalContext';
import { MultiSelect } from 'primereact/multiselect';
import { Column } from 'primereact/column';
import { checkDuplicateDepartmentName } from '@utils/checkDuplicates';
import { TreeTable } from 'primereact/treetable';
import { properCasing } from '@utils/helper';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { set } from 'lodash';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import employee from 'db/models/employee';
import { Paginator } from 'primereact/paginator';
const IntialFormState = {
  departmentId: null,
  departmentName: '',
};

type Employee = {
  name: string;
  code: string;
};

const DepartmentsSidebar = ({
  configuration: {
    title,
    submitBtnText,
    action,
    rowData,
    isOpen,
    departmentId,
  },
  setSideBarConfig,
  refetchDataFromParent,
  companyId,
  isEditDisabled,
  setIsEditDisabled,
}: {
  configuration: DepartmentsSideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  companyId: string;
  isEditDisabled: boolean;
  setIsEditDisabled: (val: boolean) => void;
}) => {
  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    setError,
    getValues,
    register,
  } = useForm({
    mode: 'onBlur',
    defaultValues: { ...IntialFormState },
  });

  const context = React.useContext(GlobalContainer);
  const userId = context?.userData.userId;
   const [first, setFirst] = useState(0);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [isLoading, setisLoading] = useState(false);
  const [isRetrievingEmployees, setIsRetrievingEmployees] = useState(false);
  const [removedEmployees, setRemovedEmployees] = useState<any[]>([]);
  const [state, setState] = useState({
    node: [],
    activeItem: {
      node: [] as {
        key: number;
        data: {
          employeeId: string;
          employeeName: string;
        };
      }[],
    },
  });
  const [filter, setFilter] = useState('');

  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);
  const loadingData = Array(5)
    .fill(null)
    .map(() => ({
      data: {
        employeeName: 'Loading...',
        employeeId: 'Loading...',
      },
    }));


  const fetchDepartmentEmployees = async ({
    limit,
    offset,
    departmentId,
    search,
  }: {
    limit: number;
    offset: number;
    departmentId: string;
    search: string;
  }) =>
    await fetch(
      `/api/departments/employee/assignedEmployees?limit=${limit}&offset=${offset}&departmentId=${departmentId}&search=${search}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    )
      .then((res) => res.json())
      .catch((err) => console.error(err));

  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Add debounced filter state
  const debouncedFilter = useDebounce(filter, 500);

  const {
    isFetching,
    error,
    data: employeeData,
    refetch,
    isRefetching,
  } = useQuery({
    enabled: !!departmentId,
    refetchOnWindowFocus: false,
    queryKey: ['departmentEmployees', pagination, debouncedFilter, departmentId, isOpen],
    queryFn: () =>
      fetchDepartmentEmployees({
        ...pagination,
        search: debouncedFilter,
        departmentId: departmentId as string,
      }),
  });

  useEffect(() => {
    if (!!employeeData?.message && !isFetching) {
      const nodeData = employeeData.message.rows.map(
        (item: any, index: any) => ({
          key: item.employeeId,
          data: {
            employeeName: item.user?.userFullName,
            employeeId: item.employeeId,
          },
        })
      );

      setState((prevState) => ({
        ...prevState,
        node: nodeData,
      }));
    }
  }, [employeeData, isFetching, isOpen]);

  const noDepartmentEmployees = useQuery({
    queryKey: ['noDepartmentEmployees', companyId],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/departments/employee/noDepartment`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        });

        setEmployees(
          res.data.map((employee: any) => ({
            name: employee.employee_profile?.employeeFullName,
            code: employee.employeeId,
          }))
        );
        return [];
      } catch (err) {
        console.log(err);
        return [];
      }
    },
  });

  const removeEmployee = async (e: any, employeeData: any) => {
    e.preventDefault();
    const removedEmployee: EmployeeData | undefined = state.node.find(
      (employee: EmployeeData) =>
        employee.data.employeeId === employeeData.data.employeeId
    );

    

    if (removedEmployee) {
      const { data } = removedEmployee as EmployeeData;
      setRemovedEmployees((prev) => [...prev, data.employeeId]);
      const removedEmployeeData = {
        name: (data && data.employeeName) || '',
        code: (data && data.employeeId) || '',
      };

      const updatedNode = state.node.filter(
        (employee: any) =>
          employee.data.employeeId !== employeeData.data.employeeId
      );

      const updatedEmployees = [...employees, removedEmployeeData];

      setState((prevState) => ({
        ...prevState,
        node: updatedNode,
      }));

      setEmployees(updatedEmployees);
      // if (action === 'edit') {
      //   refetchDataFromParent();
      // }
    }
  };

  function renderActions(rowData: any) {
    if (isRetrievingEmployees) return <Skeleton />;
    return (
      <div className="flex items-center gap-3">
        {action !== 'view' ? (
          <Button
            icon="pi pi-trash"
            type="button"
            text
            tooltip="Delete"
            tooltipOptions={{ position: 'top' }}
            onClick={(e) => {
              removeEmployee(e, rowData);
            }}
          />
        ) : (
          <i
            className="pi pi-trash ml-3"
            style={{ fontSize: '20px', color: 'gray', cursor: 'not-allowed' }}
          />
        )}
      </div>
    );
  }

  const onSubmit = async (data: DepartmentForm) => {
    if (Object.keys(errors).length > 0) return false;

    let apiUrl = '/api/departments/';
    let departmentEmployeesUrl = '/api/departments/departmentEmployees/';
    let deptId = '';
    let departmentEmployeeUrl = '/api/departments/employee';

    // CHECK FOR DUPLICATES
    setisLoading(true);
    setIsEditDisabled(true);
    const valid = await checkDuplicates({
      companyId: companyId,
      departmentName: data.departmentName,
      departmentId: data.departmentId,
    });
    if (!valid) {
      setisLoading(false);
      setIsEditDisabled(false);

      return false;
    }

    setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));

    const requestBody = {
      departmentName: data.departmentName,
      companyId: companyId,
      userId: userId,
    };
    let response = null;
    // CREATE OR UPDATE DEPARTMENT DETAILS
    let parsedResponse = null;
    setFilter('');
    try {
      if (action === 'add') {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          body: JSON.stringify(requestBody),
        });
        parsedResponse = await response.json();
      } else if (action === 'edit') {
        apiUrl = apiUrl + `${departmentId}`;
        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          body: JSON.stringify(requestBody),
        });
        parsedResponse = await response.json();
        // refetchDataFromParent();
      }
      // console.log('response!');
      // console.log(response);
      if (response && response.status != 200) {
        toastInfo.current?.clear();
        toast.current?.show({
          severity: 'error',
          detail: parsedResponse.message,
          life: 5000,
        });
        setisLoading(false);
        setIsEditDisabled(false);
        return;
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
      setisLoading(false);
      setIsEditDisabled(false);
      return;
    }

    // UPDATE EMPLOYEE DEPARTMENT
    let employeeIds: any = [];
    try {
      if (response?.ok && state.node) {
        deptId =
          action === 'add'
            ? parsedResponse?.message?.departmentId
            : departmentId;
        state.node.map((item: any) => {
          employeeIds.push(item.data.employeeId);
        });
        const requestBodyForUpdateEmployee = {
          departmentId: action === 'add' ? deptId : departmentId,
          employeeIds: employeeIds,
          removedEmployeeIds: removedEmployees,
        };
        if ((action === 'add' && employeeIds.length > 0) || action === 'edit') {
          await axios.patch(
            `/api/departments/employee`,
            requestBodyForUpdateEmployee,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          );
        }
        toastInfo.current?.clear();
      }
      setisLoading(false);
      setIsEditDisabled(false);
      if (response?.ok) {
        toastInfo.current?.clear();
        // console.log(parsedResponse);
        // const department = parsedResponse.data;
        // deptId = department.message.departmentId;

        if (action === 'add') {
          toast.current?.replace({
            severity: 'success',
            summary: 'Successfully Created',
            life: 5000,
          });
        } else if (action === 'edit') {
          toast.current?.replace({
            severity: 'success',
            summary: 'Successfully Updated',
            life: 5000,
          });
        }
      }
      refetchDataFromParent();
    } catch (err) {
      console.log(err);
      toastInfo.current?.clear();
      setisLoading(false);
      setIsEditDisabled(false);
      refetchDataFromParent();
    }
    // deptId is for creation of departments
    // console.log(isLoading);
    // console.log(isRetrievingEmployees);
    // console.log(noDepartmentEmployees.isLoading);
    // console.log(isSubmitting);
    // console.log(!isValid);

    return;
  };

   useEffect(() => {
    setFilter('');
    setEmployees([]);
    setSelectedEmployees([]);
    // refetchDataFromParent();
  }, [action, reset, rowData, setValue, refetchDataFromParent]);
  
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        if (action === 'edit' || action === 'view') {
          const { departmentName, departmentId }: any = rowData;
          setValue('departmentName', departmentName);
          setValue('departmentId', departmentId);
        } else {
          reset();
          setEmployees([]);
          setSelectedEmployees([]);
        }
      };

      Promise.allSettled([fetchData(), noDepartmentEmployees.refetch()]).then(
        () => {
          setIsRetrievingEmployees(false);
        }
      );
    } else {
      setState({
        node: [],
        activeItem: {
          node: [] as {
            key: number;
            data: {
              employeeId: string;
              employeeName: string;
            };
          }[],
        },
      })
      setRemovedEmployees([]);
    }
  }, [isOpen]);

  function onAssign(e: any) {
    e.preventDefault();

    if (selectedEmployees && selectedEmployees.length > 0) {
      // behavior for creating department
      if (action === 'add' || action === 'edit') {
        const nodeData = selectedEmployees.map((item: any) => ({
          key: item.code,
          data: {
            employeeName: item.name,
            employeeId: item.code,
          },
        }));
        setState((prevState: any) => ({
          ...prevState,
          node: [...nodeData, ...prevState.node],
        }));

        // const updatedEmployees = employees.filter((employee) =>
        //   selectedEmployees.every(
        //     (selectedEmployee) => selectedEmployee.name !== employee.name
        //   )
        // );
        setEmployees(
          employees.filter((employee: any) =>
            selectedEmployees.every(
              (selectedEmployee) => selectedEmployee.name !== employee.name
            )
          )
        );
        setSelectedEmployees([]);
        // refetchDataFromParent();
      }
    } else {
      // console.log('No data in Selected Employees');
    }
  }

  useEffect(() => {
    if (isValid && isSubmitting) {
      toastInfo.current?.show({
        severity: 'info',
        summary: 'Submitting request',
        detail: 'Please wait...',
        sticky: true,
        closable: false,
      });
    }
  }, [isValid, isSubmitting]);

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        position="right"
        style={{
          width: '84%',
        }}
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <React.Fragment>
          <form
            className="w-full overflow-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1 className="text-black font-medium text-3xl mb-3">{title}</h1>

            {/* ASSIGN EMPLOYEE */}
            <div className="w-full h-full p-5 mt-12">
              <div className="flex flex-col sm:flex-row w-full">
                <>
                  <div className="pr-10 gap-10">
                    <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mb-5 mt-5">
                      <div className="flex flex-col flex-auto">
                        <label className="my-1">
                          <span className="text-red-500">*</span>
                          <span>Department Name</span>
                        </label>
                        <InputText
                          disabled={action == 'view' || isSubmitting}
                          className={classNames('w-full md:w-14rem', {
                            'p-invalid': errors.departmentName,
                          })}
                          {...register('departmentName', {
                            required: 'Department name is required.',
                          })}
                        />
                        {errors.departmentName && (
                          <span className="text-red-600">
                            {errors.departmentName.message}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mt-5">
                      <span className="my-1">Choose Employee/s:</span>
                      <MultiSelect
                        filter
                        display={'chip'}
                        name="employees"
                        disabled={
                          action == 'view' ||
                          isSubmitting ||
                          employees.length <= 0 ||
                          isRetrievingEmployees
                        }
                        inputId="employees"
                        placeholder={
                          employees.length > 0
                            ? 'Choose Employee: '
                            : 'No options Available'
                        }
                        optionLabel="name"
                        value={selectedEmployees || ''}
                        onChange={(e) => setSelectedEmployees(e.value)}
                        options={employees}
                        className="w-full sm:w-[15rem] md:w-[19rem] lg:w-[25rem]"
                        virtualScrollerOptions={{ itemSize: 40 }}
                      />
                    </div>
                    <div className="login mt-10">
                      <Button
                        label="Assign Department"
                        disabled={
                          selectedEmployees.length <= 0 ||
                          isLoading ||
                          isSubmitting ||
                          isRetrievingEmployees
                        }
                        rounded
                        className="min-w-[200px] flex justify-center items-center gap-3"
                        onClick={onAssign}
                      />
                    </div>
                  </div>
                  {/* Vertical line */}
                  <div className="border-r border-2 sm:mt-0 mt-5"></div>
                </>
                <div className="pl-5 w-full sm:mt-0 mt-5">
                  <h1>List of Employees</h1>
                  <span className="p-input-icon-left w-full md:w-[90%] lg:w-[93.5%] justify-center flex mt-5 items-center sm:ml-10 lg:mb-0 mb-5">
                    <i className="pi pi-search absolute" />
                    <InputText
                      placeholder="Search"
                      className="w-full"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </span>

                  {state.node && (
                    <Fragment>
                    <DataTable
                      disabled={action == 'view' || isSubmitting}
                      tableStyle={{
                        minWidth: '10rem',
                        fontSize: '15px',
                      }}
                      globalFilter={filter}
                      globalFilterFields={['data.employeeName']}
                      className="overflow-auto pt-5 sm:pt-0 md:pl-10 lg:p-10"
                      value={isRetrievingEmployees ? loadingData : state.node}
                    >
                      <Column
                        field="employeeName"
                        header="Employee Name"
                        body={(item) => {
                          if (isRetrievingEmployees) return <Skeleton />;
                          return <>{item.data.employeeName}</>;
                        }}
                      />

                      {title !== 'View Department' && (
                        <Column header="Actions" body={renderActions} />
                      )}
                    </DataTable>
                    <Paginator
                        first={first}
                        rows={pagination.limit}
                        totalRecords={employeeData && employeeData.message?.count}
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
                      </Fragment>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full flex justify-end mt-[70px]">
              <Button
                type="button"
                severity="secondary"
                text
                label="Cancel"
                className="rounded-full px-10"
                onClick={() =>
                  setSideBarConfig((prev: any) => ({
                    ...prev,
                    isOpen: false,
                  }))
                }
              />
              {submitBtnText && (
                <Button
                  label={submitBtnText}
                  className="rounded-full px-10 p-button"
                  disabled={
                    isLoading ||
                    isRetrievingEmployees ||
                    noDepartmentEmployees.isLoading ||
                    isSubmitting ||
                    !isValid
                  }
                />
              )}
            </div>
          </form>
        </React.Fragment>
      </Sidebar>
    </>
  );

  async function checkDuplicates({
    companyId,
    departmentId,
    departmentName,
  }: {
    companyId: any;
    departmentId: string | null;
    departmentName: string;
  }) {
    let errorCount = 0;

    const duplicateName = await checkDuplicateDepartmentName({
      companyId: companyId,
      departmentName: departmentName,
      departmentId: departmentId,
    });

    if (duplicateName) {
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: 'Department Name already exists.',
        life: 5000,
      });
      errorCount++;
      setError('departmentName', {
        type: 'Duplicate',
        message: 'Department Name already exists.',
      });
    }

    return errorCount > 0 ? false : true;
  }
};

export default DepartmentsSidebar;
