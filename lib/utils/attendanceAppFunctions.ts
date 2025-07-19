import {
  Attendance,
  AttendanceApplication,
  ChangedSchedule,
  EmployeeLeave,
} from 'db/models';
import {
  computeUndertimeLateHours,
  getCurrentOrNewShiftDetails,
} from './companyDetailsGetter';
import { Op, QueryTypes } from 'sequelize';
import moment from '@constant/momentTZ';
import activityLog from 'db/models/activityLog';
import { dateTimeFormatter } from './attendance';
import { executeQuery } from 'db/connection';

export const updateAttendanceApp = async ({
  action,
  employee,
  dateOvertime,
  employeeId,
  fromDate,
  toDate,
  numberOfDays,
  reason,
  timeFrom,
  timeTo,
  type,
  numberOfHours,
  attendanceAppId,
  companyId,
  seshData,
}: {
  action: any;
  employee: any;
  dateOvertime: any;
  employeeId: any;
  fromDate: any;
  toDate: any;
  numberOfDays: any;
  reason: any;
  timeFrom: any;
  timeTo: any;
  type: any;
  numberOfHours: any;
  attendanceAppId: any;
  companyId: number;
  seshData: any;
}) => {
  if (action == 'APPROVE') {
    const {
      employee_leave: {
        vacationLeaveUsed,
        vacationLeaveCredits,
        sickLeaveUsed,
        sickLeaveCredits,
        soloParentLeavesUsed,
        soloParentLeaveCredits,
        paternityLeavesUsed,
        paternityLeaveCredits,
        maternityLeavesUsed,
        maternityLeaveCredits,
        serviceIncentiveLeaveUsed,
        serviceIncentiveLeaveCredits,
        otherLeavesUsed,
        otherLeaveCredits,
        emergencyLeavesUsed,
        emergencyLeaveCredits,
        birthdayLeavesUsed,
        birthdayLeaveCredits,
      },
    } = employee;

    let { shift } = employee;

    const getShiftDetails = await getCurrentOrNewShiftDetails({
      employeeId: employeeId,
      attendanceDate: fromDate,
    });

    if (getShiftDetails.success) {
      shift = getShiftDetails.shift;
    }

    const checkAttendanceResult: any = await executeQuery(
      `attendance_application_bulk_get_check_attendance`,
      { employeeId, fromDate, toDate, dateOvertime }
    );
    const checkAttendance =
      checkAttendanceResult.length > 0 ? checkAttendanceResult[0] : null;

    if (checkAttendance && checkAttendance.isPosted) {
      return {
        severity: 'error',
        summary:
          'Not allowed to approve OT/Leave applications with dates that coincide with already posted attendance',
      };
    }

    if (
      checkAttendance &&
      type === 'Overtime' &&
      (checkAttendance.isPresent == 0 ||
        checkAttendance.isDayOff == 1 ||
        checkAttendance.isLeave == 1)
    ) {
      return {
        severity: 'error',
        summary: `${checkAttendance.businessMonth} - ${checkAttendance.cycle} - ${dateOvertime}'s status must be PRESENT to approve this application`,
      };
    }

    if (type.includes('Leave') || type == 'Official Business') {
      if (type === 'Vacation Leave') {
        if (numberOfDays + vacationLeaveUsed > vacationLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );
        ``
      } else if (type === 'Sick Leave') {
        if (numberOfDays + sickLeaveUsed > sickLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Solo Parent Leave') {
        if (numberOfDays + soloParentLeavesUsed > soloParentLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Paternity Leave') {
        if (numberOfDays + paternityLeavesUsed > paternityLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Maternity Leave') {
        if (numberOfDays + maternityLeavesUsed > maternityLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Service Incentive Leave') {
        if (
          numberOfDays + serviceIncentiveLeaveUsed >
          serviceIncentiveLeaveCredits
        ) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Others') {
        if (numberOfDays + otherLeavesUsed > otherLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Emergency Leave') {
        if (numberOfDays + emergencyLeavesUsed > emergencyLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      } else if (type === 'Birthday Leave') {
        if (numberOfDays + birthdayLeavesUsed > birthdayLeaveCredits) {
          return {
            severity: 'error',
            summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
          };
        }

        await executeQuery(
          `attendance_application_bulk_put_leave_details`,
          { employeeId, numberOfDays, type },
          [],
          QueryTypes.UPDATE
        );

      }

      const { workingHours } = shift;
      let nextDay = fromDate;
      if (shift.timeIn > shift.timeOut) {
        nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
      }
      const shiftTimeFrom = `${fromDate} ${shift.timeIn}`;
      const shiftTimeTo = `${nextDay} ${shift.timeOut}`;

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

      const [attendanceApplication]: any = await executeQuery(
        `attendance_application_bulk_get_attendance_application`,
        { attendanceAppId }
      );

      let timeIn = attendanceApplication.timeFrom;
      let timeOut = attendanceApplication.timeTo;
      let lunchTimeIn = shift.lunchTimeIn;
      let lunchTimeOut = shift.lunchTimeOut;
      let isHalfDayLeave = false;
      // if leave is first half shift
      if (
        attendanceApplication.timeFrom === firstHalfShiftStart &&
        attendanceApplication.timeTo === firstHalfShiftEnd
      ) {
        timeIn = secondHalfShiftStart;
        timeOut = secondHalfShiftEnd;
        lunchTimeIn = null;
        lunchTimeOut = null;
        isHalfDayLeave = true;
      }
      // if leave is second half shift
      else if (
        attendanceApplication.timeFrom === secondHalfShiftStart &&
        attendanceApplication.timeTo === secondHalfShiftEnd
      ) {
        timeIn = firstHalfShiftStart;
        timeOut = firstHalfShiftEnd;
        lunchTimeIn = null;
        lunchTimeOut = null;
        isHalfDayLeave = true;
      }
      let customUpdateValues: any = isHalfDayLeave
        ? {
          isPresent: type.includes('Leave') ? 0 : 1,
          isLeave: type.includes('Leave') ? 1 : 0,
          isDayOff: 0,
          timeIn,
          timeOut,
          lunchTimeIn,
          lunchTimeOut,
          creditableOvertime: 0,
          // undertimeHours: attendanceApplication.undertimeHrs,
          // lateHours: attendanceApplication.lateHrs,
        }
        : {
          isPresent: type.includes('Leave') ? 0 : 1,
          isLeave: type.includes('Leave') ? 1 : 0,
          isDayOff: 0,
          creditableOvertime: 0,
        };

      const [getAttendanceResult]: any = await executeQuery(
        `attendance_application_bulk_get_attendance_leave`,
        { employeeId, fromDate, toDate }
      );
      const getAttendance =
        getAttendanceResult !== undefined ? getAttendanceResult : null;

      let remarks = `[${type}: ${moment(
        attendanceApplication.timeFrom,
        'HH:mm:ss'
      ).format('LT')}-${moment(attendanceApplication.timeTo, 'HH:mm:ss').format(
        'LT'
      )}]`;
      await Attendance.update(
        {
          ...customUpdateValues,
          remarks:
            getAttendance && getAttendance.remarks
              ? `${getAttendance.remarks}, [${remarks}]`
              : remarks,
        },
        {
          where: {
            date: {
              [Op.gte]: fromDate,
              [Op.lte]: toDate,
            },
            employeeId: employeeId,
          },
        }
      );
    } else if (type === 'Overtime') {
      const decimalValue = numberOfHours % 1;
      if (decimalValue >= 0.0 && decimalValue < 0.5) {
        // remove all decimal points
        numberOfHours = Math.trunc(numberOfHours);
      } else if (decimalValue >= 0.5 && decimalValue <= 0.99) {
        // remove all decimal values then add .5 after
        numberOfHours = Math.trunc(numberOfHours);
        numberOfHours += 0.5;
      }

      await Attendance.update(
        {
          overtimeHours: numberOfHours,
        },
        {
          where: {
            date: dateOvertime,
            employeeId: employeeId,
          },
        }
      );
    } else if (type == 'Change Schedule') {
      const changeSchedules = await ChangedSchedule.findAll({
        where: {
          attendanceAppId: attendanceAppId,
        },
      });

      // Check if there are any active Leave applications for the same date
      for (let i = 0; i < changeSchedules.length; i++) {
        const changeSchedule: any = changeSchedules[i];

        const attendanceData: any = await Attendance.findOne({
          where: {
            date: changeSchedule.date,
            employeeId: employeeId,
          },
        });

        if (attendanceData && attendanceData.isLeave) {
          return {
            severity: 'error',
            summary: `There's an active Leave application for ${attendanceData.date}`,
          };
        }
      }

      for (let i = 0; i < changeSchedules.length; i++) {
        const changeSchedule: any = changeSchedules[i];

        const attendanceData: any = await Attendance.findOne({
          where: {
            date: changeSchedule.date,
            employeeId: employeeId,
          },
        });

        if (attendanceData) {
          const dataToUpdate: any = {
            isPresent: 1,
            isDayOff: 0,
            isHalfDay: 0,
            lateHours: 0,
            undertimeHours: 0,
            creditableOvertime: 0,
          };
          let remarks = null;

          if (changeSchedule.typeOfChange == 'CHANGE DAY-OFF') {
            dataToUpdate.isDayOff = 1;
            dataToUpdate.isPresent = 0;
            dataToUpdate.isHalfDay = 0;
            remarks = `[${type}: Day-off]`;

            dataToUpdate['timeIn'] = changeSchedule.timeIn;
            dataToUpdate['timeOut'] = changeSchedule.timeOut;
            dataToUpdate['lunchTimeOut'] = changeSchedule.lunchStart;
            dataToUpdate['lunchTimeIn'] = changeSchedule.lunchEnd;
          } else if (changeSchedule.typeOfChange == 'CHANGE SHIFT SCHEDULE') {
            if (attendanceData.isPresent == 1) {
              const attendanceDateFormatted = new Date(changeSchedule.date);
              const employeeTimeIn = await dateTimeFormatter(
                attendanceDateFormatted,
                attendanceData.timeIn
              );
              const employeeTimeOut = await dateTimeFormatter(
                attendanceDateFormatted,
                attendanceData.timeOut
              );
              const employeeLunchOut = attendanceData.lunchTimeOut
                ? await dateTimeFormatter(
                  attendanceDateFormatted,
                  attendanceData.lunchTimeOut
                )
                : null;
              const employeeLunchIn = attendanceData.lunchTimeIn
                ? await dateTimeFormatter(
                  attendanceDateFormatted,
                  attendanceData.lunchTimeIn
                )
                : null;
              const shiftTimeIn = await dateTimeFormatter(
                attendanceDateFormatted,
                changeSchedule.timeIn
              );
              const shiftTimeOut = await dateTimeFormatter(
                attendanceDateFormatted,
                changeSchedule.timeOut
              );
              const shiftLunchIn = changeSchedule.lunchTimeIn
                ? await dateTimeFormatter(
                  attendanceDateFormatted,
                  changeSchedule.lunchTimeIn
                )
                : null;
              const shiftLunchOut = changeSchedule.lunchTimeOut
                ? await dateTimeFormatter(
                  attendanceDateFormatted,
                  changeSchedule.lunchTimeOut
                )
                : null;

              const computeAttendance: any = await computeUndertimeLateHours({
                employeeLogDetails: {
                  date: changeSchedule.date,
                  timeIn: attendanceData.timeIn,
                  lunchTimeOut: attendanceData.lunchTimeOut,
                  lunchTimeIn: attendanceData.lunchTimeIn,
                  timeOut: attendanceData.timeOut,
                },
                shiftDetails: changeSchedule,
                attendanceValues: {
                  employeeTimeIn,
                  employeeLunchOut,
                  employeeLunchIn,
                  employeeTimeOut,
                  shiftTimeIn,
                  shiftTimeOut,
                  shiftLunchEnd: shiftLunchIn,
                  shiftLunchStart: shiftLunchOut,
                  attendanceDate: attendanceDateFormatted,
                },
              });

              if (computeAttendance.success) {
                dataToUpdate.isHalfDay =
                  computeAttendance.data.isHalfDay &&
                    computeAttendance.data.isHalfDayIncomplete
                    ? false
                    : computeAttendance.data.isHalfDay;
                dataToUpdate.lateHours =
                  computeAttendance.data.isHalfDay &&
                    computeAttendance.data.isHalfDayIncomplete
                    ? 0
                    : computeAttendance.data.lateHours;
                dataToUpdate.undertimeHours = computeAttendance.data.isHalfDay
                  ? 0
                  : computeAttendance.data.undertimeHours;
                dataToUpdate.isPresent =
                  computeAttendance.data.isHalfDay &&
                    computeAttendance.data.isHalfDayIncomplete
                    ? 0
                    : 1;
                dataToUpdate.creditableOvertime = computeAttendance.data
                  .isHalfDay
                  ? 0
                  : computeAttendance.data.creditableOvertime;
              }
            }

            remarks = `[${type}: ${moment(
              changeSchedule.timeIn,
              'HH:mm:ss'
            ).format('LT')}-${moment(changeSchedule.timeOut, 'HH:mm:ss').format(
              'LT'
            )}]`;
          }

          // Update attendance record
          await Attendance.update(
            {
              ...dataToUpdate,
              remarks:
                attendanceData && attendanceData.remarks
                  ? `${attendanceData.remarks}, ${remarks}`
                  : remarks,
            },
            {
              where: {
                attendanceId: attendanceData.attendanceId,
                isPosted: 0,
              },
            }
          );
        }
      }
    }
  } else if (action == 'UNDO APPROVAL') {
    const changeSchedules = await ChangedSchedule.findAll({
      where: {
        attendanceAppId: attendanceAppId,
      },
    });

    for (let i = 0; i < changeSchedules.length; i++) {
      const changeSchedule: any = changeSchedules[i];

      const attendanceData: any = await Attendance.findOne({
        where: {
          date: changeSchedule.date,
          employeeId: employeeId,
        },
      });

      if (attendanceData) {
        // Update attendance record
        await Attendance.update(
          {
            isHalfDay: 0,
            lateHours: 0,
            undertimeHours: 0,
            creditableOvertime: 0,
            remarks: null,
          },
          {
            where: {
              attendanceId: attendanceData.attendanceId,
              isPosted: 0,
            },
          }
        );
      }
    }
  }

  let status = 0;
  let logMessage = '';
  let responseMessage = '';
  if (action == 'APPROVE') {
    status = 1;
    logMessage = `User approved the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    responseMessage = `${type} application has been approved`;
  } else if (action == 'DISAPPROVE') {
    status = 3;
    logMessage = `User disapproved the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    responseMessage = `${type} application has been disapproved`;
  } else if (action == 'CANCEL') {
    status = 2;
    logMessage = `User cancelled the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    responseMessage = `${type} application has been cancelled`;
  } else if (action == 'UNDO APPROVAL') {
    status = 0;
    logMessage = `User undo the approval of the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    responseMessage = `${type} application has been undo approved`;
  }

  await AttendanceApplication.update(
    {
      isApproved: status,
    },
    {
      where: {
        attendanceAppId: attendanceAppId,
      },
    }
  );

  await activityLog.create({
    companyId: companyId,
    userId: seshData.userId,
    message: logMessage,
  });
  return {
    success: true,
    severity: 'success',
    summary: responseMessage,
  };
};
