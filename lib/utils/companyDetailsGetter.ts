'use server';
import { attendanceImportHeaders } from '@constant/csvData';
import {
  selectedCompanyData,
  sessionData,
  sessionDataForManualLogin,
} from '@utils/jwt';
import {
  Attendance,
  AttendanceApplication,
  ChangedSchedule,
  Company,
  CompanyPayCycle,
  Department,
  Employee,
  EmployeeProfile,
  Holiday,
  PayrollType,
  Shift,
  TaskProcesses,
  User,
} from 'db/models';
import moment from '@constant/momentTZ';
import { Op, QueryTypes } from 'sequelize';
import { removeExtraSpaces } from './helper';
import { executeQuery } from 'db/connection';
import {
  adjustTimesForNightShift,
  calculateHalfDayStatus,
  calculateLateHours,
  calculateUndertimeHours,
  calculateCreditableOvertime,
} from './employeeAttendanceUtil';

export async function getCompanyDetails(companyId: number) {
  try {
    const company = await Company.findOne({
      where: {
        companyId: companyId,
      },
    });

    if (company) {
      return company;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function logTaskProcess({
  taskCode,
  taskName,
  departmentName,
  businessMonth,
  cycle,
  status,
}: {
  taskCode: string | number;
  taskName: string;
  departmentName?: string | null;
  businessMonth?: string | null;
  cycle?: string | null;
  status: number;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  try {
    if (status == 0) {
      const res = await executeQuery(
        'tasks_processes_insert',
        {
          userId: seshData.userId,
          taskCode: taskCode,
          companyId: companyId,
          taskName: taskName,
          departmentName: departmentName,
          businessMonth: businessMonth,
          cycle: cycle,
          status: 0,
        },
        [],
        QueryTypes.INSERT
      );
    } else {
      const res = await executeQuery(
        `tasks_processes_update`,
        {
          p_taskCode: taskCode,
          p_userId: null,
          p_companyId: null,
          p_taskName: null,
          p_departmentName: null,
          p_businessMonth: null,
          p_cycle: null,
          status: 1,
        },
        [],
        QueryTypes.UPDATE
      );
    }
    return {
      success: true,
      message: status ? 'Successfully Updated' : 'Successfully Created',
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function interruptedProcesses({
  taskIds,
  action,
}: {
  taskIds: number[];
  action: 'get' | 'acknowledge';
}) {
  const seshData: any = await sessionData();

  try {
    if (action == 'get') {
      const stuckUpTasks: any = await TaskProcesses.findAll({
        attributes: [
          'taskId',
          'taskName',
          'departmentName',
          'businessMonth',
          'cycle',
        ],
        where: {
          userId: seshData.userId,
          status: 2,
        },
      });
      return JSON.stringify(stuckUpTasks);
    } else if (action == 'acknowledge') {
      return await TaskProcesses.update(
        {
          status: 1,
        },
        {
          where: {
            taskId: taskIds,
          },
        }
      );
    }
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function isCompanyProcessing({
  taskName,
  departmentName,
  businessMonth,
  cycle,
}: {
  taskName: string;
  departmentName: string;
  businessMonth: string;
  cycle: string;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const userId = seshData.userId;

  try {
    // Check first if the currently logged in user has an inprogress task
    // const hasOwnInprogressTask: any = await TaskProcesses.count({
    //   where: {
    //     userId: userId,
    //     taskName: taskName,
    //     status: 0,
    //   },
    // });
    // if (hasOwnInprogressTask > 0) {
    //   return true;
    // }

    // Check if there are any other certain tasks running for a certain department
    const [task]: any = await executeQuery('tasks_processes_count', {
      companyId: companyId,
      taskName: taskName,
      departmentName: departmentName,
      businessMonth: businessMonth,
      cycle: cycle,
      status: 0,
    });

    return task.count > 0;
  } catch (error) {
    console.log(error);
    return true;
  }
}

export async function formatAttendanceCSVData(data: any[]) {
  try {
    // clean up data remove rows with ,,,,,,
    const formattedData = data.filter((item) => {
      if (
        item.length >= 6 &&
        item[0] === '' &&
        item[1] === '' &&
        item[2] === '' &&
        item[3] === '' &&
        item[4] === '' &&
        item[5] === ''
      ) {
      } else {
        return item;
      }
    });

    const businessMonthCycle = formattedData[0][0];
    const businessMonth = removeExtraSpaces(businessMonthCycle.split('-')[0]);
    if (!moment(businessMonth, 'MMMM').isValid()) {
      return {
        success: false,
        message: `Incorrect Business Month Cycle. Please check and try again.`,
      };
    }
    const month = removeExtraSpaces(businessMonth.split(' ')[0]);
    let cycle = removeExtraSpaces(businessMonthCycle.split('-')[1]);
    if (businessMonthCycle.split('-').length > 2) {
      cycle += removeExtraSpaces(`-${businessMonthCycle.split('-')[2]}`);
    }
    // first second third fourth
    const nthCycle = !businessMonthCycle.split('-')[1]
      ? ''
      : removeExtraSpaces(cycle.split(' ')[0]);
    const wordAfterNthCycle = !businessMonthCycle.split('-')[1]
      ? ''
      : removeExtraSpaces(cycle.split(' ')[1]);
    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();
    const companyId = selectedCompData
      ? selectedCompData.companyId
      : seshData.companyId;
    const userId = seshData.userId;
    const monthArray = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const cycleArray = [
      'FIRST',
      'SECOND',
      'THIRD',
      'FOURTH',
      'FIFTH',
      'SIXTH',
      'SEVENTH',
      // for monthly cycle
      'MONTHLY',
    ];
    let visitedEmployeeCodes: any = {};
    const headers = attendanceImportHeaders;
    let loopOnAttendance = false;
    const finalData = [];
    const foundEmpty: any = [];

    let employeeCode = '';
    let employeeName = '';
    let semiWeeklyStartDate = null;
    let semiWeeklyEndDate = null;

    if (cycleArray.includes(nthCycle.toUpperCase())) {
      if (
        nthCycle !== 'MONTHLY' &&
        (monthArray.includes(month.toUpperCase()) ||
          wordAfterNthCycle !== 'CYCLE')
      ) {
        return {
          success: false,
          message: `Incorrect Business Month Cycle. Please check and try again.`,
        };
      }
    } else {
      const startDate = businessMonthCycle.split('-')[1].replaceAll('[', '');
      const endDate = businessMonthCycle.split('-')[2].replaceAll(']', '');
      const semiWeeklyRange = '[' + startDate + '-' + endDate + ']';
      if (semiWeeklyRange.startsWith('[') && semiWeeklyRange.endsWith(']')) {
        if (
          !moment(startDate, 'MM/DD/YYYY').isValid() ||
          !moment(endDate, 'MM/DD/YYYY').isValid()
        ) {
          return {
            success: false,
            message: `Incorrect Business Month Cycle. Please check and try again.`,
          };
        }
        // console.log('res!');
        // console.log(moment(startDate, 'MM/DD/YYYY').toDate());
        // console.log(moment(endDate, 'MM/DD/YYYY').toDate());
        semiWeeklyStartDate = moment(startDate, 'MM/DD/YYYY')
          .toDate()
          .toString();
        semiWeeklyEndDate = moment(endDate, 'MM/DD/YYYY').toDate().toString();
        const dayDifference = moment(semiWeeklyEndDate).diff(
          moment(semiWeeklyStartDate),
          'days'
        );
        if (dayDifference < 0 || dayDifference > 3) {
          return {
            success: false,
            message: `Incorrect Business Month Cycle. Please check and try again.`,
          };
        }
      } else {
        return {
          success: false,
          message: `Incorrect Business Month Cycle. Please check and try again.`,
        };
      }
    }

    if (!monthArray.includes(month)) {
      return {
        success: false,
        message: `Incorrect Business Month Cycle. Please check and try again.`,
      };
    }

    // get cycleDates first for the department
    const employeeDetails: any = await Employee.findOne({
      attributes: ['employeeId', 'departmentId', 'shiftId', 'companyId'],
      where: {
        employeeCode: formattedData[1][0],
        companyId: companyId,
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
        {
          model: EmployeeProfile,
          attributes: [
            'firstName',
            'lastName',
            'suffix',
            'middleName',
            'employeeFullName',
          ],
        },
      ],
    });

    if (!employeeDetails) {
      return {
        success: false,
        message: `Employee ID#${formattedData[1][0]}: No records matched on our database.`,
      };
    }

    if (employeeDetails && !employeeDetails.department) {
      return {
        success: false,
        message: `Employee ID#${formattedData[1][0]}: Not assigned to any department yet.`,
      };
    }

    if (employeeDetails && !employeeDetails.shiftId) {
      return {
        success: false,
        message: `Employee ID#${formattedData[1][0]}: Not assigned to any shift yet.`,
      };
    }

    if (formattedData[1][0].toUpperCase() === 'DATE') {
      return {
        success: false,
        message: `Missing Employee ID and Employee Name. Please check and try again`,
      };
    } else if (employeeDetails === null) {
      return {
        success: false,
        message: `Employee ID#${formattedData[1][0]}: No records matched on our database.`,
      };
    }

    const cycleDates = await getCycleDates({
      cycle: cycle,
      businessMonth: businessMonth,
      payrollType: employeeDetails.department.payroll_type.type,
      semiWeeklyStartDate: semiWeeklyStartDate,
      semiWeeklyEndDate: semiWeeklyEndDate,
    });

    // row Counter to traverse data per employee which will check if expectedRows per employee are the same
    let rowCounter = 1;
    const checkDate: any = [];

    for (let i = 1; i < formattedData.length; ) {
      // check if employee headers are complete this will be row 1

      if (rowCounter === 1) {
        employeeCode = removeExtraSpaces(formattedData[i][0]);
        if (visitedEmployeeCodes[employeeCode]) {
          return {
            success: false,
            message: `Employee ID#${employeeCode}: Duplicate Employee Code`,
          };
        }
        visitedEmployeeCodes[employeeCode] = true;
        employeeName = removeExtraSpaces(formattedData[i][1]);
        let employeeDetails: any = null;
        employeeDetails = await Employee.findOne({
          attributes: ['employeeId', 'departmentId', 'companyId'],
          where: {
            employeeCode: employeeCode,
            companyId: companyId,
          },
          include: [
            {
              model: EmployeeProfile,
              attributes: [
                'firstName',
                'lastName',
                'suffix',
                'middleName',
                'employeeFullName',
              ],
            },
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

        if (formattedData[i][0].toUpperCase() === 'DATE') {
          return {
            success: false,
            message: `Incorrect Business Month Cycle. Please check and try again.`,
          };
        } else if (
          employeeDetails === null
          // ||
          // (employeeDetails &&
          //   employeeDetails.employee_profile.employeeFullName != rowEmployeeName)
        ) {
          return {
            success: false,
            message: `Employee ID#${employeeCode}: No records matched on our database.`,
          };
        }

        rowCounter++;
        i++;
        continue;
      }
      // check if data labels are complete "DATE","TIME-IN","LUNCH-OUT","LUNCH-IN","TIME-OUT","STATUS (PRESENT/ABSENT/DAY-OFF/LEAVE)"
      else if (rowCounter == 2) {
        const checkHeaders: any = formattedData[i].filter((d: any) =>
          headers.some((h: any) => h.label.toLowerCase() == d.toLowerCase())
        );
        if (checkHeaders.length > 0) {
          if (checkHeaders.length == headers.length) {
            loopOnAttendance = true;
            rowCounter++;
            i++;
            continue;
          } else {
            return {
              success: false,
              message: `Mismatched column headers for [ID#${employeeCode} - ${employeeName}]`,
            };
          }
        } else {
          return {
            success: false,
            message: `Empty column headers for [ID#${employeeCode} - ${employeeName}]`,
          };
        }
      }
      // start checking attendance part which are rows 2 and beyond for each employee
      if (loopOnAttendance && rowCounter > 2) {
        if (!employeeDetails.departmentId) {
          return {
            success: false,
            message: `This employee [ID#${employeeCode} - ${employeeName}] has no department.`,
          };
        }

        if (!employeeDetails.department.payrollTypeId) {
          return {
            success: false,
            message: `${employeeDetails.department.departmentName} department must have a designated payroll cycle. Please check on the Payroll Cycles settings and try again.`,
          };
        }

        let obj: any = {
          businessMonth: businessMonth,
          cycle: cycle,
          employeeCode: removeExtraSpaces(employeeCode),
          employeeName: removeExtraSpaces(employeeName),
        };
        formattedData[i].forEach((item: any, index: number) => {
          const key = headers[index].key;
          if (key == 'date') {
            if (item != '') {
              const attendanceDateRow = rowCounter - 3;
              const checkNotBelongDate =
                cycleDates[attendanceDateRow] ===
                moment(item).format('YYYY-MM-DD');
              // console.log(cycleDates[attendanceDateRow]);
              // console.log(moment(item).format('YYYY-MM-DD') + '-->');
              if (!checkNotBelongDate) {
                checkDate.push(`[ID#${employeeCode} - ${employeeName}]`);
                loopOnAttendance = false;
              }
            }
          }

          obj[key] = item;
          if (key == 'status' && item.toUpperCase() == 'PRESENT') {
            if (
              !obj.date ||
              !obj.timeIn ||
              !obj.timeOut ||
              obj.date == '-' ||
              obj.timeIn == '-' ||
              obj.timeOut == '-'
            ) {
              foundEmpty.push(
                `${obj.employeeName} on [${
                  !obj.date || obj.date == '-'
                    ? 'DATE'
                    : !obj.timeIn || obj.timeIn == '-'
                    ? 'TIME-IN'
                    : !obj.timeOut || obj.timeOut == '-'
                    ? 'TIME-OUT'
                    : ''
                }] column`
              );
              return false;
            }
          }
          // console.log(key);
        });
        finalData.push(obj);

        if (
          moment(formattedData[i][0]).format('YYYY-MM-DD') ==
          cycleDates[cycleDates.length - 1]
        ) {
          loopOnAttendance = false;
          rowCounter = 1;
        } else {
          rowCounter++;
        }
        i++;
      } else {
        i++;
      }
    }

    if (checkDate.length > 0 || rowCounter !== 1) {
      return {
        success: false,
        message: `The CSV file contains invalid or null values. Please check and try again.`,
      };
    }

    if (foundEmpty.length > 0) {
      return {
        success: false,
        message: `Empty Cells found: ${foundEmpty.join(', ')}`,
      };
    }

    return {
      success: true,
      data: finalData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// export async function isDefaultCompanyAcct({ emailAddress }: { emailAddress: string }) {
//   try {
//     const user: any = await Company.count({
//       where: {
//         emailAddress: emailAddress,
//       },
//     });

//     if (
//       user.emailAddress.toLowerCase() ===
//       user.company.emailAddress.toLowerCase()
//     ) {
//       return true;
//     }
//     return false;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// }

export async function employeeLimitChecker({
  companyId,
  additional,
}: {
  companyId: number;
  additional: number;
}) {
  try {
    const [company]: any = await executeQuery(`companies_get_employees_size`, {
      companyId,
    });
    const { maxEmployee, employeesSize } = company;
    const newTotalEmployees = employeesSize + additional;

    return {
      isExceeded: newTotalEmployees > maxEmployee,
      availableSlots: maxEmployee - employeesSize,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getCycleDates({
  cycle,
  businessMonth,
  payrollType,
  semiWeeklyStartDate,
  semiWeeklyEndDate,
  // add companyIdFromManual if function is used outside default log in on paypro
  companyIdFromManual,
}: {
  cycle: string;
  businessMonth: string;
  payrollType: string;
  semiWeeklyStartDate?: string | null;
  semiWeeklyEndDate?: string | null;
  companyIdFromManual?: number | null;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const seshManualLoginData: any = await sessionDataForManualLogin();

  let companyId = -1;

  if (companyIdFromManual) {
    companyId = companyIdFromManual;
  } else {
    companyId =
      (selectedCompData ? selectedCompData?.companyId : seshData?.companyId) ||
      seshManualLoginData?.company?.companyId;
  }

  const cycleDataList: any = await executeQuery(
    `attendances_employees_get_cycle_data`,
    {
      companyId,
      cycle: payrollType == 'SEMI-MONTHLY' ? cycle : payrollType,
    }
  );
  const cycleData = cycleDataList.length > 0 ? cycleDataList[0] : null;

  let dateArray: any = [];
  if (!cycleData) return dateArray;

  let { payDate, cutOffStartDate, cutOffEndDate, preferredMonth } = cycleData;
  if (payrollType == 'SEMI-WEEKLY') {
    let currentDate = moment(semiWeeklyStartDate);
    while (currentDate <= moment(semiWeeklyEndDate)) {
      dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
      currentDate = moment(currentDate).add(1, 'days');
    }
  } else if (payrollType == 'WEEKLY') {
    const weeklyCycles: any = await getWeeklyCycles({
      selectedMonth: businessMonth,
      payDay: payDate,
    });
    const payDateOfTheWeek = weeklyCycles
      .filter((i: any) => i.name == cycle)
      .map((i: any) => i.payDate)[0];
    let startDate = moment(payDateOfTheWeek).subtract(6, 'days');
    while (moment(startDate) <= moment(payDateOfTheWeek)) {
      dateArray.push(moment(startDate).format('YYYY-MM-DD'));
      startDate = moment(startDate).add(1, 'days');
    }
  } else {
    const cutOffStartMonthInWord =
      preferredMonth.toUpperCase() == 'PREVIOUS'
        ? moment(businessMonth).subtract(1, 'months').format('MMMM YYYY')
        : businessMonth;
    const cutOffStartMonthInNumber = moment(cutOffStartMonthInWord).format('M');
    const cutOffStartYear = moment(cutOffStartMonthInWord).format('YYYY');

    cutOffStartDate = Number(cutOffStartDate);
    cutOffEndDate = Number(cutOffEndDate);

    let startDate;
    let endDate;
    if (cutOffStartDate < cutOffEndDate) {
      if (preferredMonth.toUpperCase() == 'PREVIOUS') {
        const prevBusinessMonth = moment(businessMonth)
          .subtract(1, 'months')
          .format('MMMM YYYY');
        startDate = moment(`${prevBusinessMonth} ${cutOffStartDate}`);
        endDate = moment(`${prevBusinessMonth} ${cutOffEndDate}`);

        if (cutOffEndDate > 28) {
          const correctDaysCount = new Date(
            Number(cutOffStartYear),
            Number(cutOffStartMonthInNumber),
            0
          ).getDate();

          if (cutOffEndDate > correctDaysCount) {
            endDate = moment(`${prevBusinessMonth} ${correctDaysCount}`);
          }
        }
      } else {
        startDate = moment(`${businessMonth} ${cutOffStartDate}`);
        endDate = moment(`${businessMonth} ${cutOffEndDate}`);

        if (cutOffEndDate > 28) {
          const correctDaysCount = new Date(
            Number(cutOffStartYear),
            Number(cutOffStartMonthInNumber),
            0
          ).getDate();

          if (cutOffEndDate > correctDaysCount) {
            endDate = moment(`${businessMonth} ${correctDaysCount}`);
          }
        }
      }
    } else if (cutOffStartDate > cutOffEndDate) {
      if (preferredMonth.toUpperCase() == 'PREVIOUS') {
        const prevBusinessMonth = moment(businessMonth)
          .subtract(1, 'months')
          .format('MMMM YYYY');
        startDate = moment(`${prevBusinessMonth} ${cutOffStartDate}`);
        endDate = moment(`${businessMonth} ${cutOffEndDate}`);

        if (cutOffStartDate > 28) {
          const correctDaysCount = new Date(
            Number(cutOffStartYear),
            Number(cutOffStartMonthInNumber),
            0
          ).getDate();

          if (cutOffStartDate > correctDaysCount) {
            startDate = moment(`${businessMonth} 01`);
          }
        }
      } else {
        const nextBusinessMonth = moment(businessMonth)
          .add(1, 'months')
          .format('MMMM YYYY');
        startDate = moment(`${businessMonth} ${cutOffStartDate}`);
        endDate = moment(`${nextBusinessMonth} ${cutOffEndDate}`);

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
      while (startDate <= endDate) {
        dateArray.push(moment(startDate).format('YYYY-MM-DD'));
        startDate = moment(startDate).add(1, 'days');
      }
    }
  }

  return dateArray;
}

export async function getWeeklyCycles({
  selectedMonth,
  payDay,
}: {
  selectedMonth: string;
  payDay: string;
}) {
  const lastDayOfMonth = moment(selectedMonth).endOf('month').format('DD');

  const days = [];
  for (let i = 1; i <= Number(lastDayOfMonth); i++) {
    const dayNames = moment(`${i} ${selectedMonth}`)
      .format('dddd')
      .toUpperCase();
    const date = moment(`${i} ${selectedMonth}`).format('YYYY-MM-DD');
    days.push({
      day: dayNames,
      date: date,
    });
  }
  const monthOnly = selectedMonth.split(' ')[0];

  const filteredDays = days.filter((i: any) => {
    if (i.day == payDay) {
      return true;
    }
  });
  const lastDayofFilteredDays = filteredDays[filteredDays.length - 1];
  if (
    !lastDayofFilteredDays ||
    !lastDayofFilteredDays.date ||
    !moment(lastDayofFilteredDays.date).isValid()
  ) {
    return;
  }
  if (moment(lastDayofFilteredDays.date).format('DD') !== lastDayOfMonth) {
    let dateOfFDLastDay = moment(lastDayofFilteredDays.date)
      .add(1, 'days')
      .format('YYYY-MM-DD');
    while (
      moment(dateOfFDLastDay).format('dddd').toUpperCase() !=
      payDay.toUpperCase()
    ) {
      dateOfFDLastDay = moment(dateOfFDLastDay)
        .add(1, 'days')
        .format('YYYY-MM-DD');

      if (
        moment(dateOfFDLastDay).format('dddd').toUpperCase() ==
        payDay.toUpperCase()
      ) {
        days.push({
          day: moment(dateOfFDLastDay).format('dddd').toUpperCase(),
          date: dateOfFDLastDay,
        });
      }
    }
  }
  // console.log(days);

  return days
    .filter((i: any) => {
      // check if starting day of the cycle falls within the same month
      const currentDayMinus6 = moment(i.date).subtract(6, 'days');

      return currentDayMinus6.format('MMMM') == monthOnly && i.day == payDay;
    })
    .map((d, index) => {
      let cycle = '';
      let date = '';
      switch (index) {
        case 0:
          cycle = 'FIRST CYCLE';
          date = d.date;
          break;
        case 1:
          cycle = 'SECOND CYCLE';
          date = d.date;
          break;
        case 2:
          cycle = 'THIRD CYCLE';
          date = d.date;
          break;
        case 3:
          cycle = 'FOURTH CYCLE';
          date = d.date;
          break;
        case 4:
          cycle = 'FIFTH CYCLE';
          date = d.date;
          break;
      }
      return { name: cycle, code: cycle, payDate: date };
    })
    .filter((i: any) => i.name != '');
}
export async function getDepartmentDetails(departmentId: number) {
  try {
    const department: any = await Department.findOne({
      where: {
        departmentId: departmentId,
      },
      attributes: ['departmentId', 'departmentName', 'applyNightDiff'],
    });

    if (department) {
      return {
        success: true,
        department: department,
      };
    } else
      return {
        success: false,
        department: null,
      };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      department: null,
    };
  }
}

export async function computeUndertimeLateHours({
  employeeLogDetails,
  shiftDetails,
  attendanceValues,
}: {
  employeeLogDetails: EmployeeLogDetails;
  shiftDetails: ChangeSchedule;
  attendanceValues: {
    employeeTimeIn: any;
    employeeLunchOut: any;
    employeeLunchIn: any;
    employeeTimeOut: any;
    shiftTimeIn: any;
    shiftTimeOut: any;
    shiftLunchStart: any;
    shiftLunchEnd: any;
    attendanceDate: Date;
  };
}) {
  try {
    const {
      employeeTimeIn,
      employeeLunchOut,
      employeeLunchIn,
      employeeTimeOut,
      shiftTimeIn,
      shiftTimeOut,
      shiftLunchStart,
      shiftLunchEnd,
    } = attendanceValues;

    // Validate required times
    if (!employeeTimeIn || !employeeTimeOut || !shiftTimeIn || !shiftTimeOut) {
      return {
        success: false,
        payload: { employeeLogDetails, shiftDetails },
        data: {
          hoursWorked: 0,
          lateHours: 0,
          isHalfDay: false,
          undertimeHours: 0,
          creditableOvertime: 0,
        },
      };
    }

    const halfDay = Number((shiftDetails.workingHours / 2).toFixed(2));

    // Adjust times for night shifts
    const adjustedTimes = adjustTimesForNightShift({
      employeeTimeIn,
      employeeTimeOut,
      shiftTimeIn,
      shiftTimeOut,
      shiftLunchStart,
      shiftLunchEnd,
      employeeLunchOut,
      employeeLunchIn,
    });

    // Calculate half day status
    const { isHalfDay, isHalfDayIncomplete } = calculateHalfDayStatus(
      adjustedTimes,
      halfDay
    );

    // Calculate all metrics
    const lateHours = calculateLateHours(
      adjustedTimes.employeeTimeIn,
      adjustedTimes.shiftTimeIn
    );

    const undertimeHours = calculateUndertimeHours(
      adjustedTimes.employeeTimeOut,
      adjustedTimes.shiftTimeOut,
      adjustedTimes.shiftLunchStart,
      adjustedTimes.shiftLunchEnd
    );

    const calculatedCreditableOvertime = calculateCreditableOvertime(
      adjustedTimes.employeeTimeOut,
      adjustedTimes.shiftTimeOut
    );

    const creditableOvertime = isHalfDay ? 0 : calculatedCreditableOvertime;

    return {
      success: true,
      payload: { employeeLogDetails, shiftDetails },
      data: {
        hoursWorked: shiftDetails.workingHours - (undertimeHours + lateHours),
        lateHours,
        isHalfDay: isHalfDay,
        undertimeHours,
        creditableOvertime,
        isHalfDayIncomplete: isHalfDayIncomplete,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error,
      message: error.message,
    };
  }
}

export async function getCurrentOrNewShiftDetails({
  employeeId,
  attendanceDate,
}: {
  employeeId: number;
  attendanceDate: string;
}) {
  try {
    let isNewShift = false;
    let dayOff: boolean = false;

    let [shiftDetails]: any = await executeQuery(
      `attendances_bulkimport_get_shift`,
      {
        employeeId,
      }
    );

    if (!shiftDetails?.shiftId) {
      return {
        success: false,
        code: 'NO_SHIFT_ASSIGNED',
      };
    }

    const [newShift]: any = await executeQuery(
      `attendances_bulkimport_get_change_sched`,
      {
        isApproved: 1,
        employeeId,
        type: 'Change Schedule',
        date: moment(attendanceDate).format('YYYY-MM-DD'),
      }
    );

    if (newShift) {
      const changedSchedule = newShift;
      isNewShift = true;
      if (changedSchedule.typeOfChange == 'CHANGE DAY-OFF') {
        dayOff = true;
      } else if (changedSchedule.typeOfChange == 'CHANGE SHIFT SCHEDULE') {
        shiftDetails = { ...changedSchedule };
      }
    }

    return {
      success: true,
      isNewShift: isNewShift,
      isDayOff: dayOff,
      shift: shiftDetails,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error,
      message: error.message,
    };
  }
}

export async function getPremiumAttendanceBreakdown({
  employeeDetails: { employeeId, departmentId, daysOff },
  attendanceDetails: { businessMonth, cycle },
}: {
  employeeDetails: {
    employeeId: number;
    departmentId: number;
    daysOff: string | string[];
  };
  attendanceDetails: {
    businessMonth: string;
    cycle: string;
  };
}) {
  try {
    const attendanceResult: any = await executeQuery(
      'attendances_get_holidays',
      {
        employeeId: employeeId ?? undefined,
        departmentId: departmentId ?? undefined,
        businessMonth,
        cycle,
      }
    );

    const attendances = attendanceResult.map(
      (item: any) => item.attendance_details
    );
    // console.log(attendances!);
    // console.log(attendances);

    let workedOnRestDays = 0;
    let workedOnRegularHoliday = 0;
    let workedOnRegularHolidayWhileRestDay = 0;
    let halfDayPresentOnRegularHoliday = 0;
    let workedOnSpecialHoliday = 0;
    let workedOnSpecialHolidayWhileRestDay = 0;
    let halfDayPresentOnSpecialHoliday = 0;
    let overtimeOnRegularDays = 0;
    let overtimeOnHolidays = 0;
    let overtimeOnRestDays = 0;
    let halfDayAbsent = 0;
    for (let i = 0; i < attendances.length; i++) {
      const attendance = attendances[i];
      const attendanceDate = attendance.date;
      const isPresent = attendance.isPresent;
      const isHalfDay = attendance.isHalfDay;
      const isLeave = attendance.isLeave;
      const isHoliday = attendance.holidayId ? true : false;
      const employeesDaysOff = daysOff;
      const holidayType = attendance?.holiday?.holidayType;
      const overtimeHours = attendance.overtimeHours;

      const changeShiftDetails = await getCurrentOrNewShiftDetails({
        employeeId: employeeId,
        attendanceDate: attendanceDate,
      });

      // Worked on Rest Days
      if ((isPresent || (isHalfDay && isLeave)) && !isHoliday) {
        if (employeesDaysOff.includes(moment(attendanceDate).format('dddd'))) {
          workedOnRestDays += isHalfDay ? 0.5 : 1;
        } else if (changeShiftDetails.success && changeShiftDetails.isDayOff) {
          workedOnRestDays += isHalfDay ? 0.5 : 1;
        }
      }

      // Worked on Regular Holiday
      const isEmployeeDayOff = employeesDaysOff.includes(
        moment(attendanceDate).format('dddd')
      );
      if (
        (isPresent || (isHalfDay && isLeave)) &&
        isHoliday &&
        holidayType == 'Regular'
      ) {
        if (
          !isEmployeeDayOff ||
          (!isEmployeeDayOff &&
            changeShiftDetails.success &&
            !changeShiftDetails.isDayOff)
        ) {
          workedOnRegularHoliday += isHalfDay ? 0.5 : 1;
        }
      }

      // Worked on Regular Holiday while Rest Day
      if (
        (isPresent || (isHalfDay && isLeave)) &&
        isHoliday &&
        holidayType == 'Regular'
      ) {
        if (isEmployeeDayOff) {
          workedOnRegularHolidayWhileRestDay += isHalfDay ? 0.5 : 1;
        } else if (changeShiftDetails.success && changeShiftDetails.isDayOff) {
          workedOnRegularHolidayWhileRestDay += isHalfDay ? 0.5 : 1;
        }
      }

      // Half Day present on Regular Holiday
      if (isPresent && isHalfDay && isHoliday && holidayType == 'Regular') {
        halfDayPresentOnRegularHoliday += 1;
      }

      // Worked on Special Holiday
      if (
        (isPresent || (isHalfDay && isLeave)) &&
        isHoliday &&
        holidayType == 'Special'
      ) {
        if (
          !isEmployeeDayOff ||
          (!isEmployeeDayOff &&
            changeShiftDetails.success &&
            !changeShiftDetails.isDayOff)
        ) {
          workedOnSpecialHoliday += isHalfDay ? 0.5 : 1;
        }
      }

      // Worked on Special Holiday while Rest Day
      if (
        (isPresent || (isHalfDay && isLeave)) &&
        isHoliday &&
        holidayType == 'Special'
      ) {
        if (isEmployeeDayOff) {
          workedOnSpecialHolidayWhileRestDay += isHalfDay ? 0.5 : 1;
        } else if (changeShiftDetails.success && changeShiftDetails.isDayOff) {
          workedOnSpecialHolidayWhileRestDay += isHalfDay ? 0.5 : 1;
        }
      }

      // Half Day Present on Special Holiday
      if (isPresent && isHalfDay && isHoliday && holidayType == 'Special') {
        halfDayPresentOnSpecialHoliday += 1;
      }

      // Half Day absent on regular days
      if (isPresent && isHalfDay && !isHoliday) {
        halfDayAbsent++;
      }

      // Overtime on Regular Days
      if (isPresent && !isHoliday) {
        if (
          !isEmployeeDayOff ||
          (!isEmployeeDayOff &&
            changeShiftDetails.success &&
            !changeShiftDetails.isDayOff)
        ) {
          overtimeOnRegularDays += overtimeHours;
        }
      }

      // Overtime on Holidays
      if (isPresent && isHoliday) {
        overtimeOnHolidays += overtimeHours;
      }

      // Overtime on Rest Days
      if (isPresent && !isHoliday) {
        if (isEmployeeDayOff) {
          overtimeOnRestDays += overtimeHours;
        } else if (changeShiftDetails.success && changeShiftDetails.isDayOff) {
          overtimeOnRestDays += overtimeHours;
        }
      }
    }

    return {
      success: true,
      data: {
        workedOnRestDays,
        workedOnRegularHoliday,
        workedOnRegularHolidayWhileRestDay,
        halfDayPresentOnRegularHoliday,
        workedOnSpecialHoliday,
        workedOnSpecialHolidayWhileRestDay,
        halfDayPresentOnSpecialHoliday,
        overtimeOnRegularDays,
        overtimeOnHolidays,
        overtimeOnRestDays,
        halfDayAbsent,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error,
      message: error.message,
    };
  }
}

export async function getEmployeesWithCreditableOT({
  departmentId,
  cycle,
  businessMonth,
  semiWeeklyStartDate,
  semiWeeklyEndDate,
}: {
  departmentId: number;
  cycle: string;
  businessMonth: string;
  semiWeeklyStartDate: string | null;
  semiWeeklyEndDate: string | null;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const departmentDetails: any = await Department.findOne({
      where: {
        departmentId: departmentId,
        companyId: companyId,
      },
      include: [
        {
          attributes: ['employeeId'],
          model: Employee,
          where: {
            employeeStatus: 1,
          },
        },
        {
          model: PayrollType,
          include: [
            {
              model: CompanyPayCycle,
              where: {
                deletedAt: null,
                companyId: companyId,
              },
            },
          ],
        },
      ],
    });

    const { company_pay_cycles, type } = departmentDetails.payroll_type;
    const payrollType = type;

    const cycleDates = await getCycleDates({
      cycle: cycle,
      businessMonth: businessMonth,
      payrollType: payrollType,
      semiWeeklyStartDate: semiWeeklyStartDate,
      semiWeeklyEndDate: semiWeeklyEndDate,
    });

    const employees: any = await Employee.findAll({
      include: [
        { model: EmployeeProfile },
        { model: Shift },
        {
          model: Attendance,
          include: [Holiday],
          where: {
            businessMonth: businessMonth,
            cycle: cycle,
            companyId: companyId,
            departmentId: departmentId,
            date: {
              [Op.in]: cycleDates,
            },
            isPosted: 0,
          },
        },
      ],
    });

    let employeesWithCreditableOT: any = [];
    let temp: any = [];

    for (let i = 0; i < employees.length; i++) {
      const employee: any = employees[i];
      const { attendances } = employees[i];
      let totalCreditableOvertime = 0;

      for (let j = 0; j < attendances.length; j++) {
        const attendance: any = attendances[j];
        if (
          attendance.creditableOvertime > 0 &&
          attendance.overtimeHours <= 0
        ) {
          totalCreditableOvertime += attendance.creditableOvertime;
        }
      }
      if (totalCreditableOvertime > 0) {
        temp.push({
          employeeId: employee.employeeId,
          employeeFullName: employee.employee_profile.employeeFullName,
          totalCreditableOvertime: totalCreditableOvertime,
        });
      }
    }

    if (temp.length !== 0 && temp !== undefined) {
      employeesWithCreditableOT.push({
        departmentName: departmentDetails.departmentName,
        employeesWithCreditableOT: temp,
      });
    }

    return {
      success: true,
      data: employeesWithCreditableOT ?? null,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
}

export async function hasDuplicateTask({
  taskCode,
  taskName,
  departmentName,
  businessMonth,
  cycle,
}: {
  taskCode: string;
  taskName: string;
  departmentName: string;
  businessMonth: string;
  cycle: string;
}) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const firstCreatedTask: any = await TaskProcesses.findOne({
    where: {
      companyId: companyId,
      taskName: taskName,
      departmentName: departmentName,
      businessMonth: businessMonth,
      cycle: cycle,
      status: 0,
    },
    order: [['taskId', 'ASC']],
  });

  if (firstCreatedTask && firstCreatedTask.taskCode != taskCode) {
    await TaskProcesses.update(
      {
        status: 1,
      },
      {
        where: {
          taskCode: taskCode,
        },
      }
    );
    return true;
  }
  return false;
}

export async function reuseUserDetailsForEmployeeReg({
  emailAddress,
  contactNumber,
}: {
  emailAddress: string;
  contactNumber: string;
}) {
  const user: any = await User.findOne({
    where: {
      [Op.or]: {
        emailAddress: emailAddress,
        contactNumber: contactNumber,
      },
    },
  });
  if (user) {
    return user;
  } else {
    return null;
  }
}
