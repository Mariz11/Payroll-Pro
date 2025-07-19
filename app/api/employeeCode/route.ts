import { dateTimeFormatter, getPreviousMonthWithYear } from '@utils/attendance';
import {
  computeUndertimeLateHours,
  getCurrentOrNewShiftDetails,
  getCycleDates,
  getWeeklyCycles,
} from '@utils/companyDetailsGetter';
import getNightDifferentialHours from '@utils/getNightDifferentialHours';
import { hasHtmlTags, hasSQLKeywords, removeExtraSpaces } from '@utils/helper';
import { formatTimeToAMPM } from '@utils/helper';
import {
  isValidTokenForAttendancePortal,
  sessionDataForManualLogin,
} from '@utils/jwt';
import {
  Employee,
  Attendance,
  CompanyPayCycle,
  Company,
  Shift,
  Department,
  PayrollType,
  User,
} from 'db/models';
import company from 'db/models/company';
import shift from 'db/models/shift';
import moment from '@constant/momentTZ';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { getRequestLogger } from '@utils/logger';

const attendanceDateRegex = /^\d{4}-\d{2}-\d{2}$/;
export async function PATCH(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionDataForManualLogin();
  const { employeeCode, loggedTime, companyId, dateOverride } =
    await req.json();
  const tokenValid = await isValidTokenForAttendancePortal(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (hasHtmlTags(employeeCode)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }
  if (hasSQLKeywords(employeeCode)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible SQL keywords' },
      { status: 400 }
    );
  }
  try {
    const currentlyLoggedInUser: any = await User.findOne({
      where: {
        userId: seshData.userId,
      },
    });
    const employee: any = await Employee.findOne({
      where: {
        employeeCode: employeeCode,
        companyId: companyId,
        // employeeStatus: 1,
      },
      include: [
        {
          model: Department,
          include: [
            {
              model: PayrollType,
            },
          ],
        },
      ],
    });

    if (employee) {
      if (
        currentlyLoggedInUser.role === 'EMPLOYEE' &&
        employee.employeeId !== currentlyLoggedInUser.employeeId
      ) {
        return NextResponse.json({
          message: 'Only Admin can Enter Other Employees Code',
          status: 401,
        });
      }
      if (!employee.department) {
        return NextResponse.json({
          message:
            'No department assigned for this employee. Kindly reach out your administrator',
          status: 404,
        });
      }
      if (!employee.department.payrollTypeId) {
        return NextResponse.json({
          message:
            'Payroll Cycle for this employee is not yet configured. Kindly reach out your administrator',
          status: 404,
        });
      }
      if (!employee.shiftId) {
        return NextResponse.json({
          message:
            'We apologize for any inconvenience.  You do not have any scheduled shifts today. Kindly reach out your administrator',
          status: 401,
        });
      }
      if (employee.department.payroll_type.type == 'SEMI-WEEKLY') {
        return NextResponse.json({
          message:
            'Semi-weekly attendances are not available for manual attendance',
          status: 401,
        });
      }
      if (dateOverride && !attendanceDateRegex.test(dateOverride)) {
        return NextResponse.json({
          message: 'Invalid Override Date Format',
          status: 401,
        });
      }
      let attendanceDate = dateOverride
        ? dateOverride
        : moment().format('YYYY-MM-DD');
      const { employeeId } = employee;
      const getShiftDetails = await getCurrentOrNewShiftDetails({
        employeeId: employeeId,
        attendanceDate: attendanceDate,
      });
      const shiftDetails = getShiftDetails.shift;
      employee.dataValues.shift = shiftDetails;

      const shiftTimeIn = shiftDetails.timeIn;
      const shiftTimeOut = shiftDetails.timeOut;

      // if (shiftTimeIn > loggedTime && shiftTimeOut > loggedTime) {
      //   attendanceDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
      // }
      if (!dateOverride) {
        const dateYesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
        const existingAttendanceYesterday: any = await Attendance.findOne({
          where: {
            employeeId: employeeId,
            date: dateYesterday,
            isPosted: false,
            isPresent: true,
            timeIn: {
              [Op.not]: null,
            },
            timeOut: null,
            manualLoginAction: {
              [Op.not]: null,
            },
          },
        });
        if (existingAttendanceYesterday) {
          attendanceDate = dateYesterday;
        }
      }

      const attendance: any = await Attendance.findOne({
        where: {
          employeeId: employeeId,
          date: attendanceDate,
          deletedAt: null,
        },
      });

      if (attendance && attendance.isPosted) {
        return NextResponse.json({
          message: 'Existing Attendance',
          data: {
            employeeData: employee,
          },
          status: 200,
        });
      } else {
        return NextResponse.json({
          message: 'New Attendance',
          data: {
            employeeData: employee,
            attendanceData: attendance,
          },
          status: 200,
        });
      }
    } else {
      return NextResponse.json({
        message: 'Employee not Found',
        status: 404,
      });
    }
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidTokenForAttendancePortal(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const params = req.url.split('?')[1];
    const attendanceAction = params.split('&')[0]?.split('=')[1];
    const { employeeData, loggedTime, companyId, dateOverride } =
      await req.json();
    let loggedTimeWithZeroSeconds = loggedTime.slice(0);
    loggedTimeWithZeroSeconds = loggedTimeWithZeroSeconds.slice(0, 6) + '00';
    // console.log('time!', loggedTimeWithZeroSeconds);
    const departmentDetails = employeeData.department;
    if (dateOverride && !attendanceDateRegex.test(dateOverride)) {
      return NextResponse.json({
        message: 'Invalid Override Date Format',
        status: 401,
      });
    }
    let attendanceDate: any = dateOverride
      ? dateOverride
      : moment().format('YYYY-MM-DD');
    // console.log('date!');
    // console.log(attendanceDate);
    const shiftDetails = employeeData.shift;
    const shiftTimeIn = shiftDetails.timeIn;
    const shiftTimeOut = shiftDetails.timeOut;
    const companyDetails: any = await company.findByPk(companyId);
    const logger = getRequestLogger(req as NextRequest);

    // if (shiftTimeIn > loggedTime && shiftTimeOut > loggedTime) {
    //   attendanceDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    // }
    // if (!dateOverride) {
    const dateYesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const existingAttendanceYesterday: any = await Attendance.findOne({
      where: {
        employeeId: employeeData.employeeId,
        date: dateYesterday,
        isPosted: false,
        isPresent: true,
        timeIn: {
          [Op.not]: null,
        },
        timeOut: null,
        manualLoginAction: {
          [Op.not]: null,
        },
      },
    });
    if (existingAttendanceYesterday) {
      attendanceDate = dateYesterday;
    }
    // }

    const existingAttendance: any = await Attendance.findOne({
      where: {
        employeeId: employeeData.employeeId,
        date: attendanceDate,
      },
    });
    // console.log('existing!');
    // console.log(existingAttendance);
    if (existingAttendance && existingAttendance.isPosted) {
      return NextResponse.json({
        success: false,
        message: `Attendance already posted for this date`,
        status: 200,
      });
    }
    type AttendanceData = {
      employeeId: number;
      companyId: string;
      departmentId: string;
      date: string;
      timeIn: string | null;
      timeOut: string | null;
      lunchTimeIn: string | null;
      lunchTimeOut: string | null;
      overtimeHours: number;
      underTime: number;
      lateHours: number;
      nightDiffHours: number;
      undertimeHours: number;
      businessMonth: string;
      cycle: string;
      manualLoginAction: string | null;
      isDayOff: boolean;
    };
    let attendanceData = [] as AttendanceData[];

    let cycleName: any = null;
    if (!existingAttendance) {
      // console.log(employeeData.companyId);
      const payrollType: any = await PayrollType.findOne({
        where: {
          payrollTypeId: employeeData.department.payrollTypeId,
        },
        include: [
          {
            model: CompanyPayCycle,
            where: {
              companyId: employeeData.companyId,
            },
          },
        ],
      });
      const { type, company_pay_cycles } = payrollType;

      if (type == 'WEEKLY') {
        let businessMonth = `${moment(attendanceDate).format(
          'MMMM'
        )} ${moment().format('YYYY')}`;
        const payDate = company_pay_cycles[0].payDate;
        let weeklyCycles: any = await getWeeklyCycles({
          selectedMonth: businessMonth,
          payDay: payDate,
        });
        // console.log('ok3');
        let weeklyCycle = weeklyCycles.find((i: any) => {
          const startDate = moment(i.payDate).subtract(6, 'days');
          const endDate = moment(i.payDate);
          return (
            startDate <= moment(attendanceDate) &&
            endDate >= moment(attendanceDate)
          );
        });
        // console.log('ok4');
        if (!weeklyCycle) {
          businessMonth = getPreviousMonthWithYear(businessMonth);
          weeklyCycles = await getWeeklyCycles({
            selectedMonth: businessMonth,
            payDay: payDate,
          });
          weeklyCycle = weeklyCycles.find((i: any) => {
            const startDate = moment(i.payDate).subtract(6, 'days');
            const endDate = moment(i.payDate);
            return (
              startDate <= moment(attendanceDate) &&
              endDate >= moment(attendanceDate)
            );
          });
          if (!weeklyCycle) {
            return NextResponse.json({
              message: 'No Cycle Found',
              status: 404,
            });
          }
        }

        cycleName = weeklyCycle.name;
        // console.log('ok5');
        // console.log(companyId);
        const cycleDates = await getCycleDates({
          cycle: weeklyCycle.name,
          businessMonth: businessMonth,
          payrollType: type,
          companyIdFromManual: companyId,
        });
        // console.log('ok6');
        // console.log(companyId);
        // attendanceData = cycleDates.map((cycleDate: AttendanceData) => ({
        //   employeeId: employeeData.employeeId,
        //   companyId: companyId,
        //   departmentId: departmentDetails.departmentId,
        //   businessMonth: businessMonth,
        //   cycle: cycleName,
        //   date: cycleDate,
        //   timeIn: null,
        //   timeOut: null,
        //   lunchTimeIn: null,
        //   lunchTimeOut: null,
        //   overtimeHours: 0,
        //   underTime: 0,
        //   lateHours: 0,
        //   nightDiffHours: 0,
        //   undertimeHours: 0,
        //   manualLoginAction: 'LUNCH_OUT',
        // }));
        for (const cycleDate of cycleDates) {
          const employeeDaysOff =
            employeeData.dayOff === '' ? [] : employeeData.dayOff.split(',');
          let dayOfTheWeek = moment(cycleDate).format('dddd');
          let formattedDate = moment(cycleDate).format('YYYY-MM-DD');
          let isDayOffOfEmployee: boolean =
            employeeDaysOff &&
            employeeDaysOff.some(
              (dayOff: string) =>
                removeExtraSpaces(dayOff.toUpperCase()) ===
                dayOfTheWeek.toUpperCase()
            );

          const getShiftDetails = await getCurrentOrNewShiftDetails({
            employeeId: employeeData.employeeId,
            attendanceDate: formattedDate,
          });

          if (getShiftDetails.success) {
            if (getShiftDetails.isDayOff) {
              isDayOffOfEmployee = true;
            }
          }

          // console.log('hello world');
          attendanceData.push({
            employeeId: employeeData.employeeId,
            companyId: companyId,
            departmentId: departmentDetails.departmentId,
            businessMonth: businessMonth,
            cycle: cycleName,
            date: cycleDate,
            timeIn: null,
            timeOut: null,
            lunchTimeIn: null,
            lunchTimeOut: null,
            overtimeHours: 0,
            underTime: 0,
            lateHours: 0,
            nightDiffHours: 0,
            undertimeHours: 0,
            manualLoginAction: 'LUNCH_OUT',
            isDayOff: isDayOffOfEmployee,
          });
        }
      } else {
        for (let i = 0; i < company_pay_cycles.length; i++) {
          let breakLoop = false;
          let businessMonth = `${moment(attendanceDate).format(
            'MMMM'
          )} ${moment().format('YYYY')}`;
          let { cycle, cutOffStartDate, cutOffEndDate, preferredMonth } =
            company_pay_cycles[i];

          const attendanceDateNumber = Number(
            moment(attendanceDate).format('DD')
          );
          cutOffStartDate = Number(cutOffStartDate);
          cutOffEndDate = Number(cutOffEndDate);

          let startDate;
          let endDate;

          if (cutOffStartDate < cutOffEndDate) {
            console.log('okr1');
            if (preferredMonth.toUpperCase() == 'PREVIOUS') {
              if (
                cutOffStartDate <= attendanceDateNumber &&
                attendanceDateNumber <= 31
              ) {
                businessMonth = moment(businessMonth)
                  .add(1, 'months')
                  .format('MMMM YYYY');
              }
              const prevBusinessMonth = moment(businessMonth)
                .subtract(1, 'months')
                .format('MMMM YYYY');
              startDate = moment(
                `${prevBusinessMonth} ${cutOffStartDate}`
              ).format('YYYY-MM-DD');
              endDate = moment(`${prevBusinessMonth} ${cutOffEndDate}`).format(
                'YYYY-MM-DD'
              );

              const cutOffStartMonthInWord = prevBusinessMonth;
              const cutOffStartMonthInNumber = moment(
                cutOffStartMonthInWord
              ).format('M');
              const cutOffStartYear = moment(cutOffStartMonthInWord).format(
                'YYYY'
              );
              if (cutOffEndDate > 28) {
                const correctDaysCount = new Date(
                  Number(cutOffStartYear),
                  Number(cutOffStartMonthInNumber),
                  0
                ).getDate();

                if (cutOffEndDate > correctDaysCount) {
                  endDate = moment(
                    `${prevBusinessMonth} ${correctDaysCount}`
                  ).format('YYYY-MM-DD');
                }
              }
            } else {
              startDate = moment(`${businessMonth} ${cutOffStartDate}`).format(
                'YYYY-MM-DD'
              );
              endDate = moment(`${businessMonth} ${cutOffEndDate}`).format(
                'YYYY-MM-DD'
              );

              const cutOffStartMonthInWord = businessMonth;
              const cutOffStartMonthInNumber = moment(
                cutOffStartMonthInWord
              ).format('M');
              const cutOffStartYear = moment(cutOffStartMonthInWord).format(
                'YYYY'
              );
              if (cutOffEndDate > 28) {
                const correctDaysCount = new Date(
                  Number(cutOffStartYear),
                  Number(cutOffStartMonthInNumber),
                  0
                ).getDate();

                if (cutOffEndDate > correctDaysCount) {
                  endDate = moment(
                    `${businessMonth} ${correctDaysCount}`
                  ).format('YYYY-MM-DD');
                }
              }
            }
          } else if (cutOffStartDate > cutOffEndDate) {
            console.log('okr2');
            if (preferredMonth.toUpperCase() == 'PREVIOUS') {
              if (
                cutOffStartDate <= attendanceDateNumber &&
                attendanceDateNumber <= 31
              ) {
                businessMonth = moment(businessMonth)
                  .add(1, 'months')
                  .format('MMMM YYYY');
              }

              const prevBusinessMonth = moment(businessMonth)
                .subtract(1, 'months')
                .format('MMMM YYYY');
              startDate = moment(
                `${prevBusinessMonth} ${cutOffStartDate}`
              ).format('YYYY-MM-DD');
              endDate = moment(`${businessMonth} ${cutOffEndDate}`).format(
                'YYYY-MM-DD'
              );

              const cutOffStartMonthInWord = prevBusinessMonth;
              const cutOffStartMonthInNumber = moment(
                cutOffStartMonthInWord
              ).format('M');
              const cutOffStartYear = moment(cutOffStartMonthInWord).format(
                'YYYY'
              );
              if (cutOffStartDate > 28) {
                const correctDaysCount = new Date(
                  Number(cutOffStartYear),
                  Number(cutOffStartMonthInNumber),
                  0
                ).getDate();

                if (cutOffStartDate > correctDaysCount) {
                  startDate = moment(`${businessMonth} 01`).format(
                    'YYYY-MM-DD'
                  );
                }
              }
            } else {
              const nextBusinessMonth = moment(businessMonth)
                .add(1, 'months')
                .format('MMMM YYYY');
              businessMonth = nextBusinessMonth;
              startDate = moment(`${businessMonth} ${cutOffStartDate}`);
              endDate = moment(`${nextBusinessMonth} ${cutOffEndDate}`);

              const cutOffStartMonthInWord = nextBusinessMonth;
              const cutOffStartMonthInNumber = moment(
                cutOffStartMonthInWord
              ).format('M');
              const cutOffStartYear = moment(cutOffStartMonthInWord).format(
                'YYYY'
              );
              if (cutOffStartDate > 28) {
                const correctDaysCount = new Date(
                  Number(cutOffStartYear),
                  Number(cutOffStartMonthInNumber),
                  0
                ).getDate();

                if (cutOffStartDate > correctDaysCount) {
                  startDate = moment(`${nextBusinessMonth} 01`);
                }
              }
            }
          }

          if (startDate && endDate) {
            if (startDate <= attendanceDate && endDate >= attendanceDate) {
              const employeeDaysOff =
                employeeData.dayOff === ''
                  ? []
                  : employeeData.dayOff.split(',');
              while (startDate <= endDate) {
                if (cycleName == null) {
                  if (
                    moment(attendanceDate).format('YYYY-MM-DD') ==
                    moment(startDate).format('YYYY-MM-DD')
                  ) {
                    breakLoop = true;
                    cycleName = cycle;
                  }
                }
                // dateArray.push(moment(startDate).format('YYYY-MM-DD'));

                let dayOfTheWeek = moment(startDate).format('dddd');
                let formattedDate = moment(startDate).format('YYYY-MM-DD');
                let isDayOffOfEmployee: any =
                  employeeDaysOff &&
                  employeeDaysOff.filter(
                    (dayOff: any) =>
                      removeExtraSpaces(dayOff.toUpperCase()) ==
                      dayOfTheWeek.toUpperCase()
                  ).length > 0
                    ? true
                    : false;
                const getShiftDetails = await getCurrentOrNewShiftDetails({
                  employeeId: employeeData.employeeId,
                  attendanceDate: formattedDate,
                });
                if (getShiftDetails.success) {
                  if (getShiftDetails.isDayOff) {
                    isDayOffOfEmployee = true;
                  }
                }
                attendanceData.push({
                  employeeId: employeeData.employeeId,
                  companyId: companyId,
                  departmentId: departmentDetails.departmentId,
                  businessMonth: businessMonth,
                  cycle: cycleName,
                  date: formattedDate,
                  timeIn: null,
                  timeOut: null,
                  lunchTimeIn: null,
                  lunchTimeOut: null,
                  overtimeHours: 0,
                  underTime: 0,
                  lateHours: 0,
                  nightDiffHours: 0,
                  undertimeHours: 0,
                  manualLoginAction: 'LUNCH_OUT',

                  isDayOff: isDayOffOfEmployee ? true : false,
                });
                startDate = moment(startDate)
                  .add(1, 'days')
                  .format('YYYY-MM-DD');
              }
            } else {
              continue;
            }
          }
        }
      }
    }

    switch (attendanceAction) {
      case 'TIME_IN':
        if (existingAttendance && existingAttendance.timeIn) {
          return NextResponse.json({
            success: false,
            message: `Attendance already has time in for this date`,
            status: 200,
          });
        }
        const attendanceDateFormatted = new Date(attendanceDate);
        const employeeTimeIn = await dateTimeFormatter(
          attendanceDateFormatted,
          loggedTimeWithZeroSeconds
        );
        const employeeTimeOut = await dateTimeFormatter(
          attendanceDateFormatted,
          loggedTimeWithZeroSeconds
        );
        const employeeLunchOut = await dateTimeFormatter(
          attendanceDateFormatted,
          loggedTimeWithZeroSeconds
        );

        const employeeLunchIn = await dateTimeFormatter(
          attendanceDateFormatted,
          loggedTimeWithZeroSeconds
        );

        const shiftTimeInWithDate = await dateTimeFormatter(
          attendanceDateFormatted,
          shiftDetails.timeIn
        );
        const shiftTimeOutWithDate = await dateTimeFormatter(
          attendanceDateFormatted,
          shiftDetails.timeOut
        );
        const shiftLunchInWithDate = shiftDetails.lunchTimeIn
          ? await dateTimeFormatter(
              attendanceDateFormatted,
              shiftDetails.lunchTimeIn
            )
          : null;
        const shiftLunchOutWithDate = shiftDetails.lunchTimeOut
          ? await dateTimeFormatter(
              attendanceDateFormatted,
              shiftDetails.lunchTimeOut
            )
          : null;

        try {
          const computeAttendance: any = await computeUndertimeLateHours({
            employeeLogDetails: {
              date: attendanceDate,
              timeIn: loggedTimeWithZeroSeconds,
              lunchTimeOut: loggedTimeWithZeroSeconds,
              lunchTimeIn: loggedTimeWithZeroSeconds,
              timeOut: loggedTimeWithZeroSeconds,
            },
            shiftDetails: shiftDetails,
            attendanceValues: {
              employeeTimeIn: employeeTimeIn,
              employeeLunchOut: employeeTimeOut,
              employeeLunchIn: employeeLunchIn,
              employeeTimeOut: employeeTimeOut,
              shiftTimeIn: shiftTimeInWithDate,
              shiftTimeOut: shiftTimeOutWithDate,
              shiftLunchStart: shiftLunchOutWithDate,
              shiftLunchEnd: shiftLunchInWithDate,
              attendanceDate: new Date(attendanceDate),
            },
            logger,
          });

          if (existingAttendance) {
            await Attendance.update(
              {
                isDayOff: false,
                isPresent: true,
                timeIn: loggedTimeWithZeroSeconds,
                lateHours: computeAttendance.data.lateHours,
                manualLoginAction: 'LUNCH_OUT',
              },
              {
                where: {
                  attendanceId: existingAttendance.attendanceId,
                },
              }
            );
          } else {
            await Attendance.bulkCreate(
              attendanceData.map((att: AttendanceData) => {
                if (att.date == attendanceDate) {
                  return {
                    ...att,
                    timeIn: loggedTimeWithZeroSeconds,
                    manualLoginAction: 'LUNCH_OUT',
                    isDayOff: false,
                  };
                }
                return {
                  ...att,
                  cycle: cycleName,
                  isPresent: false,
                };
              })
            );
          }

          return NextResponse.json({
            success: true,
            message: `You've timed in at ${formatTimeToAMPM(loggedTime, true)}`,
            status: 200,
          });
        } catch (error: any) {
          if (error.name && error.name === 'SequelizeDatabaseError')
            console.log(error);
          else
            return NextResponse.json(
              { success: false, message: error.message },
              { status: 500 }
            );
        }

      case 'LUNCH_OUT':
        try {
          if (
            !existingAttendance ||
            (existingAttendance && !existingAttendance.timeIn)
          ) {
            return NextResponse.json({
              success: false,
              message: 'Attendance for this date has no time in yet',
              status: 401,
            });
          }
          if (existingAttendance && existingAttendance.timeOut) {
            return NextResponse.json({
              success: false,
              message: `Cannot lunch out. Attendance already has time out for this date`,
              status: 200,
            });
          }
          if (existingAttendance && existingAttendance.lunchTimeOut) {
            return NextResponse.json({
              success: false,
              message: `Attendance already has lunch out for this date`,
              status: 200,
            });
          }
          await Attendance.update(
            {
              lunchTimeOut: loggedTime,
              manualLoginAction: 'LUNCH_IN',
              isPresent: true,
            },
            {
              where: {
                employeeId: employeeData.employeeId,
                date: attendanceDate,
                deletedAt: null,
                manualLoginAction: {
                  [Op.not]: null,
                },
              },
            }
          );

          return NextResponse.json({
            success: true,
            message: `You've lunch out at ${formatTimeToAMPM(
              loggedTime,
              true
            )}`,
            status: 200,
          });
        } catch (error: any) {
          if (error.name && error.name === 'SequelizeDatabaseError')
            console.log(error);
          else
            return NextResponse.json(
              { success: false, message: error.message },
              { status: 500 }
            );
        }

      case 'LUNCH_IN':
        try {
          if (
            !existingAttendance ||
            (existingAttendance && !existingAttendance.timeIn)
          ) {
            return NextResponse.json({
              success: false,
              message: 'Attendance for this date has no time in yet',
              status: 401,
            });
          }
          if (existingAttendance && !existingAttendance.lunchTimeOut) {
            return NextResponse.json({
              success: false,
              message: `Cannot lunch in. Attendance has no lunch out yet`,
              status: 200,
            });
          }
          if (existingAttendance && existingAttendance.timeOut) {
            return NextResponse.json({
              success: false,
              message: `Cannot lunch in. Attendance already has time out for this date`,
              status: 200,
            });
          }
          if (existingAttendance && existingAttendance.lunchTimeIn) {
            return NextResponse.json({
              success: false,
              message: `Attendance already has lunch in for this date`,
              status: 200,
            });
          }
          await Attendance.update(
            {
              lunchTimeIn: loggedTimeWithZeroSeconds,
              manualLoginAction: 'TIME_OUT',
              isPresent: true,
            },
            {
              where: {
                employeeId: employeeData.employeeId,
                date: attendanceDate,
                deletedAt: null,
                manualLoginAction: {
                  [Op.not]: null,
                },
              },
            }
          );

          return NextResponse.json({
            success: true,
            message: `You've lunch in at ${formatTimeToAMPM(loggedTime, true)}`,
            status: 200,
          });
        } catch (error: any) {
          if (error.name && error.name === 'SequelizeDatabaseError')
            console.log(error);
          else
            return NextResponse.json(
              { success: false, message: error.message },
              { status: 500 }
            );
        }

      default:
        try {
          if (
            !existingAttendance ||
            (existingAttendance && !existingAttendance.timeIn)
          ) {
            return NextResponse.json({
              success: false,
              message: 'Attendance for this date has no time in yet',
              status: 401,
            });
          }
          // console.log(existingAttendance);
          if (existingAttendance && existingAttendance.timeOut) {
            return NextResponse.json({
              success: false,
              message: `Attendance already has time out for this date`,
              status: 200,
            });
          }
          const attendanceDateFormatted = new Date(attendanceDate);
          const employeeTimeIn = await dateTimeFormatter(
            attendanceDateFormatted,
            existingAttendance.timeIn
          );
          const employeeTimeOut = await dateTimeFormatter(
            attendanceDateFormatted,
            loggedTimeWithZeroSeconds
          );
          // console.log('employeeTimeOut!');
          // console.log(loggedTimeWithZeroSeconds);
          // console.log('existingAttendance.lunchTimeOut!');
          // console.log(existingAttendance.timeIn);
          const employeeLunchOut = existingAttendance.lunchTimeOut
            ? await dateTimeFormatter(
                attendanceDateFormatted,
                existingAttendance.lunchTimeOut
              )
            : null;

          const employeeLunchIn = existingAttendance.lunchTimeIn
            ? await dateTimeFormatter(
                attendanceDateFormatted,
                existingAttendance.lunchTimeIn
              )
            : null;

          const shiftTimeInWithDate = await dateTimeFormatter(
            attendanceDateFormatted,
            shiftDetails.timeIn
          );
          const shiftTimeOutWithDate = await dateTimeFormatter(
            attendanceDateFormatted,
            shiftDetails.timeOut
          );
          const shiftLunchInWithDate = shiftDetails.lunchTimeIn
            ? await dateTimeFormatter(
                attendanceDateFormatted,
                shiftDetails.lunchTimeIn
              )
            : null;
          const shiftLunchOutWithDate = shiftDetails.lunchTimeOut
            ? await dateTimeFormatter(
                attendanceDateFormatted,
                shiftDetails.lunchTimeOut
              )
            : null;

          const computeAttendance: any = await computeUndertimeLateHours({
            employeeLogDetails: {
              date: attendanceDate,
              timeIn: existingAttendance.timeIn,
              lunchTimeOut: existingAttendance.lunchTimeOut,
              lunchTimeIn: existingAttendance.lunchTimeIn,
              timeOut: loggedTimeWithZeroSeconds,
            },
            shiftDetails: shiftDetails,
            attendanceValues: {
              employeeTimeIn: employeeTimeIn,
              employeeLunchOut: employeeLunchOut,
              employeeLunchIn: employeeLunchIn,
              employeeTimeOut: employeeTimeOut,
              shiftTimeIn: shiftTimeInWithDate,
              shiftTimeOut: shiftTimeOutWithDate,
              shiftLunchStart: shiftLunchOutWithDate,
              shiftLunchEnd: shiftLunchInWithDate,
              attendanceDate: new Date(attendanceDate),
            },
            logger,
          });

          let isHalfDay = false;
          let lateHrs = 0;
          let undertimeHours = 0;
          let creditableOvertime = 0;
          let isHalfDayIncomplete = false;
          // console.log('half!');
          // console.log(computeAttendance.data.isHalfDay);
          if (computeAttendance.success) {
            isHalfDay = computeAttendance.data.isHalfDay;
            lateHrs = computeAttendance.data.lateHours;
            undertimeHours = computeAttendance.data.undertimeHours;
            creditableOvertime = computeAttendance.data.creditableOvertime;
            isHalfDayIncomplete = computeAttendance.data.isHalfDayIncomplete;
          }
          // console.log('rez!');
          // console.log(isHalfDay);
          // console.log(isHalfDayIncomplete);

          logger.info({
            isPresent: existingAttendance.isPresent,
            nightDiff: companyDetails.nightDifferential,
            applyNightdiff: employeeData.department.applyNightDiff,
          });

          await Attendance.update(
            {
              isPresent: isHalfDay && isHalfDayIncomplete ? false : true,
              timeOut: loggedTimeWithZeroSeconds,
              undertimeHours: isHalfDay ? 0 : undertimeHours,
              lateHours: isHalfDay && isHalfDayIncomplete ? 0 : lateHrs,
              creditableOvertime: isHalfDay ? 0 : creditableOvertime,
              isHalfDay: isHalfDay && isHalfDayIncomplete ? false : isHalfDay,
              manualLoginAction: 'SHIFT_OUT',
              nightDiffHours:
                isHalfDay && isHalfDayIncomplete
                  ? 0
                  : existingAttendance.isPresent &&
                    companyDetails.nightDifferential &&
                    employeeData.department.applyNightDiff
                  ? getNightDifferentialHours(
                      attendanceDate,
                      moment(existingAttendance.timeIn, 'LT').isValid()
                        ? moment(existingAttendance.timeIn, 'LT').format(
                            'HH:mm:ss'
                          )
                        : null,
                      isHalfDay
                        ? null
                        : moment(
                            existingAttendance.lunchTimeOut,
                            'LT'
                          ).isValid()
                        ? moment(existingAttendance.lunchTimeOut, 'LT').format(
                            'HH:mm:ss'
                          )
                        : null,
                      isHalfDay
                        ? null
                        : moment(existingAttendance.lunchTimeIn, 'LT').isValid()
                        ? moment(existingAttendance.lunchTimeIn, 'LT').format(
                            'HH:mm:ss'
                          )
                        : null,
                      moment(loggedTimeWithZeroSeconds, 'LT').isValid()
                        ? moment(loggedTimeWithZeroSeconds, 'LT').format(
                            'HH:mm:ss'
                          )
                        : null,
                      companyDetails.nightDifferentialStartHour,
                      companyDetails.nightDifferentialEndHour,
                      shiftTimeIn
                    )
                  : 0,
            },
            {
              where: {
                employeeId: employeeData.employeeId,
                date: attendanceDate,
                deletedAt: null,
                manualLoginAction: {
                  [Op.not]: null,
                },
              },
            }
          );

          return NextResponse.json({
            success: true,
            message: `You've timed out at ${formatTimeToAMPM(
              loggedTime,
              true
            )}`,
            status: 200,
          });
        } catch (error: any) {
          if (error.name && error.name === 'SequelizeDatabaseError')
            console.log(error);
          else
            return NextResponse.json(
              { success: false, message: error.message },
              { status: 500 }
            );
        }
    }
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
  }
}
