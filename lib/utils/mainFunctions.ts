'use server';

import {
  getCurrentOrNewShiftDetails,
  getCycleDates,
  getPremiumAttendanceBreakdown,
  getWeeklyCycles,
  hasDuplicateTask,
  isCompanyProcessing,
  logTaskProcess,
} from '@utils/companyDetailsGetter';
import { properCasing, removeExtraSpaces, uuidv4 } from '@utils/helper';
import { logger } from '@utils/logger';
import {
  failedDisbursementEmailContent,
  payslipEmailContent,
} from '@utils/notificationContentFormatter';
import {
  checkCompanyWalletBalance,
  disburseSalary,
  sendEmail,
  sendSMS,
  transferMoneyToSubAccount,
} from '@utils/partnerAPIs';
import { getValuesFromSSSBracket } from 'app/sssBracketArray';
import axios from 'axios';
import {
  ActivityLog,
  AllowanceBreakdown,
  Attendance,
  AttendanceApplication,
  Batch_uploads,
  Charge,
  Company,
  CompanyCharge,
  CompanyPayCycle,
  CompanyWithholdingTaxShield,
  Deduction,
  Department,
  Employee,
  EmployeeBenefit,
  EmployeeProfile,
  Holiday,
  Ledger,
  Payroll,
  PayrollDeductions,
  PayrollType,
  Shift,
  TaskProcesses,
  Transactions,
  TransferToEmployee,
} from 'db/models';
import Configuration from 'db/models/configuration';
import notifications from 'db/models/notifications';
import payrollAdjustments from 'db/models/payrollAdjustments';
import moment from '@constant/momentTZ';
import { Op, Sequelize } from 'sequelize';
import { calculateCharge } from './calculateCharge';
import { selectedCompanyData, sessionData } from './jwt';
import ExcelJS from 'exceljs';
import { duplicateInstanceMsg } from '@constant/systemMsgs';

const roundOffByTwoDecimalPlaces = (num: number) => {
  return +(Math.round(num * 100) / 100);
};

export async function postAttendance({
  taskCode,
  taskName,
  departmentId,
  cycle,
  businessMonth,
  semiWeeklyStartDate,
  semiWeeklyEndDate,
}: {
  taskCode: string;
  taskName: string;
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
  const userId = seshData.userId;

  const failedProcesses: any = [];

  try {
    const departmentDetails: any = await Department.findOne({
      where: {
        departmentId: departmentId,
      },
      include: [
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

    const pendingPayrolls = await Payroll.count({
      where: {
        departmentId: departmentId,
        isPosted: 0,
      },
    });
    if (pendingPayrolls > 0) {
      failedProcesses.push({
        headerTitle: `Pending Payrolls found ${departmentDetails.departmentName}`,
        error: `Processing more than one payroll cycle for the same department is not allowed.`,
      });
      await logTaskProcess({
        taskCode: taskCode,
        taskName: taskName,
        status: 1,
      });
      return {
        success: false,
        severity: 'error',
        message: failedProcesses,
      };
    }

    let employeesWithCreditableOT: any = [];
    const companyDetails: any = await Company.findOne({
      where: {
        companyId: companyId,
      },
      include: {
        model: CompanyCharge,
      },
    });
    if (!departmentDetails.payroll_type) {
      await logTaskProcess({
        taskCode: taskCode,
        taskName: taskName,
        status: 1,
      });
      return {
        success: false,
        severity: 'error',
        message:
          'No Payroll Type found for this department. Please set it on the configurations page',
      };
    }
    const { company_pay_cycles, type } = departmentDetails.payroll_type;
    const payrollType = type;
    // rates
    const regularHolidayAndRestDayRate = +(
      companyDetails.regularHolidayRestDayRate / 100
    ).toFixed(2);
    const regularHolidayRate = +(
      companyDetails.regularHolidayRate / 100
    ).toFixed(2);
    const specialHolidayRestDayRate = +(
      companyDetails.specialHolidayRestDayRate / 100
    ).toFixed(2);
    const specialHolidayRate = +(
      companyDetails.specialHolidayRate / 100
    ).toFixed(2);
    const restDayRate = +(companyDetails.restDayRate / 100).toFixed(2);

    // get charge tiers and threshold data
    const configurations = await Configuration.findAll({
      include: [{ model: Charge }],
    });
    const appConfigData: any = configurations[0];
    const charges = companyDetails.company_charges;

    const currentCycleDetails: any = company_pay_cycles.find((i: any) => {
      if (payrollType == 'SEMI-MONTHLY') {
        return i.companyId == companyId && i.cycle == cycle;
      } else {
        return i.companyId == companyId && i.cycle == payrollType;
      }
    });

    const cycleDates = await getCycleDates({
      cycle: cycle,
      businessMonth: businessMonth,
      payrollType: payrollType,
      semiWeeklyStartDate: semiWeeklyStartDate,
      semiWeeklyEndDate: semiWeeklyEndDate,
    });

    const employees: any = await Employee.findAll({
      include: [
        { model: EmployeeBenefit },
        { model: EmployeeProfile },
        { model: Shift },
        { model: AttendanceApplication },
        {
          model: Deduction,
          include: [
            {
              model: TransferToEmployee,
              attributes: ['disbursementStatus'],
              required: false,
            },
          ],
        },
        {
          model: PayrollDeductions,
          where: {
            isDeferred: 1,
            isCollected: 0,
          },
          required: false,
        },
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

    if (
      employees.length == 0 ||
      employees.filter((e: any) => e.attendances.length == 0).length > 0
    ) {
      failedProcesses.push({
        headerTitle: 'Something went wrong...',
        error: `The selected attendance may have already been posted`,
      });
      await logTaskProcess({
        taskCode: taskCode,
        taskName: taskName,
        status: 1,
      });
      return {
        success: false,
        severity: 'error',
        message: failedProcesses,
      };
    }

    const payrollData: any = [];
    for (let i = 0; i < employees.length; i++) {
      if (
        await hasDuplicateTask({
          taskCode: taskCode,
          taskName: taskName,
          departmentName: departmentDetails.departmentName,
          businessMonth: businessMonth,
          cycle: cycle,
        })
      ) {
        failedProcesses.push({
          headerTitle: 'Duplicate Process',
          error: duplicateInstanceMsg,
        });
        return {
          success: false,
          severity: 'error',
          message: failedProcesses,
        };
      }

      const employee: any = employees[i];
      const {
        employeeId,
        deductions,
        payroll_deductions,
        employee_benefit,
        attendance_applications,
        attendances,
      } = employee;
      const employeeFullName = employee.employee_profile.employeeFullName;

      const existingPayrolls = await Payroll.count({
        where: {
          employeeId: employeeId,
          businessMonth: businessMonth,
          cycle: cycle,
        },
      });

      if (existingPayrolls > 0) {
        failedProcesses.push({
          headerTitle: `${employeeFullName} - ${departmentDetails.departmentName}`,
          error: `Conflict with existing payroll entry ${businessMonth} - ${cycle}.`,
        });
        continue;
      }

      const noTimeOutAttendances = attendances.filter(
        (attendance: any) =>
          !attendance.timeOut && (attendance.isPresent || attendance.isHalfDay)
      );

      if (noTimeOutAttendances.length > 0) {
        failedProcesses.push({
          headerTitle: employeeFullName,
          error: `No Time Out on dates: [${noTimeOutAttendances
            .map((a: any) => moment(a.date).format('MM/DD/YYYY'))
            .join(', ')}]`,
        });
        continue;
      }

      const workingDays = attendances.length;
      const isApplyWithholdingTax = employee.applyWithholdingTax;
      const employeeDaysOff =
        employee.dayOff === '' ? [] : employee.dayOff.split(',');
      const defaultDailyRate = employee.dailyRate;
      const overtimeRateRegDays = employee.overtimeRateRegDays;
      const overtimeRateHolidays = employee.overtimeRateHolidays;
      const overtimeRateRestDays = employee.overtimeRateRestDays;
      let basicPay = employee.basicPay;
      let dailyPay = 0;
      let daysWorked = 0;
      let daysAbsent = 0;
      let regularHolidays = 0;
      let regularHolidaysAbsent = 0;
      let regularHolidaysPay = 0;
      let specialHolidays = 0;
      let specialHolidaysAbsent = 0;
      let specialHolidaysPay = 0;
      let sickLeaveDays = 0;
      let sickLeavePay = 0;
      let vacationLeaveDays = 0;
      let vacationLeavePay = 0;
      let soloParentLeaveDays = 0;
      let soloParentLeavePay = 0;
      let paternityLeaveDays = 0;
      let paternityLeavePay = 0;
      let maternityLeaveDays = 0;
      let maternityLeavePay = 0;
      let serviceIncentiveLeaveDays = 0;
      let serviceIncentiveLeavePay = 0;
      let otherLeaveDays = 0;
      let otherLeavePay = 0;
      let emergencyLeaveDays = 0;
      let emergencyLeavePay = 0;
      let birthdayLeaveDays = 0;
      let birthdayLeavePay = 0;
      let overtimeHrs = 0;
      let overtimePay = 0;
      let undertimeHrs = 0;
      let undertimePay = 0;
      let lateHrs = 0;
      let latePay = 0;
      let nightDiffHrs = 0;
      let nightDiffPay = 0;
      let allowance = 0;
      let sssContribution = 0;
      let sssERShare = 0;
      let sssECShare = 0;
      let philHealthERShare = 0;
      let philhealthContribution = 0;
      let pagIbigContribution = 0;
      let pagIbigERShare = 0;

      // Government benefits deduction computation

      let hourlyRate = 0;

      let workedOnRegDays = 0;
      let workedOnRegDaysPay = 0;
      let workedOnRD = 0;
      let workedOnRDPay = 0;
      let workedOnRHD = 0;
      let workedOnRHDPay = 0;
      let workedOnRHDWhileRD = 0;
      let workedOnRHDWhileRDPay = 0;
      let workedOnSPHD = 0;
      let workedOnSPHDPay = 0;
      let workedOnSPHDWhileRD = 0;
      let workedOnSPHDWhileRDPay = 0;
      let absentOnRHD = 0;
      let absentOnRHDPay = 0;
      let absentOnSPHD = 0;
      let absentOnSPHDPay = 0;
      let halfdayPresentonRHD = 0;
      let halfdayPresentonRHDPay = 0;
      let halfdayPresentonSPHD = 0;
      let totalCreditableOvertime = 0;
      let tempDailyRate = 0;

      for (let j = 0; j < attendances.length; j++) {
        const attendance: any = attendances[j];

        if (
          attendance.creditableOvertime > 0 &&
          attendance.overtimeHours <= 0
        ) {
          totalCreditableOvertime += attendance.creditableOvertime;
        }

        const attendanceDate = attendance.date;
        let isDayOffOfEmployee: any =
          employeeDaysOff &&
            employeeDaysOff.filter(
              (dayOff: any) =>
                removeExtraSpaces(dayOff.toUpperCase()) ==
                moment(attendance.date).format('dddd').toUpperCase()
            ).length > 0
            ? true
            : false;

        const getShiftDetails = await getCurrentOrNewShiftDetails({
          employeeId: employeeId,
          attendanceDate: attendanceDate,
        });
        if (getShiftDetails.success) {
          if (getShiftDetails.isDayOff) {
            isDayOffOfEmployee = true;
          }
        } else {
          if (
            getShiftDetails.code &&
            getShiftDetails.code == 'NO_SHIFT_ASSIGNED'
          ) {
            failedProcesses.push({
              headerTitle: `[ID#${employee.employeeCode} - ${employeeFullName}]`,
              error: `No shift assigned for this employee.`,
            });
          } else {
            failedProcesses.push({
              headerTitle: `[ID#${employee.employeeCode} - ${employeeFullName}]`,
              error: getShiftDetails.message,
            });
          }
        }
        const shiftDetails = getShiftDetails.shift;

        const workingHours = shiftDetails.workingHours;
        hourlyRate = parseFloat((defaultDailyRate / workingHours).toFixed(2));
        overtimeHrs +=
          !attendance.isPresent && !attendance.isHalfDay
            ? 0
            : Number(attendance.overtimeHours);
        undertimeHrs +=
          !attendance.isPresent && !attendance.isHalfDay
            ? 0
            : Number(attendance.undertimeHours);
        lateHrs +=
          !attendance.isPresent && !attendance.isHalfDay
            ? 0
            : Number(attendance.lateHours);
        nightDiffHrs +=
          !attendance.isPresent && !attendance.isHalfDay
            ? 0
            : Number(attendance.nightDiffHours);
        const isPresent = attendance.isPresent;
        const isHalfDay = attendance.isHalfDay;
        let isLeave = attendance.isLeave;
        let leaveType = '';
        const isDayOff = attendance.isDayOff;
        const holiday = attendance.holiday;
        let dailyRate = isHalfDay ? +(defaultDailyRate / 2) : defaultDailyRate;
        tempDailyRate = dailyRate;
        const nightDifferentialRate =
          companyDetails.nightDifferentialRate / 100;
        if (attendance_applications.length > 0) {
          isLeave = attendance_applications.filter(
            (i: any) =>
              i.type.toLowerCase().includes('leave') &&
              attendanceDate >= i.fromDate &&
              attendanceDate <= i.toDate &&
              i.isApproved == 1
          );

          if (isLeave.length > 0) {
            leaveType = isLeave[0].type;
            isLeave = true;
          } else {
            isLeave = false;
          }
        }

        const isAbsent = !isPresent && !isLeave && !isDayOff;

        let holidayType = '';
        if (holiday) holidayType = holiday.holidayType.toUpperCase();

        if (holidayType == 'REGULAR') {
          regularHolidays++;

          if (isPresent) {
            // if working on REGULAR HOLIDAY while on REST DAY
            if (isDayOffOfEmployee) {
              // regularHolidaysPay += defaultDailyRate * 2.6 - defaultDailyRate;
              regularHolidaysPay +=
                defaultDailyRate * regularHolidayAndRestDayRate -
                defaultDailyRate;

              if (companyDetails.nightDifferential) {
                // nightDiffPay += hourlyRate * 2.6 * (companyDetails.nightDifferentialRate/100) * attendance.nightDiffHours;
                nightDiffPay +=
                  hourlyRate *
                  regularHolidayAndRestDayRate *
                  nightDifferentialRate *
                  attendance.nightDiffHours;
              }
            }
            // if working on REGULAR HOLIDAY
            else {
              // regularHolidaysPay += defaultDailyRate * 2 - defaultDailyRate;
              regularHolidaysPay +=
                defaultDailyRate * regularHolidayRate - defaultDailyRate;

              if (companyDetails.nightDifferential) {
                // nightDiffPay += hourlyRate * 2 * (companyDetails.nightDifferentialRate/100) * attendance.nightDiffHours;
                nightDiffPay +=
                  hourlyRate *
                  regularHolidayRate *
                  nightDifferentialRate *
                  attendance.nightDiffHours;
              }
            }

            overtimePay += overtimeRateHolidays * attendance.overtimeHours;
            dailyPay += dailyRate;
            if (attendance.isHalfDay) {
              daysWorked += 0.5;
              if (isDayOffOfEmployee) {
                workedOnRHDWhileRD += 0.5;
                workedOnRHDWhileRDPay +=
                  dailyRate * regularHolidayAndRestDayRate;
                halfdayPresentonRHD += 1;
              } else {
                workedOnRHD += 0.5;
                workedOnRHDPay += dailyRate * regularHolidayRate;
                halfdayPresentonRHD += 1;
              }
              absentOnRHD += 0.5;
              halfdayPresentonRHDPay += dailyRate;
            } else {
              daysWorked++;
              if (isDayOffOfEmployee) {
                workedOnRHDWhileRD += 1;
                workedOnRHDWhileRDPay +=
                  defaultDailyRate * regularHolidayAndRestDayRate;
              } else {
                workedOnRHD += 1;
                workedOnRHDPay += defaultDailyRate * regularHolidayRate;
              }
            }
            if (companyDetails.allowanceOnHolidays) {
              allowance += getAllowance(
                companyDetails.halfdayAllowancePay,
                isHalfDay,
                employee.allowance
              );
            }
          }
          // if absent or dayoff on REGULAR HOLIDAY
          else if (isAbsent) {
            regularHolidaysAbsent++;
            absentOnRHD += 1;

            // daysAbsent++;
            regularHolidaysPay += dailyRate;

            absentOnRHDPay += dailyRate;
          }
          // if on-leave on REGULAR HOLIDAY
          else if (isLeave) {
            if (companyDetails.allowanceForLeaves) {
              allowance += employee.allowance;
            }
            if (isHalfDay) {
              // if working on REGULAR HOLIDAY DAYOFF
              if (isDayOffOfEmployee) {
                regularHolidaysPay +=
                  dailyRate * regularHolidayAndRestDayRate - dailyRate;
                workedOnRHDWhileRD += 0.5;
                workedOnRHDWhileRDPay +=
                  dailyRate * regularHolidayAndRestDayRate;
              }
              // if working on REGULAR HOLIDAY
              else {
                regularHolidaysPay +=
                  dailyRate * regularHolidayRate - dailyRate;
                workedOnRHD += 0.5;
                workedOnRHDPay += dailyRate * regularHolidayRate;
              }
              daysWorked += 0.5;
            } else {
              regularHolidaysPay += dailyRate * regularHolidayRate - dailyRate;
            }
            let leaveDaystoAdd = isHalfDay ? 0.5 : 1;
            if (leaveType == 'Vacation Leave') {
              vacationLeaveDays += leaveDaystoAdd;
              vacationLeavePay += dailyRate;
            } else if (leaveType == 'Sick Leave') {
              sickLeaveDays += leaveDaystoAdd;
              sickLeavePay += dailyRate;
            } else if (leaveType == 'Solo Parent Leave') {
              soloParentLeaveDays += leaveDaystoAdd;
              soloParentLeavePay += dailyRate;
            } else if (leaveType == 'Paternity Leave') {
              paternityLeaveDays += leaveDaystoAdd;
              paternityLeavePay += dailyRate;
            } else if (leaveType == 'Maternity Leave') {
              maternityLeaveDays += leaveDaystoAdd;
              maternityLeavePay += dailyRate;
            } else if (leaveType == 'Service Incentive Leave') {
              serviceIncentiveLeaveDays += leaveDaystoAdd;
              serviceIncentiveLeavePay += dailyRate;
            } else if (leaveType == 'Other Leaves') {
              otherLeaveDays += leaveDaystoAdd;
              otherLeavePay += dailyRate;
            } else if (leaveType == 'Emergency Leaves') {
              emergencyLeaveDays += leaveDaystoAdd;
              emergencyLeavePay += dailyRate;
            } else if (leaveType == 'Birthday Leaves') {
              birthdayLeaveDays += leaveDaystoAdd;
              birthdayLeavePay += dailyRate;
            }
          }
        } else if (holidayType == 'SPECIAL') {
          specialHolidays++;

          if (isPresent) {
            // if working on SPECIAL HOLIDAY while on REST DAY
            if (isDayOffOfEmployee) {
              // specialHolidaysPay += dailyRate * 1.5 - dailyRate;
              specialHolidaysPay +=
                dailyRate * specialHolidayRestDayRate - dailyRate;
              if (companyDetails.nightDifferential) {
                // nightDiffPay += hourlyRate * 1.5 * (companyDetails.nightDifferentialRate/100) * attendance.nightDiffHours;
                nightDiffPay +=
                  hourlyRate *
                  specialHolidayRestDayRate *
                  nightDifferentialRate *
                  attendance.nightDiffHours;
              }
            }
            // if working on SPECIAL HOLIDAY
            else {
              // specialHolidaysPay += dailyRate * 1.3 - dailyRate;
              specialHolidaysPay += dailyRate * specialHolidayRate - dailyRate;

              if (companyDetails.nightDifferential) {
                // nightDiffPay += hourlyRate * 1.3 * (companyDetails.nightDifferentialRate/100) * attendance.nightDiffHours;
                nightDiffPay +=
                  hourlyRate *
                  specialHolidayRate *
                  nightDifferentialRate *
                  attendance.nightDiffHours;
              }
            }
            //should be hourly rate * 1.3 * 0.1 * attendace.nightDiffHours

            overtimePay += overtimeRateHolidays * attendance.overtimeHours;
            dailyPay += dailyRate;
            if (attendance.isHalfDay) {
              daysWorked += 0.5;
              absentOnSPHD += 0.5;
              specialHolidaysAbsent += 0.5;
              daysAbsent += 0.5;
              if (isDayOffOfEmployee) {
                workedOnSPHDWhileRD += 0.5;
                workedOnSPHDWhileRDPay += dailyRate * specialHolidayRestDayRate;
              } else {
                workedOnSPHD += 0.5;
                workedOnSPHDPay += dailyRate * specialHolidayRate;
              }
              // for monthly rated employees add half day pay as regular rate
              if (
                employee.isMonthlyRated &&
                employee.employmentStatus == 'Regular'
              ) {
                specialHolidaysPay += dailyRate;
                absentOnSPHDPay += dailyRate;
              }
              absentOnSPHD += 0.5;
              halfdayPresentonSPHD += 1;
            } else {
              daysWorked++;
              if (isDayOffOfEmployee) {
                workedOnSPHDWhileRD += 1;
                workedOnSPHDWhileRDPay += dailyRate * specialHolidayRestDayRate;
              } else {
                workedOnSPHD += 1;
                workedOnSPHDPay += dailyRate * specialHolidayRate;
              }
            }
            if (companyDetails.allowanceOnHolidays) {
              allowance += getAllowance(
                companyDetails.halfdayAllowancePay,
                isHalfDay,
                employee.allowance
              );
            }
          }
          // if absent on SPECIAL HOLIDAY
          else if (isAbsent) {
            // if monthly rated, no work = 1 day pay regular rate
            if (
              employee.isMonthlyRated &&
              employee.employmentStatus == 'Regular'
            ) {
              specialHolidaysPay += dailyRate;
              absentOnSPHDPay += dailyRate;
            }

            absentOnSPHD++;
            daysAbsent++;
            specialHolidaysAbsent++;
          }
          // if on-leave on SPECIAL HOLIDAY
          else if (isLeave) {
            if (companyDetails.allowanceForLeaves) {
              allowance += employee.allowance;
            }
            if (isHalfDay) {
              if (isDayOffOfEmployee) {
                workedOnSPHDWhileRD += 0.5;
                workedOnSPHDWhileRDPay += dailyRate * specialHolidayRestDayRate;
                specialHolidaysPay +=
                  dailyRate * specialHolidayRestDayRate - dailyRate;
              } else {
                workedOnSPHD += 0.5;
                workedOnSPHDPay += dailyRate * specialHolidayRate;
                specialHolidaysPay +=
                  dailyRate * specialHolidayRate - dailyRate;
              }
              daysWorked += 0.5;
              halfdayPresentonSPHD += 1;
            }
            let leaveDaystoAdd = isHalfDay ? 0.5 : 1;
            if (leaveType == 'Vacation Leave') {
              vacationLeaveDays += leaveDaystoAdd;
              vacationLeavePay += dailyRate;
            } else if (leaveType == 'Sick Leave') {
              sickLeaveDays += leaveDaystoAdd;
              sickLeavePay += dailyRate;
            } else if (leaveType == 'Solo Parent Leave') {
              soloParentLeaveDays += leaveDaystoAdd;
              soloParentLeavePay += dailyRate;
            } else if (leaveType == 'Paternity Leave') {
              paternityLeaveDays += leaveDaystoAdd;
              paternityLeavePay += dailyRate;
            } else if (leaveType == 'Maternity Leave') {
              maternityLeaveDays += leaveDaystoAdd;
              maternityLeavePay += dailyRate;
            } else if (leaveType == 'Service Incentive Leave') {
              serviceIncentiveLeaveDays += leaveDaystoAdd;
              serviceIncentiveLeavePay += dailyRate;
            } else if (leaveType == 'Other Leaves') {
              otherLeaveDays += leaveDaystoAdd;
              otherLeavePay += dailyRate;
            } else if (leaveType == 'Emergency Leaves') {
              emergencyLeaveDays += leaveDaystoAdd;
              emergencyLeavePay += dailyRate;
            } else if (leaveType == 'Birthday Leaves') {
              birthdayLeaveDays += leaveDaystoAdd;
              birthdayLeavePay += dailyRate;
            }
          }
        } else {
          if (isPresent) {
            if (isDayOffOfEmployee) {
              overtimePay += overtimeRateRestDays * attendance.overtimeHours;
              dailyPay += dailyRate * restDayRate;

              if (companyDetails.nightDifferential) {
                nightDiffPay +=
                  hourlyRate *
                  restDayRate *
                  nightDifferentialRate *
                  attendance.nightDiffHours;
              }
            } else {
              overtimePay += overtimeRateRegDays * attendance.overtimeHours;
              dailyPay += dailyRate;

              if (companyDetails.nightDifferential) {
                nightDiffPay +=
                  hourlyRate *
                  nightDifferentialRate *
                  attendance.nightDiffHours;
              }
            }

            allowance += getAllowance(
              companyDetails.halfdayAllowancePay,
              isHalfDay,
              employee.allowance
            );
            if (isHalfDay) {
              daysWorked += 0.5;
              daysAbsent += 0.5;
              if (isDayOffOfEmployee) {
                workedOnRD += 0.5;
                workedOnRDPay += dailyRate * restDayRate;
              } else {
                workedOnRegDays += 0.5;
                workedOnRegDaysPay += dailyRate;
              }
            } else {
              daysWorked++;
              if (isDayOffOfEmployee) {
                workedOnRD += 1;
                workedOnRDPay += defaultDailyRate * restDayRate;
              } else {
                workedOnRegDays += 1;
                workedOnRegDaysPay += defaultDailyRate;
              }
            }
          } else if (isAbsent) {
            daysAbsent++;
          } else if (isLeave) {
            if (companyDetails.allowanceForLeaves) {
              allowance += employee.allowance;
            }
            if (isHalfDay) {
              if (isDayOffOfEmployee) {
                dailyPay += dailyRate * restDayRate;
                workedOnRD += 0.5;
                workedOnRDPay += dailyRate * restDayRate;
              } else {
                dailyPay += dailyRate;
                workedOnRegDays += 0.5;
                workedOnRegDaysPay += dailyRate;
              }
              daysWorked += 0.5;
            }
            let leaveDaystoAdd = isHalfDay ? 0.5 : 1;
            if (leaveType == 'Vacation Leave') {
              vacationLeaveDays += leaveDaystoAdd;
              vacationLeavePay += dailyRate;
            } else if (leaveType == 'Sick Leave') {
              sickLeaveDays += leaveDaystoAdd;
              sickLeavePay += dailyRate;
            } else if (leaveType == 'Solo Parent Leave') {
              soloParentLeaveDays += leaveDaystoAdd;
              soloParentLeavePay += dailyRate;
            } else if (leaveType == 'Paternity Leave') {
              paternityLeaveDays += leaveDaystoAdd;
              paternityLeavePay += dailyRate;
            } else if (leaveType == 'Maternity Leave') {
              maternityLeaveDays += leaveDaystoAdd;
              maternityLeavePay += dailyRate;
            } else if (leaveType == 'Service Incentive Leave') {
              serviceIncentiveLeaveDays += leaveDaystoAdd;
              serviceIncentiveLeavePay += dailyRate;
            } else if (leaveType == 'Other Leaves') {
              otherLeaveDays += leaveDaystoAdd;
              otherLeavePay += dailyRate;
            } else if (leaveType == 'Emergency Leaves') {
              emergencyLeaveDays += leaveDaystoAdd;
              emergencyLeavePay += dailyRate;
            } else if (leaveType == 'Birthday Leaves') {
              birthdayLeaveDays += leaveDaystoAdd;
              birthdayLeavePay += dailyRate;
            }
          }
        }
      }

      //  totalCreditableOvertime
      if (totalCreditableOvertime > 0) {
        employeesWithCreditableOT.push({
          employeeId: employee.employeeId,
          employeeFullName: employeeFullName,
          totalCreditableOvertime: totalCreditableOvertime,
        });
      }

      undertimePay = hourlyRate * undertimeHrs;
      latePay = hourlyRate * lateHrs;
      let compensation_lvl = 0;
      let tax_percentage = 0;
      let withholdingTax = 0;
      let fixedTax = 0;

      if (isApplyWithholdingTax) {
        // Weekly
        if (payrollType == 'WEEKLY') {
          const weeklyCycles: any = await getWeeklyCycles({
            selectedMonth: businessMonth,
            payDay: currentCycleDetails.payDate,
          });

          const weeklyWithholdingTaxShield =
            (await CompanyWithholdingTaxShield.findAll({
              where: {
                companyId: companyId,
                payrollTypeId: 1,
              },
              attributes: [
                'withholdingTaxShieldId',
                'companyId',
                'payrollTypeId',
                'bracket',
                'from',
                'to',
                'fixTaxAmount',
                'taxRateExcess',
              ],
              order: [['bracket', 'ASC']],
            })) as any;

          basicPay = parseFloat((basicPay / weeklyCycles.length).toFixed(2));
          if (
            basicPay >= weeklyWithholdingTaxShield[0].from &&
            basicPay <= weeklyWithholdingTaxShield[0].to
          ) {
            tax_percentage = parseFloat(
              (weeklyWithholdingTaxShield[0].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = weeklyWithholdingTaxShield[0].from;
            fixedTax = weeklyWithholdingTaxShield[0].fixTaxAmount;
          } else if (
            basicPay >= weeklyWithholdingTaxShield[1].from &&
            basicPay <= weeklyWithholdingTaxShield[1].to
          ) {
            tax_percentage = parseFloat(
              (weeklyWithholdingTaxShield[1].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = weeklyWithholdingTaxShield[1].from;
            fixedTax = weeklyWithholdingTaxShield[1].fixTaxAmount;
          } else if (
            basicPay >= weeklyWithholdingTaxShield[2].from &&
            basicPay <= weeklyWithholdingTaxShield[2].to
          ) {
            tax_percentage = parseFloat(
              (weeklyWithholdingTaxShield[2].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = weeklyWithholdingTaxShield[2].from;
            fixedTax = weeklyWithholdingTaxShield[2].fixTaxAmount;
          } else if (
            basicPay >= weeklyWithholdingTaxShield[3].from &&
            basicPay <= weeklyWithholdingTaxShield[3].to
          ) {
            tax_percentage = parseFloat(
              (weeklyWithholdingTaxShield[3].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = weeklyWithholdingTaxShield[3].from;
            fixedTax = weeklyWithholdingTaxShield[3].fixTaxAmount;
          } else if (
            basicPay >= weeklyWithholdingTaxShield[4].from &&
            basicPay <= weeklyWithholdingTaxShield[4].to
          ) {
            tax_percentage = parseFloat(
              (weeklyWithholdingTaxShield[4].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = weeklyWithholdingTaxShield[4].from;
            fixedTax = weeklyWithholdingTaxShield[4].fixTaxAmount;
          } else if (basicPay >= weeklyWithholdingTaxShield[5].from) {
            tax_percentage = parseFloat(
              (weeklyWithholdingTaxShield[5].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = weeklyWithholdingTaxShield[5].from;
            fixedTax = weeklyWithholdingTaxShield[5].fixTaxAmount;
          }
        }
        // Semi Monthly
        else if (payrollType == 'SEMI-MONTHLY') {
          basicPay = parseFloat((basicPay / 2).toFixed(2));

          const semiMonthlyWithholdingTaxShield =
            (await CompanyWithholdingTaxShield.findAll({
              where: {
                companyId: companyId,
                payrollTypeId: 2,
              },
              attributes: [
                'withholdingTaxShieldId',
                'companyId',
                'payrollTypeId',
                'bracket',
                'from',
                'to',
                'fixTaxAmount',
                'taxRateExcess',
              ],
              order: [['bracket', 'ASC']],
            })) as any;

          if (
            basicPay >= semiMonthlyWithholdingTaxShield[0].from &&
            basicPay <= semiMonthlyWithholdingTaxShield[0].to
          ) {
            tax_percentage = parseFloat(
              (semiMonthlyWithholdingTaxShield[0].taxRateExcess / 100).toFixed(
                2
              )
            );
            compensation_lvl = semiMonthlyWithholdingTaxShield[0].from;
            fixedTax = semiMonthlyWithholdingTaxShield[0].fixTaxAmount;
          } else if (
            basicPay >= semiMonthlyWithholdingTaxShield[1].from &&
            basicPay <= semiMonthlyWithholdingTaxShield[1].to
          ) {
            tax_percentage = parseFloat(
              (semiMonthlyWithholdingTaxShield[1].taxRateExcess / 100).toFixed(
                2
              )
            );
            compensation_lvl = semiMonthlyWithholdingTaxShield[1].from;
            fixedTax = semiMonthlyWithholdingTaxShield[1].fixTaxAmount;
          } else if (
            basicPay >= semiMonthlyWithholdingTaxShield[2].from &&
            basicPay <= semiMonthlyWithholdingTaxShield[2].to
          ) {
            tax_percentage = parseFloat(
              (semiMonthlyWithholdingTaxShield[2].taxRateExcess / 100).toFixed(
                2
              )
            );
            compensation_lvl = semiMonthlyWithholdingTaxShield[2].from;
            fixedTax = semiMonthlyWithholdingTaxShield[2].fixTaxAmount;
          } else if (
            basicPay >= semiMonthlyWithholdingTaxShield[3].from &&
            basicPay <= semiMonthlyWithholdingTaxShield[3].to
          ) {
            tax_percentage = parseFloat(
              (semiMonthlyWithholdingTaxShield[3].taxRateExcess / 100).toFixed(
                2
              )
            );
            compensation_lvl = semiMonthlyWithholdingTaxShield[3].from;
            fixedTax = semiMonthlyWithholdingTaxShield[3].fixTaxAmount;
          } else if (
            basicPay >= semiMonthlyWithholdingTaxShield[4].from &&
            basicPay <= semiMonthlyWithholdingTaxShield[4].to
          ) {
            tax_percentage = parseFloat(
              (semiMonthlyWithholdingTaxShield[4].taxRateExcess / 100).toFixed(
                2
              )
            );
            compensation_lvl = semiMonthlyWithholdingTaxShield[4].from;
            fixedTax = semiMonthlyWithholdingTaxShield[4].fixTaxAmount;
          } else if (basicPay >= semiMonthlyWithholdingTaxShield[5].from) {
            tax_percentage = parseFloat(
              (semiMonthlyWithholdingTaxShield[5].taxRateExcess / 100).toFixed(
                2
              )
            );
            compensation_lvl = semiMonthlyWithholdingTaxShield[5].from;
            fixedTax = semiMonthlyWithholdingTaxShield[5].fixTaxAmount;
          }
        }
        // Monthly
        else if (payrollType == 'MONTHLY') {
          const monthlyWithholdingTaxShield =
            (await CompanyWithholdingTaxShield.findAll({
              where: {
                companyId: companyId,
                payrollTypeId: 3,
              },
              attributes: [
                'withholdingTaxShieldId',
                'companyId',
                'payrollTypeId',
                'bracket',
                'from',
                'to',
                'fixTaxAmount',
                'taxRateExcess',
              ],
              order: [['bracket', 'ASC']],
            })) as any;

          if (
            basicPay >= monthlyWithholdingTaxShield[0].from &&
            basicPay <= monthlyWithholdingTaxShield[0].to
          ) {
            tax_percentage = parseFloat(
              (monthlyWithholdingTaxShield[0].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = monthlyWithholdingTaxShield[0].from;
            fixedTax = monthlyWithholdingTaxShield[0].fixTaxAmount;
          } else if (
            basicPay >= monthlyWithholdingTaxShield[1].from &&
            basicPay <= monthlyWithholdingTaxShield[1].to
          ) {
            tax_percentage = parseFloat(
              (monthlyWithholdingTaxShield[1].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = monthlyWithholdingTaxShield[1].from;
            fixedTax = monthlyWithholdingTaxShield[1].fixTaxAmount;
          } else if (
            basicPay >= monthlyWithholdingTaxShield[2].from &&
            basicPay <= monthlyWithholdingTaxShield[2].to
          ) {
            tax_percentage = parseFloat(
              (monthlyWithholdingTaxShield[2].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = monthlyWithholdingTaxShield[2].from;
            fixedTax = monthlyWithholdingTaxShield[2].fixTaxAmount;
          } else if (
            basicPay >= monthlyWithholdingTaxShield[3].from &&
            basicPay <= monthlyWithholdingTaxShield[3].to
          ) {
            tax_percentage = parseFloat(
              (monthlyWithholdingTaxShield[3].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = monthlyWithholdingTaxShield[3].from;
            fixedTax = monthlyWithholdingTaxShield[3].fixTaxAmount;
          } else if (
            basicPay >= monthlyWithholdingTaxShield[4].from &&
            basicPay <= monthlyWithholdingTaxShield[4].to
          ) {
            tax_percentage = parseFloat(
              (monthlyWithholdingTaxShield[4].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = monthlyWithholdingTaxShield[4].from;
            fixedTax = monthlyWithholdingTaxShield[4].fixTaxAmount;
          } else if (basicPay >= monthlyWithholdingTaxShield[5].from) {
            tax_percentage = parseFloat(
              (monthlyWithholdingTaxShield[5].taxRateExcess / 100).toFixed(2)
            );
            compensation_lvl = monthlyWithholdingTaxShield[5].from;
            fixedTax = monthlyWithholdingTaxShield[5].fixTaxAmount;
          }
        }

        const excess = basicPay - compensation_lvl;
        withholdingTax = parseFloat(
          (excess * tax_percentage + fixedTax).toFixed(2)
        );
      }

      // normal grossPay calculation
      const grossPay =
        roundOffByTwoDecimalPlaces(
          dailyPay +
          regularHolidaysPay +
          specialHolidaysPay +
          vacationLeavePay +
          sickLeavePay +
          soloParentLeavePay +
          paternityLeavePay +
          maternityLeavePay +
          emergencyLeavePay +
          birthdayLeavePay
        ) +
        overtimePay +
        nightDiffPay +
        allowance +
        serviceIncentiveLeavePay -
        (latePay + undertimePay);
      // console.log('workedOnRegDaysPay!');
      // console.log(+workedOnRegDaysPay.toFixed(2));
      // console.log('absentOnSPHDPay!');
      // console.log(+absentOnSPHDPay.toFixed(2));
      // console.log('workedOnRDPay!');
      // console.log(+workedOnRDPay.toFixed(2));
      // console.log('workedOnRHDPay!');
      // console.log(+workedOnRHDPay.toFixed(2));
      // console.log('workedOnRHDWhileRDPay!');
      // console.log(+workedOnRHDWhileRDPay.toFixed(2));
      // console.log('workedOnSPHDPay!');
      // console.log(+workedOnSPHDPay.toFixed(2));
      // console.log('workedOnSPHDWhileRDPay!');
      // console.log((Math.round(workedOnSPHDWhileRDPay * 100) / 100).toFixed(2));
      // console.log('halfdayPresentonRHDPay!');
      // console.log(+halfdayPresentonRHDPay.toFixed(2));
      // console.log('absentOnRHDPay!');
      // console.log(+absentOnRHDPay.toFixed(2));
      // console.log('halfdayPresentonRHDWhileRDPay!');
      // console.log('worked on sphd while rd');
      // console.log(tempDailyRate * specialHolidayRestDayRate);
      // console.log(tempDailyRate);
      // console.log(specialHolidayRate);
      // console.log(workedOnSPHDWhileRDPay);
      // console.log(+workedOnSPHDWhileRDPay.toFixed(2));
      // save to db simulation and edit payroll sidebar values
      const workedOnRegDaysFormattedPay =
        roundOffByTwoDecimalPlaces(workedOnRegDaysPay);
      const workedOnRDFormattedPay = roundOffByTwoDecimalPlaces(workedOnRDPay);
      const workedOnRHDFormattedPay =
        roundOffByTwoDecimalPlaces(workedOnRHDPay);
      const workedOnRHDWhileRDFormattedPay = roundOffByTwoDecimalPlaces(
        workedOnRHDWhileRDPay
      );
      const workedOnSPHDFormattedPay =
        roundOffByTwoDecimalPlaces(workedOnSPHDPay);
      const workedOnSPHDWhileRDFormattedPay = roundOffByTwoDecimalPlaces(
        workedOnSPHDWhileRDPay
      );
      const halfdayPresentonRHDFormattedPay = roundOffByTwoDecimalPlaces(
        halfdayPresentonRHDPay
      );

      const absentOnRHDFormattedPay =
        roundOffByTwoDecimalPlaces(absentOnRHDPay);
      const absentOnSPHDFormattedPay =
        roundOffByTwoDecimalPlaces(absentOnSPHDPay);
      const grossPay3 =
        workedOnRegDaysFormattedPay +
        workedOnRDFormattedPay +
        workedOnRHDFormattedPay +
        workedOnRHDWhileRDFormattedPay +
        workedOnSPHDFormattedPay +
        workedOnSPHDWhileRDFormattedPay +
        halfdayPresentonRHDFormattedPay +
        absentOnRHDFormattedPay +
        absentOnSPHDFormattedPay +
        overtimePay +
        allowance +
        roundOffByTwoDecimalPlaces(vacationLeavePay) +
        roundOffByTwoDecimalPlaces(sickLeavePay) +
        roundOffByTwoDecimalPlaces(soloParentLeavePay) +
        roundOffByTwoDecimalPlaces(paternityLeavePay) +
        roundOffByTwoDecimalPlaces(maternityLeavePay) +
        roundOffByTwoDecimalPlaces(serviceIncentiveLeavePay) +
        roundOffByTwoDecimalPlaces(emergencyLeavePay) +
        roundOffByTwoDecimalPlaces(birthdayLeavePay) +
        roundOffByTwoDecimalPlaces(nightDiffPay) -
        (latePay + undertimePay);
      // console.log('gross!');
      // console.log(grossPay3);
      // console.log(grossPay);

      if (currentCycleDetails.isApplyGovtBenefits) {
        const { deductibleContributions } = currentCycleDetails;

        if (payrollType == 'WEEKLY') {
          const weeklyCycles = await getWeeklyCycles({
            selectedMonth: businessMonth,
            payDay: currentCycleDetails.payDate,
          });

          let sssContributionRateCount = 0;
          let philHealthContributionRateCount = 0;
          let pagIbigContributionRateCount = 0;

          if (deductibleContributions) {
            if (deductibleContributions.hasOwnProperty('firstCycle')) {
              console.log('not ok');
              sssContributionRateCount +=
                deductibleContributions.firstCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length;
              philHealthContributionRateCount +=
                deductibleContributions.firstCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length;
              pagIbigContributionRateCount +=
                deductibleContributions.firstCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length;
              console.log('ok');
            }
            if (deductibleContributions.hasOwnProperty('secondCycle')) {
              sssContributionRateCount +=
                deductibleContributions.secondCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length;
              philHealthContributionRateCount +=
                deductibleContributions.secondCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length;
              pagIbigContributionRateCount +=
                deductibleContributions.secondCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length;
            }
            if (deductibleContributions.hasOwnProperty('thirdCycle')) {
              sssContributionRateCount +=
                deductibleContributions.thirdCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length;
              philHealthContributionRateCount +=
                deductibleContributions.thirdCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length;
              pagIbigContributionRateCount +=
                deductibleContributions.thirdCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length;
            }
            if (deductibleContributions.hasOwnProperty('fourthCycle')) {
              sssContributionRateCount +=
                deductibleContributions.fourthCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length;
              philHealthContributionRateCount +=
                deductibleContributions.fourthCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length;
              pagIbigContributionRateCount +=
                deductibleContributions.fourthCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length;
            }
            if (
              deductibleContributions.hasOwnProperty('fifthCycle') &&
              weeklyCycles &&
              weeklyCycles.length == 5
            ) {
              sssContributionRateCount +=
                deductibleContributions.fifthCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length;
              philHealthContributionRateCount +=
                deductibleContributions.fifthCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length;
              pagIbigContributionRateCount +=
                deductibleContributions.fifthCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length;
            }

            // Computation in every cycle
            if (cycle.toUpperCase() == 'FIRST CYCLE') {
              // SSS
              if (
                deductibleContributions.firstCycle &&
                deductibleContributions.firstCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length > 0
              ) {
                sssContribution =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssContributionRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );

                sssERShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssERShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssECShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssECShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Phil Health
              if (
                deductibleContributions.firstCycle &&
                deductibleContributions.firstCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length > 0
              ) {
                philhealthContribution =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthContributionRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
                philHealthERShare =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthERShareRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Pag-ibig
              if (
                deductibleContributions.firstCycle &&
                deductibleContributions.firstCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length > 0
              ) {
                pagIbigContribution =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigContributionRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
                pagIbigERShare =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigERShareRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
              }
              console.log('not ok2');
            } else if (cycle.toUpperCase() == 'SECOND CYCLE') {
              // SSS
              if (
                deductibleContributions.secondCycle &&
                deductibleContributions.secondCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length > 0
              ) {
                sssContribution =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssContributionRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssERShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssERShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssECShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssECShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Phil Health
              if (
                deductibleContributions.secondCycle &&
                deductibleContributions.secondCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length > 0
              ) {
                philhealthContribution =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthContributionRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
                philHealthERShare =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthERShareRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Pag-ibig
              if (
                deductibleContributions.secondCycle &&
                deductibleContributions.secondCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length > 0
              ) {
                pagIbigContribution =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigContributionRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
                pagIbigERShare =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigERShareRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
              }
            } else if (cycle.toUpperCase() == 'THIRD CYCLE') {
              // SSS
              if (
                deductibleContributions.thirdCycle &&
                deductibleContributions.thirdCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length > 0
              ) {
                sssContribution =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssContributionRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssERShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssERShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssECShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssECShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Phil Health
              if (
                deductibleContributions.thirdCycle &&
                deductibleContributions.thirdCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length > 0
              ) {
                philhealthContribution =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthContributionRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
                philHealthERShare =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthERShareRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Pag-ibig
              if (
                deductibleContributions.thirdCycle &&
                deductibleContributions.thirdCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length > 0
              ) {
                pagIbigContribution =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigContributionRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
                pagIbigERShare =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigERShareRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
              }
            } else if (cycle.toUpperCase() == 'FOURTH CYCLE') {
              // SSS
              if (
                deductibleContributions.fourthCycle &&
                deductibleContributions.fourthCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length > 0
              ) {
                sssContribution =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssContributionRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssERShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssERShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssECShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssECShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Phil Health
              if (
                deductibleContributions.fourthCycle &&
                deductibleContributions.fourthCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length > 0
              ) {
                philhealthContribution =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthContributionRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
                philHealthERShare =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthERShareRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Pag-ibig
              if (
                deductibleContributions.fourthCycle &&
                deductibleContributions.fourthCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length > 0
              ) {
                pagIbigContribution =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigContributionRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
                pagIbigERShare =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigERShareRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
              }
            } else if (cycle.toUpperCase() == 'FIFTH CYCLE') {
              // SSS
              if (
                deductibleContributions.fifthCycle &&
                deductibleContributions.fifthCycle.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length > 0
              ) {
                sssContribution =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssContributionRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssERShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssERShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
                sssECShare =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssECShareRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Phil Health
              if (
                deductibleContributions.fifthCycle &&
                deductibleContributions.fifthCycle.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length > 0
              ) {
                philhealthContribution =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthContributionRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
                philHealthERShare =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthERShareRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Pag-ibig
              if (
                deductibleContributions.fifthCycle &&
                deductibleContributions.fifthCycle.filter(
                  (f: any) => f.code == 'pagIbigContributionRate'
                ).length > 0
              ) {
                pagIbigContribution =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigContributionRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
                pagIbigERShare =
                  pagIbigContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.pagIbigERShareRate /
                        pagIbigContributionRateCount
                      ).toFixed(2)
                    );
              }
            }
          }
        } else if (payrollType == 'SEMI-MONTHLY') {
          let sssContributionRateCount = 0;
          let philHealthContributionRateCount = 0;
          let pagIbigContributionRateCount = 0;

          company_pay_cycles.forEach((f: any) => {
            if (
              f.isApplyGovtBenefits &&
              f.companyId == companyId &&
              f.payrollTypeId == 2
            ) {
              const deductibleContributions = f.deductibleContributions;
              if (deductibleContributions) {
                deductibleContributions.forEach((dc: any) => {
                  if (dc.code == 'sssContributionRate')
                    sssContributionRateCount++;
                  if (dc.code == 'philHealthContributionRate')
                    philHealthContributionRateCount++;
                  if (dc.code == 'pagIbigContributionRate')
                    pagIbigContributionRateCount++;
                });
              }
            }
          });

          // Shares
          sssERShare =
            sssContributionRateCount == 0
              ? 0
              : parseFloat(
                (
                  employee_benefit.sssERShareRate / sssContributionRateCount
                ).toFixed(2)
              );
          sssECShare =
            sssContributionRateCount == 0
              ? 0
              : parseFloat(
                (
                  employee_benefit.sssECShareRate / sssContributionRateCount
                ).toFixed(2)
              );

          philHealthERShare =
            philHealthContributionRateCount == 0
              ? 0
              : parseFloat(
                (
                  employee_benefit.philHealthERShareRate /
                  philHealthContributionRateCount
                ).toFixed(2)
              );

          pagIbigERShare =
            pagIbigContributionRateCount == 0
              ? 0
              : parseFloat(
                (
                  employee_benefit.pagIbigERShareRate /
                  pagIbigContributionRateCount
                ).toFixed(2)
              );

          if (deductibleContributions) {
            if (companyDetails.useFixedGovtContributionsRate) {
              if (
                deductibleContributions.filter(
                  (f: any) => f.code == 'sssContributionRate'
                ).length > 0
              ) {
                sssContribution =
                  sssContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.sssContributionRate /
                        sssContributionRateCount
                      ).toFixed(2)
                    );
              }
              // Phil Health
              if (
                deductibleContributions.filter(
                  (f: any) => f.code == 'philHealthContributionRate'
                ).length > 0
              ) {
                philhealthContribution =
                  philHealthContributionRateCount == 0
                    ? 0
                    : parseFloat(
                      (
                        employee_benefit.philHealthContributionRate /
                        philHealthContributionRateCount
                      ).toFixed(2)
                    );
              }
            }
            // Pag-ibig
            if (
              deductibleContributions.filter(
                (f: any) => f.code == 'pagIbigContributionRate'
              ).length > 0
            ) {
              pagIbigContribution =
                pagIbigContributionRateCount == 0
                  ? 0
                  : parseFloat(
                    (
                      employee_benefit.pagIbigContributionRate /
                      pagIbigContributionRateCount
                    ).toFixed(2)
                  );
            }
          }

          // use new which is bracketed for philhealth and sss
        } else if (payrollType == 'MONTHLY') {
          // SSS
          sssContribution = employee_benefit.sssContributionRate;
          sssERShare = employee_benefit.sssERShareRate;
          sssECShare = employee_benefit.sssECShareRate;

          // Phil Health
          philHealthERShare = employee_benefit.philHealthERShareRate;
          philhealthContribution = employee_benefit.philHealthContributionRate;

          // Pag-ibig
          pagIbigContribution = employee_benefit.pagIbigContributionRate;
          pagIbigERShare = employee_benefit.pagIbigERShareRate;
        }
      }
      if (
        payrollType == 'SEMI-MONTHLY' &&
        !companyDetails.useFixedGovtContributionsRate
      ) {
        // if first cycle for semi-monthly, there is no sss and philhealth contrib
        if (cycle.toUpperCase() == 'FIRST CYCLE') {
          sssContribution = 0;
          sssERShare = 0;
          sssECShare = 0;

          // Phil Health
          philHealthERShare = 0;
          philhealthContribution = 0;
        } else if (cycle.toLocaleUpperCase() == 'SECOND CYCLE') {
          const employeeDailyRateNow = employee.dailyRate;

          // get ot pay from first cycle
          let fcOvertimePay = 0;
          const fcRes = await getDataOnFirstCycle(
            companyId,
            employee.departmentId,
            employee.employeeId,
            businessMonth,
            'FIRST CYCLE',
            employee.isMonthlyRated
          );
          let fcDaysWorked = 0;
          let scDaysWorked = 0;
          let fcLatePay = 0;
          let scLatePay = 0;
          let fcUndertimePay = 0;
          let scUndertimePay = 0;
          let fcDailyRate = 0;
          let scDailyRate = employeeDailyRateNow;
          if (fcRes.success) {
            fcDailyRate = fcRes.dailyRate;
            fcOvertimePay = fcRes.otPay;
            fcLatePay = fcRes.latePay;
            fcUndertimePay = fcRes.undertimePay;

            if (employee.isMonthlyRated) {
              fcDaysWorked =
                15 - fcRes.daysAbsent + fcRes.specialHolidaysAbsent;
            } else {
              fcDaysWorked = 13 - fcRes.daysAbsent;
            }
          }
          scLatePay = latePay;
          scUndertimePay = undertimePay;
          if (employee.isMonthlyRated) {
            scDaysWorked = 15 - daysAbsent + specialHolidaysAbsent;
          } else {
            scDaysWorked = 13 - daysAbsent;
          }

          // get ot pay from second cycle
          let scOvertimePay = 0;

          // if monthly rated we need to remove the daily rate and get only the extra pay by dividing it with the rate
          // we only need the extra pay since monthly rated is 30 days which already includes fixed pay including dayoff
          // proof and ex. 100(daily rate) * 1.3(rest day rate) = 130(total pay) :30 is the extra pay from 130
          // to get 30 from 130 we subtract 130 with  100--->derived from (130(dailypay)/1.3(restdayrate))
          // else if daily rated we need to add working on rest days or RD as full ot pay(not extra pay only)
          // since 26 days doesnt include the work on rest days
          const scWorkedOnRDOTPay = employee.isMonthlyRated
            ? workedOnRDFormattedPay - workedOnRDFormattedPay / restDayRate
            : workedOnRDFormattedPay;
          const scWorkedOnRHDOTPay =
            workedOnRHDFormattedPay -
            workedOnRHDFormattedPay / regularHolidayRate;
          const scWorkedOnRHDWhileRDOTPay = employee.isMonthlyRated
            ? workedOnRHDWhileRDFormattedPay -
            workedOnRHDWhileRDFormattedPay / regularHolidayAndRestDayRate
            : workedOnRHDWhileRDFormattedPay;
          const scWorkedOnSPHDOTPay =
            workedOnSPHDFormattedPay -
            workedOnSPHDFormattedPay / specialHolidayRate;
          const scWorkedOnSPHDWhileRDOTPay = employee.isMonthlyRated
            ? workedOnSPHDWhileRDFormattedPay -
            workedOnSPHDWhileRDFormattedPay / specialHolidayRestDayRate
            : workedOnSPHDWhileRDFormattedPay;
          scOvertimePay =
            roundOffByTwoDecimalPlaces(
              scWorkedOnRDOTPay +
              scWorkedOnRHDOTPay +
              scWorkedOnRHDWhileRDOTPay +
              scWorkedOnSPHDOTPay +
              scWorkedOnSPHDWhileRDOTPay
            ) +
            overtimePay +
            nightDiffPay;
          const totalDeductions =
            fcLatePay + fcUndertimePay + scLatePay + scUndertimePay;
          // const ratedSalaryTotal =
          //   employeeDailyRate * (fcDaysWorked + scDaysWorked)-totalDeductions;
          // const ratedSalaryWithOT =
          //   ratedSalaryTotal + fcOvertimePay + scOvertimePay-totalDeductions;
          // console.log('fcDailyRate!');
          // console.log(fcDailyRate);
          // console.log('scDailyRate!');
          // console.log(scDailyRate);
          // console.log('fcDayWorked!');
          // console.log(fcDaysWorked);
          // console.log('scDaysWorked!');
          // console.log(scDaysWorked);
          const ratedSalaryTotal =
            fcDailyRate * fcDaysWorked + scDailyRate * scDaysWorked;
          const ratedSalaryWithOT =
            ratedSalaryTotal + fcOvertimePay + scOvertimePay;
          // console.log('ratedSalaryTotal!');
          // console.log(ratedSalaryTotal);
          // console.log('fcOvertimePay!');
          // console.log(fcOvertimePay);
          // console.log('scOvertimePay!');
          // console.log(scOvertimePay);
          // console.log('ratedSalaryWithOT!');
          // console.log(ratedSalaryWithOT);
          if (employee_benefit.philHealthId != null) {
            philHealthERShare = roundOffByTwoDecimalPlaces(
              ratedSalaryTotal * 0.025
            );
            philhealthContribution = roundOffByTwoDecimalPlaces(
              ratedSalaryTotal * 0.025
            );
          }
          // find in sss bracket using total salary with otpay
          if (employee_benefit.sssId != null) {
            const sssResults = getValuesFromSSSBracket(ratedSalaryWithOT);
            if (sssResults.success) {
              sssContribution = sssResults.EE;
              sssERShare = sssResults.ER;
              sssECShare = sssResults.EC;
            } else {
              sssContribution = 0;
              sssERShare = 0;
              sssECShare = 0;
            }
          }
        }
      }

      // const loanDeductions = deductions.filter((item: any) => {
      //   if (item.deductionPeriod === 'Specific Cycle') {
      //     let isCycleMatched = false;
      //     item.cycleChosen.split(',').map((c: any) => {

      //       if (c.trim() === cycle.trim()) {
      //         isCycleMatched =
      //           item.isPosted && item.totalAmount > item.amountPaid
      //             ? true
      //             : false;
      //         return true;
      //       }
      //     });
      //     return isCycleMatched;
      //   }
      //   if (
      //     payrollType.toLowerCase() !== 'semi-weekly' &&
      //     item.deductionType == 'Cash Advance'
      //   ) {
      //     if (
      //       cycle?.trim() == item.cycleChosen?.trim() ||
      //       (item.deductionPeriod !== 'One Time' &&
      //         (item.cycleChosen == null || item.cycleChosen == 'Every Cycle'))
      //     ) {
      //       return (
      //         item.isPosted &&
      //         item.totalAmount > item.amountPaid &&
      //         item.transfer_to_employee_acct_transaction &&
      //         item.transfer_to_employee_acct_transaction.disbursementStatus ==
      //           true
      //       );
      //     }
      //   } else if (
      //     item.deductionType == 'Other' &&
      //     item.deductionPeriod != 'Specific Cycle' &&
      //     payrollType.toLowerCase() !== 'monthly'
      //   ) {
      //     if (payrollType.toLowerCase() === 'semi-weekly') {
      //       return item.isPosted && item.totalAmount > item.amountPaid;
      //     }
      //     if (
      //       cycle === item.cycleChosen ||
      //       (item.deductionPeriod !== 'One Time' &&
      //         (item.cycleChosen == null || item.cycleChosen == 'Every Cycle'))
      //     ) {
      //       return item.isPosted && item.totalAmount > item.amountPaid;
      //     }
      //   } else if (payrollType.toLowerCase() === 'semi-weekly') {
      //     return item.isPosted && item.totalAmount > item.amountPaid;
      //   } else {
      //     if (
      //       cycle?.trim() === item.cycleChosen?.trim() ||
      //       (item.deductionPeriod !== 'One Time' &&
      //         (item.cycleChosen == null || item.cycleChosen == 'Every Cycle'))
      //     ) {
      //       return item.isPosted && item.totalAmount > item.amountPaid;
      //     }
      //   }
      // });

      const loanDeductions = deductions.filter((item: any) => {
        if (item.deductionType == 'Other') {
          if (item.deductionPeriod === 'Specific Cycle') {
            let isCycleMatched = false;
            item.cycleChosen.split(',').map((c: any) => {
              if (c.trim() === cycle.trim()) {
                isCycleMatched =
                  item.isPosted && item.totalAmount > item.amountPaid
                    ? true
                    : false;
                return true;
              }
            });
            return isCycleMatched;
          } else if (payrollType.toLowerCase() !== 'monthly') {
            if (payrollType.toLowerCase() === 'semi-weekly') {
              return item.isPosted && item.totalAmount > item.amountPaid;
            } else {
              if (
                cycle === item.cycleChosen ||
                (item.deductionPeriod !== 'One Time' &&
                  (item.cycleChosen == null ||
                    item.cycleChosen == 'Every Cycle'))
              ) {
                return item.isPosted && item.totalAmount > item.amountPaid;
              }
            }
          } else {
            if (
              cycle?.trim() === item.cycleChosen?.trim() ||
              (item.deductionPeriod !== 'One Time' &&
                (item.cycleChosen == null ||
                  item.cycleChosen == 'Every Cycle'))
            ) {
              return item.isPosted && item.totalAmount > item.amountPaid;
            }
          }
        } else {
          if (payrollType.toLowerCase() == 'semi-weekly') {
            return item.isPosted && item.totalAmount > item.amountPaid;
          } else {
            if (item.deductionType == 'Cash Advance') {
              if (
                cycle?.trim() == item.cycleChosen?.trim() ||
                (item.deductionPeriod !== 'One Time' &&
                  (item.cycleChosen == null ||
                    item.cycleChosen == 'Every Cycle'))
              ) {
                return (
                  item.isPosted &&
                  item.totalAmount > item.amountPaid &&
                  item.transfer_to_employee_acct_transaction &&
                  item.transfer_to_employee_acct_transaction
                    .disbursementStatus == true
                );
              }
            } else {
              if (
                cycle?.trim() === item.cycleChosen?.trim() ||
                (item.deductionPeriod !== 'One Time' &&
                  (item.cycleChosen == null ||
                    item.cycleChosen == 'Every Cycle'))
              ) {
                return item.isPosted && item.totalAmount > item.amountPaid;
              }
            }
          }
        }
      });

      let loanDeductionsAmount = 0;
      for (let LD = 0; LD < loanDeductions.length; LD++) {
        const loanDeduction = loanDeductions[LD];
        if (loanDeduction.noOfCycles == loanDeduction.noOfIterations + 1) {
          loanDeductionsAmount +=
            loanDeduction.totalAmount -
            loanDeduction.noOfIterations * loanDeduction.perCycleDeduction;
        } else {
          loanDeductionsAmount += loanDeduction.perCycleDeduction;
        }
      }

      // Check for deferred deductions
      if (payroll_deductions.length > 0) {
        const deferredDeductions = payroll_deductions.reduce(
          (acc: any, curr: any) => acc + curr.amountPaid,
          0
        );
        loanDeductionsAmount += deferredDeductions;
      }

      const totalDeduction =
        sssContribution +
        pagIbigContribution +
        philhealthContribution +
        withholdingTax +
        loanDeductionsAmount;

      // const netPay = grossPay - totalDeduction;
      let netPay = grossPay3 - totalDeduction;

      // tester

      // netPay = 25000.01;
      // activeEmployeeCount = 110;
      let charge =
        companyDetails.chargePerEmployee == 0
          ? 0
          : calculateCharge(netPay, charges);

      // find charge tier and
      console.log('charge!');
      console.log(charge);
      const payrollDetails = {
        companyId: companyId,
        employeeId: employeeId,
        departmentId: departmentId,
        businessMonth: businessMonth,
        cycle: cycle,
        grossPay: grossPay3,
        totalDeduction: totalDeduction,
        netPay: netPay,
        monthlyBasicPay: basicPay,
        dailyRate: defaultDailyRate,
        hourlyRate: hourlyRate,
        overtimeRateRegDays: overtimeRateRegDays,
        overtimeRateHolidays: overtimeRateHolidays,
        overtimeRateRestDays: overtimeRateRestDays,
        workingDays: workingDays,
        daysWorked: daysWorked,
        daysOff: employee.dayOff,
        daysAbsent: daysAbsent,
        regularHolidays: regularHolidays,
        regularHolidaysAbsent: regularHolidaysAbsent,
        regularHolidaysPay: regularHolidaysPay,
        specialHolidays: specialHolidays,
        specialHolidaysAbsent: specialHolidaysAbsent,
        specialHolidaysPay: specialHolidaysPay,
        sickLeaveDays: sickLeaveDays,
        sickLeavePay: sickLeavePay,
        vacationLeaveDays: vacationLeaveDays,
        vacationLeavePay: vacationLeavePay,
        soloParentLeaveDays: soloParentLeaveDays,
        soloParentLeavePay: soloParentLeavePay,
        paternityLeaveDays: paternityLeaveDays,
        paternityLeavePay: paternityLeavePay,
        maternityLeaveDays: maternityLeaveDays,
        maternityLeavePay: maternityLeavePay,
        serviceIncentiveLeaveDays: serviceIncentiveLeaveDays,
        serviceIncentiveLeavePay: serviceIncentiveLeavePay,
        otherLeaveDays: otherLeaveDays,
        otherLeavePay: otherLeavePay,
        emergencyLeaveDays: emergencyLeaveDays,
        emergencyLeavePay: emergencyLeavePay,
        birthdayLeaveDays: birthdayLeaveDays,
        birthdayLeavePay: birthdayLeavePay,
        overtimeHrs: overtimeHrs,
        overtimePay: overtimePay,
        undertimeHrs: undertimeHrs,
        undertimePay: undertimePay,
        lateHrs: lateHrs,
        latePay: latePay,
        nightDiffHrs: nightDiffHrs,
        nightDiffPay: nightDiffPay,
        allowance: allowance,
        sssContribution: sssContribution,
        pagIbigContribution: pagIbigContribution,
        philhealthContribution: philhealthContribution,
        sssERShare: sssERShare,
        sssECShare: sssECShare,
        philHealthERShare: philHealthERShare,
        pagIbigERShare: pagIbigERShare,
        withholdingTax: withholdingTax,
        modeOfPayroll: employee.modeOfPayroll,
        addAdjustment: 0,
        deductAdjustment: 0,
        chargePerEmployee: charge,
        regularHolidayRate: companyDetails.regularHolidayRate,
        regularHolidayRestDayRate: companyDetails.regularHolidayRestDayRate,
        specialHolidayRate: companyDetails.specialHolidayRate,
        specialHolidayRestDayRate: companyDetails.specialHolidayRestDayRate,
        restDayRate: companyDetails.restDayRate,
        payroll_deductions: loanDeductions.map((item: any) => {
          const perCycleDeduction =
            item.noOfCycles == item.noOfIterations + 1
              ? item.totalAmount - item.noOfIterations * item.perCycleDeduction
              : item.perCycleDeduction;
          const deferredDeductions = payroll_deductions
            .filter((f: any) => f.deductionId == item.deductionId)
            .reduce((acc: any, curr: any) => acc + curr.amountPaid, 0);
          // console.log('deductions!');
          // console.log(perCycleDeduction);
          // console.log(deferredDeductions);
          return {
            employeeId: employeeId,
            deductionId: item.deductionId,
            amountPaid: perCycleDeduction + deferredDeductions,
          };
        }),
        isMonthlyRated: employee.isMonthlyRated,
        employmentStatus: employee.employmentStatus,
      };

      payrollData.push(payrollDetails);
    }

    if (failedProcesses.length > 0) {
      await logTaskProcess({
        taskCode: taskCode,
        taskName: taskName,
        status: 1,
      });
      return {
        success: false,
        severity: 'error',
        message: failedProcesses,
      };
    }

    await TaskProcesses.update(
      {
        status: 1,
      },
      {
        where: {
          taskCode: taskCode,
          status: 0,
        },
      }
    );

    if (payrollData.length > 0) {
      const createPayroll: any = await Payroll.bulkCreate(payrollData, {
        include: [PayrollDeductions],
      });

      if (createPayroll) {
        await Attendance.update(
          {
            isPosted: 1,
            datePosted: new Date(),
          },
          {
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
          }
        );

        await ActivityLog.create({
          companyId: companyId,
          userId: seshData.userId,
          message: `Posted Attendance [${businessMonth} - ${cycle}]`,
        });

        return {
          success: true,
          severity: 'success',
          message: `${departmentDetails.departmentName} - [${businessMonth} - ${cycle}] has been posted`,
        };
      }
    }
  } catch (error: any) {
    failedProcesses.push({
      headerTitle: `Something went wrong...`,
      error: JSON.stringify(error.message ?? { ...error }),
    });

    await logTaskProcess({
      taskCode: taskCode,
      taskName: taskName,
      status: 1,
    });

    return {
      success: false,
      severity: 'error',
      message: failedProcesses,
    };
  }
}

export async function getTotalPayrolls({
  businessMonth,
  cycle,
  departmentId,
  isDirect,
  isReposting,
}: {
  businessMonth: string;
  cycle: string;
  departmentId: number;
  isDirect: boolean;
  isReposting: boolean;
}) {
  try {
    const errorMessages: any = [];
    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();
    const companyId = selectedCompData
      ? selectedCompData.companyId
      : seshData.companyId;

    let dynamicWhere: any = {
      businessMonth: businessMonth,
      cycle: cycle,
      companyId: companyId,
      departmentId: departmentId,
      isDirect: isDirect,
      // if reposting only posted payrolls with disbursement status 2 will be fetched
      isPosted: isReposting ? 1 : 0,
    };
    if (isReposting) {
      dynamicWhere.disbursementStatus = 2;
      dynamicWhere.createdAt = {
        [Op.gte]: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      };
    }

    const companyDetails: any = await Company.findByPk(companyId);
    const totalPayroll = await Payroll.count({
      where: dynamicWhere,
    });

    const checkEmployeesWithNegativeSalary = await Payroll.findAll({
      attributes: ['payroll_id', 'employeeId'],
      where: {
        ...dynamicWhere,
        netPay: {
          [Op.lt]: 0,
        },
      },
      include: [
        {
          model: Employee,
          attributes: ['employeeId'],
          include: [
            {
              model: EmployeeProfile,
              attributes: [
                'employeeProfileId',
                'firstName',
                'lastName',
                'middleName',
                'suffix',
                'employeeFullName',
              ],
            },
          ],
        },
      ],
    });
    if (checkEmployeesWithNegativeSalary.length > 0) {
      for (let i = 0; i < checkEmployeesWithNegativeSalary.length; i++) {
        const payroll: any = checkEmployeesWithNegativeSalary[i];
        errorMessages.push({
          headerTitle: payroll.employee.employee_profile.employeeFullName,
          error: `Salary must not be lesser than Php 0.00`,
        });
      }
      return {
        success: false,
        message: errorMessages,
        data: {
          totalPayroll: totalPayroll,
          companyDetails: companyDetails,
        },
      };
    }

    let totalNetPay = await Payroll.sum('netPay', {
      where: dynamicWhere,
    });
    let totalChargePerEmployee = await Payroll.sum('chargePerEmployee', {
      where: {
        ...dynamicWhere,
        netPay: {
          [Op.gt]: 0,
        },
      },
    });
    if (totalPayroll == 0) {
      return {
        success: false,
        message: 'This payroll may have already been posted.',
      };
    }

    // Check Company Wallet Balance
    totalChargePerEmployee = Math.round(totalChargePerEmployee * 100) / 100;
    totalNetPay = Math.round(totalNetPay * 100) / 100;
    let balanceToCheck = totalNetPay + totalChargePerEmployee;
    balanceToCheck = balanceToCheck = Math.round(balanceToCheck * 100) / 100;
    if (balanceToCheck != 0) {
      const checkBalance = await checkCompanyWalletBalance({
        companyAccountId: companyDetails.accountId,
        balanceToCheck: balanceToCheck,
      });
      if (!checkBalance.success) {
        return {
          severity: 'error',
          success: false,
          message: checkBalance.message,
          data: {
            totalPayroll: totalPayroll,
            companyDetails: companyDetails,
          },
        };
      }
    }

    return {
      success: true,
      data: {
        totalPayroll: totalPayroll,
        companyDetails: companyDetails,
      },
    };
  } catch (error: any) {
    logger.error({
      label: 'Post Payroll: Count Payrolls',
      message: JSON.stringify(error.message ? error.message : error),
    });
    return {
      severity: 'error',
      success: false,
      message: error.message,
    };
  }
}

export async function processDisbursement({
  processedPayrollIDs,
  departmentName,
  businessMonth,
  cycle,
  departmentId,
  isDirect,
  isReposting,
  batchId,
  batchNumber,
  companyDetails,
}: {
  processedPayrollIDs: number[];
  departmentName: string;
  businessMonth: string;
  cycle: string;
  departmentId: number;
  isDirect: boolean;
  isReposting: boolean;
  batchId: number | null;
  batchNumber: string | null;
  companyDetails: any;
}) {
  const errorMessages: any = [];
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  try {
    const dynamicWhere: any = {
      payroll_id: {
        [Op.notIn]: processedPayrollIDs,
      },
      businessMonth: businessMonth,
      cycle: cycle,
      companyId: companyId,
      departmentId: departmentId,
      isDirect: isDirect,
      isPosted: isReposting ? 1 : 0, // if reposting only posted payrolls with disbursement status 2 will be fetched
    };
    if (isReposting) {
      dynamicWhere.disbursementStatus = 2;
      dynamicWhere.createdAt = {
        [Op.gte]: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      };
    }

    const payroll: any = await Payroll.findOne({
      where: dynamicWhere,
      include: [
        {
          model: Batch_uploads,
          attributes: ['batchNumber', 'batchUploadId'],
          required: false,
        },
        {
          model: Employee,
          attributes: ['employeeId', 'departmentId', 'ckycId'],
          include: [
            {
              model: EmployeeProfile,
              attributes: [
                'employeeProfileId',
                'firstName',
                'lastName',
                'middleName',
                'suffix',
                'employeeFullName',
              ],
            },
            {
              model: Department,
              attributes: ['departmentId', 'payrollTypeId'],
              where: {
                companyId: companyId,
              },
              include: [
                {
                  model: PayrollType,
                  attributes: ['type'],
                },
              ],
            },
          ],
        },
      ],
      order: [['payroll_id', 'ASC']],
    });

    if (!payroll) {
      return {
        success: false,
        message: errorMessages,
        abort: true,
      };
    }

    const {
      payroll_id,
      batchUploadId,
      chargePerEmployee,
      employee: {
        ckycId,
        employee_profile: { employeeFullName },
        department: {
          payroll_type: { type },
        },
      },
      netPay,
      modeOfPayroll,
      batch_upload,
    } = payroll;

    if (netPay < 0) {
      errorMessages.push({
        headerTitle: employeeFullName,
        error: `Salary must not be lesser than PHP 0.00`,
      });
      return {
        success: false,
        message: errorMessages,
        processedPayrollID: payroll.payroll_id,
      };
    }

    if (!batchUploadId) {
      if (!batchNumber) {
        batchNumber = await batchNumberGenerator({
          companyName: companyDetails.companyName,
        });
        const insertBatchDetails: any = await Batch_uploads.create({
          companyId: companyId,
          businessMonth: businessMonth,
          cycle: cycle,
          batchNumber: batchNumber,
          modeOfPayroll: modeOfPayroll,
        });
        batchId = insertBatchDetails.batchUploadId;
      } else {
        const getBatchDetails: any = await Batch_uploads.findOne({
          where: {
            batchNumber: batchNumber,
            modeOfPayroll: modeOfPayroll,
          },
        });
        if (getBatchDetails) {
          batchId = getBatchDetails.batchUploadId;
          batchNumber = getBatchDetails.batchNumber;
        } else {
          const insertBatchDetails: any = await Batch_uploads.create({
            companyId: companyId,
            businessMonth: businessMonth,
            cycle: cycle,
            batchNumber: batchNumber,
            modeOfPayroll: modeOfPayroll,
          });
          batchId = insertBatchDetails.batchUploadId;
          batchNumber = insertBatchDetails.batchNumber;
        }
      }
    } else {
      batchId = batchUploadId;
      batchNumber = batch_upload.batchNumber;
    }

    if (netPay == 0) {
      await Payroll.update(
        {
          datePosted: new Date(),
          isPosted: true,
          batchUploadId: batchId,
        },
        {
          where: {
            payroll_id: payroll_id,
          },
        }
      );
      await updateDeductionsInBackground({
        payroll_id: payroll_id,
      });
      return {
        success: true,
        message: errorMessages,
        batchId,
        batchNumber,
        processedPayrollID: payroll.payroll_id,
      };
    }

    const res = await Configuration.findAll();
    const appConfigData: any = res[0];
    const emailContacts = appConfigData.emailContacts
      ? appConfigData.emailContacts.split(',')
      : [];
    const phoneContacts = appConfigData.phoneContacts
      ? appConfigData.phoneContacts.split(',')
      : [];

    let disbursementCode = null;
    let disbursementStatus = 0;
    let failedRemarks = null;
    let transferTransactionId: number | null = null;

    // Disburse Salary
    let isSuccess: boolean = true;
    const disbursement = await disburseSalary({
      nonce: uuidv4(),
      transactionSubtype: null,
      timestamp: new Date().getTime(),
      companyAccountId: companyDetails.accountId,
      ckycId: ckycId,
      batchNumber: batchNumber as string,
      netSalary: netPay,
      operator: {
        id: seshData.emailAddress,
        name: seshData.emailAddress,
      },
      modeOfPayroll: modeOfPayroll,
      payrollType: type,
      cycle: cycle,
    });

    if (disbursement.success) {
      disbursementStatus = 1;
      disbursementCode = disbursement.responseData.transactionCode;

      // Apply Disbursement Charges to be sent to Sub-Account
      if (chargePerEmployee > 0) {
        const transferTransaction = await transferToSubAcctTransaction({
          uuid: uuidv4(),
          companyAccountId: companyDetails.accountId,
          employeeCKYCId: ckycId,
          totalChargePerEmployee: chargePerEmployee,
          seshData: seshData,
          companyId: companyId,
          businessMonth: businessMonth,
          cycle: cycle,
        });

        if (transferTransaction.success) {
          transferTransactionId = transferTransaction.transferTransactionId;
        } else {
          errorMessages.push({
            headerTitle: `${employeeFullName}`,
            error: `Transfer Money API Error: A network error occurred. Please inform the administrator.`,
          });
          failedRemarks = `Transfer Money API Error: A network error occurred. Please inform the administrator.`;
        }
      }
    } else {
      isSuccess = false;
      disbursementStatus = 2;
      failedRemarks = `Disburse Salary API Error: ${disbursement.message ??
        'A network error occurred. Please inform the administrator.'
        }`;
      errorMessages.push({
        headerTitle: `${employeeFullName}`,
        error: `Disburse Salary API Error: ${disbursement.message ??
          'A network error occurred. Please inform the administrator.'
          }`,
      });

      for (let j = 0; j < phoneContacts.length; j++) {
        const contact = phoneContacts[j];
        const content = `Disbursement for ${employeeFullName} for ${businessMonth} ${cycle} has failed. The disbursement amount is ${netPay}`;
        sendSMS({
          recepientNo: contact,
          content: content,
          sender: 'MLHUILLIER',
        });
      }

      const timeStamp = moment().format('LL - LT');
      for (let k = 0; k < emailContacts.length; k++) {
        sendEmail({
          to: emailContacts[k],
          subject: `Failed Disbursement for ${employeeFullName} (${timeStamp})`,
          content: failedDisbursementEmailContent({
            businessMonth: businessMonth,
            cycle: cycle,
            amount: netPay,
            employeeFullName: employeeFullName,
          }),
        });
      }
    }

    await Payroll.update(
      {
        batchUploadId: batchId,
        transferTransactionId: transferTransactionId,
        disbursementStatus: disbursementStatus,
        disbursementCode: disbursementCode,
        failedRemarks: failedRemarks,
        datePosted: new Date(),
        disbursementSchedule: new Date(),
        isPosted: true,
      },
      {
        where: {
          payroll_id: payroll_id,
        },
      }
    );

    // Process Payment on Loan Deductions
    await updateDeductionsInBackground({
      payroll_id: payroll_id,
    });
    // Send Payslip
    await sendPaySlip({
      companyId: companyId,
      departmentId: departmentId,
      companyDetails: companyDetails,
      payroll_id: payroll_id,
      businessMonth: businessMonth,
      cycle: cycle,
    });

    await ActivityLog.create({
      companyId: companyId,
      userId: seshData.userId,
      message: `Posted Payroll of ${employeeFullName} [${departmentName} - ${businessMonth} - ${cycle}]`,
    });

    // posting payroll logic end
    return {
      success: isSuccess,
      message: errorMessages,
      batchId,
      batchNumber,
      processedPayrollID: payroll.payroll_id,
    };
  } catch (error: any) {
    console.log(error.message);
    logger.error({
      label: 'Post Payroll: Get Payrolls',
      message: JSON.stringify(error.message ? error.message : error),
    });
    errorMessages.push({
      headerTitle: 'Something went wrong...',
      error: error.message,
    });
    return {
      severity: 'error',
      success: false,
      message: errorMessages,
      abort: true,
    };
  }
}


export async function batchNumberGenerator({
  companyName,
}: {
  companyName: string;
}) {
  const matches: any = companyName.match(/\b(\w)/g);
  const acronym: any = removeExtraSpaces(matches.join('')).toUpperCase();
  const currentDate = new Date();
  const datestring = `${currentDate.getFullYear()}${currentDate.getMonth() + 1
    }${currentDate.getDate()}${currentDate.getTime()}`;
  const batchNumber = `PP-${acronym}-${datestring}`;
  // let batchNumber = latestBatchNumber
  //   ? latestBatchNumber.batchNumber
  //   : `${prefix}-000000000000`;
  // batchNumber = batchNumber.split('-');
  // batchNumber = batchNumber[2].replace(/\D/g, '');
  // batchNumber = String('000000000000' + (parseFloat(batchNumber) + 1)).slice(
  //   -12
  // );
  // return `${prefix}-P${batchNumber}`;
  return batchNumber;
}

export async function transferToSubAcctTransaction({
  uuid,
  companyAccountId,
  employeeCKYCId,
  totalChargePerEmployee,
  seshData,
  companyId,
  businessMonth,
  cycle,
}: {
  uuid: string;
  companyAccountId: string;
  employeeCKYCId: string;
  totalChargePerEmployee: number;
  seshData: { userId: any; emailAddress: string };
  companyId: number;
  businessMonth: string;
  cycle: string;
}) {
  const transferType = 'MAIN_TO_SUB';
  const chargePerEmployeeTransfer: any = await transferMoneyToSubAccount({
    nonce: uuid,
    type: transferType,
    timestamp: new Date().getTime(),
    companyAccountId: companyAccountId,
    employeeAccountId: employeeCKYCId,
    amount: totalChargePerEmployee,
    operator: {
      id: seshData.userId,
      name: seshData.emailAddress,
    },
  });
  let transferCode = null;
  let transferDate = null;
  let status = 0;
  if (chargePerEmployeeTransfer.success) {
    transferCode = chargePerEmployeeTransfer.responseData.transactionCode;
    transferDate = chargePerEmployeeTransfer.responseData.transactionDate;
    status = 1;
  }
  const createTransferTransaction: any = await Transactions.create({
    companyId: companyId,
    type: transferType,
    businessMonth: businessMonth,
    cycle: cycle,
    transactionCode: transferCode,
    transactionDate: transferDate,
    transactionAmount: totalChargePerEmployee,
    status: status,
  });

  return chargePerEmployeeTransfer.success
    ? {
      success: true,
      message: chargePerEmployeeTransfer.message,
      transferTransactionId: createTransferTransaction.transferId,
    }
    : {
      success: false,
      message: chargePerEmployeeTransfer.message,
      transferTransactionId: null,
    };
}

export async function taskCodeGenerator({
  companyId,
  companyName,
}: {
  companyId: number;
  companyName: string;
}) {
  const latestTask: any = await TaskProcesses.findOne({
    attributes: ['taskCode'],
    where: {
      companyId: companyId,
    },
    order: [['taskId', 'DESC']],
  });

  const matches: any = companyName.match(/\b(\w)/g);
  const acronym: any = removeExtraSpaces(matches.join('')).toUpperCase();
  const prefix = `TASK-${acronym}`;
  let taskCode = latestTask ? latestTask.taskCode : `${prefix}-000000000000`;
  taskCode = taskCode.split('-');
  taskCode = taskCode[2].replace(/\D/g, '');
  taskCode = String('000000000000' + (parseFloat(taskCode) + 1)).slice(-12);
  return `${prefix}-P${taskCode}`;
}

const getDataOnFirstCycle = async (
  companyId: number,
  departmentId: number,
  employeeId: number,
  businessMonth: string,
  cycle: string,
  isMonthlyRated: boolean
) => {
  const data: any = await Payroll.findOne({
    where: {
      companyId: companyId,
      businessMonth: businessMonth,
      departmentId: departmentId,
      cycle: cycle,
      isPosted: true,
      employeeId: employeeId,
    },
    include: [
      {
        model: Employee,
        include: [
          {
            attributes: [
              'date',
              'isPresent',
              'isDayOff',
              'isLeave',
              'isHalfDay',
              'overtimeHours',
            ],
            model: Attendance,
            where: {
              businessMonth: businessMonth,
              cycle: cycle,
              companyId: companyId,
              departmentId: departmentId,
            },
            include: [
              {
                attributes: ['holidayType'],
                model: Holiday,
              },
            ],
          },
        ],
        where: {
          employeeId: employeeId,
        },
      },
      {
        model: Department,
        paranoid: false,
      },
    ],
  });

  if (!data) {
    return {
      success: false,
    };
  }

  const premiumAttendanceData: any = await getPremiumAttendanceBreakdown({
    employeeDetails: {
      employeeId: data?.employeeId,
      departmentId: data.departmentId,
      daysOff: data.daysOff,
    },
    attendanceDetails: {
      businessMonth: businessMonth,
      cycle: cycle,
    },
  });
  if (premiumAttendanceData.success) {
    const {
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
    } = premiumAttendanceData.data;

    // ========amount of hours or days==============
    const workedOnRD = workedOnRestDays;
    const workedOnSPHD = workedOnSpecialHoliday;
    const workedOnSPHDWhileRD = workedOnSpecialHolidayWhileRestDay;
    const workedOnRHD = workedOnRegularHoliday;
    const workedOnRHDWhileRD = workedOnRegularHolidayWhileRestDay;
    const halfDayPresentOnRHD = halfDayPresentOnRegularHoliday;
    const halfDayPresentOnSPHD = halfDayPresentOnSpecialHoliday;
    const OTonRegDays = overtimeOnRegularDays;
    const OTonHolidays = overtimeOnHolidays;
    const OTonRestDays = overtimeOnRestDays;
    let workedOnRDOTPay = 0;
    let workedOnRHDOTPay = 0;
    let workedOnRHDWhileRDOTPay = 0;
    let workedOnSPHDOTPay = 0;
    let workedOnSPHDWhileRDOTPay = 0;
    // =======get only the extra pay for monthly rated=========
    // we need to subtract 100 because for ex. reg. holiday pay is 200% we only get
    //  the extra 100% while we leave the 100% out which is just the normal daily rate
    // this is because monthly rated(30days) already considers if you worked on a holiday etc or not

    if (isMonthlyRated) {
      workedOnRDOTPay =
        workedOnRD * data.dailyRate * ((data.restDayRate - 100) / 100);
    } else {
      workedOnRDOTPay = workedOnRD * data.dailyRate * (data.restDayRate / 100);
    }
    // console.log(workedOnRDOTPay);
    // console.log('workedOnRDOTPay!!');
    workedOnRHDOTPay =
      workedOnRHD * data.dailyRate * ((data.regularHolidayRate - 100) / 100);
    // console.log('workedOnRHDOTPay!!');
    // console.log(workedOnRHDOTPay);

    if (isMonthlyRated) {
      workedOnRHDWhileRDOTPay =
        workedOnRHDWhileRD *
        data.dailyRate *
        ((data.regularHolidayRestDayRate - 100) / 100);
    } else {
      workedOnRHDWhileRDOTPay =
        workedOnRHDWhileRD *
        data.dailyRate *
        (data.regularHolidayRestDayRate / 100);
    }
    workedOnSPHDOTPay =
      workedOnSPHD * data.dailyRate * ((data.specialHolidayRate - 100) / 100);
    // console.log('workedOnSPHDOTPay!!');
    // console.log(workedOnSPHDOTPay);
    if (isMonthlyRated) {
      workedOnSPHDWhileRDOTPay =
        workedOnSPHDWhileRD *
        data.dailyRate *
        ((data.specialHolidayRestDayRate - 100) / 100);
    } else {
      workedOnSPHDWhileRDOTPay =
        workedOnSPHDWhileRD *
        data.dailyRate *
        (data.specialHolidayRestDayRate / 100);
    }
    // console.log('workedOnSPHDWhileRDOTPay!!');
    // console.log(workedOnSPHDWhileRDOTPay);

    // if daily rated we get the extra pay with daily rate since it is not included in the month

    const nightDiffPay = data.nightDiffPay;
    const total =
      roundOffByTwoDecimalPlaces(
        workedOnRDOTPay +
        workedOnRHDOTPay +
        workedOnRHDWhileRDOTPay +
        workedOnSPHDOTPay +
        workedOnSPHDWhileRDOTPay
      ) +
      OTonRegDays +
      OTonHolidays +
      OTonRestDays +
      nightDiffPay;
    return {
      success: true,
      otPay: total,
      daysAbsent: data.daysAbsent,
      specialHolidaysAbsent: data.specialHolidaysAbsent,
      latePay: data.latePay,
      undertimePay: data.undertimePay,
      dailyRate: data.dailyRate,
    };
  } else {
    return {
      sucess: false,
    };
  }
};

async function updateDeductionsInBackground({
  payroll_id,
}: {
  payroll_id: number;
}) {
  try {
    const payroll: any = await Payroll.findOne({
      attributes: ['payroll_id', 'isPosted', 'disbursementStatus'],
      where: {
        payroll_id: payroll_id,
      },
      include: [
        {
          model: PayrollDeductions,
          attributes: [
            'payrollDeductionId',
            'deductionId',
            'employeeId',
            'amountPaid',
            'isDeferred',
            'isCollected',
          ],
          include: [
            {
              model: Deduction,
              attributes: ['deductionId', 'amountPaid'],
            },
          ],
        },
      ],
    });

    if (payroll.isPosted == 1) {
      const { payroll_deductions } = payroll;
      if (payroll_deductions.length > 0) {
        for (let j = 0; j < payroll_deductions.length; j++) {
          const payrollDeduction = payroll_deductions[j].dataValues;
          const {
            payrollDeductionId,
            employeeId,
            deductionId,
            amountPaid,
            isDeferred,
            isCollected,
            deduction,
          } = payrollDeduction;

          if (!isDeferred && !isCollected) {
            // Increment amountPaid for the deduction
            await Deduction.update(
              {
                amountPaid: deduction.amountPaid + amountPaid,
              },
              {
                where: {
                  deductionId: deductionId,
                },
              }
            );

            await PayrollDeductions.update(
              {
                isCollected: true,
              },
              {
                where: {
                  payrollDeductionId: payrollDeductionId,
                },
              }
            );
          }

          // Set isCollected to true even if it is DEFERRED because it will be collected on the next cycle
          await PayrollDeductions.update(
            {
              isCollected: true,
            },
            {
              where: {
                isDeferred: true,
                employeeId: employeeId,
                payroll_id: {
                  [Op.ne]: payroll_id,
                },
              },
            }
          );

          // Increment noOfIterations for the deduction
          await Deduction.update(
            {
              noOfIterations: Sequelize.literal('noOfIterations + ' + 1),
            },
            {
              where: {
                deductionId: deductionId,
              },
            }
          );
        }
      }
    }
  } catch (error: any) {
    logger.error({
      label: 'Post Payroll: Update Deductions',
      message: JSON.stringify(error.message ? error.message : error),
    });
  }
}

async function sendPaySlip({
  companyId,
  payroll_id,
  businessMonth,
  cycle,
  departmentId,
  companyDetails,
}: {
  companyId: number;
  departmentId: number;
  payroll_id: number;
  businessMonth: string;
  cycle: string;
  companyDetails: any;
}) {
  try {
    // Send Payslip via EMAIL
    const emailNotificationSettings: any = await notifications.findOne({
      where: {
        serviceType: 'EMAIL',
        companyId: companyId,
      },
    });
    if (
      emailNotificationSettings &&
      emailNotificationSettings.isEnabled === true
    ) {
      console.log('enabler!');
      const payrollForEmail: any = await Payroll.findOne({
        include: [
          {
            model: PayrollDeductions,
            include: [
              {
                model: Deduction,
                include: [
                  {
                    model: TransferToEmployee,
                    attributes: ['disbursementStatus'],
                  },
                  {
                    model: Ledger,
                    attributes: ['amount', 'desc'],
                  },
                ],
              },
            ],
          },
          {
            model: payrollAdjustments,
          },
          {
            model: Employee,
            include: [
              {
                model: EmployeeProfile,
              },
              {
                model: AllowanceBreakdown,
              },
              {
                model: Company,
                attributes: ['companyName'],
              },
              {
                model: Attendance,
                attributes: [
                  'date',
                  'isPresent',
                  'isDayOff',
                  'isLeave',
                  'overtimeHours',
                ],
                where: {
                  businessMonth: businessMonth,
                  cycle: cycle,
                  companyId: companyId,
                  departmentId: departmentId,
                },
                include: [
                  {
                    attributes: ['holidayType'],
                    model: Holiday,
                  },
                ],
                required: false,
              },
            ],
          },
        ],
        where: {
          payroll_id: payroll_id,
        },
      });
      const res: any = await getPremiumAttendanceBreakdown({
        employeeDetails: {
          employeeId: payrollForEmail?.employee?.employeeId,
          departmentId: payrollForEmail?.employee?.departmentId,
          daysOff: payrollForEmail.daysOff,
        },
        attendanceDetails: {
          businessMonth: payrollForEmail?.businessMonth,
          cycle: payrollForEmail?.cycle,
        },
      });

      const {
        workedOnRestDays,
        workedOnRegularHoliday,
        workedOnRegularHolidayWhileRestDay,
        halfDayPresentOnRegularHoliday,
        halfDayPresentOnSpecialHoliday,
        workedOnSpecialHoliday,
        workedOnSpecialHolidayWhileRestDay,
        overtimeOnRegularDays,
        overtimeOnHolidays,
        overtimeOnRH,
        overtimeOnRHRestDay,
        overtimeOnSHRestDay,
        overtimeOnRestDays,
      } = res.data;

      // Assign values to payrollReport[i]
      payrollForEmail.workedOnRestDays = workedOnRestDays;
      payrollForEmail.workedOnRegularHoliday = workedOnRegularHoliday;
      payrollForEmail.workedOnRegularHolidayWhileRestDay =
        workedOnRegularHolidayWhileRestDay;
      payrollForEmail.halfDayPresentOnRegularHoliday =
        halfDayPresentOnRegularHoliday;
      payrollForEmail.halfDayPresentOnSpecialHoliday =
        halfDayPresentOnSpecialHoliday;
      payrollForEmail.workedOnSpecialHoliday = workedOnSpecialHoliday;
      payrollForEmail.workedOnSpecialHolidayWhileRestDay =
        workedOnSpecialHolidayWhileRestDay;
      payrollForEmail.overtimeOnRegularDays = overtimeOnRegularDays;
      payrollForEmail.overtimeOnHolidays = overtimeOnHolidays;
      payrollForEmail.overtimeOnRH = overtimeOnRH;
      payrollForEmail.overtimeOnRHRestDay = overtimeOnRHRestDay;
      payrollForEmail.overtimeOnSHRestDay = overtimeOnSHRestDay;
      payrollForEmail.overtimeOnRestDays = overtimeOnRestDays;
      if (payrollForEmail.disbursementStatus == 1) {
        console.log('ok11!');
        console.log(payrollForEmail.employee.employee_profile.emailAddress);
        sendEmail({
          to: payrollForEmail.employee.employee_profile.emailAddress,
          subject: `${properCasing(companyDetails.companyName)} Payslip for ${payrollForEmail.businessMonth
            } ${properCasing(payrollForEmail.cycle)}`,
          content: payslipEmailContent({
            payroll: payrollForEmail,
            companyName: companyDetails.companyName,
          }),
        });
      }
      // console.log('ok9');
      console.log('ok12!');
    }
  } catch (error: any) {
    logger.error({
      label: 'Post Payroll: Send Payslip',
      message: JSON.stringify(error.message ? error.message : error),
    });
  }
}
const getAllowance = (
  halfDayAllowancePay: string,
  isHalfDay: boolean,
  allowance: number
) => {
  if (isHalfDay) {
    switch (halfDayAllowancePay) {
      case 'FULL':
        return allowance;
      case 'HALF':
        return allowance * 0.5;
      case 'NONE':
        return 0;
      default:
        return allowance;
    }
  } else {
    return allowance;
  }
};
