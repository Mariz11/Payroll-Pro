import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import activityLog from 'db/models/activityLog';
import {
  Attendance,
  AttendanceApplication,
  Company,
  Employee,
  EmployeeLeave,
  EmployeeProfile,
  Holiday,
  Shift,
  ChangedSchedule,
  User,
  UserRole,
} from 'db/models';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import moment from '@constant/momentTZ';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import {
  computeUndertimeLateHours,
  getCurrentOrNewShiftDetails,
} from '@utils/companyDetailsGetter';
import { updateAttendanceApp } from '@utils/attendanceAppFunctions';
import { ACTIVITY_LOGS_INSERT, ATTENDANCE_APPLICATION_GET_ALL, ATTENDANCE_APPLICATION_GET_USER_ROLE, CHANGED_SCHEDULES_GET_BY_DATE, CHANGED_SCHEDULES_GET_SIMPLE, COMPANIES_GET_EMPLOYEES, HOLIDAYS_GET_BY_DATE } from '@constant/storedProcedures';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');
    const status = Number(url.searchParams.get('status'));

    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();
    const companyId = selectedCompData
      ? selectedCompData.companyId
      : seshData.companyId;

    const [user]: any = await executeQuery(ATTENDANCE_APPLICATION_GET_USER_ROLE, {
      userId: seshData.userId,
    });

    let moduleAccess = [];
    if (user.users && user.users.user_role) {
      moduleAccess = JSON.parse(user.users.user_role.moduleAccess);
    }

    let role: string | null = 'ADMIN';
    role = moduleAccess.find((item: any) => item.moduleId === 3)
      ? 'ADMIN'
      : moduleAccess.find((item: any) => item.moduleId === 18)
        ? 'EMPLOYEE'
        : null;

    const dataList: any = await executeQuery(ATTENDANCE_APPLICATION_GET_ALL, {
      companyId,
      isApproved: status,
      search: search,
      employeeId: role && role != 'EMPLOYEE' ? undefined : seshData.employeeId,
    });

    const formattedObject = (item: any) => {
      const count = item.length;
      const rows = item.slice(offset, offset + limit).map((item: any) => ({
        ...item,
      }));
      return {
        count,
        rows,
      };
    };
    const attendanceApplicationList = formattedObject(dataList);

    if (attendanceApplicationList.rows.length > 0) {
      const { rows } = attendanceApplicationList;
      for (let i = 0; i < rows.length; i++) {
        const attendanceApplication: any = rows[i];

        if (attendanceApplication.type == 'Change Schedule') {
          const changeSchedules = await ChangedSchedule.findAll({
            where: {
              attendanceAppId: attendanceApplication.attendanceAppId,
            },
          });

          if (changeSchedules.length > 0) {
            const attendanceData: any = await Attendance.count({
              where: {
                date: changeSchedules.map((schedule: any) => schedule.date),
                employeeId: attendanceApplication.employeeId,
                isPosted: 0,
              },
            });

            attendanceApplicationList.rows[i].pendingAttendance =
              attendanceData;
          }
        }
      }
    }
    return NextResponse.json(attendanceApplicationList);
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  let {
    attendanceAppId,
    approverId,
    type,
    reason,
    requestedDate,
    fromDate,
    toDate,
    fromTime,
    toTime,
    employeeId,
    newScheduleData,
    numberOfHours,
    numberOfDays,
  } = await req.json();
  let dateOvertime = null;

  if (hasHtmlTags(reason) || hasHtmlTags(type)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }

  try {
    let shift: any = await Shift.findOne({
      include: [
        {
          model: Employee,
          where: {
            employeeId: employeeId,
          },
          attributes: { include: ['daysOff'] },
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

    let isHalfDayLeave = false;

    if (type == 'Overtime') {
      const dateTimeFrom = moment(`${fromDate} ${fromTime}`);
      const dateTimeTo = moment(`${toDate} ${toTime}`);
      dateOvertime = fromDate;
      numberOfDays = null;

      if (dateTimeFrom > dateTimeTo) {
        return NextResponse.json({
          success: false,
          message: 'Invalid Date range selected',
        });
      }

      const decimalValue = numberOfHours % 1;
      if (decimalValue >= 0.0 && decimalValue < 0.5) {
        // remove all decimal points
        numberOfHours = Math.trunc(numberOfHours);
      } else if (decimalValue >= 0.5 && decimalValue <= 0.99) {
        // remove all decimal values then add .5 after
        numberOfHours = Math.trunc(numberOfHours);
        numberOfHours += 0.5;
      }

      const dayOfWeek = moment(fromDate).format('dddd');

      // return;
      let checkAttendance: any = await Attendance.findOne({
        where: {
          date: fromDate,
          employeeId: employeeId,
        },
      });

      if (checkAttendance && checkAttendance.isPosted) {
        return NextResponse.json({
          success: false,
          message:
            'Not allowed to file OT/Leave applications with dates that coincide with already posted attendance',
        });
      }

      if (
        checkAttendance &&
        (checkAttendance.isPresent == 0 ||
          checkAttendance.isDayOff == 1 ||
          checkAttendance.isLeave == 1)
      ) {
        return NextResponse.json({
          severity: 'error',
          message: `${checkAttendance.businessMonth} - ${checkAttendance.cycle} - ${fromTime}'s status must be PRESENT to proceed with the application`,
        });
      }

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
    } else {
      // check if leaves on holidays config is false
      if (!company.leavesOnHolidays) {
        // check if holidays fall in between
        let holidays: any = [];
        holidays = await Holiday.findAll({
          where: {
            holidayDate: {
              [Op.between]: [
                fromDate,
                toDate === '' || !toDate ? fromDate : toDate,
              ],
            },
            companyId: companyId,
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
      if (type.includes('Leave')) {
        if (fromDate > toDate) {
          return NextResponse.json({
            success: false,
            message: 'Invalid Date range selected',
          });
        }

        const getShiftDetails = await getCurrentOrNewShiftDetails({
          employeeId: employeeId,
          attendanceDate: fromDate,
        });

        if (getShiftDetails.success) {
          shift = getShiftDetails.shift;
        }

        let nextDay = fromDate;
        if (fromTime > toTime) {
          nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }
        const dateTimeFrom = `${fromDate} ${fromTime}`;
        const dateTimeTo = `${nextDay} ${toTime}`;

        const { lunchStart, lunchEnd, workingHours } = shift;
        if (shift.timeIn > shift.timeOut) {
          nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }
        const shiftTimeFrom = `${fromDate} ${shift.timeIn}`;
        const shiftTimeTo = `${nextDay} ${shift.timeOut}`;

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

        if (dateTimeFrom != shiftTimeFrom || dateTimeTo != shiftTimeTo) {
          if (dateTimeFrom < shiftTimeFrom || dateTimeTo > shiftTimeTo) {
            return NextResponse.json({
              success: false,
              message: 'Invalid Hours Duration',
              details: `When applying for whole-day ${type}, time range should be [${moment(
                shift.timeIn,
                'HH:mm:ss'
              ).format('LT')}-${moment(shift.timeOut, 'HH:mm:ss').format(
                'LT'
              )}]`,
              life: '15000',
            });
          } else if (
            !(
              (fromTime == firstHalfShiftStart &&
                toTime == firstHalfShiftEnd) ||
              (fromTime == secondHalfShiftStart && toTime == secondHalfShiftEnd)
            )
          ) {
            return NextResponse.json({
              success: false,
              message: 'Invalid Hours Duration',
              details: `When applying for Half-day ${type}, time range should be [${moment(
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
        }

        // if leave is first half of shift
        if (
          (fromTime === firstHalfShiftStart && toTime === firstHalfShiftEnd) ||
          (fromTime === secondHalfShiftStart && toTime === secondHalfShiftEnd)
        ) {
          isHalfDayLeave = true;
        }
      } else if (type == 'Change Schedule') {
        // Check if there are any active Change Schedule applications for the same date
        for (let i = 0; i < newScheduleData.length; i++) {
          const schedule = newScheduleData[i];
          const checkExisting = await ChangedSchedule.findOne({
            where: {
              date: moment(schedule.date).format('YYYY-MM-DD'),
              attendanceAppId: {
                [Op.not]: attendanceAppId,
              },
            },
            include: [
              {
                attributes: [],
                model: AttendanceApplication,
                where: {
                  employeeId: employeeId,
                },
                required: true,
              },
            ],
          });

          if (checkExisting) {
            return NextResponse.json({
              success: false,
              message: `There's already a ${type} application for ${moment(
                schedule.date
              ).format('MM/DD/YYYY')}`,
            });
          }
        }

        fromDate = null;
        toDate = null;
        fromTime = null;
        toTime = null;
        numberOfDays = null;
        numberOfHours = 0;
      }

      const checkAttendance: any = await Attendance.findOne({
        where: {
          date: {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          },
          employeeId: employeeId,
          isPosted: 1,
        },
      });

      if (checkAttendance) {
        return NextResponse.json({
          success: false,
          message:
            'Not allowed to file OT/Leave applications with dates that coincide with already posted attendance',
        });
      }
    }

    const checkExisting = await AttendanceApplication.findAll({
      where: {
        attendanceAppId: {
          [Op.not]: attendanceAppId,
        },
        employeeId: employeeId,
        fromDate: {
          [Op.lte]: toDate,
        },
        toDate: {
          [Op.gte]: fromDate,
        },
        isApproved: [0, 1],
        deletedAt: null,
      },
    });

    if (checkExisting.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'There is already an application for this date range',
      });
    }

    const objData = {
      companyId,
      type: type,
      dateOvertime: dateOvertime,
      reason,
      fromDate: fromDate,
      toDate: toDate,
      requestedDate: requestedDate,
      timeFrom: fromTime,
      timeTo: toTime,
      employeeId: employeeId,
      approverId: approverId,
      numberOfHours: numberOfHours,
      numberOfDays: numberOfDays,
      isHalfDayLeave: isHalfDayLeave,
    };

    let query: any = null;
    if (!attendanceAppId) {
      query = await AttendanceApplication.create(objData);
    } else {
      query = await AttendanceApplication.update(objData, {
        where: { attendanceAppId: attendanceAppId },
      });
    }

    if (query) {
      if (type == 'Change Schedule') {
        for (let i = 0; i < newScheduleData.length; i++) {
          const schedule = newScheduleData[i];
          await ChangedSchedule.upsert({
            changeScheduleId: schedule.changeScheduleId,
            attendanceAppId: attendanceAppId ?? query.attendanceAppId,
            typeOfChange: schedule.typeOfChange,
            date: moment(schedule.date).format('YYYY-MM-DD'),
            timeIn: schedule.timeIn ? schedule.timeIn : null,
            lunchStart: schedule.lunchStart ? schedule.lunchStart : null,
            lunchEnd: schedule.lunchEnd ? schedule.lunchEnd : null,
            timeOut: schedule.timeOut ? schedule.timeOut : null,
            workingHours: schedule.workingHours,
          });
        }
        await ChangedSchedule.destroy({
          where: {
            attendanceAppId: attendanceAppId ?? query.attendanceAppId,
            changeScheduleId: {
              [Op.notIn]: newScheduleData.map(
                (schedule: any) => schedule.changeScheduleId
              ),
            },
          },
        });
      } else {
        // If Attendance Application type is changed from Change Schedule to others, then delete all existing Changed Schedule records
        await ChangedSchedule.destroy({
          where: {
            attendanceAppId: attendanceAppId ?? query.attendanceAppId,
          },
        });
      }
    }

    await executeQuery(
      ACTIVITY_LOGS_INSERT,
      {
        userId: seshData.userId,
        companyId,
        message: `User requested for ${type}`,
      },
      [],
      QueryTypes.INSERT
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully Submitted',
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error submitting attendance application:', error.message);
    } else
      return NextResponse.json(
        { message: error, success: false },
        { status: 500 }
      );
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();

  let { action, rowData } = await req.json();

  try {
    rowData = JSON.parse(rowData);

    const {
      attendanceAppId,
      companyId,
      employeeId,
      type,
      reason,
      fromDate,
      toDate,
      dateOvertime,
      timeFrom,
      timeTo,
      numberOfDays,
      employee,
    } = rowData;

    let numberOfHours = rowData.numberOfHours;

    const res = await updateAttendanceApp({
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
    });

    // if (action == 'APPROVE') {
    //   const {
    //     employee_leave: {
    //       vacationLeaveUsed,
    //       vacationLeaveCredits,
    //       sickLeaveUsed,
    //       sickLeaveCredits,
    //       soloParentLeavesUsed,
    //       soloParentLeaveCredits,
    //       paternityLeavesUsed,
    //       paternityLeaveCredits,
    //       maternityLeavesUsed,
    //       maternityLeaveCredits,
    //       serviceIncentiveLeaveUsed,
    //       serviceIncentiveLeaveCredits,
    //       otherLeavesUsed,
    //       otherLeaveCredits,
    //       emergencyLeavesUsed,
    //       emergencyLeaveCredits,
    //       birthdayLeavesUsed,
    //       birthdayLeaveCredits,
    //     },
    //   } = employee;

    //   let { shift } = employee;

    //   const getShiftDetails = await getCurrentOrNewShiftDetails({
    //     employeeId: employeeId,
    //     attendanceDate: fromDate,
    //   });

    //   if (getShiftDetails.success) {
    //     shift = getShiftDetails.shift;
    //   }

    //   const checkAttendance: any = await Attendance.findOne({
    //     where: {
    //       date: {
    //         [Op.or]: {
    //           [Op.and]: {
    //             [Op.gte]: fromDate,
    //             [Op.lte]: toDate,
    //           },
    //           [Op.eq]: dateOvertime,
    //         },
    //       },
    //       employeeId: employeeId,
    //     },
    //   });

    //   if (checkAttendance && checkAttendance.isPosted) {
    //     return NextResponse.json({
    //       severity: 'error',
    //       summary:
    //         'Not allowed to approve OT/Leave applications with dates that coincide with already posted attendance',
    //     });
    //   }

    //   if (
    //     checkAttendance &&
    //     type === 'Overtime' &&
    //     (checkAttendance.isPresent == 0 ||
    //       checkAttendance.isDayOff == 1 ||
    //       checkAttendance.isLeave == 1)
    //   ) {
    //     return NextResponse.json({
    //       severity: 'error',
    //       summary: `${checkAttendance.businessMonth} - ${checkAttendance.cycle} - ${dateOvertime}'s status must be PRESENT to approve this application`,
    //     });
    //   }

    //   if (type.includes('Leave') || type == 'Official Business') {
    //     if (type === 'Vacation Leave') {
    //       if (numberOfDays + vacationLeaveUsed > vacationLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         { vacationLeaveUsed: (vacationLeaveUsed ?? 0) + numberOfDays },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Sick Leave') {
    //       if (numberOfDays + sickLeaveUsed > sickLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         { sickLeaveUsed: (sickLeaveUsed ?? 0) + numberOfDays },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Solo Parent Leave') {
    //       if (numberOfDays + soloParentLeavesUsed > soloParentLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         {
    //           soloParentLeavesUsed: (soloParentLeavesUsed ?? 0) + numberOfDays,
    //         },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Paternity Leave') {
    //       if (numberOfDays + paternityLeavesUsed > paternityLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         { paternityLeavesUsed: (paternityLeavesUsed ?? 0) + numberOfDays },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Maternity Leave') {
    //       if (numberOfDays + maternityLeavesUsed > maternityLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         { maternityLeavesUsed: (maternityLeavesUsed ?? 0) + numberOfDays },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Service Incentive Leave') {
    //       if (
    //         numberOfDays + serviceIncentiveLeaveUsed >
    //         serviceIncentiveLeaveCredits
    //       ) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         {
    //           serviceIncentiveLeaveUsed:
    //             (serviceIncentiveLeaveUsed ?? 0) + numberOfDays,
    //         },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Others') {
    //       if (numberOfDays + otherLeavesUsed > otherLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         {
    //           otherLeavesUsed: (otherLeavesUsed ?? 0) + numberOfDays,
    //         },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Emergency Leave') {
    //       if (numberOfDays + emergencyLeavesUsed > emergencyLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         {
    //           emergencyLeavesUsed: (emergencyLeavesUsed ?? 0) + numberOfDays,
    //         },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     } else if (type === 'Birthday Leave') {
    //       if (numberOfDays + birthdayLeavesUsed > birthdayLeaveCredits) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `${employee.employee_profile?.employeeFullName}'s ${type} credits already exceeded`,
    //         });
    //       }
    //       await EmployeeLeave.update(
    //         {
    //           birthdayLeavesUsed: (birthdayLeavesUsed ?? 0) + numberOfDays,
    //         },
    //         {
    //           where: {
    //             employeeId: employeeId,
    //           },
    //         }
    //       );
    //     }

    //     const { workingHours } = shift;
    //     let nextDay = fromDate;
    //     if (shift.timeIn > shift.timeOut) {
    //       nextDay = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
    //     }
    //     const shiftTimeFrom = `${fromDate} ${shift.timeIn}`;
    //     const shiftTimeTo = `${nextDay} ${shift.timeOut}`;

    //     const halfDay = parseFloat((workingHours / 2).toFixed(2));

    //     // calculate first half of shift
    //     const firstHalfShiftStart = shift.timeIn;
    //     const firstHalfShiftEnd = moment(shiftTimeFrom)
    //       .add(halfDay, 'hours')
    //       .format('HH:mm:ss');
    //     // calculate second half of shift
    //     const secondHalfShiftStart = moment(shiftTimeTo)
    //       .subtract(halfDay, 'hours')
    //       .format('HH:mm:ss');
    //     const secondHalfShiftEnd = shift.timeOut;

    //     const attendanceApplication: any = await AttendanceApplication.findOne({
    //       where: {
    //         attendanceAppId: attendanceAppId,
    //       },
    //     });
    //     let timeIn = attendanceApplication.timeFrom;
    //     let timeOut = attendanceApplication.timeTo;
    //     let lunchTimeIn = shift.lunchTimeIn;
    //     let lunchTimeOut = shift.lunchTimeOut;
    //     let isHalfDayLeave = false;
    //     // if leave is first half shift
    //     if (
    //       attendanceApplication.timeFrom === firstHalfShiftStart &&
    //       attendanceApplication.timeTo === firstHalfShiftEnd
    //     ) {
    //       timeIn = secondHalfShiftStart;
    //       timeOut = secondHalfShiftEnd;
    //       lunchTimeIn = null;
    //       lunchTimeOut = null;
    //       isHalfDayLeave = true;
    //     }
    //     // if leave is second half shift
    //     else if (
    //       attendanceApplication.timeFrom === secondHalfShiftStart &&
    //       attendanceApplication.timeTo === secondHalfShiftEnd
    //     ) {
    //       timeIn = firstHalfShiftStart;
    //       timeOut = firstHalfShiftEnd;
    //       lunchTimeIn = null;
    //       lunchTimeOut = null;
    //       isHalfDayLeave = true;
    //     }
    //     let customUpdateValues: any = isHalfDayLeave
    //       ? {
    //           isPresent: type.includes('Leave') ? 0 : 1,
    //           isLeave: type.includes('Leave') ? 1 : 0,
    //           isDayOff: 0,
    //           timeIn,
    //           timeOut,
    //           lunchTimeIn,
    //           lunchTimeOut,
    //           creditableOvertime: 0,
    //           // undertimeHours: attendanceApplication.undertimeHrs,
    //           // lateHours: attendanceApplication.lateHrs,
    //         }
    //       : {
    //           isPresent: type.includes('Leave') ? 0 : 1,
    //           isLeave: type.includes('Leave') ? 1 : 0,
    //           isDayOff: 0,
    //           creditableOvertime: 0,
    //         };

    //     const getAttendance: any = await Attendance.findOne({
    //       attributes: ['remarks'],
    //       where: {
    //         date: {
    //           [Op.gte]: fromDate,
    //           [Op.lte]: toDate,
    //         },
    //         employeeId: employeeId,
    //       },
    //     });

    //     let remarks = `[${type}: ${moment(
    //       attendanceApplication.timeFrom,
    //       'HH:mm:ss'
    //     ).format('LT')}-${moment(
    //       attendanceApplication.timeTo,
    //       'HH:mm:ss'
    //     ).format('LT')}]`;
    //     await Attendance.update(
    //       {
    //         ...customUpdateValues,
    //         remarks:
    //           getAttendance && getAttendance.remarks
    //             ? `${getAttendance.remarks}, [${remarks}]`
    //             : remarks,
    //       },
    //       {
    //         where: {
    //           date: {
    //             [Op.gte]: fromDate,
    //             [Op.lte]: toDate,
    //           },
    //           employeeId: employeeId,
    //         },
    //       }
    //     );
    //   } else if (type === 'Overtime') {
    //     const decimalValue = numberOfHours % 1;
    //     if (decimalValue >= 0.0 && decimalValue < 0.5) {
    //       // remove all decimal points
    //       numberOfHours = Math.trunc(numberOfHours);
    //     } else if (decimalValue >= 0.5 && decimalValue <= 0.99) {
    //       // remove all decimal values then add .5 after
    //       numberOfHours = Math.trunc(numberOfHours);
    //       numberOfHours += 0.5;
    //     }

    //     await Attendance.update(
    //       {
    //         overtimeHours: numberOfHours,
    //       },
    //       {
    //         where: {
    //           date: dateOvertime,
    //           employeeId: employeeId,
    //         },
    //       }
    //     );
    //   } else if (type == 'Change Schedule') {
    //     const changeSchedules = await ChangedSchedule.findAll({
    //       where: {
    //         attendanceAppId: attendanceAppId,
    //       },
    //     });

    //     // Check if there are any active Leave applications for the same date
    //     for (let i = 0; i < changeSchedules.length; i++) {
    //       const changeSchedule: any = changeSchedules[i];

    //       const attendanceData: any = await Attendance.findOne({
    //         where: {
    //           date: changeSchedule.date,
    //           employeeId: employeeId,
    //         },
    //       });

    //       if (attendanceData && attendanceData.isLeave) {
    //         return NextResponse.json({
    //           severity: 'error',
    //           summary: `There's an active Leave application for ${attendanceData.date}`,
    //         });
    //       }
    //     }

    //     for (let i = 0; i < changeSchedules.length; i++) {
    //       const changeSchedule: any = changeSchedules[i];

    //       const attendanceData: any = await Attendance.findOne({
    //         where: {
    //           date: changeSchedule.date,
    //           employeeId: employeeId,
    //         },
    //       });

    //       if (attendanceData) {
    //         const dataToUpdate: any = {
    //           isPresent: 1,
    //           isDayOff: 0,
    //           isHalfDay: 0,
    //           lateHours: 0,
    //           undertimeHours: 0,
    //           creditableOvertime: 0,
    //         };
    //         let remarks = null;

    //         if (changeSchedule.typeOfChange == 'CHANGE DAY-OFF') {
    //           dataToUpdate.isDayOff = 1;
    //           dataToUpdate.isPresent = 0;
    //           dataToUpdate.isHalfDay = 0;
    //           remarks = `[${type}: Day-off]`;

    //           dataToUpdate['timeIn'] = changeSchedule.timeIn;
    //           dataToUpdate['timeOut'] = changeSchedule.timeOut;
    //           dataToUpdate['lunchTimeOut'] = changeSchedule.lunchStart;
    //           dataToUpdate['lunchTimeIn'] = changeSchedule.lunchEnd;
    //         } else if (changeSchedule.typeOfChange == 'CHANGE SHIFT SCHEDULE') {
    //           if (attendanceData.isPresent == 1) {
    //             const computeAttendance: any = await computeUndertimeLateHours({
    //               employeeLogDetails: {
    //                 date: changeSchedule.date,
    //                 timeIn: attendanceData.timeIn,
    //                 lunchTimeOut: attendanceData.lunchTimeOut,
    //                 lunchTimeIn: attendanceData.lunchTimeIn,
    //                 timeOut: attendanceData.timeOut,
    //               },
    //               shiftDetails: changeSchedule,
    //             });

    //             if (computeAttendance.success) {
    //               dataToUpdate.isHalfDay = computeAttendance.data.isHalfDay;
    //               dataToUpdate.lateHours = computeAttendance.data.lateHours;
    //               dataToUpdate.undertimeHours =
    //                 computeAttendance.data.undertimeHours;
    //               dataToUpdate.isPresent = 1;
    //               dataToUpdate.creditableOvertime =
    //                 computeAttendance.data.creditableOvertime;
    //             }
    //           }

    //           remarks = `[${type}: ${moment(
    //             changeSchedule.timeIn,
    //             'HH:mm:ss'
    //           ).format('LT')}-${moment(
    //             changeSchedule.timeOut,
    //             'HH:mm:ss'
    //           ).format('LT')}]`;
    //         }

    //         // Update attendance record
    //         await Attendance.update(
    //           {
    //             ...dataToUpdate,
    //             remarks:
    //               attendanceData && attendanceData.remarks
    //                 ? `${attendanceData.remarks}, ${remarks}`
    //                 : remarks,
    //           },
    //           {
    //             where: {
    //               attendanceId: attendanceData.attendanceId,
    //               isPosted: 0,
    //             },
    //           }
    //         );
    //       }
    //     }
    //   }
    // } else if (action == 'UNDO APPROVAL') {
    //   const changeSchedules = await ChangedSchedule.findAll({
    //     where: {
    //       attendanceAppId: attendanceAppId,
    //     },
    //   });

    //   for (let i = 0; i < changeSchedules.length; i++) {
    //     const changeSchedule: any = changeSchedules[i];

    //     const attendanceData: any = await Attendance.findOne({
    //       where: {
    //         date: changeSchedule.date,
    //         employeeId: employeeId,
    //       },
    //     });

    //     if (attendanceData) {
    //       // Update attendance record
    //       await Attendance.update(
    //         {
    //           isHalfDay: 0,
    //           lateHours: 0,
    //           undertimeHours: 0,
    //           creditableOvertime: 0,
    //           remarks: null,
    //         },
    //         {
    //           where: {
    //             attendanceId: attendanceData.attendanceId,
    //             isPosted: 0,
    //           },
    //         }
    //       );
    //     }
    //   }
    // }

    // let status = 0;
    // let logMessage = '';
    // let responseMessage = '';
    // if (action == 'APPROVE') {
    //   status = 1;
    //   logMessage = `User approved the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    //   responseMessage = `${type} application has been approved`;
    // } else if (action == 'DISAPPROVE') {
    //   status = 3;
    //   logMessage = `User disapproved the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    //   responseMessage = `${type} application has been disapproved`;
    // } else if (action == 'CANCEL') {
    //   status = 2;
    //   logMessage = `User cancelled the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    //   responseMessage = `${type} application has been cancelled`;
    // } else if (action == 'UNDO APPROVAL') {
    //   status = 0;
    //   logMessage = `User undo the approval of the ${type} application of ${employee.employee_profile?.employeeFullName}`;
    //   responseMessage = `${type} application has been undo approved`;
    // }

    // await AttendanceApplication.update(
    //   {
    //     isApproved: status,
    //   },
    //   {
    //     where: {
    //       attendanceAppId: attendanceAppId,
    //     },
    //   }
    // );

    // await activityLog.create({
    //   companyId: companyId,
    //   userId: seshData.userId,
    //   message: logMessage,
    // });

    return NextResponse.json(res);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error submitting attendance application:', error.message);
    } else console.log(error);
    return NextResponse.json({
      success: false,
      summary: error.message,
      error: error,
    });
  }
}
