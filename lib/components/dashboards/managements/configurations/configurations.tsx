'use client';

import React, { use, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import PayCycleForms from './payCycleForms';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { GlobalContainer } from 'lib/context/globalContext';
import { Divider } from 'primereact/divider';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import RolesManagement from './rolesManagement';
import { Controller } from 'react-hook-form';
import { Calendar } from 'primereact/calendar';
import classNames from 'classnames';
import moment from '@constant/momentTZ';
import { Nullable } from 'primereact/ts-helpers';
import AuthenticationDialog from 'lib/components/blocks/authenticationDialog';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { set } from 'lodash';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Skeleton } from 'primereact/skeleton';
const Configurations = () => {
  const context = React.useContext(GlobalContainer);
  const [filters, setFilters] = useState({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const sessionData = context?.userData;
  const [isAuthenticationDialogVisible, setIsAuthenticationDialogVisible] =
    useState(false);
  const [password, setPassword] = useState<string>('');
  const submitButtonRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const company = useRef<any>(null);
  const [payCycleFormsData, setPayCycleFormsData] = useState<any>([]);
  const [workingDays, setWorkingDays] = useState<any>(242);
  const [wdError, setwdError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<any>({
    payCycleForms: {
      data: [],
      message: '',
    },
  });
  const [nightDiffDepts, setNightDiffDepts] = useState<any>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [employeeOptions, setEmployeeOptions] = useState<any>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<any>([]);
  const [monthlyRatedEmployees, setMonthlyRatedEmployees] = useState<any>([]);
  const selectedEmployeeIdMap = useRef<any>(new Map<number, boolean>());
  const toast = useRef<Toast>(null);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`/api/configurations/departments`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        // console.log('hello world!');
        // console.log(res.data);
        setDepartmentOptions(res.data);
      });

    axios
      .get(`/api/companies/${sessionData.companyId}`, {
        params: {
          includeEmployees: 'false',
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
      .then((res: any) => {
        company.current = res.data;

        // const employeeOpts = company.current.employees.map((i: any) => ({
        //   code: i.employeeId,
        //   name: i.employee_profile.employeeFullName,
        //   isMonthlyRated: i.isMonthlyRated,
        // }));
        let dailyRatedEmployeesArr = [];
        let monthlyRatedEmployeesArr = [];
        for (let i = 0; i < company.current.employees.length; i++) {
          let item = company.current.employees[i];
          if (company.current.employees[i].isMonthlyRated) {
            monthlyRatedEmployeesArr.push({
              code: item.employeeId,
              name: item.employee_profile.employeeFullName,
              isMonthlyRated: true,
            });
          } else {
            dailyRatedEmployeesArr.push({
              code: item.employeeId,
              name: item.employee_profile.employeeFullName,
              isMonthlyRated: false,
            });
          }
        }
        setEmployeeOptions(dailyRatedEmployeesArr);
        setMonthlyRatedEmployees(monthlyRatedEmployeesArr);

        setWorkingDays(company.current.workingDays);
        setNightDiffDepts(
          company.current.nightDiffDepartments.map((i: any) => ({
            code: i.departmentId,
            name: i.departmentName,
          }))
        );

        const emailNotif = res.data?.notifications.find(
          (item: any) => item.serviceType === 'EMAIL'
        );
        if (emailNotif) {
          setEmailChecked(emailNotif.isEnabled);
        }
        if (res.data.allowanceForLeaves) {
          setAllowanceOnLeavesChecked(res.data.allowanceForLeaves);
        }
        if (res.data.leavesOnHolidays) {
          setLeavesonHolidaysChecked(res.data.leavesOnHolidays);
        }

        if (res.data.allowanceOnHolidays) {
          setAllowanceOnHolidaysChecked(res.data.allowanceOnHolidays);
        }

        if (res.data.nightDifferential) {
          setNightDifferentialChecked(res.data.nightDifferential);
        }

        if (res.data.nightDifferentialRate) {
          setNightDifferentialRate(res.data.nightDifferentialRate);
        }

        if (res.data.nightDifferentialStartTime) {
          setNightDifferentialStartTime(
            new Date(`2024-01-01T${res.data.nightDifferentialStartTime}`)
          );
        }

        if (res.data.nightDifferentialEndTime) {
          setNightDifferentialEndTime(
            new Date(`2024-01-01T${res.data.nightDifferentialEndTime}`)
          );
        }

        if (res.data.regularHoliday) {
          setRegularHolidayChecked(res.data.regularHoliday);
        }

        if (res.data.regularHolidayRate) {
          setRegularHolidayRate(res.data.regularHolidayRate);
        }

        if (res.data.regularHolidayRestDayRate) {
          setRegularHolidayRestDayRate(res.data.regularHolidayRestDayRate);
        }

        if (res.data.specialHoliday) {
          setSpecialHolidayChecked(res.data.specialHoliday);
        }

        if (res.data.specialHolidayRate) {
          setSpecialHolidayRate(res.data.specialHolidayRate);
        }

        if (res.data.specialHolidayRestDayRate) {
          setSpecialHolidayRestDayRate(res.data.specialHolidayRestDayRate);
        }

        if (res.data.restDay) {
          setRestDayChecked(res.data.restDay);
        }

        if (res.data.restDayRate) {
          setRestDayRate(res.data.restDayRate);
        }
        if (res.data.useFixedGovtContributionsRate) {
          setUseFixedGovtContributionsRate(
            res.data.useFixedGovtContributionsRate
          );
        }
        if (res.data.enableSearchEmployee) {
          setEnableSearchEmployee(res.data.enableSearchEmployee);
        }

        if (res.data.isHolidayDayoffPaid) {
          // console.log('hi!');
          // console.log(res.data.isHolidayDayoffPaid);
          setIsHolidayDayoffPaid(res.data.isHolidayDayoffPaid);
        }
        if (res.data.halfdayAllowancePay) {
          setHalfdayAllowancePay({
            name: res.data.halfdayAllowancePay,
            code: res.data.halfdayAllowancePay,
          });
        }
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [emailChecked, setEmailChecked] = useState(false);
  const [allowanceOnLeavesChecked, setAllowanceOnLeavesChecked] =
    useState(false);
  const [leavesOnHolidaysChecked, setLeavesonHolidaysChecked] = useState(false);
  const [allowanceOnHolidaysChecked, setAllowanceOnHolidaysChecked] =
    useState(false);
  const [nightDifferentialChecked, setNightDifferentialChecked] =
    useState(false);
  const [nightDifferentialStartTime, setNightDifferentialStartTime] = useState<
    Nullable<Date>
  >(new Date('2024-01-01T22:00:00'));
  const [nightDifferentialEndTime, setNightDifferentialEndTime] = useState<
    Nullable<Date>
  >(new Date('2024-01-01T06:00:00'));
  const [nightDifferentialRate, setNightDifferentialRate] =
    useState<number>(10);
  const [regularHolidayChecked, setRegularHolidayChecked] = useState(false);
  const [regularHolidayRate, setRegularHolidayRate] = useState<number>(10);
  const [regularHolidayRestDayRate, setRegularHolidayRestDayRate] =
    useState<number>(260);
  const [specialHolidayChecked, setSpecialHolidayChecked] = useState(false);
  const [specialHolidayRate, setSpecialHolidayRate] = useState<number>(10);
  const [specialHolidayRestDayRate, setSpecialHolidayRestDayRate] =
    useState<number>(150);
  const [restDayChecked, setRestDayChecked] = useState(false);
  const [restDayRate, setRestDayRate] = useState<number>(10);
  const [useFixedGovtContributionsRate, setUseFixedGovtContributionsRate] =
    useState(false);
  const [isHolidayDayoffPaid, setIsHolidayDayoffPaid] = useState(false);
  const [enableSearchEmployee, setEnableSearchEmployee] = useState(false);
  const [halfdayAllowancePay, setHalfdayAllowancePay] = useState({
    code: 'FULL',
    name: 'FULL',
  });
  function renderActions(rowData: any) {
    if (isLoading || isAdding) return <Skeleton />;
    return (
      <div className="flex items-center gap-3">
        <Button
          icon="pi pi-trash"
          type="button"
          text
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
          onClick={(e) => {
            let sortedArr = employeeOptions;
            let newArr: any = [{}];
            for (let i = 0; i < sortedArr.length; i++) {
              if (rowData.name >= sortedArr[i].name) {
                newArr = [
                  ...sortedArr.slice(0, i),
                  rowData,
                  ...sortedArr.slice(i + 1),
                ];
                break;
              }
            }
            setEmployeeOptions(newArr);
            setMonthlyRatedEmployees(
              monthlyRatedEmployees.filter((i: any) => i.code != rowData.code)
            );
          }}
        />
      </div>
    );
  }

  const handleSubmit = async () => {
    // check if working days is not empty
    if (workingDays < 242 || workingDays === null) {
      setwdError('Please enter a valid number');
      return;
    } else {
      if (wdError !== '' && (workingDays != null || workingDays > 0)) {
        setwdError('');
      }
    }

    let premiumRatesField = [];

    if (restDayChecked && restDayRate <= 0) {
      premiumRatesField.push('Rest Day Rate');
    }

    if (regularHolidayChecked) {
      if (regularHolidayRate <= 0) {
        premiumRatesField.push('Regular Holiday Rate');
      }

      if (regularHolidayRestDayRate <= 0) {
        premiumRatesField.push('Regular Holiday and Rest Day Rate');
      }
    }

    if (specialHolidayChecked) {
      if (specialHolidayRate <= 0) {
        premiumRatesField.push('Special Holiday Rate');
      }

      if (specialHolidayRestDayRate <= 0) {
        premiumRatesField.push('Special Holiday and Rest Day Rate');
      }
    }

    if (nightDifferentialChecked) {
      if (nightDifferentialRate <= 0) {
        premiumRatesField.push('Night Differential Rate');
      }
    }

    if (
      nightDifferentialChecked &&
      (nightDiffDepts.length == 0 || !nightDiffDepts)
    ) {
      setNightDiffDeptError(true);
    } else {
      setNightDiffDeptError(false);
    }
    let message = '';
    for (let i = 0; i < premiumRatesField.length; i++) {
      if (i == premiumRatesField.length - 1) {
        message += `${premiumRatesField.length > 1 ? 'and' : ''} ${
          premiumRatesField[i]
        } ${premiumRatesField.length > 1 ? 'are' : 'is'} required.`;
      } else {
        message += `${premiumRatesField[i]}, `;
      }
    }

    if (premiumRatesField.length > 0) {
      toast.current?.replace({
        severity: 'error',
        summary: message,
        life: 3000,
      });
      return;
    }
    if (
      nightDifferentialChecked &&
      (nightDiffDepts.length == 0 || !nightDiffDepts)
    ) {
      toast.current?.replace({
        severity: 'error',
        summary:
          'Please select at least one department for Night Differential.',
        life: 3000,
      });
      return;
    }
    if (nightStartTimeError) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Please enter a start time between 6:00 PM and 6:00 AM.',
        life: 3000,
      });
      return;
    }

    if (nightEndTimeError) {
      toast.current?.replace({
        severity: 'error',
        summary:
          'Please enter an end time between 6:00 PM and 6:00 AM that is later than the start time.',
        life: 3000,
      });
      return;
    }

    const checkPayCycleForms = payCycleFormsData?.filter(
      (i: any) =>
        i.payrollTypeId == null ||
        i.departments.length == 0 ||
        (i.type !== 'SEMI-WEEKLY' &&
          i.company_pay_cycles?.filter((cd: any) => {
            if (cd.cycle == 'WEEKLY') {
              return cd.payDate == '' || cd.isApplyGovtBenefits == null;
            } else if (cd.cycle == 'SEMI-WEEKLY') {
              return false;
            } else {
              return (
                cd.payDate == 0 ||
                cd.cutOffStartDate == 0 ||
                cd.cutOffEndDate == 0 ||
                cd.preferredMonth == '' ||
                cd.isApplyGovtBenefits == null
              );
            }
          }).length > 0)
    );

    if (payCycleFormsData.length == 0) {
      toast.current?.replace({
        severity: 'error',
        summary: 'Please create a Pay Cycle.',
        life: 3000,
      });
      return;
    }
    // console.log('checkPayCycleForms!', checkPayCycleForms);
    if (checkPayCycleForms.length > 0) {
      toast.current?.replace({
        severity: 'error',
        summary: 'All fields are required!',
        // detail: 'Please wait...',
        life: 5000,
      });
      setErrors((prev: any) => ({
        ...prev,
        payCycleForms: {
          data: checkPayCycleForms,
          message: 'All fields are required!',
        },
      }));
      return;
    }

    setIsSubmitting(true);
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting Request',
      // detail: 'Please wait...',
      closable: false,
      sticky: true,
    });

    const monthlyRatedEmployeesData = monthlyRatedEmployees.map(
      (i: any) => i.code
    );
    await axios
      .post(
        `/api/companies/configurations`,
        {
          payCycleFormsData: payCycleFormsData,
          workingDays,
          emailEnabled: emailChecked,
          allowanceForLeaves: allowanceOnLeavesChecked,
          leavesOnHolidays: leavesOnHolidaysChecked,
          allowanceOnHolidays: allowanceOnHolidaysChecked,
          nightDifferential: nightDifferentialChecked,
          nightDifferentialRate: nightDifferentialRate,
          nightDifferentialStartTime: moment(nightDifferentialStartTime).format(
            'HH:mm'
          ),
          nightDifferentialEndTime: moment(nightDifferentialEndTime).format(
            'HH:mm'
          ),
          regularHoliday: regularHolidayChecked,
          regularHolidayRate: regularHolidayRate,
          regularHolidayRestDayRate: regularHolidayRestDayRate,
          specialHoliday: specialHolidayChecked,
          specialHolidayRate: specialHolidayRate,
          specialHolidayRestDayRate: specialHolidayRestDayRate,
          restDay: restDayChecked,
          restDayRate: restDayRate,
          nightDiffDepts: nightDiffDepts.map((i: any) => i.code),
          useFixedGovtContributionsRate: useFixedGovtContributionsRate,
          monthlyRatedEmployeesData: monthlyRatedEmployeesData,
          isHolidayDayoffPaid: isHolidayDayoffPaid,
          enableSearchEmployee: enableSearchEmployee,
          halfdayAllowancePay: halfdayAllowancePay.code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
      .then((res: any) => {
        if (res.data.success) {
          setIsSubmitted(true);
          setIsSubmitting(false);
        }
        toast.current?.replace({
          severity: res.data.success ? 'success' : 'error',
          summary: res.data.message,
          life: 3000,
        });
      });
  };
  const [nightStartTimeError, setNightStartTimeError] =
    useState<boolean>(false);
  const [nightEndTimeError, setNightEndTimeError] = useState<boolean>(false);
  const [nightDiffDeptError, setNightDiffDeptError] = useState<boolean>(false);
  // console.log(payCycleFormsData);

  const validateNightDifferentialTime = (startTime: any, endTime: any) => {
    const startHour = moment(startTime);
    const endHour = moment(endTime);

    if (endHour.isBefore(startHour)) {
      endHour.add(1, 'day');
    }

    if (startHour.hours() >= 18 || startHour.hours() <= 6) {
      setNightStartTimeError(false);
    } else {
      setNightStartTimeError(true);
    }

    if (
      (endHour.hours() >= 18 || endHour.hours() <= 6) &&
      endHour.isAfter(startHour)
    ) {
      setNightEndTimeError(false);
    } else {
      setNightEndTimeError(true);
    }
  };

  const handleAdd = async () => {
    const chosenEmployees = selectedEmployees;
    setIsAdding(true);
    selectedEmployeeIdMap.current = await chosenEmployees.reduce(
      (acc: any, curr: any) => {
        acc[curr.code] = true;
        return acc;
      },
      {}
    );
    await setMonthlyRatedEmployees([
      ...monthlyRatedEmployees,
      ...chosenEmployees,
    ]);

    await setEmployeeOptions((prev: any) =>
      employeeOptions.filter((i: any) => !selectedEmployeeIdMap.current[i.code])
    );

    setSelectedEmployees([]);
    selectedEmployeeIdMap.current = new Map<number, boolean>();
    setIsAdding(false);
    return undefined;
  };

  const handleBooleanChecker = (value: number | boolean) => {
    if (typeof value === 'number') {
      return value === 1;
    }
    return value;
  };

  return (
    <div className="w-screen h-screen overflow-auto p-5">
      <Toast ref={toast} position="bottom-left" />
      {/* DASHBOARD NAV */}

      {/* MAIN CONTENT */}
      <div className="line-container rounded-lg p-5 flex flex-col gap-5">
        <PayCycleForms
          errors={errors}
          setErrors={setErrors}
          payCycleFormsData={payCycleFormsData}
          setPayCycleFormsData={setPayCycleFormsData}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted}
        />
        {/* <RolesManagement companyId={sessionData.companyId} /> */}
        <div className="mt-[0px]">
          <div className="inline-flex items-center">
            <i className="pi pi-calendar mr-2"></i>
            <p className="font-bold text-[18px]">General Settings</p>
          </div>
          <div
            className="flex flex-col md:flex-col mt-6 px-10 gap-5 rounded-lg py-[20px] align-middle overflow-x-scroll md:overflow-x-hidden"
            style={{
              background: '#F2F3FE',
            }}
          >
            <div className="flex">
              <div className="w-1/4">
                <div className="flex flex-col w-[250px]">
                  <div className="flex flex-col mt-5 w-full">
                    <label className="font-bold text-[12px]">
                      <span className="text-red-500">*</span>
                      Total Number of Working Days
                    </label>
                    <InputNumber
                      inputId="integeronly"
                      // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                      disabled={isLoading ? true : false}
                      min={242}
                      max={365}
                      name="workingDays"
                      value={workingDays}
                      onValueChange={(e: InputNumberValueChangeEvent) =>
                        setWorkingDays(e.value)
                      }
                      placeholder="Enter Total Number of Working Days"
                      required
                    />
                  </div>
                  {workingDays == 242 && (
                    <span className="text-red-500 text-xs">
                      Note: 242 Working Days Based on DOLE
                    </span>
                  )}
                  <span className="text-red-500 text-xs">{wdError}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 md:flex-row md:gap-0 mb-5">
              <div className="w-full md:w-1/4 flex md:self-center ">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(allowanceOnLeavesChecked)}
                    onChange={(e) =>
                      setAllowanceOnLeavesChecked(!allowanceOnLeavesChecked)
                    }
                  />
                </div>
                <span className="ml-5">Allowance on Leaves</span>
                <span className="mx-1">
                  <Tooltip
                    target=".allowance-on-leave-switch"
                    position="left"
                  />
                  <i
                    className="allowance-on-leave-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      allowanceOnLeavesChecked
                        ? 'Toggle to disable allowance during employee leave'
                        : 'Toggle to enable allowance during employee leave'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              <div className="w-full md:w-1/4 flex md:self-center ">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(allowanceOnHolidaysChecked)}
                    onChange={(e) =>
                      setAllowanceOnHolidaysChecked(!allowanceOnHolidaysChecked)
                    }
                  />
                </div>
                <span className="ml-5">Allowance on Holidays</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      allowanceOnHolidaysChecked
                        ? 'Toggle to disable allowance during holidays'
                        : 'Toggle to enable allowance during holidays'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              <div className="w-full md:w-1/4 flex md:self-center ">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(leavesOnHolidaysChecked)}
                    onChange={(e) =>
                      setLeavesonHolidaysChecked(!leavesOnHolidaysChecked)
                    }
                  />
                </div>
                <span className="ml-5">Leaves on Holidays</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      leavesOnHolidaysChecked
                        ? 'Toggle to disable leave requests during holidays'
                        : 'Toggle to enable leave requests during holidays'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              <div className="w-full md:w-1/4 flex md:self-center ">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(useFixedGovtContributionsRate)}
                    onChange={(e) =>
                      setUseFixedGovtContributionsRate(
                        !useFixedGovtContributionsRate
                      )
                    }
                  />
                </div>
                <span className="ml-5">Fixed Govt. Contribution Rates</span>
                <span className="mx-1">
                  <Tooltip
                    target=".allowance-on-leave-switch"
                    position="left"
                  />
                  <i
                    className="allowance-on-leave-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      useFixedGovtContributionsRate
                        ? ' Toggle to disable fixed government contribution rate (for "Semi-Monthly" payrolls only)'
                        : ' Toggle to enable fixed government contribution rate (for "Semi-Monthly" payrolls only)'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              {/* <div className="w-full md:w-1/4 flex md:self-center ">
                <div className="card flex ">
                  <InputSwitch
                    checked={handleBooleanChecker(isHolidayDayoffPaid)}
                    onChange={(e) =>
                      setIsHolidayDayoffPaid(!isHolidayDayoffPaid)
                    }
                  />
                </div>
                <span className="ml-5">Paid Regular Holiday Day Off</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      isHolidayDayoffPaid
                        ? 'Toggle to disable pay for day-offs on Regular Holidays'
                        : 'Toggle to enable pay for day-offs on Regular Holidays'
                    }`}
                    data-pr-position="left"
                    data-pr-at="right-5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div> */}
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:gap-0 mb-5">
              <div className="w-full md:w-1/4 flex md:self-center ">
                <div className="card flex " data-testid="enableSearchEmployee">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(enableSearchEmployee)}
                    onChange={(e) =>
                      setEnableSearchEmployee(!enableSearchEmployee)
                    }
                  />
                </div>
                <span className="ml-5">Enable Search Employees</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      enableSearchEmployee
                        ? 'Toggle to disable searching of employees in attendance and payroll modules'
                        : 'Toggle to enable searching of employees in attendance and payroll modules'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
            </div>
            <div>
              <div className="flex flex-col  w-[250px]">
                <label className="font-bold text-[12px]">
                  <span className="text-red-500">*</span>
                  Allowance On Halfday
                </label>
                <Dropdown
                  value={halfdayAllowancePay}
                  disabled={isLoading ? true : false}
                  options={[
                    { code: 'FULL', name: 'FULL' },
                    { code: 'HALF', name: 'HALF' },
                    { code: 'NONE', name: 'NONE' },
                  ]}
                  onChange={(e) => {
                    setHalfdayAllowancePay(e.value);
                  }}
                  optionLabel="name"
                ></Dropdown>
              </div>
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:gap-0 mb-5"></div>
            {/* <div>
              <p className="font-bold text-[16px]">Monthly Rated Employees</p>
            </div>
            <div className="">
              <div className="flex flex-col  w-full">
                <label className="font-bold text-[12px]">
                  <span className="text-red-500"></span>
                  Choose Employee/s
                </label>

                <div>
                  <MultiSelect
                    filter
                    maxSelectedLabels={10}
                    max={10}
                    width={'50%'}
                    virtualScrollerOptions={{ itemSize: 50 }}
                    disabled={isAdding || isLoading}
                    className="monthly-rated-employees-multiselect w-[1000px]"
                    optionLabel="name"
                    name="selectedEmployees"
                    placeholder="Select Employees"
                    options={employeeOptions}
                    value={selectedEmployees}
                    onChange={(e) => {
                      setSelectedEmployees(e.value);

                      console.log('selectedEmployees', e.value);
                      console.log(
                        'monthlyRatedEmployees',
                        monthlyRatedEmployees
                      );
                    }}
                  ></MultiSelect>{' '}
                  <span>
                    <Button
                      disabled={isAdding || isLoading}
                      className="ml-5"
                      onClick={handleAdd}
                    >
                      Add
                    </Button>
                  </span>
                </div>
              </div>
              <div className="mt-5 bg-white p-5">
                <h1>List of Employees</h1>
                <span className="p-input-icon-left w-full md:w-[90%] lg:w-[93.5%] justify-center flex mt-5 items-center sm:ml-10 lg:mb-0 mb-5">
                  <i className="pi pi-search absolute" />
                  <InputText
                    // value={filter}
                    placeholder="Search"
                    className="w-full"
                    value={globalFilterValue}
                    onChange={(e) => onGlobalFilterChange(e)}
                  />
                </span>
                <DataTable
                  tableStyle={{
                    minWidth: '10rem',
                    fontSize: '15px',
                  }}
                  globalFilterFields={['name']}
                  filters={filters}
                  className="overflow-auto pt-5 sm:pt-0 md:pl-10 lg:p-10"
                  value={monthlyRatedEmployees}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25]}
                >
                  <Column
                    field="employeeName"
                    header="Employee Name"
                    body={(data) => <>{isLoading ? <Skeleton /> : data.name}</>}
                  />

                  {<Column header="Actions" body={renderActions} />}
                </DataTable>
              </div>
            </div> */}
          </div>
        </div>
        <div className="mt-[50px]">
          <div className="inline-flex items-center">
            <i className="pi pi-percentage mr-2"></i>
            <p className="font-bold text-[18px]">Premium Rates</p>
          </div>
          <div
            className="flex flex-col md:flex-col mt-6 px-10 gap-5 rounded-lg py-[20px] align-middle overflow-x-scroll md:overflow-x-hidden"
            style={{
              background: '#F2F3FE',
            }}
          >
            <p className="text-sm text-red-500">
              Note: If the you disable rest days, regular holidays, special
              holidays, or night differential, employees will not receive
              additional pay or compensatory benefits for those periods
            </p>
            <div className="flex items-center h-[70px]">
              <div className="w-full md:w-1/4 flex md:self-center">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(restDayChecked)}
                    onChange={(e) => {
                      const updated = !restDayChecked;
                      setRestDayChecked(updated);
                      if (updated) {
                        if (restDayRate === 100) {
                          setRestDayRate(130);
                        }
                      } else {
                        setRestDayRate(100);
                      }
                    }}
                  />
                </div>
                <span className="ml-5">Rest Days</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      restDayChecked
                        ? 'Toggle to disable the rate for working on rest days'
                        : 'Toggle to enable the rate for working on rest days'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              {restDayChecked && (
                <>
                  <div className="w-1/4">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Rest Day Rate
                        </label>
                        <InputNumber
                          inputId="integeronly"
                          // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                          disabled={isLoading ? true : false}
                          min={100}
                          max={150}
                          name="restDayRate"
                          value={restDayRate}
                          onValueChange={(e: InputNumberValueChangeEvent) =>
                            setRestDayRate(e.value!)
                          }
                          placeholder="Enter Night Differential Rate"
                          required
                          suffix="%"
                        />
                      </div>
                      {restDayChecked && restDayRate <= 0 && (
                        <span className="text-red-500 text-xs">
                          Rest Day Rate is required.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Divider style={{ margin: 0 }} />
            <div className="flex items-center h-[70px]">
              <div className="w-full md:w-1/4 flex md:self-center">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(regularHolidayChecked)}
                    onChange={(e) => {
                      const updated = !regularHolidayChecked;
                      setRegularHolidayChecked(updated);
                      if (updated) {
                        if (regularHolidayRate === 100) {
                          setRegularHolidayRate(200);
                        }
                        if (regularHolidayRestDayRate === 100) {
                          setRegularHolidayRestDayRate(260);
                        }
                      } else {
                        setRegularHolidayRate(100);
                        setRegularHolidayRestDayRate(100);
                      }
                    }}
                  />
                </div>
                <span className="ml-5">Regular Holidays</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      regularHolidayChecked
                        ? 'Toggle to disable the rate for working on regular holidays'
                        : 'Toggle to enable the rate for working on regular holidays'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              {regularHolidayChecked && (
                <>
                  <div className="w-1/4">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Regular Holiday Rate
                        </label>
                        <InputNumber
                          inputId="integeronly"
                          // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                          disabled={isLoading ? true : false}
                          min={100}
                          max={300}
                          name="regularHolidayRate"
                          value={regularHolidayRate}
                          onValueChange={(e: InputNumberValueChangeEvent) =>
                            setRegularHolidayRate(e.value!)
                          }
                          placeholder="Enter Regular Holiday Rate"
                          required
                          suffix="%"
                        />
                      </div>
                      {regularHolidayChecked && regularHolidayRate <= 0 && (
                        <span className="text-red-500 text-xs">
                          Regular Holiday Rate is required.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-1/4">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Regular Holiday and Rest Day Rate
                        </label>
                        <InputNumber
                          inputId="integeronly"
                          // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                          disabled={isLoading ? true : false}
                          min={100}
                          max={300}
                          name="regularHolidayRestDayRate"
                          value={regularHolidayRestDayRate}
                          onValueChange={(e: InputNumberValueChangeEvent) =>
                            setRegularHolidayRestDayRate(e.value!)
                          }
                          placeholder="Enter Regular Holiday and Rest Day Rate"
                          required
                          suffix="%"
                        />
                      </div>
                      {regularHolidayChecked &&
                        regularHolidayRestDayRate <= 0 && (
                          <span className="text-red-500 text-xs">
                            Regular Holiday and Rest Day Rate is required.
                          </span>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Divider style={{ margin: 0 }} />
            <div className="flex items-center h-[70px]">
              <div className="w-full md:w-1/4 flex md:self-center">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(specialHolidayChecked)}
                    onChange={(e) => {
                      const updated = !specialHolidayChecked;
                      setSpecialHolidayChecked(updated);
                      if (updated) {
                        if (specialHolidayRate === 100) {
                          setSpecialHolidayRate(130);
                        }
                        if (specialHolidayRestDayRate === 100) {
                          setSpecialHolidayRestDayRate(150);
                        }
                      } else {
                        setSpecialHolidayRate(100);
                        setSpecialHolidayRestDayRate(100);
                      }
                    }}
                  />
                </div>
                <span className="ml-5">Special Holidays</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      specialHolidayChecked
                        ? 'Toggle to disable the rate for working on special holidays'
                        : 'Toggle to enable the rate for working on special holidays'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              {specialHolidayChecked && (
                <>
                  <div className="w-1/4">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Special Holiday Rate
                        </label>
                        <InputNumber
                          inputId="integeronly"
                          // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                          disabled={isLoading ? true : false}
                          min={100}
                          max={300}
                          name="specialHolidayRate"
                          value={specialHolidayRate}
                          onValueChange={(e: InputNumberValueChangeEvent) =>
                            setSpecialHolidayRate(e.value!)
                          }
                          placeholder="Enter Special Holiday Rate"
                          required
                          suffix="%"
                        />
                      </div>
                      {specialHolidayRate <= 0 && (
                        <span className="text-red-500 text-xs">
                          Special Holiday Rate is required.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-1/4">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Special Holiday and Rest Day Rate
                        </label>
                        <InputNumber
                          inputId="integeronly"
                          // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                          disabled={isLoading ? true : false}
                          min={100}
                          max={300}
                          name="specialHolidayRestDayRate"
                          value={specialHolidayRestDayRate}
                          onValueChange={(e: InputNumberValueChangeEvent) =>
                            setSpecialHolidayRestDayRate(e.value!)
                          }
                          placeholder="Enter Special Holiday and Rest Day Rate"
                          required
                          suffix="%"
                        />
                      </div>
                      {specialHolidayRestDayRate <= 0 && (
                        <span className="text-red-500 text-xs">
                          Special Holiday and Rest Day Rate is required.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <Divider style={{ margin: 0 }} />
            <div className="flex md:Flex-row items-center h-[70px]">
              <div className="w-full md:w-1/4 flex md:self-center">
                <div className="card flex ">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(nightDifferentialChecked)}
                    onChange={(e) =>
                      setNightDifferentialChecked(!nightDifferentialChecked)
                    }
                  />
                </div>
                <span className="ml-5">Night Differential</span>
                <span className="mx-1">
                  <Tooltip target=".leave-on-holiday-switch" position="left" />
                  <i
                    className="leave-on-holiday-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      nightDifferentialChecked
                        ? 'Toggle to disable night differential'
                        : 'Toggle to enable night differential'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              {nightDifferentialChecked && (
                <div className="flex flex-row w-full  md:w-3/4">
                  <div className="w-1/3">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Night Differential Rate
                        </label>

                        <InputNumber
                          inputId="integeronly"
                          // className="max-w:[40px] md:max-w-[400px]  w-[10px] "
                          disabled={isLoading ? true : false}
                          min={10}
                          max={100}
                          name="nightDifferentialRate"
                          value={nightDifferentialRate}
                          onValueChange={(e: InputNumberValueChangeEvent) =>
                            setNightDifferentialRate(e.value!)
                          }
                          placeholder="Enter Night Differential Rate"
                          required
                          suffix="%"
                        />
                      </div>
                      {nightDifferentialRate <= 0 && (
                        <span className="text-red-500 text-xs">
                          Night Differential Rate is required.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-1/3">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Night Differential Start Time
                        </label>
                        <Calendar
                          disabled={isLoading ? true : false}
                          showTime
                          hourFormat="12"
                          timeOnly
                          value={nightDifferentialStartTime}
                          onChange={(e) => {
                            const value = e.value?.toString();
                            if (value) {
                              const newStartTime = new Date(value);
                              setNightDifferentialStartTime(newStartTime);
                              if (nightDifferentialEndTime) {
                                validateNightDifferentialTime(
                                  newStartTime,
                                  nightDifferentialEndTime
                                );
                              }
                            }
                          }}
                          placeholder="Select Time in"
                          dateFormat="yy-mm-dd"
                        />
                      </div>
                      {nightStartTimeError && (
                        <span className="text-red-500 text-xs">
                          Please enter a start time between 6:00 PM and 6:00 AM.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-1/3">
                    <div className="flex flex-col w-[250px]">
                      <div className="flex flex-col w-full">
                        <label className="font-bold text-[12px]">
                          <span className="text-red-500">*</span>
                          Night Differential End Time
                        </label>
                        <Calendar
                          disabled={isLoading ? true : false}
                          showTime
                          hourFormat="12"
                          timeOnly
                          value={nightDifferentialEndTime}
                          onChange={(e) => {
                            const value = e.value?.toString();
                            if (value) {
                              const newEndTime = new Date(value);
                              setNightDifferentialEndTime(newEndTime);
                              if (nightDifferentialStartTime) {
                                validateNightDifferentialTime(
                                  nightDifferentialStartTime,
                                  newEndTime
                                );
                              }
                            }
                          }}
                          placeholder="Select Time in"
                          dateFormat="yy-mm-dd"
                        />
                      </div>
                      {nightEndTimeError && (
                        <span className="text-red-500 text-xs">
                          Please enter an end time between 6:00 PM and 6:00 AM
                          that is later than the start time.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {nightDifferentialChecked && (
              <div>
                <div className="flex flex-col gap-3 w-1/3">
                  <label className="font-bold text-[12px]">
                    <span className="text-red-500">*</span>
                    Select Departments for Night Differential
                  </label>
                  <MultiSelect
                    value={nightDiffDepts}
                    disabled={isLoading ? true : false}
                    options={
                      departmentOptions
                        ? departmentOptions.map((i: any) => ({
                            code: i.departmentId,
                            name: i.departmentName,
                          }))
                        : []
                      // [
                      //   { code: 'Monday', name: 'Monday' },
                      //   { code: 'Tuesday', name: 'Tuesday' },
                      //   { code: 'Wednesday', name: 'Wednesday' },
                      //   { code: 'Thursday', name: 'Thursday' },
                      //   { code: 'Friday', name: 'Friday' },
                      //   { code: 'Saturday', name: 'Saturday' },
                      //   { code: 'Sunday', name: 'Sunday' },
                      // ]
                    }
                    onChange={(e) => {
                      setNightDiffDepts(e.value);
                    }}
                    filter
                    optionLabel="name"
                  ></MultiSelect>
                </div>
                {nightDiffDeptError && (
                  <span className="text-red-500 text-xs">
                    Departments are required.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-[0px]">
          <div className="inline-flex items-center">
            <i className="pi pi-bell   mr-2"></i>
            <p className="font-bold text-[18px]">Enable Notifications</p>
          </div>

          <div
            className="flex mt-6 p-[40px] rounded-lg justify-start flex-col gap-5"
            style={{
              background: '#F2F3FE',
              backgroundColor: '#F2F3FE',
            }}
          >
            <div>
              <p className="font-bold text-[16px]">Employee Payslip</p>
            </div>
            <div className="flex justify-start flex-col md:flex-row gap-10 ">
              <div className="w-1/4 flex justify-start">
                <div className="card flex justify-content-center">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    checked={handleBooleanChecker(emailChecked)}
                    onChange={(e) => setEmailChecked(!emailChecked)}
                  />
                </div>
                <span className="ml-5">Email</span>
                <span className="mx-1">
                  <Tooltip target=".email-switch" position="left" />
                  <i
                    className="email-switch pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                    data-pr-tooltip={`${
                      emailChecked
                        ? 'Toggle to disable email of payslip to employee'
                        : 'Toggle to enable email of payslip to employee'
                    }`}
                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ cursor: 'pointer' }}
                  ></i>
                </span>
              </div>
              <div className="w-full flex justify-start">
                <div className="card flex justify-content-center">
                  {/* <label htmlFor={field.name}></label> */}
                  <InputSwitch
                    // disabled={isSubmitting || action == 'view'}
                    disabled={true}
                    checked={handleBooleanChecker(false)}
                    onChange={(e) => setEmailChecked(true)}
                  />
                </div>
                <span className="ml-5">SMS (Under Development)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button
            label={'Save'}
            className="rounded-full w-[200px] px-10 p-button"
            onClick={() => {
              handleSubmit();
            }}
            disabled={isSubmitting || isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Configurations;
