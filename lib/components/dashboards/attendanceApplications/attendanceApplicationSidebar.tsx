import { parseTimeStringToDate } from '@utils/dashboardFunction';
import axios from 'axios';
import classNames from 'classnames';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Sidebar } from 'primereact/sidebar';
import { Toast } from 'primereact/toast';
// import moment from 'moment-timezone';
import React, { useContext, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { TimePicker, type TimePickerProps } from 'antd';
import moment from '@constant/momentTZ';
import { properCasing } from '@utils/helper';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { GlobalContainer } from 'lib/context/globalContext';
import { Tooltip } from 'primereact/tooltip';

interface FormTypeProps {
  employeeName: string;
  requestedDate: null;
  fromDate: null;
  toDate: null;
  type: {
    name: string;
  };

  reason: string;
}
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
function AttendanceApplicationSidebar({
  configuration: { isOpen, setIsOpen },
  label: { buttonText, title },
  register,
  watch,
  reset,
  handleSubmit,
  errors,
  setValue,
  control,
  attendanceId,
  refetch,
  time,
  setRequestedDate,
  requestedDate,
  setTime,
  toast,
  defaultTimeFrom,
  defaultTimeTo,

  data,
}: {
  configuration: Configuration;
  label: Label;
  register: UseFormRegister<FormTypeProps>;
  watch: UseFormWatch<FormTypeProps>;
  reset: UseFormReset<FormTypeProps>;
  handleSubmit: UseFormHandleSubmit<FormTypeProps>;
  errors: FieldErrors<FormTypeProps>;
  setValue: UseFormSetValue<FormTypeProps>;
  control: Control<FormTypeProps>;
  attendanceId: number;
  refetch: any;
  requestedDate: any;
  setRequestedDate: any;
  data: any;
  defaultTimeFrom: any;
  defaultTimeTo: any;
  time: {
    fromTime: any;
    toTime: any;
  };

  setTime: React.Dispatch<
    React.SetStateAction<{
      fromTime: null;
      toTime: null;
    }>
  >;
  toast: React.RefObject<Toast>;
}) {
  const [isButtonLabelChange, setIsButtonLabelChange] = useState(false);
  const holidayError = useRef<{
    holidays: { holidayDate: string; holidayName: string }[];
    message: string;
  }>({
    holidays: [],
    message: '',
  });
  const [visible, setVisible] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [forceRefresher, setForceRefresher] = useState(false);
  const context = useContext(GlobalContainer);
  // useEffect(() => {
  //   if (watch('type.name') !== 'Overtime') {
  //     setValue('requestedDate', requestedDate);
  //   }
  // }, [watch('type.name')]);
  useEffect(() => {
    if (context?.authRole === 'EMPLOYEE') {
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
    }
  }, []);
  useEffect(() => {
    if (data && data.employee) {
      setUserData(data.employee);
    }
  }, [data]);

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
  const [timeFromError, setTimeFromError] = useState('');
  const [timeToError, setTimeToError] = useState('');
  useEffect(() => {
    setForceRefresher(!forceRefresher);
    clearDaysOffData();
    if (userData !== null) {
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

      userData.daysOff.forEach((day: string) => {
        // set days to true on map which is to be used for validation to check if the days off fall witihin date from - date to range
        daysOffMap.current[`${day}`] = true;

        // map to daysOffNumberArray which is a list of days to be disabled on date from to date to
        daysOffNumberArray.current.push(daytoNumberMap[`${day}`]);
      });
    }
  }, [userData]);
  const OtLimits = useRef<any>({
    timeIn: null,
    timeOut: null,
  });
  return (
    <Sidebar
      position="right"
      className="p-sidebar-md"
      visible={isOpen}
      onHide={() => {
        setIsOpen(false);

        reset();
      }}
    >
      <React.Fragment>
        <h1 className="text-black font-medium text-3xl">{title}</h1>
        <h3 className="font-medium mt-5 mb-2">Basic Details</h3>
        {(watch().type?.name === 'Sick Leave' ||
          watch().type?.name === 'Vacation Leave') && (
          <div className=" text-sm">
            Half-Day Leave Calculation
            <span className="mx-1">
              <Tooltip target=".computation-info" position="left" />
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
      </React.Fragment>

      <form
        className="w-full overflow-auto gap-3 flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();

          handleSubmit((data) => {
            updateAttendanceApplication(data);
          })();
        }}
      >
        <div className="col-span-2 w-full card flex justify-content-center flex-col text-[12px] flex-auto">
          <label className="my-1">
            <span>Employee Name</span>
          </label>
          <InputText
            className={classNames('w-full md:w-14rem')}
            placeholder="Employee Name"
            disabled
            {...register('employeeName')}
          />
        </div>
        <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
          <label>
            {watch('type.name') == 'Overtime'
              ? 'Date Overtime'
              : 'Requested Date'}
          </label>
          {watch('type.name') !== 'Overtime' ? (
            <Controller
              name="requestedDate"
              control={control}
              rules={{ required: 'Requested Date is Required' }}
              render={({ field, fieldState }) => (
                <Calendar
                  disabled={true}
                  inputId={field.name}
                  showIcon
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="Requested Date"
                  className={classNames({
                    'p-invalid': fieldState.invalid,
                  })}
                  dateFormat="mm/dd/yy"
                />
              )}
            />
          ) : (
            <Controller
              name="requestedDate"
              control={control}
              rules={{ required: 'Requested Date is Required' }}
              render={({ field, fieldState }) => (
                <Calendar
                  disabled={
                    title === 'View Attendance Application' ? true : false
                  }
                  inputId={field.name}
                  showIcon
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  maxDate={new Date()}
                  onChange={field.onChange}
                  placeholder="Requested Date"
                  className={classNames({
                    'p-invalid': fieldState.invalid,
                  })}
                  dateFormat="mm/dd/yy"
                />
              )}
            />
          )}

          {errors.requestedDate && (
            <span className="text-red-500">
              {errors?.requestedDate?.message}
            </span>
          )}
        </div>

        <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
          <label className="mb-1">Application Type</label>
          <Dropdown
            value={watch('type')}
            options={
              watch('type.name') === 'Overtime'
                ? [{ name: 'Overtime' }]
                : [
                    { name: 'Vacation Leave' },
                    { name: 'Sick Leave' },
                    { name: 'Solo Parent Leave' },
                    { name: 'Paternity Leave' },
                    { name: 'Maternity Leave' },
                    { name: 'Service Incentive Leave' },
                    // { name: 'Overtime' },
                    { name: 'Others' },
                  ]
            }
            optionLabel={'name'}
            placeholder="Application Type"
            className="w-full"
            onChange={(e) => {
              if (e.value.name !== 'Overtime') {
                setValue('requestedDate', requestedDate);
              }
              if (e.value.name === 'Overtime') {
                let toTime: any = new Date();
                let fromTime: any = new Date();
                // const [ttHours, ttMinutes, ttSeconds] = data.timeTo
                //   .split(':')
                //   .map(Number);
                // const [tfHours, tfMinutes, tfSeconds] = data.timeFrom
                //   .split(':')
                //   .map(Number);

                // toTime.setHours(ttHours);
                // toTime.setMinutes(ttMinutes);
                // toTime.setSeconds(ttSeconds);

                // fromTime.setHours(tfHours);
                // fromTime.setMinutes(tfMinutes);
                // fromTime.setSeconds(tfSeconds);

                setTime((prev: any) => ({
                  ...prev,
                  fromTime: '',
                  toTime: '',
                }));

                // setTime((prev: any) => ({
                //   ...prev,
                //   ToTime: dayjs(defaultTimeTo),
                // }));
              } else {
                setTime((prev: any) => ({
                  ...prev,
                  fromTime: defaultTimeFrom,
                  toTime: defaultTimeTo,
                }));
              }
              setTimeFromError('');
              setTimeToError('');
              setValue('type', e.value);
            }}
            disabled={
              title === 'View Attendance Application' ||
              watch('type.name') === 'Overtime'
                ? true
                : false
            }
            // {...register('type.name')}
          />
        </div>

        {watch('type.name') !== 'Overtime' && (
          <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
            <label>From Date</label>
            <Controller
              name="fromDate"
              control={control}
              rules={{ required: 'From Date is Required' }}
              render={({ field, fieldState }) => (
                <Calendar
                  disabled={
                    title === 'View Attendance Application' ? true : false
                  }
                  inputId={field.name}
                  // minDate={new Date()}
                  showIcon
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="From Date"
                  className={classNames({
                    'p-invalid': fieldState.invalid,
                  })}
                  dateFormat="yy-mm-dd"
                />
              )}
            />
            {errors.fromDate && (
              <span className="text-red-500">{errors?.fromDate?.message}</span>
            )}
          </div>
        )}

        {watch('type.name') !== 'Overtime' && (
          <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
            <label>To Date</label>
            <Controller
              name="toDate"
              control={control}
              rules={{ required: 'To Date is Required' }}
              render={({ field, fieldState }) => (
                <Calendar
                  // minDate={new Date()}
                  disabled={
                    title === 'View Attendance Application' ? true : false
                  }
                  inputId={field.name}
                  showIcon
                  id={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="To Date"
                  className={classNames({
                    'p-invalid': fieldState.invalid,
                  })}
                  dateFormat="yy-mm-dd"
                />
              )}
            />
            {errors.toDate && (
              <span className="text-red-500">{errors?.toDate?.message}</span>
            )}
          </div>
        )}

        {(watch('type.name') === 'Overtime' ||
          watch('type.name') === 'Vacation Leave' ||
          watch('type.name') === 'Sick Leave') && (
          <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
            <label>Time From</label>
            <TimePicker
              allowClear={false}
              disabled={title === 'View Attendance Application' ? true : false}
              className="p-inputtext p-component"
              use12Hours
              format="hh:mm A"
              onChange={(e) => {
                if (!e) {
                  setTime((prev: any) => ({
                    ...prev,
                    fromTime: null,
                  }));
                  return;
                }
                const value = new Date(e.toString());
                if (watch('type.name') === 'Overtime') {
                  const timeIn = OtLimits.current.timeIn;
                  const timeOut = OtLimits.current.timeOut;

                  if (value && String(value) == String(timeOut)) {
                    setTimeFromError('');
                    setTime((prev: any) => ({
                      ...prev,
                      fromTime: dayjs(value),
                    }));
                    return;
                  }
                  // dayshift

                  if (timeIn < timeOut) {
                    if (value && time.fromTime === timeOut && value < timeOut) {
                      setTimeFromError('Chosen time was automatically changed');
                      setTime((prev: any) => ({
                        ...prev,
                        fromTime: dayjs(timeIn),
                      }));
                    } else if (value && value > timeIn && value < timeOut) {
                      setTimeFromError('Chosen time was automatically changed');
                      setTime((prev: any) => ({
                        ...prev,
                        fromTime: dayjs(timeOut),
                      }));
                    } else {
                      setTimeFromError('');
                      setTime((prev: any) => ({
                        ...prev,
                        fromTime: dayjs(value),
                      }));
                    }
                  }
                  // night shift
                  else if (timeIn > timeOut) {
                    if (value && time.fromTime === timeOut && value < timeOut) {
                      setTimeFromError('Chosen time was automatically changed');
                      setTime((prev: any) => ({
                        ...prev,
                        fromTime: dayjs(timeIn),
                      }));
                    } else if (value && (value > timeIn || value < timeOut)) {
                      setTimeFromError('Chosen time was automatically changed');
                      setTime((prev: any) => ({
                        ...prev,
                        fromTime: dayjs(timeOut),
                      }));
                    } else {
                      setTimeFromError('');
                      setTime((prev: any) => ({
                        ...prev,
                        fromTime: dayjs(value),
                      }));
                    }
                  } else {
                    setTimeFromError('');
                    setTime((prev: any) => ({
                      ...prev,
                      fromTime: dayjs(value),
                    }));
                  }
                } else {
                  setTimeFromError('');
                  setTime((prev: any) => ({
                    ...prev,
                    fromTime: dayjs(value),
                  }));
                }
              }}
              value={time.fromTime}
            ></TimePicker>

            {/* <Controller
              name="timeFrom"
              control={control}
              rules={{ required: 'Time from  is required.' }}
              render={({ field, fieldState }) => (
                
                // <Calendar
                //   disabled={
                //     title === 'View Attendance Application' ? true : false
                //   }
                //   inputId={field.name}
                //   showTime
                //   hourFormat="12"
                //   timeOnly
                //   id={field.name}
                //   ref={field.ref}
                //   value={field.value}
                //   onBlur={field.onBlur}
                //   onChange={(e) => {
                //     if (watch('type.name') === 'Overtime') {
                //       const timeIn = OtLimits.current.timeIn;
                //       const timeOut = OtLimits.current.timeOut;
                //       // dayshift
                //       console.log(timeIn);
                //       if (timeIn < timeOut) {
                //         if (
                //           e.value &&
                //           String(watch('timeFrom')) === String(timeOut) &&
                //           e.value < timeOut
                //         ) {
                //           setTimeFromError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeFrom', timeIn);
                //           return;
                //         } else if (
                //           e.value &&
                //           e.value > timeIn &&
                //           e.value < timeOut
                //         ) {
                //           setTimeFromError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeFrom', timeOut);
                //           return;
                //           // return;
                //         }
                //       }
                //       // night shift
                //       else if (timeIn > timeOut) {
                //         if (
                //           e.value &&
                //           String(watch('timeFrom')) === String(timeOut) &&
                //           e.value < timeOut
                //         ) {
                //           setTimeFromError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeFrom', timeIn);
                //           return;
                //         } else if (
                //           e.value &&
                //           (e.value < timeOut || e.value > timeIn)
                //         ) {
                //           setTimeFromError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeFrom', timeOut);
                //           return;
                //         }
                //       }
                //     }
                //     setTimeFromError('');
                //     setValue('timeFrom', e.value as any);
                //   }}
                //   placeholder="Select Time from"
                //   className={classNames({
                //     'p-invalid': fieldState.invalid,
                //   })}
                //   dateFormat="yy-mm-dd"
                // />
              )} */}
            {/* /> */}
            <span className="text-grey-600">{timeFromError}</span>
          </div>
        )}

        {(watch('type.name') === 'Overtime' ||
          watch('type.name') === 'Vacation Leave' ||
          watch('type.name') === 'Sick Leave') && (
          <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
            <label>Time To</label>
            <TimePicker
              allowClear={false}
              disabled={title === 'View Attendance Application' ? true : false}
              className="p-inputtext p-component"
              use12Hours
              format="hh:mm A"
              onChange={(e) => {
                if (!e) {
                  setTime((prev: any) => ({
                    ...prev,
                    toTime: null,
                  }));
                  return;
                }
                const value = new Date(e.toString());
                if (watch('type.name') === 'Overtime') {
                  const timeIn = OtLimits.current.timeIn;
                  const timeOut = OtLimits.current.timeOut;

                  // Create a new Date object with the selected time

                  if (value && String(value) == String(timeOut)) {
                    setTimeToError('');
                    setTime((prev: any) => ({
                      ...prev,
                      toTime: dayjs(value),
                    }));
                    return;
                  }
                  if (timeIn < timeOut) {
                    // if (value && time.toTime === timeOut && value < timeOut) {
                    //   setTimeToError('Chosen time was automatically changed');
                    //   setTime((prev: any) => ({
                    //     ...prev,
                    //     toTime: dayjs(timeIn),
                    //   }));
                    // } else
                    if (value && value > timeIn && value < timeOut) {
                      setTimeToError('Chosen time was automatically changed');
                      setTime((prev: any) => ({
                        ...prev,
                        toTime: dayjs(timeOut),
                      }));
                    } else {
                      setTimeToError('');
                      setTime((prev: any) => ({
                        ...prev,
                        toTime: dayjs(value),
                      }));
                    }
                  }
                  // night shift
                  else if (timeIn > timeOut) {
                    // if (value && time.toTime === timeOut && value < timeOut) {
                    //   setTimeToError('Chosen time was automatically changed');
                    //   setTime((prev: any) => ({
                    //     ...prev,
                    //     toTime: dayjs(timeIn),
                    //   }));
                    // } else
                    if (value && (value > timeIn || value < timeOut)) {
                      setTimeToError('Chosen time was automatically changed');
                      setTime((prev: any) => ({
                        ...prev,
                        toTime: dayjs(timeOut),
                      }));
                    } else {
                      setTimeToError('');
                      setTime((prev: any) => ({
                        ...prev,
                        toTime: dayjs(value),
                      }));
                    }
                  } else {
                    setTimeToError('');
                    setTime((prev: any) => ({
                      ...prev,
                      toTime: dayjs(value),
                    }));
                  }
                } else {
                  setTimeToError('');
                  setTime((prev: any) => ({
                    ...prev,
                    toTime: dayjs(value),
                  }));
                }
              }}
              value={time.toTime}
            ></TimePicker>
            {/* <Calendar
            {/* <Controller
              name="timeTo"
              control={control}
              rules={{ required: 'Time from  is required.' }}
              render={({ field, fieldState }) => (
                
                // <Calendar
                //   disabled={
                //     title === 'View Attendance Application' ? true : false
                //   }
                //   inputId={field.name}
                //   showTime
                //   hourFormat="12"
                //   timeOnly
                //   id={field.name}
                //   ref={field.ref}
                //   value={field.value}
                //   onBlur={field.onBlur}
                //   onChange={(e) => {
                //     if (watch('type.name') === 'Overtime') {
                //       const timeIn = OtLimits.current.timeIn;
                //       const timeOut = OtLimits.current.timeOut;
                //       // dayshift

                //       if (timeIn < timeOut) {
                //         if (
                //           e.value &&
                //           String(watch('timeTo')) == String(timeOut) &&
                //           e.value < timeOut
                //         ) {
                //           setTimeToError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeTo', timeIn);
                //           return;
                //         } else if (
                //           e.value &&
                //           e.value > timeIn &&
                //           e.value < timeOut
                //         ) {
                //           setTimeToError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeTo', timeOut);
                //           return;
                //         }
                //       }
                //       // night shift
                //       else if (timeIn > timeOut) {
                //         if (
                //           e.value &&
                //           String(watch('timeTo')) === String(timeOut) &&
                //           e.value < timeOut
                //         ) {
                //           setTimeToError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeTo', timeIn);
                //           return;
                //         } else if (
                //           e.value &&
                //           (e.value < timeOut || e.value > timeIn)
                //         ) {
                //           setTimeToError(
                //             'Chosen time was automatically changed'
                //           );
                //           setValue('timeTo', timeOut);
                //           return;
                //         }
                //       }
                //     }
                //     setTimeToError('');
                //     setValue('timeTo', e.value as any);
                //   }}
                //   placeholder="Select Time to"
                //   className={classNames({
                //     'p-invalid': fieldState.invalid,
                //   })}
                //   dateFormat="yy-mm-dd"
                // />
              )}
            /> */}
            <span className="text-grey-600">{timeToError}</span>
          </div>
        )}

        <div className="card flex justify-content-center flex-col text-[12px] flex-auto">
          <label className="mb-1">Reason</label>
          <InputTextarea
            autoResize
            rows={5}
            cols={30}
            placeholder="Reason"
            disabled={title === 'View Attendance Application' ? true : false}
            {...register('reason')}
          />
          {errors.reason && (
            <span className="text-red-500">{errors.reason?.message}</span>
          )}
        </div>

        <div className="mt-2 w-full flex flex-nowrap justify-center items-center gap-2">
          <Button
            rounded
            className="w-full"
            severity="secondary"
            text
            label="Cancel"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
          />

          {title !== 'View Attendance Application' ? (
            <Button
              rounded
              className="w-full bg-primaryDefault"
              disabled={isButtonLabelChange}
              label={isButtonLabelChange ? 'Saving...' : buttonText}
              type="submit"
            />
          ) : null}
        </div>
      </form>
      <div className="card flex justify-content-center">
        {/* <Button
          label="Show"
          icon="pi pi-external-link"
          onClick={() => setVisible(true)}
        /> */}
        <Dialog
          header={holidayError.current.message}
          visible={visible}
          maximizable
          style={{ width: '40vw', minHeight: '10vw' }}
          onHide={() => setVisible(false)}
        >
          <ul className="m-0 py-5">
            {holidayError.current.holidays.map((item: any, index: number) => {
              let holidayString = ` ${properCasing(item.holidayName)} (${moment(
                item.holidayDate
              ).format('MM/DD/YYYY')})`;
              // if (index < holidayError.current.holidays.length - 1) {
              //   holidayString += ',';
              // }
              return (
                <li className=" text-red-600" key={index}>
                  {holidayString}
                </li>
              );
            })}
          </ul>
        </Dialog>
      </div>
    </Sidebar>
  );

  function updateAttendanceApplication(data2: FormTypeProps) {
    const fromDate = watch('fromDate');
    const toDate = watch('toDate');

    let timeFromFormatted = new Date(time.fromTime);
    let timeToFormatted = new Date(time.toTime);
    let timeInLimit = new Date(OtLimits.current.timeIn);
    let timeOutLimit = new Date(OtLimits.current.timeOut);
    // console.log(time.toTime);
    if (
      watch('type.name') === 'Overtime' &&
      (time.toTime == null ||
        time.fromTime == null ||
        time.toTime == '' ||
        time.fromTime == '')
    ) {
      return (function () {
        toast.current?.replace({
          severity: 'error',
          summary: 'Time From and Time To is required for Overtime',
          life: 3000,
        });
      })();
    }

    if (timeOutLimit < timeInLimit) {
      timeOutLimit.setDate(timeOutLimit.getDate() + 1);
    }
    if (timeToFormatted < timeFromFormatted) {
      timeToFormatted.setDate(timeToFormatted.getDate() + 1);
    }
    if (timeInLimit < timeFromFormatted) {
      timeInLimit.setDate(timeInLimit.getDate() + 1);
    }
    if (timeOutLimit < timeFromFormatted) {
      timeOutLimit.setDate(timeOutLimit.getDate() + 1);
    }
    let errorCount = 0;

    // console.log(OtLimits.current.timeIn);
    // console.log(OtLimits.current.timeOut);
    // console.log('tf:' + timeFromFormatted);
    // console.log('tt:' + timeToFormatted);
    // console.log('til:' + timeInLimit);
    // console.log('tol:' + timeOutLimit);
    // // validation check if limits fall in between the chosen time from and  time to
    // console.log(timeInLimit >= timeFromFormatted);
    // console.log(timeInLimit <= timeToFormatted);
    // console.log(timeOutLimit >= timeFromFormatted);

    // console.log(
    //   new Date(String(timeOutLimit)) <= new Date(String(timeToFormatted))
    // );

    if (
      timeInLimit >= timeFromFormatted &&
      timeInLimit <= timeToFormatted &&
      timeOutLimit >= timeFromFormatted &&
      new Date(String(timeOutLimit)) <= new Date(String(timeToFormatted))
    ) {
      errorCount++;
    }

    //specific condition
    if (
      timeOutLimit.getDate() < timeInLimit.getDate() &&
      timeToFormatted < timeFromFormatted
    ) {
      if (
        (timeFromFormatted >= timeOutLimit &&
          timeFromFormatted <= timeInLimit) ||
        (timeToFormatted >= timeOutLimit && timeToFormatted <= timeInLimit)
      ) {
        errorCount++;
      }
    }

    // if (timeOutLimit >= timeFromFormatted && timeOutLimit <= timeToFormatted) {
    //   errorCount++;
    // }
    if (watch('type.name') === 'Overtime' && errorCount > 0) {
      return (function () {
        toast.current?.replace({
          severity: 'error',
          summary: 'Time From and Time To falls within shift hours',
          life: 3000,
        });
      })();
    }

    if (watch('type.name') !== 'Overtime' && fromDate && toDate) {
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

    let config = {
      method: 'patch',
      maxBodyLength: Infinity,
      url: `/api/attendanceApplication/attendanceSchedule?attendanceApplicationId=${attendanceId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
      },
      data: JSON.stringify({
        requestedDate: moment(data2.requestedDate).format('YYYY-MM-DD'),
        type: data2.type.name,
        fromDate: moment(
          data2.type.name == 'Overtime' ? data2.requestedDate : data2.fromDate
        ).format('YYYY-MM-DD'),
        toDate: moment(
          data2.type.name == 'Overtime' ? data2.requestedDate : data2.toDate
        ).format('YYYY-MM-DD'),
        reason: data2.reason,
        timeFrom: time.fromTime ? time.fromTime.format('HH:mm:ss') : '00:00:00',
        timeTo: time.toTime ? time.toTime.format('HH:mm:ss') : '00:00:00',
      }),
    };

    axios
      .request(config)
      .then((res) => {
        if (!res.data.success) {
          // chosen time beyond shifts error

          if (res.data.holidays && res.data.holidays.length > 0) {
            holidayError.current.holidays = res.data.holidays;
            holidayError.current.message = res.data.message;
            setVisible(true);
            toast.current?.clear();
          } else {
            toast.current?.replace({
              severity: res.data.success ? 'success' : 'error',
              detail: res.data.details ?? undefined,
              summary: res.data.message,
              life: res.data.life ?? 3000,
              closable: true,
            });
            setIsButtonLabelChange(false);
            return;
          }
          toast.current?.clear();
          setIsButtonLabelChange(false);
          return;
        } else if (res.data.success) {
          refetch();
          setIsOpen(false);
        }
        setIsButtonLabelChange(false);
        toast.current?.replace({
          severity: res.data.success ? 'success' : 'error',
          detail: res.data.details ?? undefined,
          summary: res.data.message,
          life: res.data.life ?? 3000,
          closable: true,
        });
      })
      .catch((error) => {
        // console.log(error);
        toast.current?.replace({
          severity: error.success ? 'success' : 'error',
          detail: error.details ?? undefined,
          summary: error.message,
          life: 3000,
          closable: true,
        });
        if (error.success) {
        } else {
          (function () {
            toast.current?.replace({
              severity: 'error',
              summary: 'Error Occured',
              life: 3000,
            });
          })();
        }

        refetch();
        setIsButtonLabelChange(false);
      });
  }
}

export default AttendanceApplicationSidebar;
