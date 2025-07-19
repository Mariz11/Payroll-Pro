/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useForm } from 'react-hook-form';
import { Calendar } from 'primereact/calendar';
import classNames from 'classnames';
import { Toast } from 'primereact/toast';
import { Controller } from 'react-hook-form';
import {
  convertDateTo24Hour,
  timeStringToDate,
} from '@utils/dashboardFunction';
import { GlobalContainer } from 'lib/context/globalContext';
import { InputSwitch } from 'primereact/inputswitch';
import { MultiSelect } from 'primereact/multiselect';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { checkDuplicateShiftName } from '@utils/checkDuplicates';
import { TreeTable } from 'primereact/treetable';
import { shiftsData } from '@constant/tableData';
import shift from 'db/models/shift';
import moment from '@constant/momentTZ';
import axios from 'axios';
import { Skeleton } from 'primereact/skeleton';
import { Paginator } from 'primereact/paginator';
import { useQueries, useQuery } from '@tanstack/react-query';
import { AnyKindOfDictionary, set } from 'lodash';
import { resolve } from 'path';
import department from 'db/models/department';
import { ref } from 'yup';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Checkbox } from 'primereact/checkbox';
type Employee = {
  name: string;
  code: string;
  department: string;
};

const IntialFormState = {
  shiftId: null,
  shiftName: '',
  timeIn: '',
  timeOut: '',
  lunchStart: '',
  lunchEnd: '',
  workingHours: 0,
};

const ShiftSidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen, shiftId },
  setSideBarConfig,
  refetchDataFromParent,
  companyId,
  setIsEditDisabled,
}: {
  configuration: ShiftsSideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  companyId: string;
  setIsEditDisabled: any;
}) => {
  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    setError,
    register,
  } = useForm({
    mode: 'onBlur',
    defaultValues: { ...IntialFormState },
  });

  const context = React.useContext(GlobalContainer);
  const userId = context?.userData.userId;
  const [isEmployee, setIsEmployee] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftEmployees, setShiftEmployees] = useState<any[]>([]);
  const [isRetrievingEmployees, setIsRetrievingEmployees] = useState(false);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5,
  });
  const [selectConfig, setSelectConfig] = useState({
    offset: 0,
    limit: 20,
  });
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<{
    name: string;
    code: string;
  }>({ name: '', code: '' });
  const [filter, setFilter] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [searchedEmployees, setSearchedEmployees] = useState<any[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [state, setState] = useState({
    node: [],
    activeItem: {
      node: [] as {
        key: number;
        data: {
          employeeId: string;
          employeeName: string;
          department: string;
        };
      }[],
    },
  });
  const loadingData = Array(5)
    .fill(null)
    .map(() => ({
      data: {
        employeeName: 'Loading...',
        employeeId: 'Loading...',
      },
    }));
  const toast = useRef<Toast>(null);
  const toastInfo = useRef<Toast>(null);

  const {
    isLoading: isLoadingDepartments,
    isFetching: isFetchingDepartments,
    error: errorDepartments,
    refetch: refetchDepartments,
    data: departmentData,
  } = useQuery(
    ['departments', isEmployee],
    async () => {
      const response = await axios.get(
        `/api/shifts/departments?companyId=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      setDepartments(
        response.data.message.map((item: any) => ({
          name: item.departmentName,
          code: item.departmentId,
        }))
      );
      return response.data.message.map((item: any) => ({
        name: item.departmentName,
        code: item.departmentId,
      }));
    },
    {
      enabled: isOpen,
      refetchOnWindowFocus: false,
    }
  );

  // Query for employees
  const {
    isLoading: isLoadingEmployees,
    isFetching: isFetchingEmployees,
    error: errorEmployees,
    refetch: refetchEmployees,
    data: employeeData,
  } = useQuery(
    ['employees', selectConfig.offset, filterEmployee, setSelectConfig],
    async () => {
      const response = await axios.get(
        `/api/shifts/employee?limit=${selectConfig.limit}&offset=${selectConfig.offset}&filter=${filterEmployee}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );
      // console.log(response);
      if (filterEmployee !== '') {
        setSearchedEmployees(
          response.data?.employeesAssignable.rows.map((employee: any) => ({
            name: employee.employee_profile.employeeFullName,
            code: employee.employeeId,
            department: employee.department
              ? employee.department.departmentName
              : '',
          }))
        );
        setIsFiltered(true);
      } else {
        setIsFiltered(false);
        // console.log(response.data?.employeesAssignable.rows);
        setEmployees((prev) => [
          ...prev,
          ...response.data?.employeesAssignable.rows
            .filter(
              (employee: any) =>
                !prev.some(
                  (existingEmployee: any) =>
                    existingEmployee.code === employee.employeeId
                )
            )
            .map((employee: any) => ({
              name: employee.employee_profile.employeeFullName,
              code: employee.employeeId,
              department: employee.department
                ? employee.department.departmentName
                : '',
            })),
        ]);
      }

      setTotalEmployees(response.data?.employeesAssignable.count);

      return [];
      // response.data?.employeesAssignable.rows.map((employee: any) => ({
      //   name: employee.employee_profile.employeeFullName,
      //   code: employee.employeeId,
      //   department: employee.department
      //     ? employee.department.departmentName
      //     : '',
      // }));
    },
    {
      enabled: isOpen,
      refetchOnWindowFocus: false,
    }
  );

  const {
    isLoading: isLoadingShiftsEmployee,
    error: errorShiftsEmployee,
    refetch: shiftsEmployeeRefetch,
    isRefetching: isRefetchingShiftsEmployee,
    data: shiftEmployeeData,
  } = useQuery(
    ['shiftEmployees', pagination.offset, pagination.limit, filter],
    async () => {
      const response = await fetch(
        `/api/shifts/${shiftId}?limit=${pagination.limit}&offset=${pagination.offset}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch shift employees');
      }

      const shiftData = await response.json();
      setTotalRecords(shiftData.message.count);
      if (shiftData.message.rows) {
        return shiftData.message.rows.map((item: any) => ({
          key: item.employeeId,
          data: {
            employeeName: item.employee_profile.employeeFullName,
            department:
              item.department !== null ? item.department.departmentName : '',
            employeeId: item.employeeId,
          },
        }));
      }

      return [];
    },
    {
      enabled: action !== 'add' && isOpen,
      onError: (error) => console.error('Error fetching employees:', error),
      refetchOnWindowFocus: false,
    }
  );

  const removeEmployee = async (e: any, data: any) => {
    e.preventDefault();

    if (action == 'add') {
      setShiftEmployees((prev) =>
        prev.filter(
          (employee: any) => employee.data.employeeId !== data.data.employeeId
        )
      );
      setEmployees((prev) => [
        ...prev,
        {
          name: data.data.employeeName,
          code: data.data.employeeId,
          department: data.data.department,
        },
      ]);

      return;
    }

    const removedEmployee: EmployeeData | undefined = shiftEmployees.find(
      (employee: EmployeeData) =>
        employee.data.employeeId === data.data.employeeId
    );

    const requestBodyForUpdateEmployee = {
      shiftId: null,
      employeeIds: [removedEmployee?.data.employeeId],
    };

    try {
      await axios.patch(`/api/shifts/employee`, requestBodyForUpdateEmployee, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      });

      setEmployees([
        // {
        //   name: 'Select all',
        //   code: 'all',
        //   department: '',
        // },
      ]);
      setSelectedEmployees([]);
      setSelectConfig((prev) => ({
        ...prev,
        offset: 0,
      }));
      refetchEmployees();
      shiftsEmployeeRefetch();
    } catch (error) {
      console.error('Error removing employee:', error);
    }
  };

  function renderActions(rowData: any) {
    if (isRetrievingEmployees) return <Skeleton />;
    const confirmRemoveEmployee = (e: any, rowData: any) => {
      confirmDialog({
        message: 'Do you want to remove this employee?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => removeEmployee(e, rowData),
        reject: () => { },
        draggable: false,
      });
    };

    return (
      <>
        <div className="flex items-center gap-3">
          {action !== 'view' ? (
            <Button
              icon="pi pi-trash"
              type="button"
              text
              tooltip="Delete"
              tooltipOptions={{ position: 'top' }}
              onClick={(e) => {
                confirmRemoveEmployee(e, rowData);
              }}
            />
          ) : (
            <i
              className="pi pi-trash ml-3"
              style={{ fontSize: '20px', color: 'gray', cursor: 'not-allowed' }}
            />
          )}
        </div>
      </>
    );
  }

  const onSubmit = async (data: ShiftsForm) => {
    setIsEditDisabled(true);
    if (Object.keys(errors).length > 0) return false;
    let apiUrl = '/api/shifts';

    const valid = await checkDuplicates({
      companyId: companyId,
      shiftName: data.shiftName,
      shiftId: data.shiftId,
    });
    if (!valid) return false;

    // Working Hours
    const timeIn = new Date(watch().timeIn);
    const timeOut = new Date(watch().timeOut);

    const lunchStart = new Date(watch().lunchStart);
    const lunchEnd = new Date(watch().lunchEnd);

    // Check if the time out is earlier than the time in on the same day
    if (timeOut < timeIn) {
      timeOut.setDate(timeOut.getDate() + 1);
    }

    if (lunchEnd < lunchStart) {
      lunchEnd.setDate(lunchEnd.getDate() + 1);
    }
    // throw errors if di mo fall within range ang lunch end
    let errorCount = 0;

    if (
      timeIn.getDate() < timeOut.getDate() &&
      lunchStart.getDate() === lunchEnd.getDate()
    ) {
      if (lunchStart < timeIn) {
        lunchStart.setDate(lunchStart.getDate() + 1);
      }

      if (lunchEnd < timeIn) {
        lunchEnd.setDate(lunchEnd.getDate() + 1);
      }
    }
    // if (
    //   timeIn.getDate() < timeOut.getDate() &&
    //   lunchEnd.getDate() === timeIn.getDate()
    // ) {
    //   lunchEnd.setDate(lunchEnd.getDate() + 1);
    // }

    if (lunchStart < timeIn || lunchStart > timeOut) {
      setError('lunchStart', {
        type: 'required',
        message: 'Lunch should be between Time In/Out',
      });
      errorCount++;
    }
    if (lunchEnd > timeOut || lunchEnd < timeIn) {
      setError('lunchEnd', {
        type: 'required',
        message: 'Lunch should be between Time In/Out',
      });
      errorCount++;
    }

    if (errorCount > 0) {
      toastInfo.current?.clear();
      return;
    }

    const timeInTimestamp = timeIn.getTime();
    const timeOutTimestamp = timeOut.getTime();

    const lunchStartTimestamp = new Date(lunchStart).getTime();
    const lunchEndTimestamp = new Date(lunchEnd).getTime();

    // const timeDifference: any = timeOutTimestamp - timeInTimestamp;
    // const lunchDifference: any = lunchEndTimestamp - lunchStartTimestamp;

    // get Date today;
    const dateToday = timeIn.getDate();
    const timeInFormatted = moment(timeIn);
    const timeOutFormatted = moment(timeOut);

    const lunchEndFormatted = moment(new Date(lunchEnd));
    const lunchStartFormatted = moment(new Date(lunchStart));

    let hoursWorked = parseFloat(
      (timeOutFormatted.diff(timeInFormatted, 'minutes') / 60).toFixed(2)
    );
    // console.log(hoursWorked);
    // const shiftLunchBreakHours = parseFloat(
    //   (ShiftLunchEnd.diff(ShiftLunchStart, 'minutes') / 60).toFixed(2)
    // );
    const lunchBreakHours = parseFloat(
      (lunchEndFormatted.diff(lunchStartFormatted, 'minutes') / 60).toFixed(2)
    );
    // console.log(lunchBreakHours);
    const hours = (hoursWorked - lunchBreakHours).toFixed(2);

    // if (lunchBreakDiff > 0) {
    //   hoursWorked += lunchBreakDiff;
    // }
    // const hours: number = +(
    //   (timeDifference - lunchDifference) /
    //   3600000
    // ).toFixed(2);
    // console.log('hours:' + hours);
    setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));

    const requestBody = {
      shiftName: watch().shiftName,
      timeIn: watch().timeIn
        ? convertDateTo24Hour(new Date(watch().timeIn))
        : '',
      timeOut: watch().timeOut
        ? convertDateTo24Hour(new Date(watch().timeOut))
        : '',
      lunchStart: watch().lunchStart
        ? convertDateTo24Hour(new Date(watch().lunchStart))
        : '',
      lunchEnd: watch().lunchEnd
        ? convertDateTo24Hour(new Date(watch().lunchEnd))
        : '',
      workingHours: hours,
      companyId: companyId,
      userId: userId,
    };
    // CREATE / UPDATE SHIFT
    let res: any = null;
    setFilter('');
    try {
      if (action === 'add') {
        res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          body: JSON.stringify(requestBody),
        });
      } else if (action === 'edit') {
        apiUrl = apiUrl + `/${shiftId}`;
        res = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
          body: JSON.stringify(requestBody),
        });
      }
    } catch (error: any) {
      const response = error?.response?.data;
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: response.message,
        life: 5000,
      });
    }
    let employeeIds: any = [];
    try {
      // UPDATE EMPLOYEE SHIFT
      if (res?.ok) {
        shiftEmployees.map((item: any) => {
          employeeIds.push(item.data.employeeId);
        });

        let newShiftId = null;
        if (action == 'add') {
          const shift = await res.json();

          newShiftId = shift.message.shiftId;
        }
        const requestBodyForUpdateEmployee = {
          shiftId: action === 'add' ? newShiftId : shiftId,
          employeeIds: employeeIds,
        };
        if ((action == 'add' && employeeIds.length > 0) || action == 'edit') {
          await axios.patch(
            `/api/shifts/employee`,
            requestBodyForUpdateEmployee,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          );
        }
        // return;
        // const updateEmployeesSequentially = async () => {
        //   try {
        //     const response = await fetch(`/api/shifts/${shiftId}`, {
        //       method: 'GET',
        //       headers: {
        //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        //       },
        //     });

        //     if (response) {
        //       const data = await response.json();
        //       if (response.ok && data) {
        //         state.node.map((item: any) => {
        //           const employeeId = item.data.employeeId;
        //           const employeeInShifts = async () => {
        //             const dataFound = data.message.employees.find(
        //               (item: any) => item.employeeId === employeeId
        //             );

        //             // IF EMPLOYEE IS STILL NOT IN SHIFT
        //             if (!dataFound) {
        //               const requestBody = {
        //                 shiftId: data.message.shiftId,
        //               };
        //               await fetch(`/api/shifts/employee/${employeeId}`, {
        //                 method: 'PUT',
        //                 headers: {
        //                   'Content-Type': 'application/json',
        //                   Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        //                 },
        //                 body: JSON.stringify(requestBody),
        //               });
        //             }
        //           };
        //           employeeInShifts();
        //         });
        //         if (data.message) {
        //         }

        //         data.message.employees.map((item: any) => {
        //           const employeeId = item.employeeId;

        //           const employeeNotInShift = async () => {
        //             const dataFound = state.node.find(
        //               (item: any) => item.data.employeeId === employeeId
        //             );

        //             // IF EMPLOYEE IS REMOVED FROM SHIFT
        //             if (!dataFound) {
        //               const requestBody = {
        //                 shiftId: null,
        //               };
        //               await fetch(`/api/shifts/employee/${employeeId}`, {
        //                 method: 'PUT',
        //                 headers: {
        //                   'Content-Type': 'application/json',
        //                   Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        //                 },
        //                 body: JSON.stringify(requestBody),
        //               });
        //             }
        //           };
        //           employeeNotInShift();
        //         });

        //         refetchDataFromParent();
        //       }
        //     }
        //     refetchDataFromParent();
        //   } catch (error) {
        //     console.error('Error Updating: ', error);
        //   }
        // };

        // toastInfo.current?.clear();
        // updateEmployeesSequentially();
        // refetchDataFromParent();
      }
    } catch (error: any) { }
    setIsEditDisabled(false);
    if (res?.ok) {
      refetchDataFromParent();
      toastInfo.current?.clear();
      if (res.ok) {
        if (action === 'add') {
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Created',
            life: 5000,
          });
        } else if (action === 'edit') {
          toast.current?.show({
            severity: 'success',
            summary: 'Successfully Updated',
            life: 5000,
          });
        }
      } else {
        if (action === 'add') {
          toast.current?.show({
            severity: 'error',
            summary: 'Error Creating',
            life: 5000,
          });
        } else if (action === 'edit') {
          toast.current?.show({
            severity: 'error',
            summary: 'Error Updating',
            life: 5000,
          });
        }
      }

      setSelectedDepartment({ name: '', code: '' });
      setSelectedEmployees([]);
    }
  };

  useEffect(() => {
    setFilter('');
    setFilterEmployee('');
    const fetchData = async () => {
      // setEmployees([]);
      // setDepartments([]);
      if (action === 'edit' || action === 'view') {
        const {
          shiftName,
          timeIn,
          timeOut,
          lunchStart,
          lunchEnd,
          shiftId,
        }: any = rowData;
        setValue('shiftName', shiftName);
        setValue('shiftId', shiftId);
        setValue('timeIn', timeStringToDate(timeIn) as any);
        setValue('timeOut', timeStringToDate(timeOut) as any);
        setValue('lunchStart', timeStringToDate(lunchStart) as any);
        setValue('lunchEnd', timeStringToDate(lunchEnd) as any);
      } else {
        reset();
        setEmployees([]);
        setDepartments([]);
      }
    };
    if (isOpen) {
      refetchDataFromParent();
      fetchData();
    }
  }, [isOpen, action, reset, rowData, setValue, refetchDataFromParent]);

  async function onAssign(e: any) {
    e.preventDefault();

    // if (selectAll) {
    //   setSelectedEmployees([
    //     { name: 'Select all', code: 'all', department: '' },
    //   ]);
    // }

    const headers = new Headers({
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
    });

    if (action === 'add') {
      let newShiftEmployees: any = [];

      if (isEmployee === false && selectedEmployees) {
        if (selectAll) {
          // assign all employees to shiftEmloyees
          newShiftEmployees = await axios.get('/api/shifts/employee', {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          });
          setShiftEmployees([
            ...newShiftEmployees.data.employeesAssignable.rows.map(
              (item: any) => ({
                key: item.employeeId,
                data: {
                  employeeName: item.employee_profile.employeeFullName,
                  department:
                    item.department !== null
                      ? item.department.departmentName
                      : '',
                  employeeId: item.employeeId,
                },
              })
            ),
          ]);
          setEmployees([
            // {
            //   name: 'Select all',
            //   code: 'all',
            //   department: '',
            // },
          ]);

          setSelectAll(false);
        } else {
          newShiftEmployees = selectedEmployees
            .filter(
              (item: any) =>
                !shiftEmployees.some(
                  (shiftEmployee: any) =>
                    shiftEmployee.data.employeeId === item.code
                )
            )
            .map((item: any) => ({
              key: item.code,
              data: {
                employeeName: item.name,
                department: item.department !== null ? item.department : '',
                employeeId: item.code,
              },
            }));
          const updatedShiftEmployees = shiftEmployees.filter(
            (shiftEmployee: any) =>
              selectedEmployees.some(
                (selectedEmployee: any) =>
                  selectedEmployee.code === shiftEmployee.data.employeeId
              )
          );

          // setSelectedEmployees([]);
          setEmployees((prev: any) => [
            ...prev.filter(
              (employee: any) =>
                !selectedEmployees.some(
                  (selectedEmployee: any) =>
                    selectedEmployee.code === employee.code
                )
            ),
          ]);
          setShiftEmployees((prev: any) => [...prev, ...newShiftEmployees]);
        }
        setSelectedEmployees([]);

        // setShiftEmployees([...updatedShiftEmployees, ...newShiftEmployees]);
      }
      ///// department
      if (isEmployee === true && selectedDepartment) {
        const departmentId =
          selectedDepartment !== null ? selectedDepartment.code : '';
        const depapiUrl = `/api/shifts/departments/${departmentId}`;

        try {
          const response = await axios.get(depapiUrl, {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          });
          
          if (response.data.message) {
            newShiftEmployees = response.data.message.employees.map(
              (employee: any) => ({
                key: employee.employeeId,
                data: {
                  employeeName: employee.employee_profile.employeeFullName,
                  department: selectedDepartment.name,
                  employeeId: employee.employeeId,
                },
              })
            );
            if (newShiftEmployees.length > 0) {
              setShiftEmployees((prev) => [
                ...prev,
                ...newShiftEmployees.filter(
                  (newEmployee: any) =>
                    !shiftEmployees.some(
                      (shiftEmployee: any) =>
                        shiftEmployee.data.employeeId ===
                        newEmployee.data.employeeId
                    )
                ),
              ]);
            }
            // console.log('newEmployees', newShiftEmployees);
            setEmployees((prev: any) => [
              ...prev.filter(
                (employee: any) =>
                  !newShiftEmployees.some(
                    (selectedEmployee: any) =>
                      selectedEmployee.key === employee.code
                  )
              ),
            ]);
            // console.log('employees', employees);
            setSelectedEmployees([]);
          } else {
            toastInfo.current?.clear();
            toast.current?.show({
              severity: 'error',
              summary: 'Error',
              detail:
                'No assignable employees found for ' + selectedDepartment.name,
              life: 5000,
            });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

      setIsRetrievingEmployees(false);
    } else if (action === 'edit') {
      // employee
      if (isEmployee === false && selectedEmployees) {
        if ((selectedEmployees && selectedEmployees.length > 0) || selectAll) {
          let employeeIds: any = [];
          if (selectAll) {
            employeeIds = 'all';
          } else {
            employeeIds = selectedEmployees.map((item: any) => item.code);
          }

          const response = await axios.patch(
            `/api/shifts/employee`,
            { shiftId, employeeIds },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
              },
            }
          );
          if (response) {
            shiftsEmployeeRefetch();
            setIsRetrievingEmployees(false);
            if (selectAll) {
              setEmployees([]);
              setSelectAll(false);
            } else {
              const employeeIdSet = new Set(employeeIds);
              setEmployees((prev) =>
                prev.filter(
                  (employee: any) => !employeeIdSet.has(employee.code)
                )
              );
            }
            setSelectedEmployees([]);
            return;
          }
        } else {
          // console.log('No data in selectedEmployees');
          setIsRetrievingEmployees(false);
        }
      }
      // if toggle is set to switch department
      else if (isEmployee === true && selectedDepartment) {
        const departmentId =
          selectedDepartment !== null ? selectedDepartment.code : '';

        const depapiUrl = `/api/shifts/departments/${departmentId}`;

        const response = await axios.get(depapiUrl, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        });

        if (response.data.message) {
          try {
            if (response?.data?.message?.employees) {
              setIsRetrievingEmployees(true);
              const employeeIds = response.data.message.employees.map(
                (item: any) => item.employeeId
              );
              const res = await axios.patch(
                `/api/shifts/employee`,
                { shiftId, employeeIds },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                  },
                }
              );

              if (res) {
                shiftsEmployeeRefetch();
                setSelectedEmployees([]);
                const employeeIdSet = new Set(employeeIds);

                setEmployees((prev) =>
                  prev.filter(
                    (employee: any) => !employeeIdSet.has(employee.code)
                  )
                );
                // setSelectConfig((prev) => ({
                //   ...prev,
                //   offset: 0,
                // }));
                setSelectedDepartment({ name: '', code: '' });
              }

              setIsRetrievingEmployees(false);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        } else {
          toastInfo.current?.clear();
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail:
              'No assignable employees found for ' + selectedDepartment.name,
            life: 5000,
          });
        }
      }
    }
  }

  useEffect(() => {
    setShiftEmployees(shiftEmployeeData);
  }, [shiftEmployeeData, shiftsEmployeeRefetch]);

  useEffect(() => {
    if (isOpen) {
      // new Promise((resolve) => {
      // setDepartments(departmentData);
      setEmployees([
        // {
        //   name: 'Select all',
        //   code: 'all',
        //   department: '',
        // },
      ]);
      setSelectConfig({ offset: 0, limit: 20 });
      setShiftEmployees(action === 'add' ? [] : shiftEmployeeData);
      //   resolve;
      // });
    }
  }, [isOpen]);

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
      <ConfirmDialog />
      <Toast ref={toast} position="bottom-left" />
      <Toast ref={toastInfo} position="bottom-left" />
      <Sidebar
        position="right"
        style={{
          width: '84%',
        }}
        visible={isOpen}
        onHide={() => {
          setEmployees([]);
          setSelectedEmployees([]);
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
          setSelectAll(false);
        }}
      >
        <React.Fragment>
          <form
            className="w-full overflow-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h1 className="text-black font-medium text-3xl mb-3">{title}</h1>
            <div className="flex flex-col">
              <div>
                <div className="gap-2 w-full card flex justify-content-center flex-row h-[30px] text-[12px] flex-auto">
                  <div className="flex flex-col flex-auto h-[68px]">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Shift Name</span>
                    </label>
                    <InputText
                      disabled={action == 'view'}
                      className={classNames(
                        'flex w-full h-[120px] md:w-14rem',
                        {
                          'p-invalid': errors.shiftName,
                        }
                      )}
                      {...register('shiftName', {
                        required: 'Shift name is required.',
                      })}
                    />
                    {errors.shiftName && (
                      <span className="text-red-600">
                        {errors.shiftName.message}
                      </span>
                    )}
                  </div>
                  {/* TIME IN */}
                  <div className="flex flex-col flex-grow">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Time In</span>
                    </label>
                    <Controller
                      name="timeIn"
                      control={control}
                      rules={{ required: 'Time in is required.' }}
                      render={({ field, fieldState }) => (
                        <Calendar
                          disabled={isSubmitting || action === 'view'}
                          inputId={field.name}
                          showTime
                          hourFormat="12"
                          timeOnly
                          id={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          placeholder="Select Time in"
                          className={classNames({
                            'p-invalid': fieldState.invalid,
                          })}
                          dateFormat="yy-mm-dd"
                        />
                      )}
                    />
                    {errors.timeIn && (
                      <span className="text-red-600">
                        {errors.timeIn?.message}
                      </span>
                    )}
                  </div>

                  {/* LUNCH START */}
                  <div className="flex flex-col flex-grow">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Lunch Start</span>
                    </label>
                    <Controller
                      name="lunchStart"
                      control={control}
                      rules={{
                        required: 'Lunch start is required.',
                      }}
                      render={({ field, fieldState }) => (
                        <Calendar
                          disabled={
                            isSubmitting ||
                            action === 'view' ||
                            watch('timeIn') === '' ||
                            watch('timeIn') === null ||
                            watch('timeOut') === '' ||
                            watch('timeOut') === null
                          }
                          placeholder="Select Lunch Start"
                          inputId={field.name}
                          showTime
                          hourFormat="12"
                          timeOnly
                          id={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          className={classNames({
                            'p-invalid': fieldState.invalid,
                          })}
                        />
                      )}
                    />
                    {/* {errors.timeOut && (
                      <span className="text-red-600">
                        {errors.lunchStart?.message}
                      </span>
                    )} */}
                    {errors.lunchStart && (
                      <span className="text-red-600">
                        {errors.lunchStart?.message}
                      </span>
                    )}
                  </div>
                  {/* LUNCH END */}
                  <div className="flex flex-col flex-grow">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Lunch End</span>
                    </label>
                    <Controller
                      name="lunchEnd"
                      control={control}
                      rules={{ required: 'Lunch end is required.' }}
                      render={({ field, fieldState }) => (
                        <Calendar
                          disabled={
                            isSubmitting ||
                            action === 'view' ||
                            watch('timeIn') === '' ||
                            watch('timeIn') === null ||
                            watch('timeOut') === '' ||
                            watch('timeOut') === null
                          }
                          inputId={field.name}
                          showTime
                          hourFormat="12"
                          timeOnly
                          id={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          placeholder="Select Lunch End"
                          className={classNames({
                            'p-invalid': fieldState.invalid,
                          })}
                          dateFormat="yy-mm-dd"
                        />
                      )}
                    />
                    {/* {errors.timeOut && (
                      <span className="text-red-600">
                        {errors.lunchEnd?.message}
                      </span>
                    )} */}
                    {errors.lunchEnd && (
                      <span className="text-red-600">
                        {errors.lunchEnd?.message}
                      </span>
                    )}
                  </div>
                  {/* TIME OUT */}
                  <div className="flex flex-col flex-grow">
                    <label className="my-1">
                      <span className="text-red-500">*</span>
                      <span>Time Out</span>
                    </label>
                    <Controller
                      name="timeOut"
                      control={control}
                      rules={{ required: 'Time out is required.' }}
                      render={({ field, fieldState }) => (
                        <Calendar
                          disabled={isSubmitting || action === 'view'}
                          inputId={field.name}
                          showTime
                          hourFormat="12"
                          timeOnly
                          id={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          placeholder="Select Time out"
                          className={classNames({
                            'p-invalid': fieldState.invalid,
                          })}
                          dateFormat="yy-mm-dd"
                        />
                      )}
                    />
                    {errors.timeOut && (
                      <span className="text-red-600">
                        {errors.timeOut.message}
                      </span>
                    )}
                  </div>
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
                    (!isDirty && action == 'add') ||
                    isRetrievingEmployees ||
                    !isValid ||
                    isSubmitting
                  }
                />
              )}
            </div>

            <Divider
              type="solid"
              style={{ margin: '0px' }}
              align="left"
              className="w-full"
            >
              <span className="text-black font-medium text-md mb-3">
                Assign Employee
              </span>
            </Divider>

            {/* ASSIGN EMPLOYEE */}
            <div className="w-full h-full p-5 mt-4">
              <div className="flex flex-col sm:flex-row w-full">
                {action !== 'view' && (
                  <>
                    <div className="pr-10 gap-10">
                      <div className="card flex justify-content-center gap-3 mt-5 w-full">
                        <InputSwitch
                          checked={isEmployee}
                          onChange={(e) => {
                            // if (action === 'add') {
                            //   setSelectedEmployees(
                            //     shiftEmployees.map((item: any) => ({
                            //       name: item.data.employeeName,
                            //       code: item.data.employeeId,
                            //       department: item.data.department,
                            //     }))
                            //   );
                            // }
                            setSelectedDepartment({ name: '', code: '' });
                            setIsEmployee(!isEmployee);
                          }}
                        />
                        {isEmployee ? (
                          <span>Switch to Employee</span>
                        ) : (
                          <span>Switch to Department</span>
                        )}
                      </div>
                      <div className="w-full card flex justify-content-center flex-col text-[12px] flex-auto mt-5">
                        <span className="my-1">
                          {isEmployee
                            ? 'Choose Department:'
                            : 'Choose Employee/s:'}
                        </span>
                        {isEmployee ? (
                          <Dropdown
                            name="department"
                            inputId="department"
                            placeholder="Choose Department: "
                            optionLabel="name"
                            value={selectedDepartment}
                            onChange={(e) => {
                              setSelectedDepartment(e.value);
                            }}
                            options={departments}
                            className="w-full sm:w-[15rem] md:w-[19rem] lg:w-[25rem]"
                          />
                        ) : (
                          <>
                            <MultiSelect
                              display={'chip'}
                              name="employees"
                              disabled={
                                action == 'view' ||
                                isSubmitting ||
                                employees?.length <= 0 ||
                                selectAll
                              }
                              inputId="employees"
                              placeholder={
                                selectAll
                                  ? 'All'
                                  : employees?.length > 0
                                    ? 'Choose Employee: '
                                    : 'No options Available'
                              }
                              optionLabel="name"
                              value={selectedEmployees || ''}
                              onChange={(e) => {
                                setSelectedEmployees(e.value);
                              }}
                              onHide={() => setFilterEmployee('')}
                              options={
                                isFiltered ? searchedEmployees : employees || []
                              }
                              className="w-full sm:w-[15rem] md:w-[19rem] lg:w-[25rem]"
                              virtualScrollerOptions={{
                                itemSize: 40,
                                onScroll: async (e) => {
                                  // lazy loading for employees
                                  // if searching, no lazy loading
                                  const target = e.target as HTMLElement;
                                  if (
                                    target.scrollTop + target.clientHeight >=
                                    target.scrollHeight &&
                                    selectConfig.offset < totalEmployees &&
                                    !isFiltered
                                  ) {
                                    const newOffset =
                                      selectConfig.offset + selectConfig.limit;

                                    setSelectConfig((prev) => ({
                                      ...prev,
                                      offset: newOffset,
                                    }));
                                  }
                                },
                              }}
                              panelHeaderTemplate={
                                <>
                                  <span className="p-input-icon-left w-full md:w-[90%] lg:w-[90%] sm:w-[90%] justify-center flex items-center m-4">
                                    <i className="pi pi-search absolute" />
                                    <InputText
                                      placeholder="Search"
                                      className="w-full"
                                      onChange={(e) =>
                                        setFilterEmployee(e.target.value)
                                      }
                                    />
                                  </span>
                                </>
                              }
                            // showSelectAll={false}
                            />
                            <div className="flex card flex-auto items-center justify-start mt-2">
                              <Checkbox
                                checked={selectAll}
                                disabled={
                                  action == 'view' ||
                                  isSubmitting ||
                                  employees?.length < 1
                                }
                                inputId="employees"
                                placeholder={
                                  action == 'view'
                                    ? 'Select employees'
                                    : 'Select employees to add'
                                }
                                onChange={(e) => {
                                  setSelectAll(!selectAll);
                                  // if (selectAll) {
                                  //   setSelectedEmployees([
                                  //     {
                                  //       name: 'Select all',
                                  //       code: 'all',
                                  //       department: '',
                                  //     },
                                  //   ]);
                                  // } else {
                                  //   setSelectedEmployees([]);
                                  // }
                                }}
                              // className="w-full"
                              />
                              <label className="text-xs text-gray-500 w-1/6 ml-2">
                                Select All
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="login mt-10">
                        <Button
                          label="Assign Shift"
                          disabled={
                            !(
                              selectedEmployees.length > 0 ||
                              selectedDepartment.name !== '' ||
                              selectAll
                            )
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
                )}
                <div className="pl-5 w-full sm:mt-0 mt-5">
                  <h1>List of Employees</h1>
                  <span className="p-input-icon-left w-full md:w-[90%] lg:w-[93.5%] justify-center flex mt-5 items-center sm:ml-10 lg:mb-0 mb-5">
                    <i className="pi pi-search absolute" />
                    <InputText
                      placeholder="Search"
                      className="w-full"
                      onChange={(e) => setFilter(e.target.value)}
                    />
                  </span>

                  <DataTable
                    disabled={action == 'view' || isSubmitting}
                    tableStyle={{
                      minWidth: '10rem',
                      fontSize: '15px',
                    }}
                    className="overflow-auto pt-5 sm:pt-0 md:pl-10 lg:p-10"
                    rowsPerPageOptions={[5, 10, 25]}
                    value={isRetrievingEmployees ? loadingData : shiftEmployees}
                    selectionMode={'single'}
                    rows={5}
                    paginator={action == 'add' ? true : false}
                  >
                    <Column
                      field="employeeName"
                      header="Employee Name"
                      body={(item) => {
                        if (isRetrievingEmployees) return <Skeleton />;
                        return <>{item.data.employeeName}</>;
                      }}
                    />
                    <Column
                      field="department"
                      header="Department"
                      body={(item) => {
                        if (isRetrievingEmployees) return <Skeleton />;
                        return <>{item.data.department}</>;
                      }}
                    />

                    {title !== 'View Company' && (
                      <Column header="Actions" body={renderActions} />
                    )}
                  </DataTable>
                  {shiftEmployeeData && action !== 'add' && (
                    <Paginator
                      first={first}
                      rows={pagination.limit}
                      totalRecords={totalRecords}
                      rowsPerPageOptions={[5, 15, 25, 50, 100]}
                      onPageChange={(event) => {
                        const { page, rows, first }: any = event;
                        setFirst(first);
                        setPagination({
                          offset: rows * page,
                          limit: rows,
                        });
                        shiftsEmployeeRefetch;
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </form>
        </React.Fragment>
      </Sidebar>
    </>
  );

  async function checkDuplicates({
    companyId,
    shiftId,
    shiftName,
  }: {
    companyId: any;
    shiftId: string | null;
    shiftName: string;
  }) {
    let errorCount = 0;

    const duplicateName = await checkDuplicateShiftName({
      companyId: companyId,
      shiftName: shiftName,
      shiftId: shiftId,
    });

    if (duplicateName) {
      toastInfo.current?.clear();
      toast.current?.show({
        severity: 'error',
        detail: 'Shift Name already exists.',
        life: 5000,
      });
      errorCount++;
      setError('shiftName', {
        type: 'Duplicate',
        message: 'Shift Name already exists.',
      });
    }

    return errorCount > 0 ? false : true;
  }
};

export default ShiftSidebar;
