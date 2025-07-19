'use client';

import { Sidebar } from 'primereact/sidebar';

import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import classNames from 'classnames';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tooltip } from 'primereact/tooltip';
import { properCasing } from '@utils/helper';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import { InputNumber, TimePicker, type TimePickerProps } from 'antd';
import { MultiSelect } from 'primereact/multiselect';
import ChangeScheduleForm from './changeScheduleForm';
import { InputText } from 'primereact/inputtext';
import { getCurrentOrNewShiftDetails } from '@utils/companyDetailsGetter';
import EmployeeAutoSuggest from 'lib/components/common/EmployeeAutoSuggest';

const numberTodayMap = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const daytoNumberMap: any = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const AttendanceAppForm = ({
  toast,
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
  moduleRole,
}: {
  toast: any;
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent?: () => void;
  moduleRole?: string;
}) => {
  // for holidays error dialogue
  const holidayError = useRef<{
    holidays: { holidayDate: string; holidayName: string }[];
    message: string;
  }>({
    holidays: [],
    message: '',
  });
  const [newScheduleData, setNewScheduleData] = useState<ChangeSchedule[]>([]);
  const [currentScheduleData, setCurrentScheduleData] = useState(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);

  const context = useContext(GlobalContainer);
  const sessionData = context?.userData;
  const role = moduleRole ? moduleRole : context?.userData.role;
  const [isButtonLabelChange, setIsButtonLabelChange] = useState(false);
  let daysOffMap = useRef<any>({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });
  let daysOffNumberArray = useRef<any>([]);
  const clearDaysOffData = () => {
    daysOffMap.current = {
      Sunday: false,
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
    };
    daysOffNumberArray.current = [];
  };

  const [showForms, setShowForms] = useState({
    leavesOTs: false,
    changeSched: false,
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
    resetField,
  } = useForm<AttendanceApplication>({
    mode: 'onSubmit',
    defaultValues: {
      requestedDate: moment().format('MM/DD/YYYY'),
      numberOfHours: 0,
      numberOfDays: 0,
    },
  });

  useEffect(() => {
    if (isOpen && action == 'add') {
      setNewScheduleData([]);
      setCurrentScheduleData(null);
      reset();
    } else if (isOpen && rowData) {
      setValue('attendanceAppId', rowData.attendanceAppId);
      setValue(
        'fromDate',
        rowData.fromDate ? (new Date(rowData.fromDate) as any) : undefined
      );
      setValue(
        'toDate',
        rowData.toDate ? (new Date(rowData.toDate) as any) : undefined
      );
      setValue(
        'timeFrom',
        rowData.timeFrom
          ? (new Date(`${rowData.fromDate} ${rowData.timeFrom}`) as any)
          : null
      );
      setValue(
        'timeTo',
        rowData.timeTo
          ? (new Date(`${rowData.fromDate} ${rowData.timeTo}`) as any)
          : null
      );
      setValue('type', rowData.type);
      setValue('reason', rowData.reason);
      setValue('employeeId', rowData.employee.employeeId);
      setValue('approverId', rowData.approverId);
      setValue(
        'requestedDate',
        moment(rowData.requestedDate).format('MM/DD/YYYY')
      );
      setValue('numberOfHours', rowData.numberOfHours);
      setValue('numberOfDays', rowData.numberOfDays);
    } else {
      clearErrors();
    }
  }, [action, rowData, clearErrors, setValue, reset, isOpen]);

  useEffect(() => {
    if (context && role === 'EMPLOYEE') {
      axios
        .get(`/api/employee/${context.userData.employeeId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
        .then((res) => {
          setUserData(res.data.message);
          // console.log(userData);
        })
        .catch((err) => {
          console.log(err);
        });

      setValue('employeeId', context?.userData.employeeId);
    }
  }, [context, setValue, role]);

  useEffect(() => {
    clearDaysOffData();

    if (userData !== null) {
      // change ot limits whenever user data changes
      let minTime = new Date();
      const timeInSplit = userData.shift.timeIn.split(':');
      minTime.setHours(timeInSplit[0]);
      minTime.setMinutes(timeInSplit[1]);
      minTime.setSeconds(timeInSplit[2]);
      const timeOutSplit = userData.shift.timeOut.split(':');

      let maxTime = new Date();
      maxTime.setHours(timeOutSplit[0]);
      maxTime.setMinutes(timeOutSplit[1]);
      maxTime.setSeconds(timeOutSplit[2]);
      OtLimits.current = {
        timeIn: minTime,
        timeOut: maxTime,
      };

      //change days off data
      userData.daysOff.forEach((day: string) => {
        // set days to true on map which is to be used for validation to check if the days off fall witihin date from - date to range
        daysOffMap.current[`${day}`] = true;

        // map to daysOffNumberArray which is a list of days to be disabled on date from to date to
        daysOffNumberArray.current.push(daytoNumberMap[`${day}`]);
      });
    }
  }, [userData]);

  const leaveList = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['leaveList'],
    enabled: false,
    queryFn: () =>
      fetch(
        `/api/employees/leaves?employeeId=${
          role === 'EMPLOYEE'
            ? context?.userData.employeeId
            : watch('employeeId')
        }`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
          return [];
        }),
  });

  const myLeaves = () => {
    switch (watch('type')) {
      case 'Vacation Leave':
        return {
          used: leaveList.data?.data[0].vacationLeaveUsed || 0,
          credits: leaveList.data?.data[0].vacationLeaveCredits || 0,
        };
      case 'Sick Leave':
        return {
          used: leaveList.data?.data[0].sickLeaveUsed || 0,
          credits: leaveList.data?.data[0].sickLeaveCredits || 0,
        };
      case 'Solo Parent Leave':
        return {
          used: leaveList.data?.data[0].soloParentLeavesUsed || 0,
          credits: leaveList.data?.data[0].soloParentLeaveCredits || 0,
        };
      case 'Paternity Leave':
        return {
          used: leaveList.data?.data[0].paternityLeavesUsed || 0,
          credits: leaveList.data?.data[0].paternityLeaveCredits || 0,
        };
      case 'Maternity Leave':
        return {
          used: leaveList.data?.data[0].maternityLeavesUsed || 0,
          credits: leaveList.data?.data[0].maternityLeaveCredits || 0,
        };
      case 'Service Incentive Leave':
        return {
          used: leaveList.data?.data[0].serviceIncentiveLeaveUsed || 0,
          credits: leaveList.data?.data[0].serviceIncentiveLeaveCredits || 0,
        };
      case 'Others':
        return {
          used: leaveList.data?.data[0].otherLeavesUsed || 0,
          credits: leaveList.data?.data[0].otherLeaveCredits || 0,
        };
      case 'Emergency Leave':
        return {
          used: leaveList.data?.data[0].emergencyLeavesUsed || 0,
          credits: leaveList.data?.data[0].emergencyLeaveCredits || 0,
        };
      case 'Birthday Leave':
        return {
          used: leaveList.data?.data[0].birthdayLeavesUsed || 0,
          credits: leaveList.data?.data[0].birthdayLeaveCredits || 0,
        };
      default:
        return {
          used: 0,
          credits: 1,
        };
    }
  };

  // const approvers = useQuery({
  //   refetchOnWindowFocus: false,
  //   queryKey: ['approvers'],
  //   enabled: false,
  //   queryFn: () =>
  //     fetch(`/api/approvers`, {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
  //       },
  //     })
  //       .then((res) => res.json())
  //       .catch((err) => console.error(err)),
  // });

  useEffect(() => {
    if (watch('employeeId')) {
      leaveList.refetch();
    }

  }, [leaveList, watch]);

  const calcDuration = async () => {
    if (
      watch('type') &&
      watch('fromDate') &&
      watch('toDate') &&
      watch('timeFrom') &&
      watch('timeTo')
    ) {
      if (watch('type') == 'Overtime') {
        const dateTimeFrom = `${moment(watch('fromDate')).format(
          'MM/DD/YYYY'
        )} ${moment(watch('timeFrom')).format('hh:mm A')}`;
        const dateTimeTo = `${moment(watch('toDate')).format(
          'MM/DD/YYYY'
        )} ${moment(watch('timeTo')).format('hh:mm A')}`;
        let numberOfHours =
          moment
            .duration(moment(dateTimeTo).diff(moment(dateTimeFrom)))
            .asMinutes() / 60;
        const decimalValue = numberOfHours % 1;
        if (decimalValue >= 0.0 && decimalValue < 0.5) {
          // remove all decimal points
          numberOfHours = Math.trunc(numberOfHours);
        } else if (decimalValue >= 0.5 && decimalValue <= 0.99) {
          // remove all decimal values then add .5 after
          numberOfHours = Math.trunc(numberOfHours);
          numberOfHours += 0.5;
        }
        setValue('numberOfHours', numberOfHours);
      } else if (
        watch('type') != 'Overtime' &&
        watch('type') != 'Change Schedule' &&
        watch('employeeId')
      ) {
        let shift;

        const newShiftShed = await getCurrentOrNewShiftDetails({
          employeeId: watch().employeeId,
          attendanceDate: moment(watch('fromDate')).format('YYYY-MM-DD'),
        });
        if (newShiftShed.success) {
          shift = newShiftShed.shift;
        }
        const { lunchStart, lunchEnd, workingHours } = shift;

        const fromDate = moment(watch('fromDate')).format('YYYY-MM-DD');
        const toDate = moment(watch('toDate')).format('YYYY-MM-DD');
        const fromTime = moment(watch('timeFrom')).format('HH:mm:ss');
        const toTime = moment(watch('timeTo')).format('HH:mm:ss');

        let nextDay = fromDate;
        if (fromTime > toTime) {
          nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }
        // console.log(fromTime);
        // console.log(toTime);
        const dateTimeFrom = `${fromDate} ${fromTime}`;
        const dateTimeTo = `${nextDay} ${toTime}`;

        if (shift.timeIn > shift.timeOut) {
          nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }
        const shiftTimeFrom = `${fromDate} ${shift.timeIn}`;
        const shiftTimeTo = `${nextDay} ${shift.timeOut}`;

        let lunchInNextDay = fromDate;
        if (lunchStart > lunchEnd) {
          lunchInNextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }
        const shiftLunchStart = `${fromDate} ${lunchStart}`;
        const shiftLunchEnd = `${lunchInNextDay} ${lunchEnd}`;
        const lunchBreakHours =
          moment
            .duration(moment(shiftLunchEnd).diff(moment(shiftLunchStart)))
            .asMinutes() / 60;

        let numberOfHours =
          moment
            .duration(moment(dateTimeTo).diff(moment(dateTimeFrom)))
            .asMinutes() /
            60 -
          lunchBreakHours;

        // calculate half day hours
        const halfDay = parseFloat((workingHours / 2).toFixed(2));
        // calculate first half of shift
        const firstHalfShiftStart = shift.timeIn;
        const firstHalfShiftEnd = moment(shiftTimeFrom)
          .add(halfDay, 'hours')
          .format('HH:mm:ss');
        // calculate second half of shift
        const secondHalfShiftStart = moment(shiftTimeTo)
          .subtract(halfDay, 'hours')
          .format('HH:mm:ss');
        const secondHalfShiftEnd = shift.timeOut;

        // recaulculate numberofhours for halfday to avoid subtracting lunch break hours to final number of hours
        if (
          (fromTime != firstHalfShiftStart && toTime != firstHalfShiftEnd) ||
          (fromTime != secondHalfShiftStart && toTime != secondHalfShiftEnd)
        ) {
          numberOfHours =
            moment
              .duration(moment(dateTimeTo).diff(moment(dateTimeFrom)))
              .asMinutes() / 60;
        }

        let leaveHours = 0;
        let startDate: any = fromDate;
        let endDate = toDate;
        while (moment(startDate) <= moment(endDate)) {
          leaveHours += numberOfHours;
          startDate = moment(startDate).add(1, 'days');
        }
        setValue('numberOfHours', numberOfHours);
        setValue('numberOfDays', leaveHours / workingHours);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (watch('type') == 'Change Schedule' && watch('employeeId')) {
        axios.get(`/api/employee/${watch().employeeId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
          .then((res) => {
            setCurrentScheduleData(res.data?.message?.shift || null);
          })
          .catch((err) => {
            console.error(err);
          });
      }
      if (rowData) {
        setNewScheduleData(rowData.changed_schedules);
      }
    }
  }, [watch, isOpen, rowData]);

  const OtLimits = useRef<any>({
    timeIn: null,
    timeOut: null,
  });

  const createAttendanceApplication = async (data: AttendanceApplication) => {
    const fromDate = watch('fromDate');
    const toDate = watch('toDate');

    let config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `/api/attendanceApplication`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
      data: JSON.stringify({
        attendanceAppId: data.attendanceAppId ?? null,
        approverId: data.approverId,
        type: data.type,
        reason: data.reason,
        requestedDate: moment(data.requestedDate).format('YYYY-MM-DD'),
        fromDate: moment(data.fromDate).format('YYYY-MM-DD'),
        toDate: moment(data.toDate).format('YYYY-MM-DD'),
        fromTime: moment(data.timeFrom).format('HH:mm:ss'),
        toTime: moment(data.timeTo).format('HH:mm:ss'),
        numberOfHours: data.numberOfHours,
        numberOfDays: data.numberOfDays,
        employeeId:
          role === 'EMPLOYEE' ? context?.userData.employeeId : data.employeeId,
        newScheduleData: newScheduleData,
      }),
    };
    // traverse from from date date to to check if days off fall within the two range
    // console.log(watch('fromDate'));

    if (data.type === 'Overtime' && (!data.timeFrom || !data.timeTo)) {
      return (function () {
        toast.current?.replace({
          severity: 'error',
          summary: 'Time From and Time To is required for Overtime',
          life: 3000,
        });
      })();
    }

    if (data.type == 'Change Schedule' && newScheduleData.length == 0) {
      return (function () {
        toast.current?.replace({
          severity: 'error',
          summary: 'Please add at least one schedule',
          life: 3000,
        });
      })();
    }

    if (
      data.type.includes('Leave') &&
      (data.timeFrom == null ||
        data.timeTo == null ||
        data.toDate === undefined ||
        data.fromDate === undefined)
    ) {
      return (function () {
        toast.current?.replace({
          severity: 'error',
          summary:
            'Time From and Time | Date From and to is required for Vacation and Sick Leave',
          life: 3000,
        });
      })();
    }

    if (
      data.type !== 'Overtime' &&
      data.type !== 'Change Schedule' &&
      (data.toDate == undefined || data.fromDate == undefined)
    ) {
      return (function () {
        toast.current?.replace({
          severity: 'error',
          summary: 'Date From and Date To is required',
          life: 3000,
        });
      })();
    }

    if (data.type !== 'Overtime' && fromDate && toDate) {
      let fromDateFormatted = new Date(fromDate);
      let toDateFormatted = new Date(toDate);
      let i = 0;
      let hasCollision = false;
      while (
        fromDateFormatted <= toDateFormatted &&
        i < 7 &&
        hasCollision == false
      ) {
        // 'sunday','monday'
        let dayOfWeek = numberTodayMap[fromDateFormatted.getDay()];
        // IF true sa map then stop
        if (daysOffMap.current[`${dayOfWeek}`]) {
          hasCollision = true;
        }

        i++;
        fromDateFormatted.setDate(fromDateFormatted.getDate() + 1);
      }
      if (hasCollision) {
        return (function () {
          toast.current?.replace({
            severity: 'error',
            summary: 'You cannot file leaves for day off',
            life: 3000,
          });
        })();
      }
    }

    setIsButtonLabelChange(true);

    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting request',
      detail: 'Please wait...',
      sticky: true,
      closable: false,
    });

    await axios
      .request(config)
      .then((res) => {
        if (!res.data.success) {
          if (res.data.holidays && res.data.holidays.length > 0) {
            holidayError.current.holidays = res.data.holidays;
            holidayError.current.message = res.data.message;
            setVisible(true);
          } else {
            (function () {
              toast.current?.replace({
                severity: 'error',
                detail: res.data.details ?? undefined,
                summary: res.data.message,
                life: res.data.life ?? 3000,
                closable: true,
              });
            })();
          }
          setIsButtonLabelChange(false);
        } else {
          (function () {
            toast.current?.replace({
              severity: 'success',
              summary:
                action == 'add'
                  ? 'Successfully Submitted'
                  : 'Successfully Updated',
              life: 10000,
            });
          })();
          setIsButtonLabelChange(false);
          reset();
          refetchDataFromParent && refetchDataFromParent();
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
        }
      })
      .catch((err) => {
        // console.log(err);
        (function () {
          toast.current?.replace({
            severity: 'error',
            summary: 'Error Occured',
            life: 10000,
          });
        })();

        setIsButtonLabelChange(false);
      });
  };

  return (
    <>
      <Sidebar
        closeOnEscape={action == 'view'}
        dismissable={action == 'view'}
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        <React.Fragment>
          <div className="flex justify-between items-center">
            <div className="w-full flex gap-2 justify-start">
              <h1 className="text-black font-medium text-3xl">{title}</h1>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <form
            className="px-5 py-[30px]"
            onSubmit={handleSubmit(createAttendanceApplication)}
          >
            <div className="col-span-3 grid grid-cols-2 gap-5 mb-4">
              <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                <label>
                  <span className="text-red-500">*</span>Application Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Application Type field is required.' }}
                  render={({ field, fieldState }) => (
                    <Dropdown
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      className={classNames('w-full', {
                        'p-invalid': fieldState.invalid,
                      })}
                      showClear
                      disabled={action == 'view'}
                      options={[
                        { name: 'Change Schedule', value: 'Change Schedule' },
                        {
                          name: 'Emergency Leave',
                          value: 'Emergency Leave',
                        },
                        {
                          name: 'Birthday Leave',
                          value: 'Birthday Leave',
                        },
                        {
                          name: 'Official Business',
                          value: 'Official Business',
                        },
                        { name: 'Vacation Leave', value: 'Vacation Leave' },
                        { name: 'Sick Leave', value: 'Sick Leave' },
                        {
                          name: 'Solo Parent Leave',
                          value: 'Solo Parent Leave',
                        },
                        { name: 'Paternity Leave', value: 'Paternity Leave' },
                        { name: 'Maternity Leave', value: 'Maternity Leave' },
                        {
                          name: 'Service Incentive Leave',
                          value: 'Service Incentive Leave',
                        },
                        { name: 'Overtime', value: 'Overtime' },
                      ].sort((a, b) =>
                        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                      )}
                      optionLabel={'name'}
                      placeholder={'Select Application Type'}
                      onChange={async (e) => {
                        const value = e.value;
                        field.onChange(value);
                        clearErrors();
                        calcDuration();
                        if (role === 'EMPLOYEE') {
                          setValue('employeeId', context?.userData.employeeId);
                        }

                        if (value) {
                          if (value.includes('Leave') || value === 'Overtime') {
                            setShowForms({
                              leavesOTs: true,
                              changeSched: false,
                            });
                          } else {
                            setShowForms({
                              leavesOTs: false,
                              changeSched: true,
                            });
                            if (watch().employeeId) {
                              axios.get(`/api/employee/${watch().employeeId}`, {
                                headers: {
                                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
                                },
                              })
                                .then((res) => {
                                  setCurrentScheduleData(res.data?.message?.shift || null);
                                })
                                .catch((err) => {
                                  console.error(err);
                                });
                            }
                          }
                        } else {
                          reset();
                          setShowForms({
                            leavesOTs: false,
                            changeSched: false,
                          });
                        }
                      }}
                    />
                  )}
                />
                {errors.type && (
                  <span className="text-red-500">
                    Application Type is required
                  </span>
                )}
              </div>

              <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                <label>Requested Date</label>
                <InputText disabled={true} {...register('requestedDate')} />
              </div>
            </div>

            {watch().type && (
              <>
                {/* <h1 className="text-xl mb-2">Request Application</h1> */}
                {(watch('employeeId') || role === 'EMPLOYEE') &&
                  watch().type.includes('Leave') && (
                    <Divider align="left">
                      <div className="inline-flex items-center text-red-700">
                        <i className="pi pi-calendar mr-2"></i>
                        <b className="mr-2">{`${watch().type}:`}</b>
                        <Badge
                          value={`${myLeaves()?.used}/${myLeaves()?.credits}`}
                        ></Badge>
                      </div>
                    </Divider>
                  )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {showForms.leavesOTs && (
                    <>
                      {watch().type != 'Overtime' && (
                        <div className=" text-sm">
                          Half-Day Leave Calculation
                          <span className="mx-1">
                            <Tooltip
                              target=".computation-info"
                              position="left"
                            />
                            <i
                              className="computation-info pi pi-info-circle p-text-secondary p-overlay-badge text-[17px]"
                              data-pr-tooltip={
                                `Example:` +
                                `
              Shift Hours: 8:00 AM - 5:00 PM (9 hours)
              Break: 12:00 PM - 1:00 PM (1 hour)
              Using the formula:
              = (9 - 1) / 2
              = 4 hours                
              Hence, half day work is composed of 4 hours - the first half is from 8:00 AM - 12:00 PM
              and the second half is from 1:00 PM - 5:00 PM.`
                              }
                              data-pr-position="right"
                              data-pr-at="right+5 top"
                              data-pr-my="left center-2"
                              style={{ cursor: 'pointer' }}
                            ></i>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {role != 'EMPLOYEE' && (
                    <div className="col-span-3 gap-5">
                      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                        <label className="mb-1">
                          <span className="text-red-500">*</span>Employee
                        </label>
                        <Controller
                          name="employeeId"
                          control={control}
                          rules={{ required: 'Employee is required.' }}
                          render={({ field, fieldState }) => (
                            <EmployeeAutoSuggest
                              value={field.value}
                              onChange={(value: any) => {
                                field.onChange(value?.employeeId ?? null);

                                if (!value) return;

                                if (value.shift === null) {
                                  toast.current?.replace({
                                    severity: 'error',
                                    summary: 'Please select shift for this employee first',
                                    life: 3000,
                                  });
                                  return;
                                }
                                setCurrentScheduleData(value.shift);

                                calcDuration();
                                setUserData(value);
                                setValue('employeeId', value.employeeId);
                                leaveList.refetch();
                              }}
                              onBlur={field.onBlur}
                              className={classNames({
                                'p-invalid': fieldState.invalid,
                              })}
                              disabled={action == 'view'}
                              companyId={sessionData.companyId}
                              employeeStatus={1}
                              placeholder="Search Employee"
                            />
                          )}
                        />
                        {errors.employeeId && (
                          <span className="text-red-500">
                            {errors.employeeId.message}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {watch('type') == 'Change Schedule' && (
                    <div className="col-span-3 gap-5">
                      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                        <ChangeScheduleForm
                          action={action}
                          currentScheduleData={currentScheduleData}
                          newScheduleData={newScheduleData}
                          setNewScheduleData={setNewScheduleData}
                        />
                      </div>
                    </div>
                  )}

                  {watch('type') !== 'Change Schedule' && (
                    <div className="col-span-3 grid grid-cols-2 gap-5">
                      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                        <label>
                          <span className="text-red-500">*</span>Date From
                        </label>
                        <Controller
                          name="fromDate"
                          control={control}
                          rules={{ required: 'Date From is required.' }}
                          render={({ field, fieldState }) => (
                            <Calendar
                              disabled={action == 'view'}
                              ref={field.ref}
                              value={field.value}
                              onBlur={field.onBlur}
                              onChange={(e) => {
                                field.onChange(e.value);
                                calcDuration();
                              }}
                              className={classNames({
                                'p-invalid': fieldState.invalid,
                              })}
                              dateFormat="mm/dd/yy"
                              showIcon
                            />
                          )}
                        />
                        {errors.fromDate && (
                          <span className="text-red-500">
                            Date From field is required.
                          </span>
                        )}
                      </div>

                      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                        <label>
                          <span className="text-red-500">*</span>Time{' '}
                          {watch('type') === 'Change Schedule' ? 'In' : 'From'}
                        </label>
                        <Controller
                          name="timeFrom"
                          control={control}
                          rules={{ required: 'This field is required.' }}
                          render={({ field, fieldState }) => (
                            <>
                              <TimePicker
                                disabled={action == 'view'}
                                ref={field.ref}
                                value={field.value ? dayjs(field.value) : null}
                                onBlur={field.onBlur}
                                onChange={(e: any) => {
                                  field.onChange(e ? new Date(e) : null);
                                  calcDuration();
                                }}
                                className={classNames(
                                  'p-inputtext p-component',
                                  {
                                    'p-invalid': fieldState.invalid,
                                  }
                                )}
                                use12Hours
                                format="hh:mm A"
                              />
                            </>
                          )}
                        />
                        {errors.timeFrom && (
                          <span className="text-red-500">
                            Time{' '}
                            {watch('type') === 'Change Schedule'
                              ? 'In'
                              : 'From'}{' '}
                            field is required.
                          </span>
                        )}
                      </div>

                      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                        <label>
                          <span className="text-red-500">*</span>Date To
                        </label>
                        <Controller
                          name="toDate"
                          control={control}
                          rules={{ required: 'Date From is required.' }}
                          render={({ field, fieldState }) => (
                            <Calendar
                              disabled={action == 'view'}
                              ref={field.ref}
                              value={field.value}
                              onBlur={field.onBlur}
                              onChange={(e) => {
                                field.onChange(e.value);
                                calcDuration();
                              }}
                              className={classNames({
                                'p-invalid': fieldState.invalid,
                              })}
                              dateFormat="mm/dd/yy"
                              showIcon
                            />
                          )}
                        />
                        {errors.toDate && (
                          <span className="text-red-500">
                            Date To field is required.
                          </span>
                        )}
                      </div>
                      <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
                        <label>
                          <span className="text-red-500">*</span>Time{' '}
                          {watch('type') === 'Change Schedule' ? 'Out' : 'To'}
                        </label>
                        <Controller
                          name="timeTo"
                          control={control}
                          rules={{ required: 'This field is required.' }}
                          render={({ field, fieldState }) => (
                            <>
                              <TimePicker
                                disabled={action == 'view'}
                                ref={field.ref}
                                value={field.value ? dayjs(field.value) : null}
                                onBlur={field.onBlur}
                                onChange={(e: any) => {
                                  field.onChange(e ? new Date(e) : null);
                                  calcDuration();
                                }}
                                className={classNames(
                                  'p-inputtext p-component',
                                  {
                                    'p-invalid': fieldState.invalid,
                                  }
                                )}
                                use12Hours
                                format="hh:mm A"
                              />
                            </>
                          )}
                        />
                        {errors.timeTo && (
                          <span className="text-red-500">
                            Time{' '}
                            {watch('type') === 'Change Schedule' ? 'Out' : 'To'}{' '}
                            field is required.
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {watch('type') == 'Overtime' && (
                    <div className="card flex col-span-3 justify-content-center flex-col text-[12px] flex-auto">
                      <label className="mb-1">Overtime Duration (Hours)</label>
                      <InputText
                        {...register('numberOfHours')}
                        className={classNames('w-full')}
                        disabled
                      />
                    </div>
                  )}

                  {watch('type') &&
                    watch('type') != 'Overtime' &&
                    watch('type') != 'Change Schedule' && (
                      <div className="card flex col-span-3 justify-content-center flex-col text-[12px] flex-auto">
                        <label className="mb-1">
                          {watch('type')} Duration (Days)
                        </label>
                        <InputText
                          {...register('numberOfDays')}
                          className={classNames('w-full')}
                          disabled
                        />
                      </div>
                    )}

                  <div className="card flex col-span-3 justify-content-center flex-col text-[12px] flex-auto">
                    <label className="mb-1">
                      <span className="text-red-500">*</span>Reason
                    </label>
                    <InputTextarea
                      autoResize
                      rows={2}
                      cols={30}
                      {...register('reason', {
                        required: 'Reason is required',
                      })}
                      disabled={action == 'view'}
                    />
                    {errors.reason && (
                      <span className="text-red-500">
                        {errors.reason.message}
                      </span>
                    )}
                  </div>
                  {/* <div className="card flex col-span-3 justify-content-center flex-col text-[12px] flex-auto">
                    <label className="mb-1">
                      <span className="text-red-500">*</span>Approver
                    </label>
                    <Controller
                      name="approverId"
                      control={control}
                      rules={{ required: 'Approver is required.' }}
                      render={({ field, fieldState }) => (
                        <Dropdown
                          showClear
                          disabled={action == 'view'}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onChange={(e) => {
                            field.onChange(e.value);
                          }}
                          options={
                            approvers.isLoading && approvers.data
                              ? []
                              : approvers.data.map((approver: any) => ({
                                  name: `${approver.userFullName} - ${approver.role}`,
                                  value: approver.userId,
                                }))
                          }
                          optionLabel="name"
                          className="w-full md:w-20rem"
                        />
                      )}
                    />
                    {errors.approverId && (
                      <span className="text-red-500">
                        {errors.approverId.message}
                      </span>
                    )}
                  </div> */}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <Button
                rounded
                className="rounded-full px-20 justify-center"
                severity="secondary"
                text
                label="Cancel"
                onClick={(e) => {
                  e.preventDefault();
                  setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
                }}
              />
              {action != 'view' && (
                <Button
                  label={submitBtnText}
                  className="bg-primaryDefault"
                  disabled={
                    isButtonLabelChange ||
                    myLeaves()?.used === myLeaves()?.credits ||
                    (!isDirty && !isValid)
                  }
                  rounded
                  type="submit"
                />
              )}
            </div>
          </form>
          {/* TOAST */}

          <div className="card flex justify-content-center">
            <Dialog
              header={holidayError.current.message}
              visible={visible}
              maximizable
              style={{ width: '40vw', minHeight: '10vw' }}
              onHide={() => setVisible(false)}
            >
              <ul className="m-0 py-5">
                {holidayError.current.holidays.map(
                  (item: any, index: number) => {
                    let holidayString = ` ${properCasing(
                      item.holidayName
                    )} (${moment(item.holidayDate).format('MM/DD/YYYY')})`;

                    return (
                      <li className=" text-red-600" key={index}>
                        {holidayString}
                      </li>
                    );
                  }
                )}
              </ul>
            </Dialog>
          </div>
        </React.Fragment>
      </Sidebar>
    </>
  );
};

export default AttendanceAppForm;
