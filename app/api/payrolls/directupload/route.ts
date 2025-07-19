import { directPayrollImportHeaders } from '@constant/csvData';
import { calculateCharge } from '@utils/calculateCharge';
import { properCasing, removeExtraSpaces, uuidv4 } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  ActivityLog,
  Attendance,
  Company,
  CompanyCharge,
  Department,
  Employee,
  EmployeeProfile,
  Payroll,
  PayrollDeductions,
  PayrollType,
} from 'db/models';
import moment from '@constant/momentTZ';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes, Sequelize } from 'sequelize';
import connection, { executeQuery, executeRawQuery } from 'db/connection';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { createActivityLog } from '@utils/activityLogs';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const { searchParams } = new URL(req.url);
  const selectedDepartmentId = searchParams.get('departmentId');

  try {

    const employeeResult = await executeQuery(`employees_get_details`, {
      companyId,
      employeeStatus: 1,
      departmentId: selectedDepartmentId,
    })

    const employees = employeeResult.map((employee: any) => employee?.employeeData);

    // const filteredEmployees = employees.filter((employee: any) => {
    //   const department = employee.department;
    //   // 4 is for semi-weekly
    //   return department.payrollTypeId != 4;
    // });
    // console.log('filter!');
    // console.log(
    //   filteredEmployees.map((i: any) => {
    //     return {
    //       employeeId: i.employeeId,
    //       departmentId: i.departmentId,
    //       departmentName: i.department.departmentName,
    //       departmentPayrollTypeId: i.department.payrollTypeId,
    //     };
    //   })
    // );
    return NextResponse.json(employees);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const failedProcesses: any = [];
  let successCounter = 0;
  let taskId = null;
  let transaction = null;
  try {
    const payload = await req.json();
    transaction = await connection.transaction();
    const formattedData: any = await formatCSVData(payload);
    taskId = formattedData.taskId;
    if (!formattedData.success) {
      failedProcesses.push({
        headerTitle: formattedData.summary,
        error: formattedData.detail,
      });
      return NextResponse.json({
        success: false,
        severity: 'error',
        message: failedProcesses,
      });
    }

    const csvData: any = formattedData.data;

    const finalData = [];
    // get charge tiers and threshold data
    const [companyDetailData]: any = await executeQuery(`companies_get_charges`, {
      companyId,
    });
    const companyDetails: any = companyDetailData.companyDetails;
    const charges = companyDetails.company_charges;
    let businessMonthYearCycle = '';
    for (let i = 0; i < csvData.length; i++) {
      // const percentage = (i / csvData.length) * 100;
      try {
        const errorMessage = [];
        let {
          row,
          employeeCode,
          businessMonth,
          businessYear,
          cycle,
          daysWorked,
          workingDays,
          netPay,
        } = csvData[i];

        businessMonth = `${businessMonth} ${businessYear}`;
        businessMonthYearCycle = `${businessMonth} - ${cycle}`;

        const [employeeDetails]: any = await executeQuery(`employees_get_profile_department`, {
          companyId,
          employeeCode
        });

        const employee: any = employeeDetails.employeeData;

        if (!employee) {
          errorMessage.push(`Not found on our database.`);
          failedProcesses.push({
            headerTitle: `Employee Code: ${employeeCode}`,
            error: errorMessage,
          });
          continue;
        }
        if (employee.employeeStatus != 1) {
          errorMessage.push(`This employee is not active.`);
        }
        // if (!employee.shiftId) {
        //   errorMessage.push(`Please assign shift first.`);
        // }
        if (!employee.departmentId) {
          errorMessage.push(`Please assign department first.`);
        }
        if (daysWorked > workingDays) {
          errorMessage.push(
            `Days Worked value must be lesser than or equal to Total Working Days`
          );
        }

        const [duplicateAttendance]: any = await executeQuery("attendances_count", {
          companyId,
          employeeId: employee.employeeId,
          businessMonth,
          cycle
        })

        const checkDuplicateAttendance: any = duplicateAttendance.attendanceCount

        // Checking already exist Payroll
        const [duplicatePayroll]: any = await executeQuery("payrolls_count", {
          companyId,
          employeeId: employee.employeeId,
          businessMonth,
          cycle
        })

        const checkDuplicate: any = duplicatePayroll.payrollCount;

        if (checkDuplicateAttendance > 0 || checkDuplicate > 0) {
          errorMessage.push(
            `It seems there is an existing Attendance/Payroll entry for this employee.`
          );
        }
        const { employeeFullName } = employee.employee_profile;
        if (errorMessage.length > 0) {
          failedProcesses.push({
            headerTitle: employeeFullName,
            error: errorMessage,
          });
          continue;
        }

        const {
          employeeId,
          departmentId,
          department: { payroll_type: { payrollTypeId } },
          department,
          modeOfPayroll,
          basicPay,
          dailyRate,
          overtimeRateRegDays,
          overtimeRateHolidays,
          overtimeRateRestDays,
          dayOff,
          // shift: { workingHours },
          // // deductions, // Disabled Salary Loans
        } = employee;

        // Updated: Clyde (9/24/24): Removed condition to check if employee is on a semi-weekly cycle
        // if (employee.department.payrollTypeId == 4) {
        //   semiWeeklyEmployees.push(row);
        //   continue;
        // }
        // Checking already exist Attendance

        let type = null;
        if (!payrollTypeId || !department.payroll_type) {
          errorMessage.push(
            `This employee's department has no Payroll Type. Please set it in the configurations.`
          );
        } else {
          type = department.payroll_type.type;
        }
        // const { type } = department.payroll_type;

        if (
          type == 'WEEKLY' &&
          !(
            cycle == 'FIRST CYCLE' ||
            cycle == 'SECOND CYCLE' ||
            cycle == 'THIRD CYCLE' ||
            cycle == 'FOURTH CYCLE' ||
            cycle == 'FIFTH CYCLE'
          )
        ) {
          errorMessage.push(
            `Incorrect cycle values provided. Please refer on the Payroll Cycles settings.`
          );
        }

        if (
          type == 'SEMI-MONTHLY' &&
          !(cycle == 'FIRST CYCLE' || cycle == 'SECOND CYCLE')
        ) {
          errorMessage.push(
            `Incorrect cycle values provided. Please refer on the Payroll Cycles settings.`
          );
        }

        if (type == 'MONTHLY' && !(cycle == 'MONTHLY')) {
          errorMessage.push(
            `Incorrect cycle values provided. Please refer on the Payroll Cycles settings.`
          );
        }

        //  Updated: Clyde (10/03/24): Added validation for semi weekly cycles
        if (
          type == 'SEMI-WEEKLY' &&
          (cycle.toLowerCase().includes('cycle') ||
            cycle.toLowerCase().includes('monthly'))
        ) {
          errorMessage.push(
            `Incorrect cycle values provided. Please refer on the Payroll Cycles settings.`
          );
        }

        if (type == 'SEMI-WEEKLY') {
          const regex = /\[(\d{2}\/\d{2}\/\d{4})-(\d{2}\/\d{2}\/\d{4})\]/;
          const regex2 = /\[(\d{1}\/\d{1}\/\d{4})-(\d{1}\/\d{1}\/\d{4})\]/;
          const matches = cycle.match(regex) || cycle.match(regex2);

          // console.log(matches);

          if (matches) {
            const startDate = moment(
              `${matches[1]}/${matches[2]}/${matches[3]}`,
              'MM/DD/YYYY'
            );
            const endDate = moment(
              `${matches[4]}/${matches[5]}/${matches[6]}`,
              'MM/DD/YYYY'
            );

            const parsedBusinessMonth = `${startDate.format(
              'MMMM'
            )} ${startDate.format('YYYY')}`;

            if (parsedBusinessMonth !== businessMonth) {
              errorMessage.push(
                `Incorrect cycle values provided. Please refer on the Payroll Cycles settings.`
              );
            }

            const diffDays = endDate.diff(startDate, 'days');

            if (diffDays > 4) {
              // console.log('err1');
              errorMessage.push(
                `Incorrect cycle values provided. Please refer on the Payroll Cycles settings.`
              );
            }
          }
        }

        if (type == 'SEMI-WEEKLY' && workingDays > 4) {
          errorMessage.push(
            `Total working days should be lesser than or equal to 4 for semiweekly cycle.`
          );
        }

        // Checking duplicate rows in CSV
        finalData.forEach((csv: any, csvNdx: number) => {
          if (
            csv.payrollData.employeeId == employeeId &&
            csv.payrollData.businessMonth == businessMonth &&
            csv.payrollData.cycle == cycle
          ) {
            errorMessage.push(`Duplicate found on rows: [${i + 1} and ${row}]`);
          }
        });

        if (errorMessage.length > 0) {
          failedProcesses.push({
            headerTitle: employeeFullName,
            error: errorMessage,
          });
          continue;
        }

        let finalNetPay = netPay;
        let totalDeduction = 0;
        let loanDeductions: any = [];

        let charge = calculateCharge(finalNetPay, charges);

        finalData.push({
          deductionsData: loanDeductions,
          payrollData: {
            employeeId: employeeId,
            companyId: companyId,
            departmentId: departmentId,
            businessMonth: businessMonth,
            cycle: cycle,
            grossPay: netPay,
            netPay: finalNetPay,
            modeOfPayroll: modeOfPayroll,
            monthlyBasicPay: basicPay,
            dailyRate: dailyRate,
            hourlyRate: dailyRate / 8,
            overtimeRateRegDays: overtimeRateRegDays ?? 0,
            overtimeRateHolidays: overtimeRateHolidays ?? 0,
            overtimeRateRestDays: overtimeRateRestDays ?? 0,
            daysOff: dayOff,
            // chargePerEmployee: companyDetails.chargePerEmployee,
            chargePerEmployee: charge,
            totalDeduction: totalDeduction,
            daysWorked: daysWorked,
            daysAbsent: 0,
            workingDays: workingDays,
            regularHolidays: 0,
            regularHolidaysAbsent: 0,
            regularHolidaysPay: 0,
            specialHolidays: 0,
            specialHolidaysAbsent: 0,
            specialHolidaysPay: 0,
            sickLeaveDays: 0,
            sickLeavePay: 0,
            vacationLeaveDays: 0,
            vacationLeavePay: 0,
            soloParentLeaveDays: 0,
            soloParentLeavePay: 0,
            paternityLeaveDays: 0,
            paternityLeavePay: 0,
            maternityLeaveDays: 0,
            maternityLeavePay: 0,
            serviceIncentiveLeaveDays: 0,
            serviceIncentiveLeavePay: 0,
            otherLeaveDays: 0,
            otherLeavePay: 0,
            overtimeHrs: 0,
            overtimePay: 0,
            undertimeHrs: 0,
            undertimePay: 0,
            lateHrs: 0,
            latePay: 0,
            nightDiffHrs: 0,
            nightDiffPay: 0,
            allowance: 0,
            sssContribution: 0,
            pagIbigContribution: 0,
            philhealthContribution: 0,
            sssERShare: 0,
            sssECShare: 0,
            philHealthERShare: 0,
            pagIbigERShare: 0,
            withholdingTax: 0,
            addAdjustment: 0,
            deductAdjustment: 0,
            isDirect: true,
          },
        });
      } catch (error: any) {
        failedProcesses.push({
          headerTitle: 'Something went wrong...',
          error: error.message,
        });
        await transaction?.rollback();
        return NextResponse.json({
          success: false,
          severity: 'error',
          message: failedProcesses,
        });
      }
    } // end of for loop

    if (failedProcesses.length > 0) {
      await transaction?.rollback();
      return NextResponse.json({
        success: false,
        severity: 'error',
        message: failedProcesses,
      });
    }

    // Insert Payroll data
    if (finalData.length > 0) {
      const handleDecimalValue = (value: any): number => {
        // Handle null cases
        if (value === 'null' || value === null || value === undefined) {
          return 0.0;
        }

        // Convert to number if it's a string
        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        // Check if it's a valid number
        if (isNaN(numValue) || !isFinite(numValue)) {
          return 0.0;
        }

        return numValue;
      };

      for (let i = 0; i < finalData.length; i++) {
        const { payrollData, deductionsData } = finalData[i];
        const [insertPayroll]: any = await executeQuery(`payroll_insert`, {
          p_employeeId: payrollData.employeeId,
          p_companyId: payrollData.companyId,
          p_departmentId: payrollData.departmentId,
          p_businessMonth: payrollData.businessMonth,
          p_cycle: payrollData.cycle,
          p_grossPay: handleDecimalValue(payrollData.grossPay),
          p_netPay: handleDecimalValue(payrollData.netPay),
          p_modeOfPayroll: payrollData.modeOfPayroll,
          p_monthlyBasicPay: handleDecimalValue(payrollData.monthlyBasicPay),
          p_dailyRate: handleDecimalValue(payrollData.dailyRate),
          p_hourlyRate: handleDecimalValue(payrollData.hourlyRate),
          p_overtimeRateRegDays: handleDecimalValue(payrollData.overtimeRateRegDays),
          p_overtimeRateHolidays: handleDecimalValue(payrollData.overtimeRateHolidays),
          p_overtimeRateRestDays: handleDecimalValue(payrollData.overtimeRateRestDays),
          p_daysOff: payrollData.daysOff,
          p_chargePerEmployee: handleDecimalValue(payrollData.chargePerEmployee),
          p_totalDeduction: handleDecimalValue(payrollData.totalDeduction),
          p_daysWorked: payrollData.daysWorked,
          p_daysAbsent: payrollData.daysAbsent,
          p_workingDays: payrollData.workingDays,
          p_regularHolidays: payrollData.regularHolidays,
          p_regularHolidaysAbsent: payrollData.regularHolidaysAbsent,
          p_regularHolidaysPay: handleDecimalValue(payrollData.regularHolidaysPay),
          p_specialHolidays: payrollData.specialHolidays,
          p_specialHolidaysAbsent: payrollData.specialHolidaysAbsent,
          p_specialHolidaysPay: handleDecimalValue(payrollData.specialHolidaysPay),
          p_sickLeaveDays: payrollData.sickLeaveDays,
          p_sickLeavePay: handleDecimalValue(payrollData.sickLeavePay),
          p_vacationLeaveDays: payrollData.vacationLeaveDays,
          p_vacationLeavePay: handleDecimalValue(payrollData.vacationLeavePay),
          p_soloParentLeaveDays: payrollData.soloParentLeaveDays,
          p_soloParentLeavePay: handleDecimalValue(payrollData.soloParentLeavePay),
          p_paternityLeaveDays: payrollData.paternityLeaveDays,
          p_paternityLeavePay: handleDecimalValue(payrollData.paternityLeavePay),
          p_maternityLeaveDays: payrollData.maternityLeaveDays,
          p_maternityLeavePay: handleDecimalValue(payrollData.maternityLeavePay),
          p_serviceIncentiveLeaveDays: payrollData.serviceIncentiveLeaveDays,
          p_serviceIncentiveLeavePay: handleDecimalValue(payrollData.serviceIncentiveLeavePay),
          p_otherLeaveDays: payrollData.otherLeaveDays,
          p_otherLeavePay: handleDecimalValue(payrollData.otherLeavePay),
          p_overtimeHrs: handleDecimalValue(payrollData.overtimeHrs),
          p_overtimePay: handleDecimalValue(payrollData.overtimePay),
          p_undertimeHrs: handleDecimalValue(payrollData.undertimeHrs),
          p_undertimePay: handleDecimalValue(payrollData.undertimePay),
          p_lateHrs: handleDecimalValue(payrollData.lateHrs),
          p_latePay: handleDecimalValue(payrollData.latePay),
          p_nightDiffHrs: handleDecimalValue(payrollData.nightDiffHrs),
          p_nightDiffPay: handleDecimalValue(payrollData.nightDiffPay),
          p_allowance: handleDecimalValue(payrollData.allowance),
          p_sssContribution: handleDecimalValue(payrollData.sssContribution),
          p_pagIbigContribution: handleDecimalValue(payrollData.pagIbigContribution),
          p_philhealthContribution: handleDecimalValue(payrollData.philhealthContribution),
          p_sssERShare: handleDecimalValue(payrollData.sssERShare),
          p_sssECShare: handleDecimalValue(payrollData.sssECShare),
          p_philHealthERShare: handleDecimalValue(payrollData.philHealthERShare),
          p_pagIbigERShare: handleDecimalValue(payrollData.pagIbigERShare),
          p_withholdingTax: handleDecimalValue(payrollData.withholdingTax),
          p_addAdjustment: handleDecimalValue(payrollData.addAdjustment),
          p_deductAdjustment: handleDecimalValue(payrollData.deductAdjustment),
          p_isDirect: payrollData.isDirect
        }, [], QueryTypes.INSERT, transaction as any, QueryReturnTypeEnum.RAW);

        if (deductionsData?.length > 0) {
          const query = deductionsData
            .map((item: any) => {
              const payrollId = connection.escape(insertPayroll.result.payroll_id);
              const employeeId = connection.escape(payrollData.employeeId);
              const deductionId = connection.escape(item.deductionId);
              const perCycleDeduction = handleDecimalValue(connection.escape(item.perCycleDeduction));

              return `CALL payroll_deductions_insert(${payrollId}, ${employeeId}, ${deductionId}, ${perCycleDeduction})`;
            })
            .join('; ');

          await executeRawQuery(query, transaction as any);
        }
      }

      await createActivityLog(companyId, seshData.userId, `Imported Direct Payroll for [${businessMonthYearCycle}]`, transaction as any);
    }

    await transaction?.commit();

    return NextResponse.json({
      success: true,
      severity: 'success',
      message: `Successfully Imported`,
    });
  } catch (error: any) {
    await transaction?.rollback();
    failedProcesses.push({
      headerTitle: 'Something went wrong...',
      error: error.message,
    });

    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 500 }
      );
  }
}

async function formatCSVData(data: any) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const rows = data.data;

  try {
    const headers = directPayrollImportHeaders;
    if (rows[0].length != headers.length) {
      return {
        success: false,
        severity: 'error',
        summary: 'Incorrect Header Format',
        detail: `There seems to be an issue with the format.We advise you to edit the file using google sheets and upload it again.`,
        sticky: true,
      };
    }
    const checkHeaders: any = headers
      .filter((h: any) =>
        rows[0].some((d: any) => h.label.toUpperCase() == d.toUpperCase())
      )
      .map((i: any) => i.label);
    const missingHeaders = headers
      .filter((h: any) => !checkHeaders.includes(h.label.toUpperCase()))
      .map((i: any) => i.label);

    if (missingHeaders.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: 'Missing Column Headers',
        detail: `The ff column headers are missing: ${missingHeaders.join(
          ', '
        )}`,
        sticky: true,
      };
    }

    const finalData = [];
    const foundEmpty = [];
    const invalidBusinessMonthFormat = [];
    const invalidCycleValue = [];
    const invalidBusinessYearFormat = [];
    const invalidDaysWorkedValue = [];
    const invalidWorkingDaysValue = [];
    const invalidNetPayValue = [];
    const employeeNotFound = [];
    const pendingPayrolls = [];
    const duplicateEmployeeCodes = [];
    const employeeCodes = new Map<string, boolean>();
    for (let i = 1; i < rows.length; i++) {
      const obj: any = {};
      const row = i + 1;
      for (let j = 0; j < rows[i].length; j++) {
        const { key, label, required } = headers[j];
        let item = rows[i][j];

        if (item == '' && required) {
          foundEmpty.push(`[Column: ${label.replace('*', '')} - Row: ${row}]`);
          continue;
        }

        if (key == 'employeeCode') {
          let duplicateCSVEC = false;
          if (employeeCodes.get(item) == true) {
            duplicateCSVEC = true;
          }
          employeeCodes.set(item, true);
          if (duplicateCSVEC) {
            duplicateEmployeeCodes.push(row);
            continue;
          }

          const [employee]: any = await executeQuery('employees_get_by_code', {
            employeeCode: item,
            companyId,
            employeeStatus: 1
          });

          if (!employee) {
            employeeNotFound.push(row);
            continue;
          }

          const [pendingPayrollsCountData]: any = await executeQuery('payrolls_count_by_employee', {
            employeeId: employee.employeeId,
            isPosted: 0,
          });

          const pendingPayrollsCount = pendingPayrollsCountData.count;

          if (pendingPayrollsCount > 0) {
            pendingPayrolls.push(row);
            continue;
          }
        }

        if (key == 'businessMonth') {
          item = properCasing(item);

          if (moment(item, 'MMMM').format('MMMM') != item) {
            invalidBusinessMonthFormat.push(row);
            continue;
          }
          item = moment(item, 'MMMM').format('MMMM');
        }

        if (key == 'businessYear') {
          item = removeExtraSpaces(item);

          if (
            !moment(item).isValid() ||
            moment(item, 'YYYY').format('YYYY') !== item ||
            Number(moment().format('YYYY')) - 50 > Number(item)
          ) {
            invalidBusinessYearFormat.push(row);
            continue;
          }
          item = moment(item, 'YYYY').format('YYYY');
        }

        if (key == 'netPay') {
          item = parseFloat(removeExtraSpaces(item).replace(',', ''));

          if (item <= 0 || isNaN(item)) {
            invalidNetPayValue.push(row);
            continue;
          }
        }

        if (key == 'daysWorked') {
          item = parseFloat(removeExtraSpaces(item).replace(',', ''));

          if (item <= 0 || isNaN(item)) {
            invalidDaysWorkedValue.push(row);
            continue;
          }
        }

        if (key == 'workingDays') {
          item = parseFloat(removeExtraSpaces(item).replace(',', ''));

          if (item <= 0 || isNaN(item)) {
            invalidWorkingDaysValue.push(row);
            continue;
          }
        }

        if (key == 'cycle') {
          item = removeExtraSpaces(item.toUpperCase());

          //  Updated: Clyde (9/24/24): Added validation for semi weekly cycles
          const regex = /\[(\d{2}\/\d{2}\/\d{4})-(\d{2}\/\d{2}\/\d{4})\]/;
          const regex2 = /\[(\d{1}\/\d{1}\/\d{4})-(\d{1}\/\d{1}\/\d{4})\]/;
          const match = item.match(regex) || item.match(regex2);

          let validationItem = item;

          if (match) {
            validationItem = 'SEMI-WEEKLY';
          }

          if (
            !(
              item == 'FIRST CYCLE' ||
              item == 'SECOND CYCLE' ||
              item == 'THIRD CYCLE' ||
              item == 'FOURTH CYCLE' ||
              item == 'FIFTH CYCLE' ||
              item == 'MONTHLY' ||
              validationItem == 'SEMI-WEEKLY'
            )
          ) {
            invalidCycleValue.push(row);
            continue;
          }
        }

        obj[key] = item;
        obj['row'] = row;
      }
      finalData.push(obj);
    }

    if (foundEmpty.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: 'Found Empty cells',
        detail: foundEmpty,
        sticky: true,
      };
    }

    if (employeeNotFound.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: 'Employee not found at rows:',
        detail: employeeNotFound,
        sticky: true,
      };
    }
    if (pendingPayrolls.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary:
          'Employees in the following rows have pending payrolls. Please process it first, then try again.',
        detail: pendingPayrolls,
        sticky: true,
      };
    }

    if (duplicateEmployeeCodes.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary:
          'Processing more than one payroll cycle for the same employee is not allowed. To continue, please clear the following rows:',
        detail: duplicateEmployeeCodes,
        sticky: true,
      };
    }

    if (invalidBusinessMonthFormat.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: `Month format is invalid. Ex: ${moment()
          .locale('id')
          .format('MMMM')}`,
        detail: `Invalid Month format at rows: ${invalidBusinessMonthFormat.join(
          ', '
        )}`,
        sticky: true,
      };
    }
    if (invalidBusinessYearFormat.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: `Year format is invalid. Choose between: [${Number(moment().format('YYYY')) - 50
          } - ${moment().locale('id').format('YYYY')}]`,
        detail: `Invalid Year format at rows: ${invalidBusinessYearFormat.join(
          ', '
        )}`,
        sticky: true,
      };
    }
    if (invalidCycleValue.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: `Cycle value should either be [Monthly / First Cycle / Second Cycle / Third Cycle / Fourth Cycle / Fifth Cycle]`,
        detail: `Invalid Cycle value on rows: ${invalidCycleValue.join(', ')}`,
        sticky: true,
      };
    }

    if (invalidDaysWorkedValue.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: `Days Worked should be a positive number value`,
        detail: `Invalid Days Worked value on rows: ${invalidDaysWorkedValue.join(
          ', '
        )}`,
        sticky: true,
      };
    }

    if (invalidWorkingDaysValue.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: `Total Working Days should be a positive number value`,
        detail: `Invalid Total Working Days value on rows: ${invalidWorkingDaysValue.join(
          ', '
        )}`,
        sticky: true,
      };
    }

    if (invalidNetPayValue.length > 0) {
      return {
        success: false,
        severity: 'error',
        summary: `Net Pay should be a positive number value`,
        detail: `Invalid Net Pay value on rows: ${invalidNetPayValue.join(
          ', '
        )}`,
        sticky: true,
      };
    }

    return {
      success: true,
      data: finalData,
    };
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log('error', error);
    } else
      return {
        success: false,
        severity: 'error',
        summary: `Something went wrong...`,
        detail: JSON.stringify(error),
        sticky: true,
      };
  }
}
