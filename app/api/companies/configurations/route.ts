import moment from '@constant/momentTZ';
import { getCurrentOrNewShiftDetails } from '@utils/companyDetailsGetter';
import getNightDifferentialHours from '@utils/getNightDifferentialHours';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  ActivityLog,
  Attendance,
  Company,
  CompanyPayCycle,
  CompanyWithholdingTaxShield,
  Department,
  Employee,
  PayrollType,
  Shift,
} from 'db/models';
import Notifications from 'db/models/notifications';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    // const data = await CompanyPayCycle.findAll({
    //     where: {
    //         companyId: companyId
    //     },
    // });
    // return NextResponse.json(data);

    const data = await PayrollType.findAll({
      include: [
        {
          model: Department,
          where: {
            companyId: companyId,
          },
          required: false,
        },
        {
          model: CompanyPayCycle,
          where: {
            companyId: companyId,
            deletedAt: null,
          },
        },
        {
          model: CompanyWithholdingTaxShield,
          where: {
            companyId: companyId,
            deletedAt: null,
          },
          required: false,
        },
      ],
      order: [[CompanyWithholdingTaxShield, 'bracket', 'ASC']],
    });
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting company configurations:', error.message);
    } else
      return NextResponse.json('Error getting payroll types', { status: 500 });
  }
}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const {
      payCycleFormsData,
      workingDays,
      emailEnabled,
      allowanceForLeaves,
      leavesOnHolidays,
      allowanceOnHolidays,
      nightDifferential,
      nightDifferentialRate,
      nightDifferentialStartTime,
      nightDifferentialEndTime,
      regularHoliday,
      regularHolidayRate,
      regularHolidayRestDayRate,
      specialHoliday,
      specialHolidayRate,
      specialHolidayRestDayRate,
      restDay,
      restDayRate,
      nightDiffDepts,
      monthlyRatedEmployeesData,
      isHolidayDayoffPaid,
      useFixedGovtContributionsRate,
      enableSearchEmployee,
      halfdayAllowancePay,
    } = await req.json();
    // console.log('rhdDayoffPaid!', isHolidayDayoffPaid);
    // get instance of company for comparing values
    const company: any = await Company.findByPk(companyId);
    // =======================NOTIFICATION CONFIGURATION =======================
    // for email
    let notification = null;
    notification = await Notifications.findOne({
      where: { companyId: companyId, serviceType: 'EMAIL' },
    });
    if (!notification) {
      await Notifications.create({
        companyId: companyId,
        serviceType: 'EMAIL',
        isEnabled: emailEnabled,
        serviceFor: '',
      });
    }
    await Notifications.update(
      {
        isEnabled: emailEnabled,
      },
      {
        where: {
          companyId: companyId,
        },
      }
    );
    // ======================= WORKING DAYS OF THE YEAR CONFIGURATION =======================
    // compare values if input is actually a new value

    const doBackgroundCalculations = async () => {
      if (company.workingDays !== workingDays) {
        // Re-compute OT and Daily rates of Employee
        await Employee.findAll({
          where: {
            companyId: companyId,
          },
          include: Shift,
        }).then(async (res: any) => {
          const employees = res;
          for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];
            const dailyRate = parseFloat(
              ((employee.basicPay * 12) / workingDays).toFixed(2)
            );
            let overtimeRateRegDays = 0;
            let overtimeRateHolidays = 0;
            let overtimeRateRestDays = 0;

            if (employee.shift) {
              const shift = employee.shift;
              const workingHours = shift.workingHours;
              const hourlyRate = parseFloat(
                (dailyRate / workingHours).toFixed(2)
              );
              overtimeRateRegDays = hourlyRate * 1.25;
              overtimeRateHolidays = hourlyRate * 1.69;
              overtimeRateRestDays = hourlyRate * 1.69;
            }

            await Employee.update(
              {
                dailyRate: dailyRate,
                overtimeRateRegDays: overtimeRateRegDays,
                overtimeRateHolidays: overtimeRateHolidays,
                overtimeRateRestDays: overtimeRateRestDays,
              },
              {
                where: {
                  employeeId: employee.employeeId,
                },
              }
            );
          }
        });
      }
      // update pending attendances for that company
      // if night differential is not enabled, then set nightDiffHours to 0
      if (!nightDifferential) {
        await Attendance.update(
          {
            nightDiffHours: 0,
          },
          {
            where: {
              companyId: companyId,
              isPosted: false,
            },
          }
        );
        // update posted attendances for that company and recalculate nightDiffHours
      } else {
        await Attendance.update(
          {
            nightDiffHours: 0,
          },
          {
            where: {
              companyId: companyId,
              departmentId: {
                [Op.notIn]: nightDiffDepts,
              },
              isPosted: false,
            },
          }
        );
        const attendancesWithNightDiff: any = await Attendance.findAll({
          where: {
            departmentId: {
              [Op.in]: nightDiffDepts,
            },
            companyId: companyId,
            isPosted: false,
          },
        });
        for (let i = 0; i < attendancesWithNightDiff.length; i++) {
          let shift: any = null;
          const getShiftDetails = await getCurrentOrNewShiftDetails({
            employeeId: attendancesWithNightDiff[i].employeeId,
            attendanceDate: attendancesWithNightDiff[i].date,
          });

          if (getShiftDetails.success) {
            shift = getShiftDetails.shift;
          }
          const attendance = attendancesWithNightDiff[i];
          // if (attendance.employeeId == 4) {
          //   console.log('data!');
          // }
          let nightDiffHours = 0;
          if (
            attendance.isPresent ||
            (attendance.isHalfDay && attendance.isLeave)
          ) {
            nightDiffHours = getNightDifferentialHours(
              attendance.date,
              attendance.timeIn,
              attendance.lunchTimeOut,
              attendance.lunchTimeIn,
              attendance.timeOut,
              nightDifferentialStartTime,
              nightDifferentialEndTime,
              shift.timeIn
            );
          }
          await Attendance.update(
            {
              nightDiffHours: nightDiffHours,
            },
            {
              where: {
                attendanceId: attendance.attendanceId,
              },
            }
          );
        }
      }
    };
    doBackgroundCalculations();
    await Company.update(
      {
        workingDays: workingDays,
        allowanceForLeaves: allowanceForLeaves,
        leavesOnHolidays: leavesOnHolidays,
        allowanceOnHolidays: allowanceOnHolidays,
        nightDifferential: nightDifferential,
        nightDifferentialRate: nightDifferentialRate,
        nightDifferentialStartHour: nightDifferentialStartTime,
        nightDifferentialEndHour: nightDifferentialEndTime,
        regularHoliday: regularHoliday,
        regularHolidayRate: regularHolidayRate,
        regularHolidayRestDayRate: regularHolidayRestDayRate,
        specialHoliday: specialHoliday,
        specialHolidayRate: specialHolidayRate,
        specialHolidayRestDayRate: specialHolidayRestDayRate,
        restDay: restDay,
        restDayRate: restDayRate,
        useFixedGovtContributionsRate: useFixedGovtContributionsRate,
        isHolidayDayoffPaid: isHolidayDayoffPaid,
        enableSearchEmployee: enableSearchEmployee,
        halfdayAllowancePay: halfdayAllowancePay,
      },
      {
        where: {
          companyId: companyId,
        },
      }
    );
    await Department.update(
      {
        applyNightDiff: true,
      },
      {
        where: {
          companyId: companyId,
          departmentId: {
            [Op.in]: nightDiffDepts,
          },
        },
      }
    );
    await Department.update(
      {
        applyNightDiff: false,
      },
      {
        where: {
          companyId: companyId,
          departmentId: {
            [Op.notIn]: nightDiffDepts,
          },
        },
      }
    );
    if (!nightDifferential) {
      await Department.update(
        {
          applyNightDiff: false,
        },
        {
          where: {
            companyId: companyId,
          },
        }
      );
    }
    // ======================= PAYCYCLE CONFIGURATION =======================
    // Delete existing Company Pay Cycle
    await CompanyPayCycle.destroy({
      where: {
        companyId: companyId,
        payrollTypeId: null,
      },
    });
    let monthlyCount = 0;
    let weeklyCount = 0;
    let semiMonthlyCount = 0;
    let semiWeeklyCount = 0;
    console.log('payCycleFormsData!', payCycleFormsData);
    for (let i = 0; i < payCycleFormsData.length; i++) {
      const company_pay_cycles = payCycleFormsData[i].company_pay_cycles;
      const company_withholding_tax_shields =
        payCycleFormsData[i].company_withholding_tax_shields;
      const departments = payCycleFormsData[i].departments;
      const payrollTypeId = payCycleFormsData[i].payrollTypeId;
      const payrollType = payCycleFormsData[i].type;
      // list number of monthly, weekly, semi weekly
      if (payrollType === 'WEEKLY') {
        weeklyCount++;
      } else if (payrollType === 'SEMI-MONTHLY') {
        semiMonthlyCount++;
      } else if (payrollType === 'MONTHLY') {
        monthlyCount++;
      } else if (payrollType === 'SEMI-WEEKLY') {
        semiWeeklyCount++;
      }
      // console.log('company_pay_cycles!', company_pay_cycles);

      for (let j = 0; j < company_pay_cycles.length; j++) {
        const cycleDetail = company_pay_cycles[j];
        await CompanyPayCycle.upsert({
          payCycleId: cycleDetail.payCycleId,
          payrollTypeId: payrollTypeId,
          companyId: companyId,
          payrollType: cycleDetail.type,
          cycle: cycleDetail.cycle,
          payDate: cycleDetail.payDate,
          cutOffStartDate:
            cycleDetail.cycle == 'WEEKLY'
              ? moment(cycleDetail.payDate, 'dd')
                  .subtract(6, 'days')
                  .format('dddd')
                  .toUpperCase()
              : cycleDetail.cutOffStartDate,
          cutOffEndDate:
            cycleDetail.cycle == 'WEEKLY'
              ? moment(cycleDetail.payDate, 'dd')
                  .subtract(1, 'days')
                  .format('dddd')
                  .toUpperCase()
              : cycleDetail.cutOffEndDate,
          preferredMonth:
            cycleDetail.preferredMonth == ''
              ? null
              : cycleDetail.preferredMonth,
          isApplyGovtBenefits: cycleDetail.isApplyGovtBenefits,
          deductibleContributions:
            cycleDetail.isApplyGovtBenefits &&
            ((payrollType == 'WEEKLY' &&
              cycleDetail.deductibleContributions &&
              (cycleDetail.deductibleContributions?.firstCycle?.length > 0 ||
                cycleDetail.deductibleContributions?.secondCycle?.length > 0 ||
                cycleDetail.deductibleContributions?.thirdCycle?.length > 0 ||
                cycleDetail.deductibleContributions?.fourthCycle?.length > 0 ||
                cycleDetail.deductibleContributions?.fifthCycle?.length > 0)) ||
              (payrollType == 'SEMI-MONTHLY' &&
                cycleDetail.deductibleContributions &&
                cycleDetail.deductibleContributions.length > 0))
              ? JSON.stringify(cycleDetail.deductibleContributions)
              : null,
        });
      }

      for (let k = 0; k < company_withholding_tax_shields.length; k++) {
        const bracketDetails = company_withholding_tax_shields[k];
        await CompanyWithholdingTaxShield.upsert({
          withholdingTaxShieldId: bracketDetails.withholdingTaxShieldId,
          companyId: companyId,
          payrollTypeId: payrollTypeId,
          bracket: bracketDetails.bracket,
          from: bracketDetails.from,
          to: bracketDetails.to,
          fixTaxAmount: bracketDetails.fixTaxAmount,
          taxRateExcess: bracketDetails.taxRateExcess,
        });
        // console.log(bracketDetails)
      }

      // Check current associated departments
      const currentAssignedDepartments = await Department.findAll({
        attributes: ['departmentId'],
        where: {
          companyId: companyId,
          payrollTypeId: payrollTypeId,
        },
      });

      // Associated Departments
      await Department.update(
        {
          payrollTypeId: payrollTypeId,
        },
        {
          where: {
            companyId: companyId,
            departmentId: {
              [Op.in]: departments,
            },
          },
        }
      );

      // Disassociated Departments
      const dissociateDepartments = currentAssignedDepartments
        .filter((cad: any) => !departments.includes(cad.departmentId))
        .map((cad: any) => cad.departmentId);
      if (dissociateDepartments.length > 0) {
        await Department.update(
          {
            payrollTypeId: null,
          },
          {
            where: {
              companyId: companyId,
              departmentId: {
                [Op.in]: dissociateDepartments,
              },
            },
          }
        );
      }
    }
    if (monthlyCount === 0) {
      CompanyPayCycle.destroy({ where: { companyId, payrollTypeId: 3 } });
      CompanyWithholdingTaxShield.destroy({
        where: { companyId, payrollTypeId: 3 },
      });
    }
    if (semiMonthlyCount === 0) {
      CompanyPayCycle.destroy({
        where: {
          companyId,
          payrollTypeId: 2,
        },
      });
      CompanyWithholdingTaxShield.destroy({
        where: {
          companyId,
          payrollTypeId: 2,
        },
      });
    }

    if (weeklyCount === 0) {
      CompanyPayCycle.destroy({ where: { companyId, payrollTypeId: 1 } });
      CompanyWithholdingTaxShield.destroy({
        where: { companyId, payrollTypeId: 1 },
      });
    }
    // update monthly rated employees
    // const monthlyRatedEmployees = await Employee.update(
    //   {
    //     isMonthlyRated: true,
    //   },
    //   {
    //     where: {
    //       employeeId: {
    //         [Op.in]: monthlyRatedEmployeesData,
    //       },
    //     },
    //   }
    // );
    // const dailyRatedEmployees = await Employee.update(
    //   {
    //     isMonthlyRated: false,
    //   },
    //   {
    //     where: {
    //       employeeId: {
    //         [Op.notIn]: monthlyRatedEmployeesData,
    //       },
    //     },
    //   }
    // );
    // For OLD/EXISTING DATA
    // Updated Attendances and Payrolls for rows that have no department
    // const employees: any = await Employee.findAll({
    //   where: {
    //     companyId: companyId,
    //     departmentId: {
    //       [Op.not]: null,
    //     },
    //   },
    // });

    // for (let i = 0; i < employees.length; i++) {
    //   const employee = employees[i];

    // Assign department on existing Posted entries
    // await Attendance.update(
    //   {
    //     departmentId: employee.departmentId,
    //   },
    //   {
    //     where: {
    //       employeeId: employee.employeeId,
    //       departmentId: null,
    //       isPosted: true,
    //     },
    //   }
    // );

    // await Payroll.update(
    //   {
    //     departmentId: employee.departmentId,
    //   },
    //   {
    //     where: {{}
    //       employeeId: employee.employeeId,
    //       departmentId: null,
    //       isPosted: true,
    //     },
    //   }
    // );

    // Delete existing Pending entries
    // await Attendance.destroy({
    //   where: {
    //     employeeId: employee.employeeId,
    //     departmentId: null,
    //     isPosted: false,
    //   },
    // });

    // await Payroll.destroy({
    //   where: {
    //     employeeId: employee.employeeId,
    //     departmentId: null,
    //     isPosted: false,
    //   },
    // });
    // }

    await ActivityLog.create({
      companyId: companyId,
      userId: seshData.userId,
      message: 'Updated Configurations',
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Configurations has been saved successfully! Some changes may take a few minutes to reflect.',
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error updating company configurations:', error.message);
    } else
      return NextResponse.json({
        success: false,
        message: error.message,
      });
  }
}

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const payload = await req.json();

    const { company_pay_cycles, departments } = payload;
    const payCycleIdsToBeDeleted = company_pay_cycles.map(
      (i: any) => i.payCycleId
    );

    const departmentsToBeDeleted = company_pay_cycles.map(
      (i: any) => i.payrollTypeId
    );

    if (payCycleIdsToBeDeleted.length > 0) {
      await CompanyPayCycle.destroy({
        where: {
          payCycleId: {
            [Op.in]: payCycleIdsToBeDeleted,
          },
          companyId: companyId,
        },
      });
    }

    await Department.update(
      {
        payrollTypeId: null,
      },
      {
        where: {
          payrollTypeId: {
            [Op.in]: departmentsToBeDeleted,
          },
          companyId: companyId,
        },
      }
    );

    await ActivityLog.create({
      companyId: companyId,
      userId: seshData.userId,
      message: 'Deleted Configurations: Payroll Cycle',
    });

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully!',
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error deleting company configurations:', error.message);
    } else
      return NextResponse.json({
        success: false,
        message: error.message,
      });
  }
}
