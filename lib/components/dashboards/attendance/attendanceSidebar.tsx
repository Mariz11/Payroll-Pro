'use client';

import { useQuery } from '@tanstack/react-query';
import { dateTimeFormatter } from '@utils/attendance';
import {
  computeUndertimeLateHours,
  getCurrentOrNewShiftDetails,
  getDepartmentDetails,
} from '@utils/companyDetailsGetter';
import getNightDifferentialHours from '@utils/getNightDifferentialHours';
import { convertMinsToHours } from '@utils/helper';
import { TimePicker } from 'antd';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import DashboardNav from 'lib/components/blocks/dashboardNav';
import { GlobalContainer } from 'lib/context/globalContext';
import moment from '@constant/momentTZ';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
const date = new Date();
const dateToday = date.toISOString().split('T')[0];

interface Attendance {
  date?: string;
  holiday?: {
    holidayType?: string;
  };
  attendanceId: number;
  timeIn: Dayjs | null;
  timeOut: Dayjs | null;
  lunchTimeIn: Dayjs | null;
  lunchTimeOut: Dayjs | null;
  undertimeHours: number;
  lateHours: number;
  status: string;
  isDayOff: boolean;
  isPresent: boolean;
  isLeave: boolean;
  isHalfDay: boolean;
}

const AttendanceSidebar = ({
  configuration: { title, submitBtnText, action, rowData, isOpen },
  setSideBarConfig,
  refetchDataFromParent,
  setForceResetSelectedRows,
  forceResetSelectedRows,
}: {
  configuration: SideBarConfig;
  setSideBarConfig: any;
  refetchDataFromParent: () => void;
  setForceResetSelectedRows: any;
  forceResetSelectedRows: boolean;
}) => {
  let emptyItem: Attendance = {
    attendanceId: 0,
    timeIn: null,
    timeOut: null,
    lunchTimeIn: null,
    lunchTimeOut: null,
    undertimeHours: 0,
    lateHours: 0,
    status: '',
    isDayOff: false,
    isPresent: false,
    isLeave: false,
    isHalfDay: false,
  };

  const [items, setItems] = useState<any[]>([]);
  const [item, setItem] = useState<Attendance>(emptyItem);
  const [itemDialog, setItemDialog] = useState<boolean>(false);
  const [isHideFields, setIsHideFields] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any[]>>(null);
  const [shiftValues, setShiftValues] = useState<any>({
    firstHalfShiftStart: '',
    firstHalfShiftEnd: '',
    secondHalfShiftStart: '',
    secondHalfShiftEnd: '',
    halfDayWorkingHours: 0,
  });
  const {
    control,
    formState: { errors, isDirty, isValid, isSubmitting },
    handleSubmit,
    getValues,
    reset,
    register,
    setValue,
    trigger,
    clearErrors,
    setError,
    watch,
  } = useForm<Attendance>({ mode: 'onChange', defaultValues: item });

  useEffect(() => {
    if (isOpen) {
      axios
        .get(
          `/api/attendances/employees/details?businessMonth=${rowData.businessMonth}&cycle=${rowData.cycle}&employeeId=${rowData.employeeId}&companyId=${rowData.companyId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
            },
          }
        )
        .then((response) => {
          setItems(response.data);
        });

      axios
        .get(`/api/employee/${rowData.employeeId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
          },
        })
        .then((response: any) => {
          const shift = response.data.message.shift;
          const halfDay = (shift.workingHours / 2).toFixed(2);
          const firstHalfShiftStart = shift.timeIn;
          const firstHalfShiftEnd = moment(`${dateToday} ${shift.timeIn}`)
            .add(halfDay, 'hours')
            .format('HH:mm:ss');
          const secondHalfShiftStart = moment(`${dateToday} ${shift.timeOut}`)
            .subtract(halfDay, 'hours')
            .format('HH:mm:ss');
          const secondHalfShiftEnd = shift.timeOut;
          setShiftValues((prev: any) => ({
            ...prev,
            firstHalfShiftStart,
            firstHalfShiftEnd,
            secondHalfShiftStart,
            secondHalfShiftEnd,
            halfDayWorkingHours: halfDay,
          }));
        });
    }
  }, [rowData, isOpen]);
  function isHalfDayLeave(timeIn: any, timeOut: any) {
    return (
      (timeIn == shiftValues.firstHalfShiftStart &&
        timeOut == shiftValues.firstHalfShiftEnd) ||
      (timeIn == shiftValues.secondHalfShiftStart &&
        timeOut == shiftValues.secondHalfShiftEnd)
    );
  }
  const editItem = (item: any) => {
    if (item.isLeave) {
      return;
    }
    setItem({ ...item });
    setValue('attendanceId', item.attendanceId);
    setValue(
      'timeIn',
      item.timeIn
        ? dayjs(moment(item.timeIn, 'LT').format('YYYY-MM-DD HH:mm:ss'))
        : null
    );
    setValue(
      'timeOut',
      item.timeOut
        ? dayjs(moment(item.timeOut, 'LT').format('YYYY-MM-DD HH:mm:ss'))
        : null
    );
    setValue(
      'lunchTimeIn',
      item.lunchTimeIn
        ? dayjs(moment(item.lunchTimeIn, 'LT').format('YYYY-MM-DD HH:mm:ss'))
        : null
    );
    setValue(
      'lunchTimeOut',
      item.lunchTimeOut
        ? dayjs(moment(item.lunchTimeOut, 'LT').format('YYYY-MM-DD HH:mm:ss'))
        : null
    );

    const isPresent = item.isPresent;
    const isLeave = item.isLeave;
    const isDayOff = item.isDayOff;
    let isHalfDay = item.isHalfDay;
    let status = 'PRESENT';

    // if (isHalfDay && isPresent) status = 'HALF-DAY';
    // else if (isHalfDay && isLeave) status = 'HALF-DAY-LEAVE';
    if (isPresent) status = 'PRESENT';
    else if (isLeave) status = 'LEAVE';
    else if (isDayOff) status = 'DAY-OFF';
    else status = 'ABSENT';
    setValue('status', status);

    clearErrors(['timeIn', 'timeOut', 'lunchTimeIn', 'lunchTimeOut']);
    setItemDialog(true);
  };
  const context = React.useContext(GlobalContainer);
  const sessionData = context?.userData;
  const getCompanyDetails = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['companyDetails'],
    queryFn: async () =>
      await axios(`/api/companies/${sessionData.companyId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }).then((response) => {
        return response.data;
      }),
  });

  useEffect(() => {
    if (item.isPresent) {
      setIsHideFields(false);
    } else {
      setIsHideFields(true);
    }
  }, [item]);

  const handleUpdate = async () => {
    toast.current?.replace({
      severity: 'info',
      summary: 'Submitting Request',
      // detail: 'Please wait...',
      sticky: true,
    });
    setForceResetSelectedRows(!forceResetSelectedRows);
    const response = await axios.patch(
      '/api/attendances',
      JSON.stringify(items),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      }
    );

    refetchDataFromParent();
    setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }));
    toast.current?.replace({
      severity: response.data.severity,
      summary: response.data.message,
      life: 5000,
    });
  };

  const handleEdit = async (data: Attendance) => {
    let _items = [...items];
    let _item = { ...data };
    const index = findIndexByGridId(data.attendanceId);
    let status = _item.status;
    let timeIn = data.timeIn ? dayjs(data.timeIn).toDate() : null;
    let timeOut = data.timeOut ? dayjs(data.timeOut).toDate() : null;
    let lunchTimeIn = data.lunchTimeIn
      ? dayjs(data.lunchTimeIn).toDate()
      : null;
    let lunchTimeOut = data.lunchTimeOut
      ? dayjs(data.lunchTimeOut).toDate()
      : null;

    const attendanceDate = _items[index].date;
    let isHalfDay = false;
    let isHalfDayIncomplete = false;
    let lateHrs = 0;
    let undertimeHours = 0;
    let creditableOvertime = 0;
    let employeeTimeIn = timeIn
      ? await dateTimeFormatter(attendanceDate, timeIn)
      : null;
    let employeeLunchOut = lunchTimeOut
      ? await dateTimeFormatter(attendanceDate, lunchTimeOut)
      : null;
    let employeeLunchIn = lunchTimeIn
      ? await dateTimeFormatter(attendanceDate, lunchTimeIn)
      : null;
    let employeeTimeOut = timeOut
      ? await dateTimeFormatter(attendanceDate, timeOut)
      : null;
    let nightDiffHours = 0;
    if (employeeTimeOut && employeeTimeIn) {
      const getShiftDetails = await getCurrentOrNewShiftDetails({
        employeeId: rowData.employeeId,
        attendanceDate: attendanceDate,
      });

      const shiftDetails = getShiftDetails.shift;
      // console.log(rowData);
      const departmentDetails = await getDepartmentDetails(
        rowData.departmentId
      );
      if (!departmentDetails.success) {
        toast.current?.replace({
          severity: 'error',
          summary: 'Error',
          detail: 'Department details not found.',
          sticky: true,
        });
        return;
      }
      const lunchOut = lunchTimeOut
        ? moment(employeeLunchOut).format('HH:mm:ss')
        : null;
      const lunchIn = lunchTimeIn
        ? moment(employeeLunchIn).format('HH:mm:ss')
        : null;
      nightDiffHours =
        getCompanyDetails.data.nightDifferential &&
        departmentDetails.department.applyNightDiff
          ? getNightDifferentialHours(
              attendanceDate,
              moment(employeeTimeIn).format('HH:mm:ss'),
              lunchOut,
              lunchIn,
              moment(employeeTimeOut).format('HH:mm:ss'),
              getCompanyDetails.data.nightDifferentialStartTime,
              getCompanyDetails.data.nightDifferentialEndTime,
              shiftDetails.timeIn
            )
          : 0;
      let errorCount = 0;
      if (employeeTimeOut < employeeTimeIn) {
        employeeTimeOut = moment(employeeTimeOut)
          .add('1', 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      }

      // Employee lunch details
      if (employeeLunchOut && !employeeLunchIn) {
        setError('lunchTimeIn', {
          type: 'required',
          message: 'Lunch-in must be filled in.',
        });
        errorCount++;
      }
      if (!employeeLunchOut && employeeLunchIn) {
        setError('lunchTimeOut', {
          type: 'required',
          message: 'Lunch-out must be filled in.',
        });
        errorCount++;
      }

      if (employeeLunchOut && employeeLunchIn) {
        if (employeeLunchOut < employeeTimeIn) {
          employeeLunchOut = moment(employeeLunchOut)
            .add('1', 'day')
            .format('YYYY-MM-DD HH:mm:ss');
        }
        if (employeeLunchIn < employeeLunchOut) {
          employeeLunchIn = moment(employeeLunchIn)
            .add('1', 'day')
            .format('YYYY-MM-DD HH:mm:ss');
        }

        if (
          employeeLunchOut < employeeTimeIn ||
          employeeLunchOut > employeeTimeOut
        ) {
          setError('lunchTimeOut', {
            type: 'required',
            message: 'Lunch should be between Time In/Out',
          });
          errorCount++;
        }

        if (
          employeeLunchIn > employeeTimeOut ||
          employeeLunchIn < employeeTimeIn
        ) {
          setError('lunchTimeIn', {
            type: 'required',
            message: 'Lunch should be between Time In/Out',
          });
          errorCount++;
        }

        if (
          employeeLunchIn < employeeLunchOut &&
          employeeTimeIn < employeeLunchOut &&
          employeeTimeOut > employeeLunchIn
        ) {
          setError('lunchTimeOut', {
            type: 'required',
            message: 'Invalid Time range',
          });
          setError('lunchTimeIn', {
            type: 'required',
            message: 'Invalid Time range',
          });
          errorCount++;
        }
      }
      if (errorCount > 0) {
        return;
      }

      const attendanceDateFormatted = new Date(attendanceDate);
      const shiftTimeIn = await dateTimeFormatter(
        attendanceDateFormatted,
        shiftDetails.timeIn
      );
      const shiftTimeOut = await dateTimeFormatter(
        attendanceDateFormatted,
        shiftDetails.timeOut
      );
      const shiftLunchIn = shiftDetails.lunchTimeIn
        ? await dateTimeFormatter(
            attendanceDateFormatted,
            shiftDetails.lunchTimeIn
          )
        : null;
      const shiftLunchOut = shiftDetails.lunchTimeOut
        ? await dateTimeFormatter(
            attendanceDateFormatted,
            shiftDetails.lunchTimeOut
          )
        : null;
      const computeAttendance: any = await computeUndertimeLateHours({
        employeeLogDetails: {
          date: attendanceDate,
          timeIn: timeIn,
          lunchTimeOut: lunchTimeOut,
          lunchTimeIn: lunchTimeIn,
          timeOut: timeOut,
        },
        shiftDetails: shiftDetails,
        attendanceValues: {
          employeeTimeIn: employeeTimeIn,
          employeeLunchOut: employeeLunchOut,
          employeeLunchIn: employeeLunchIn,
          employeeTimeOut: employeeTimeOut,
          shiftTimeIn: shiftTimeIn,
          shiftTimeOut: shiftTimeOut,
          shiftLunchStart: shiftLunchOut,
          shiftLunchEnd: shiftLunchIn,
          attendanceDate: new Date(attendanceDate),
        },
      });
      // console.log('computeAttendance!');
      // console.log(computeAttendance);
      // console.log(computeAttendance.data);
      if (computeAttendance.success) {
        isHalfDay = computeAttendance.data.isHalfDay;
        lateHrs = computeAttendance.data.lateHours;
        undertimeHours = computeAttendance.data.undertimeHours;
        creditableOvertime = computeAttendance.data.creditableOvertime;
        isHalfDayIncomplete = computeAttendance.data.isHalfDayIncomplete;
      }
    }
    if (isHalfDayIncomplete && isHalfDay) {
      isHalfDay = false;
      status = 'ABSENT';
    }
    _items[index].timeIn = timeIn ? moment(timeIn).format('HH:mm:ss') : null;
    _items[index].timeOut = timeOut ? moment(timeOut).format('HH:mm:ss') : null;
    _items[index].lunchTimeIn = lunchTimeIn
      ? moment(lunchTimeIn).format('HH:mm:ss')
      : null;
    _items[index].lunchTimeOut = lunchTimeOut
      ? moment(lunchTimeOut).format('HH:mm:ss')
      : null;
    _items[index].lateHours =
      status == 'LEAVE' || status == 'ABSENT' || status == 'DAY-OFF'
        ? 0
        : lateHrs;
    _items[index].undertimeHours =
      isHalfDay ||
      status == 'LEAVE' ||
      status == 'ABSENT' ||
      status == 'DAY-OFF'
        ? 0
        : undertimeHours;
    _items[index].isPresent = status == 'PRESENT' ? true : false;
    _items[index].isHalfDay = isHalfDay ? true : false;
    _items[index].isDayOff = status == 'DAY-OFF' ? true : false;
    _items[index].isLeave = status == 'LEAVE' ? true : false;
    _items[index].nightDiffHours = status === 'PRESENT' ? nightDiffHours : 0;
    _items[index].creditableOvertime =
      isHalfDay ||
      status == 'LEAVE' ||
      status == 'ABSENT' ||
      status == 'DAY-OFF'
        ? 0
        : creditableOvertime;
    setItems(_items);
    setItemDialog(false);
    setItem(emptyItem);
    reset();

    toast.current?.replace({
      severity: 'success',
      summary: 'Updates have been saved',
      closable: true,
      life: 5000,
    });
  };

  const findIndexByGridId = (gridId: any) => {
    let index = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].attendanceId === gridId) {
        index = i;
        break;
      }
    }

    return index;
  };

  return (
    <>
      <Toast ref={toast} position="bottom-left" />
      <Sidebar
        id="attendance-sidebar"
        closeOnEscape={true}
        dismissable={false}
        position="right"
        style={{
          width: '87%',
        }}
        visible={isOpen}
        onHide={() =>
          setSideBarConfig((prev: any) => ({ ...prev, isOpen: false }))
        }
      >
        {rowData && (
          <DashboardNav
            navTitle={`${rowData.employeeFullName} - ${rowData?.businessMonthCycle}`}
            buttons={[]}
            isShowSearch={false}
          />
        )}

        <DataTable
          value={
            items.length == 0
              ? [{ dummy: '' }, { dummy: '' }, { dummy: '' }]
              : items
          }
          frozenWidth="120rem"
          scrollable={true}
          tableStyle={{ minWidth: '120rem' }}
          size="small"
          scrollHeight="650px"
          selectionMode={action == 'edit' ? 'single' : undefined}
          onSelectionChange={(e: any) => {
            items.length > 0 && action == 'edit' && !e.value.isPosted
              ? editItem(e.value)
              : null;
          }}
          id="individual-attendance-datatable"
        >
          <Column
            field="date"
            header="Date"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : (
                <>
                  {moment(data.date).format('MM/DD (ddd)')}{' '}
                  {data.manualLoginAction ? (
                    <i className="pi pi-sign-in text-green-500 text-[13px]"></i>
                  ) : (
                    ''
                  )}
                </>
              );
            }}
          />
          <Column
            field="holidayType"
            header="Holiday Type"
            body={(data) => {
              const holiday = data.holiday;
              return items.length == 0 ? (
                <Skeleton />
              ) : holiday ? (
                holiday.holidayType
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="timeIn"
            header="Time-in"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : (data.isPresent ||
                  // if date is a half day leave
                  isHalfDayLeave(data.timeIn, data.timeOut)) &&
                moment(data.timeIn, 'HH:mm:ss').isValid() ? (
                moment(data.timeIn, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />

          <Column
            field="lunchTimeOut"
            header="Lunch-out"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : data.isPresent &&
                moment(data.lunchTimeOut, 'HH:mm:ss').isValid() ? (
                moment(data.lunchTimeOut, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="lunchTimeIn"
            header="Lunch-in"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : data.isPresent &&
                moment(data.lunchTimeIn, 'HH:mm:ss').isValid() ? (
                moment(data.lunchTimeIn, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="timeOut"
            header="Time-out"
            body={(data) => {
              return items.length == 0 ? (
                <Skeleton />
              ) : (data.isPresent ||
                  // if date is a half day leave
                  isHalfDayLeave(data.timeIn, data.timeOut)) &&
                moment(data.timeOut, 'HH:mm:ss').isValid() ? (
                moment(data.timeOut, 'HH:mm:ss').format('LT')
              ) : (
                '-'
              );
            }}
          />
          <Column
            field="overtimeHours"
            header="Creditable Overtime (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const overtimeHoursInMins =
                  Number(data.creditableOvertime) * 60;
                return convertMinsToHours({
                  minutes: overtimeHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          <Column
            field="overtimeHours"
            header="Approved Overtime (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const overtimeHoursInMins = Number(data.overtimeHours) * 60;
                return convertMinsToHours({
                  minutes: overtimeHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />

          <Column
            field="nightDiffHours"
            header="Night Differential (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const nightDiffHoursInMins = Number(data.nightDiffHours) * 60;
                return convertMinsToHours({
                  minutes: nightDiffHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          <Column
            field="lateHours"
            header="Late (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent || isHalfDayLeave(data.timeIn, data.timeOut)) {
                const lateHoursInMins = Number(data.lateHours) * 60;
                return convertMinsToHours({
                  minutes: lateHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          <Column
            field="undertimeHours"
            header="Undertime (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent || isHalfDayLeave(data.timeIn, data.timeOut)) {
                const undertimeHoursInMins = Number(data.undertimeHours) * 60;
                return convertMinsToHours({
                  minutes: undertimeHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          />
          {/* <Column
            field="nightDiffHours"
            header="Night Differential (hrs)"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              if (data.isPresent) {
                const nightDiffHoursInMins = Number(data.nightDiffHours) * 60;
                return convertMinsToHours({
                  minutes: nightDiffHoursInMins,
                  withUnit: true,
                });
              } else {
                return '-';
              }
            }}
          /> */}
          <Column
            field="isHalfDay"
            header="Half Day"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              return data.isHalfDay ? 'Yes' : 'No';
            }}
          />
          <Column
            field="status"
            header="Status"
            body={(data) => {
              if (items.length == 0) return <Skeleton />;
              const isPresent = data.isPresent;
              const isLeave = data.isLeave;
              const isDayOff = data.isDayOff;
              const isHalfDay = data.isHalfDay;
              let status = 'PRESENT';
              if (
                data.date > moment().format('YYYY-MM-DD') &&
                data.manualLoginAction != null &&
                data.isPresent == false
              ) {
                status = '';
              } else {
                if (isPresent) status = 'PRESENT';
                else if (isLeave) status = 'LEAVE';
                else if (isDayOff) status = 'DAY-OFF';
                else status = 'ABSENT';
              }
              return status;
            }}
          />
          <Column field="remarks" header="Remarks" style={{ width: '10rem' }} />
          <Column
            field="actions"
            header="Actions"
            body={actionTemplate}
            hidden={action == 'view' || rowData.isPosted}
          />
        </DataTable>

        <div className="mt-10 w-full flex justify-end">
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
          {action == 'edit' && !rowData.isPosted && (
            <Button
              label="Update"
              className="rounded-full px-10 p-button"
              onClick={handleUpdate}
            />
          )}
        </div>
      </Sidebar>

      <Dialog
        visible={itemDialog}
        style={{ width: '35rem' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header="Details"
        modal
        className="p-fluid"
        onHide={() => setItemDialog(false)}
        id="edit-attendance-dialog"
      >
        <form>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="field mb-2">
              <label htmlFor="date" className="font-bold">
                Date
              </label>
              <InputText
                value={moment(item.date).format('MM/DD/YYYY')}
                disabled
              />
            </div>

            <div className="field mb-2">
              <label htmlFor="holidayType" className="font-bold">
                Holiday Type
              </label>
              <InputText
                value={item.holiday ? item.holiday.holidayType : '-'}
                disabled
              />
            </div>

            {!isHideFields && (
              <>
                <div className="field mb-2">
                  <label htmlFor="name" className="font-bold">
                    <span className="text-red-500">*</span>
                    Time-in
                  </label>

                  <Controller
                    name="timeIn"
                    control={control}
                    rules={{
                      required: 'Time-in field is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <TimePicker
                        className="p-inputtext p-component"
                        use12Hours
                        id={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        format="hh:mm A"
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        value={field.value}
                      ></TimePicker>
                    )}
                  />
                  {errors.timeIn && (
                    <span className="text-red-600 text-sm">
                      {errors.timeIn.message}
                    </span>
                  )}
                </div>

                <div className="field mb-2">
                  <label htmlFor="name" className="font-bold">
                    <span className="text-red-500">*</span>
                    Time-out
                  </label>

                  <Controller
                    name="timeOut"
                    control={control}
                    rules={{
                      required: 'Time-out field is required.',
                    }}
                    render={({ field, fieldState }) => (
                      <TimePicker
                        className="p-inputtext p-component"
                        use12Hours
                        id={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        format="hh:mm A"
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        value={field.value}
                      ></TimePicker>
                    )}
                  />
                  {errors.timeOut && (
                    <span className="text-red-600 text-sm">
                      {errors.timeOut.message}
                    </span>
                  )}
                </div>

                <div className="field mb-2" id="lunch-out-picker">
                  <label htmlFor="name" className="font-bold">
                    Lunch-out
                  </label>

                  <Controller
                    name="lunchTimeOut"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TimePicker
                        className="p-inputtext p-component"
                        use12Hours
                        id={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        format="hh:mm A"
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        value={field.value}
                      ></TimePicker>
                    )}
                  />
                  {errors.lunchTimeOut && (
                    <span className="text-red-600 text-sm">
                      {errors.lunchTimeOut.message}
                    </span>
                  )}
                </div>
                <div className="field mb-2" id="lunch-in-picker">
                  <label htmlFor="name" className="font-bold">
                    Lunch-in
                  </label>

                  <Controller
                    name="lunchTimeIn"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TimePicker
                        className="p-inputtext p-component"
                        use12Hours
                        id={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        format="hh:mm A"
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        value={field.value}
                      ></TimePicker>
                    )}
                  />
                  {errors.lunchTimeIn && (
                    <span className="text-red-600 text-sm">
                      {errors.lunchTimeIn.message}
                    </span>
                  )}
                </div>
              </>
            )}
            <div className="w-full card flex justify-content-center flex-col flex-auto mb-5">
              <label className="font-bold">
                <span className="text-red-500">*</span>
                <span>Status</span>
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState }) => (
                  <Dropdown
                    value={field.value}
                    options={[
                      { name: 'PRESENT', value: 'PRESENT' },
                      { name: 'DAY-OFF', value: 'DAY-OFF' },
                      // { name: 'LEAVE', value: 'LEAVE' },
                      { name: 'ABSENT', value: 'ABSENT' },
                    ]}
                    optionLabel={'name'}
                    onChange={(e) => {
                      if (e.value == 'PRESENT') {
                        setIsHideFields(false);
                      } else {
                        setIsHideFields(true);
                      }

                      field.onChange(e.value);
                    }}
                    required
                    className="w-full md:w-14rem"
                    id="status-dropdown"
                  />
                )}
              />
              {errors.status && (
                <span className="text-red-600">{errors.status.message}</span>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end my-5">
            <Button
              type="button"
              severity="secondary"
              text
              label="Cancel"
              className="rounded-full px-10"
              onClick={() => setItemDialog(false)}
            />
            <Button
              id="edit-attendance-submit-button"
              onClick={handleSubmit(handleEdit)}
              label={'Save'}
              className="rounded-full px-10 p-button"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Dialog>
    </>
  );

  function actionTemplate(rowData: any) {
    if (items.length == 0) return <Skeleton />;
    return (
      <div className="flex flex-nowrap gap-2">
        {!rowData.isLeave && (
          <Button
            id="individual-attendance-edit-button"
            type="button"
            text
            severity="secondary"
            icon="pi pi-file-edit"
            tooltip="Edit"
            tooltipOptions={{ position: 'top' }}
            onClick={() => editItem(rowData)}
          />
        )}
      </div>
    );
  }
};

export default AttendanceSidebar;
