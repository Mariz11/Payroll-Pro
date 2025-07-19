import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import activityLog from 'db/models/activityLog';
import attendanceApplication from 'db/models/attendanceApplication';
import { ParseDateStringtoFormatted } from '@utils/parseDate';
import employee from 'db/models/employee';
import {
  Attendance,
  AttendanceApplication,
  Company,
  Employee,
  Holiday,
  Shift,
} from 'db/models';
import attendance from 'db/models/attendance';
import { Op, where } from 'sequelize';
import { EmployeeLeave } from 'db/models/index';
import moment from '@constant/momentTZ';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { formatTimeToAMPM } from '@utils/helper';
import { number } from 'yup';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const params = req.url.split('?')[1];
  const employeeId = Number(params.split('&')[0].split('=')[1]);
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const attendanceSchedule = await attendance.findAll({
    order: [['createdAt', 'DESC']],
    where: {
      employeeId: employeeId,
      deletedAt: null,
    },
  });

  return NextResponse.json({ data: attendanceSchedule });
}

export async function PUT(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const userId = seshData.userId;

  let { leaveData, typeOfAction } = await req.json();
  leaveData = JSON.parse(leaveData);

  let {
    attendanceAppId,
    employeeId,
    type,
    fromDate,
    toDate,
    dateOvertime,
    numberOfHours,
    numberOfDays,
    employee: {
      employee_leave: {
        vacationLeaveCredits,
        sickLeaveCredits,
        soloParentLeaveCredits,
        paternityLeaveCredits,
        maternityLeaveCredits,
        serviceIncentiveLeaveCredits,
        otherLeaveCredits,
        vacationLeaveUsed,
        sickLeaveUsed,
        soloParentLeavesUsed,
        paternityLeavesUsed,
        maternityLeavesUsed,
        serviceIncentiveLeaveUsed,
        otherLeavesUsed,
      },
      shift: { workingHours },
    },
  } = leaveData;
  if (hasHtmlTags(type)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }

  // if (hasSQLKeywords(type)) {
  //   return NextResponse.json(
  //     { success: false, message: 'Input/s contain/s possible SQL keywords' },
  //     { status: 400 }
  //   );
  // }
  numberOfDays = parseFloat(numberOfDays ?? 0);
  vacationLeaveCredits = parseFloat(vacationLeaveCredits ?? 0);
  sickLeaveCredits = parseFloat(sickLeaveCredits ?? 0);
  soloParentLeaveCredits = parseFloat(soloParentLeaveCredits ?? 0);
  paternityLeaveCredits = parseFloat(paternityLeaveCredits ?? 0);
  maternityLeaveCredits = parseFloat(maternityLeaveCredits ?? 0);
  serviceIncentiveLeaveCredits = parseFloat(serviceIncentiveLeaveCredits ?? 0);
  otherLeaveCredits = parseFloat(otherLeaveCredits ?? 0);
  vacationLeaveUsed = parseFloat(vacationLeaveUsed ?? 0);
  sickLeaveUsed = parseFloat(sickLeaveUsed ?? 0);
  soloParentLeavesUsed = parseFloat(soloParentLeavesUsed ?? 0);
  paternityLeavesUsed = parseFloat(paternityLeavesUsed ?? 0);
  maternityLeavesUsed = parseFloat(maternityLeavesUsed ?? 0);
  serviceIncentiveLeaveUsed = parseFloat(serviceIncentiveLeaveUsed ?? 0);
  otherLeavesUsed = parseFloat(otherLeavesUsed ?? 0);
  const employeeDetails: any = await Employee.findOne({
    attributes: ['employeeId', 'departmentId', 'companyId'],
    where: {
      employeeId: employeeId,
      companyId: companyId,
    },
    include: [{ model: Shift }, { model: AttendanceApplication }],
  });
  const shift = employeeDetails.shift;

  const halfDay = parseFloat((workingHours / 2).toFixed(2));
  // calculate first half of shift
  const firstHalfShiftStart = shift.timeIn;
  const firstHalfShiftEnd = moment(`${fromDate} ${shift.timeIn}`)
    .add(halfDay, 'hours')
    .format('HH:mm:ss');
  const secondHalfShiftStart = moment(`${fromDate} ${shift.timeOut}`)
    .subtract(halfDay, 'hours')
    .format('HH:mm:ss');
  const secondHalfShiftEnd = shift.timeOut;

  if (typeOfAction === 'APPROVED') {
    const checkAttendance: any = await Attendance.findOne({
      where: {
        date: {
          [Op.or]: {
            [Op.and]: {
              [Op.gte]: fromDate,
              [Op.lte]: toDate,
            },
            [Op.eq]: dateOvertime,
          },
        },
        employeeId: employeeId,
      },
    });

    if (checkAttendance && checkAttendance.isPosted) {
      return NextResponse.json({
        severity: 'error',
        summary:
          'Not allowed to approve OT/Leave applications with dates that coincide with already posted attendance',
      });
    }

    if (
      checkAttendance &&
      type.replace(/%20/g, ' ') === 'Overtime' &&
      (checkAttendance.isPresent == 0 ||
        checkAttendance.isDayOff == 1 ||
        checkAttendance.isLeave == 1)
    ) {
      return NextResponse.json({
        severity: 'error',
        summary: `${checkAttendance.businessMonth} - ${checkAttendance.cycle} - ${dateOvertime}'s status must be PRESENT to approve this application`,
      });
    }

    if (type.replace(/%20/g, ' ') === 'Vacation Leave') {
      if (numberOfDays + vacationLeaveUsed > vacationLeaveCredits) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        { vacationLeaveUsed: (vacationLeaveUsed ?? 0) + numberOfDays },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Sick Leave') {
      if (numberOfDays + sickLeaveUsed > sickLeaveCredits) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        { sickLeaveUsed: (sickLeaveUsed ?? 0) + numberOfDays },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Solo Parent Leave') {
      if (numberOfDays + soloParentLeavesUsed > soloParentLeaveCredits) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        { soloParentLeavesUsed: (soloParentLeavesUsed ?? 0) + numberOfDays },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Paternity Leave') {
      if (numberOfDays + paternityLeavesUsed > paternityLeaveCredits) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        { paternityLeavesUsed: (paternityLeavesUsed ?? 0) + numberOfDays },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Maternity Leave') {
      if (numberOfDays + maternityLeavesUsed > maternityLeaveCredits) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        { maternityLeavesUsed: (maternityLeavesUsed ?? 0) + numberOfDays },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Service Incentive Leave') {
      if (
        numberOfDays + serviceIncentiveLeaveUsed >
        serviceIncentiveLeaveCredits
      ) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        {
          serviceIncentiveLeaveUsed:
            (serviceIncentiveLeaveUsed ?? 0) + numberOfDays,
        },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Others') {
      if (numberOfDays + otherLeavesUsed > otherLeaveCredits) {
        return NextResponse.json({
          severity: 'error',
          summary: `${type} credits exceeded`,
        });
      }
      await EmployeeLeave.update(
        {
          otherLeavesUsed: (otherLeavesUsed ?? 0) + numberOfDays,
        },
        {
          where: {
            employeeId: employeeId,
          },
        }
      );
    } else if (type.replace(/%20/g, ' ') === 'Overtime') {
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
          overtimeHours:
            //  attendance
            //   ? attendance.overtimeHours + numberOfHours:
            numberOfHours,
        },
        {
          where: {
            date: dateOvertime,
            employeeId: employeeId,
          },
        }
      );
    }

    const attendanceSchedule = await attendanceApplication.update(
      {
        isApproved: 1,
        approvedDate: new Date(),
        approvedBy: userId,
      },
      {
        where: {
          attendanceAppId: attendanceAppId,
        },
      }
    );

    if (type.replace(/%20/g, ' ') != 'Overtime') {
      const attendanceApplication: any = await AttendanceApplication.findOne({
        where: {
          attendanceAppId: attendanceAppId,
        },
      });
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
          isPresent: 0,
          isDayOff: 0,
          isLeave: 1,
          timeIn,
          timeOut,
          lunchTimeIn,
          lunchTimeOut,
          isHalfDay: true,
          creditableOvertime: 0,
        }
        : {
          isPresent: 0,
          isDayOff: 0,
          isLeave: 1,
          isHalfDay: false,
          creditableOvertime: 0,
        };

      await Attendance.update(customUpdateValues, {
        where: {
          date: {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          },
          employeeId: employeeId,
        },
      });
    }

    await activityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'User Attendance Application Approved',
    });

    return NextResponse.json({
      data: attendanceSchedule,
      severity: 'success',
      summary: `${type} has been ${typeOfAction}`,
    });
  } else if (typeOfAction === 'CANCELLED' || typeOfAction === 'DISAPPROVED') {
    const attendanceSchedule = await attendanceApplication.update(
      { isApproved: typeOfAction === 'DISAPPROVED' ? 3 : 2 },
      {
        where: {
          attendanceAppId: attendanceAppId,
        },
      }
    );

    await activityLog.create({
      companyId: companyId,
      userId: userId,
      message:
        typeOfAction === 'DISAPPROVED'
          ? 'Disapproved Attendance Application'
          : 'Cancelled Attendance Application',
    });

    return NextResponse.json({
      data: attendanceSchedule,
      severity: 'success',
      summary: `${type} has been ${typeOfAction}`,
    });
  }
}

export async function PATCH(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  try {
    const userId = seshData.userId;

    const params = req.url.split('?')[1];
    const attendanceApplicationId = Number(params.split('&')[0].split('=')[1]);

    const { requestedDate, type, fromDate, toDate, reason, timeFrom, timeTo } =
      await req.json();

    if (hasHtmlTags(reason) || hasHtmlTags(type)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    // if (hasSQLKeywords(reason) || hasSQLKeywords(type)) {
    //   return NextResponse.json(
    //     { success: false, message: 'Input/s contain/s possible SQL keywords' },
    //     { status: 400 }
    //   );
    // }
    const appDetails: any = await AttendanceApplication.findByPk(
      attendanceApplicationId
    );

    const employeeId = appDetails.employeeId;
    const fromTime = timeFrom;
    const toTime = timeTo;

    const shift: any = await Shift.findOne({
      include: [
        {
          model: Employee,
          where: {
            employeeId: employeeId,
          },
        },
      ],
    });
    const company: any = await Company.findOne({
      attributes: ['leavesOnHolidays'],
      where: {
        companyId: companyId,
      },
    });

    if (!shift) {
      return NextResponse.json({
        success: false,
        message: 'Please assign shift first.',
      });
    }

    if (!shift) {
      return NextResponse.json({
        success: false,
        message: 'Please assign shift first.',
      });
    }

    const { lunchStart, lunchEnd, workingHours } = shift;
    let customWhere: any = {};

    let nextDay: any = fromDate;
    if (fromTime > toTime) {
      nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
    }
    const dateTimeFrom = `${fromDate} ${fromTime}`;
    const dateTimeTo = `${nextDay} ${toTime}`;
    nextDay = fromDate;
    if (lunchStart > lunchEnd) {
      nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
    }
    const lunchOut = `${fromDate} ${lunchStart}`;
    const lunchIn = `${nextDay} ${lunchEnd}`;
    const lunchBreakHours =
      moment.duration(moment(lunchIn).diff(moment(lunchOut))).asMinutes() / 60;
    let numberOfHours =
      type === 'Overtime'
        ? moment
          .duration(moment(dateTimeTo).diff(moment(dateTimeFrom)))
          .asMinutes() / 60
        : moment
          .duration(moment(dateTimeTo).diff(moment(dateTimeFrom)))
          .asMinutes() /
        60 -
        lunchBreakHours;
    // calculate half day hours
    const halfDay = parseFloat((workingHours / 2).toFixed(2));
    // calculate first half of shift
    const firstHalfShiftStart = shift.timeIn;
    const firstHalfShiftEnd = moment(`${fromDate} ${shift.timeIn}`)
      .add(halfDay, 'hours')
      .format('HH:mm:ss');
    const secondHalfShiftStart = moment(`${fromDate} ${shift.timeOut}`)
      .subtract(halfDay, 'hours')
      .format('HH:mm:ss');
    const secondHalfShiftEnd = shift.timeOut;
    const fromTimeFormatted = fromTime;
    const toTimeFormatted = toTime;

    if (type == 'Overtime') {
      const dayOfWeek = moment(requestedDate).format('dddd');

      // return;
      let checkAttendance: any = await Attendance.findOne({
        where: {
          date: requestedDate,
          employeeId: employeeId,
          // isPosted: 1,
        },
      });

      if (checkAttendance && checkAttendance.isPosted) {
        return NextResponse.json({
          success: false,
          message:
            'Not allowed to file OT/Leave applications with dates that coincide with already posted attendance',
        });
      }

      //

      if (shift.employees[0].daysOff.includes(dayOfWeek) && !checkAttendance) {
        return NextResponse.json({
          success: false,
          message: 'No Attendance Recorded',
        });
      }
      if (checkAttendance && checkAttendance.isDayOff) {
        return NextResponse.json({
          success: false,
          message: 'No Attendance Recorded',
        });
      }

      customWhere = {
        employeeId: employeeId,
        attendanceAppId: {
          [Op.not]: attendanceApplicationId,
        },
        [Op.or]: {
          [Op.and]: {
            fromDate: {
              [Op.lte]: requestedDate,
            },
            toDate: {
              [Op.gte]: requestedDate,
            },
          },
          dateOvertime: requestedDate,
        },
        isApproved: [0, 1],
        deletedAt: null,
      };
    } else {
      if (moment(fromDate) > moment(toDate)) {
        return NextResponse.json({
          success: false,
          message: 'Invalid Date range selected',
        });
      }

      // check if holidays fall in between
      if (!company.leavesOnHolidays) {
        let holidays: any = [];
        holidays = await Holiday.findAll({
          where: {
            holidayDate: {
              [Op.between]: [
                fromDate,
                toDate === '' || !toDate ? fromDate : toDate,
              ],
            },
          },
          attributes: ['holidayName', 'holidayDate'],
        });

        if (holidays && holidays.length > 0) {
          return NextResponse.json({
            success: false,
            message: `These holidays are in conflict with your application:`,
            holidays,
          });
        }
      }

      // If type is SL, VL
      if (type == 'Vacation Leave' || type == 'Sick Leave') {
        let startDateTime = moment(`${fromDate} ${fromTime}`);
        let endDateTime = moment(`${toDate} ${toTime}`);
        if (endDateTime.date() === startDateTime.date() && toTime < fromTime) {
          endDateTime.add(1, 'day');
        }
        if (startDateTime > endDateTime) {
          return NextResponse.json({
            success: false,
            message: 'Invalid Date Time selected',
          });
        }

        nextDay = fromDate;
        if (lunchStart > lunchEnd) {
          nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }

        if (
          fromTimeFormatted < shift.timeIn ||
          toTimeFormatted > shift.timeOut
        ) {
          return NextResponse.json({
            success: false,
            message: 'Invalid Hours Duration',
            details: `When applying for whole-day ${type}, time range should be [${moment(
              shift.timeIn,
              'HH:mm:ss'
            ).format('LT')}-${moment(shift.timeOut, 'HH:mm:ss').format('LT')}]`,
            life: '15000',
          });
        } else if (
          (fromTimeFormatted != shift.timeIn ||
            toTimeFormatted != shift.timeOut) &&
          (fromTimeFormatted != firstHalfShiftStart ||
            toTimeFormatted != firstHalfShiftEnd) &&
          (fromTimeFormatted != secondHalfShiftStart ||
            toTimeFormatted != secondHalfShiftEnd)
        ) {
          return NextResponse.json({
            success: false,
            message: 'Invalid Hours Duration',
            details: `When applying for Halfday Leave, time range should be [${moment(
              firstHalfShiftStart,
              'HH:mm:ss'
            ).format('LT')}-${moment(firstHalfShiftEnd, 'HH:mm:ss').format(
              'LT'
            )}]
            or [${moment(secondHalfShiftStart, 'HH:mm:ss').format(
              'LT'
            )}-${moment(secondHalfShiftEnd, 'HH:mm:ss').format('LT')}]`,
            life: '15000',
          });
        }
        // recaulculate numberofhours for halfday to avoid subtracting lunch break hours to final number of hours
        if (
          (fromTimeFormatted == firstHalfShiftStart &&
            toTimeFormatted == firstHalfShiftEnd) ||
          (fromTimeFormatted == secondHalfShiftStart &&
            toTimeFormatted == secondHalfShiftEnd)
        ) {
          numberOfHours =
            moment
              .duration(moment(dateTimeTo).diff(moment(dateTimeFrom)))
              .asMinutes() / 60;
        }
      } else {
        numberOfHours = workingHours;
      }

      const checkAttendance: any = await Attendance.findOne({
        where: {
          date: {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          },
          employeeId: employeeId,
        },
      });

      if (checkAttendance && checkAttendance.isPosted == 1) {
        return NextResponse.json({
          success: false,
          message: 'Not allowed to apply on already posted attendance date.',
        });
      }

      customWhere = {
        employeeId: employeeId,
        attendanceAppId: {
          [Op.not]: attendanceApplicationId,
        },
        fromDate: {
          [Op.lte]: toDate,
        },
        toDate: {
          [Op.gte]: fromDate,
        },
        isApproved: [0, 1],
        deletedAt: null,
      };
    }
    const checkExisting = await AttendanceApplication.findAll({
      where: customWhere,
    });

    if (checkExisting.length > 0) {
      return NextResponse.json({
        success: false,
        message: `You've already applied on this date`,
      });
    }

    let leaveHours = 0;
    let startDate = fromDate;
    let endDate = toDate;
    while (moment(startDate) <= moment(endDate)) {
      leaveHours += numberOfHours;
      startDate = moment(startDate).add(1, 'days');
    }
    const leaveDaysCount = leaveHours / workingHours;
    // console.log('leaveDays');
    // console.log(leaveDaysCount);
    // console.log(numberOfHours);
    // console.log(workingHours);
    if (type === 'Overtime') {
      const decimalValue = numberOfHours % 1;
      if (decimalValue >= 0.0 && decimalValue < 0.5) {
        // remove all decimal points
        numberOfHours = Math.trunc(numberOfHours);
      } else if (decimalValue >= 0.5 && decimalValue <= 0.99) {
        // remove all decimal values then add .5 after
        numberOfHours = Math.trunc(numberOfHours);
        numberOfHours += 0.5;
      }
    }
    if (type === 'Vacation Leave' || type === 'Sick Leave') {
      let undertimeHrs = 0;
      let lateHrs = 0;
      let isHalfDayLeave = false;
      let numOfHours = numberOfHours;
      if (
        fromTimeFormatted === firstHalfShiftStart &&
        toTimeFormatted === firstHalfShiftEnd
      ) {
        // if leave is first half of shift

        undertimeHrs = 0;
        lateHrs = +halfDay.toFixed(2);
        numOfHours + halfDay.toFixed(2);
        isHalfDayLeave = true;
      } else if (
        fromTimeFormatted === secondHalfShiftStart &&
        toTimeFormatted === secondHalfShiftEnd
      ) {
        // if leave is second half of shift

        undertimeHrs = +halfDay.toFixed(2);
        lateHrs = 0;
        numOfHours + halfDay.toFixed(2);
        isHalfDayLeave = true;
      }
      await attendanceApplication.update(
        {
          type: type,
          dateOvertime: null,
          reason,
          fromDate: fromDate,
          toDate: toDate,
          timeFrom: fromTimeFormatted,
          timeTo: toTimeFormatted,
          numberOfHours: numOfHours,
          numberOfDays: leaveDaysCount,
          undertimeHrs: undertimeHrs,
          lateHrs: lateHrs,
          isHalfDayLeave: isHalfDayLeave,
        },
        {
          where: {
            attendanceAppId: attendanceApplicationId,
          },
        }
      );
    } else {
      await attendanceApplication.update(
        {
          isHalfDayLeave: false,
          type: type,
          dateOvertime: type == 'Overtime' ? requestedDate : null,
          reason,
          fromDate: fromDate,
          toDate: toDate,
          timeFrom:
            type == 'Overtime' ||
              type == 'Vacation Leave' ||
              type == 'Sick Leave'
              ? fromTime
              : null,
          timeTo:
            type == 'Overtime' ||
              type == 'Vacation Leave' ||
              type == 'Sick Leave'
              ? toTime
              : null,

          numberOfHours: numberOfHours,
          numberOfDays: type == 'Overtime' ? null : leaveDaysCount,
        },
        {
          where: {
            attendanceAppId: attendanceApplicationId,
          },
        }
      );
    }

    await activityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'User Attendance Application Updated',
    });
    return NextResponse.json({
      success: true,
      message: `Successfully Updated`,
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error updating attendance application:', error.message);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
