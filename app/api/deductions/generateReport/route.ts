import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { error } from 'console';
import {
  AllowanceBreakdown,
  Attendance,
  Company,
  Deduction,
  Employee,
  EmployeeProfile,
  Holiday,
  PayrollDeductions,
  TransferToEmployee,
  User,
} from 'db/models';
import attendance from 'db/models/attendance';
import company from 'db/models/company';
import deduction from 'db/models/deduction';
import department from 'db/models/department';
import payroll from 'db/models/payroll';
import payrollAdjustments from 'db/models/payrollAdjustments';
import payrollDeductions from 'db/models/payrollDeductions';
import user from 'db/models/user';
import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { boolean, string } from 'yup';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const departmentId: any = url.searchParams
    .get('departmentIds')
    ?.split(',')
    .map(Number);
  const businessMonth: any = getMonthsBetween(
    url.searchParams.get('startMonth'),
    url.searchParams.get('endMonth')
  );

  try {
    const deductions: any = [];

    await Promise.all(
      departmentId.map(async (id: any) => {
        const departmentData: any = await department.findByPk(id, {
          paranoid: false,
        });
        const months: any = await Promise.all(
          businessMonth.map(async (month: any) => {
            try {
              const deductionReport = await payroll.findAll({
                where: {
                  businessMonth: month,
                  departmentId: id,
                  companyId: companyId,
                },
                include: [
                  {
                    model: Employee,
                    // where: {
                    //   employeeId: {
                    //     [Op.eq]: Sequelize.col('payrolls.employeeId'),
                    //   },
                    // },
                    include: [
                      {
                        model: user,
                        attributes: ['employeeId', 'firstName', 'lastName'],
                        where: {
                          employeeId: {
                            [Op.ne]: null,
                          },
                        },
                        paranoid: false,
                      },
                    ],
                    attributes: ['employeeStatus', 'employeeCode'],
                    paranoid: false,
                  },
                  {
                    model: payrollDeductions,
                    include: [
                      {
                        model: deduction,
                        attributes: ['deductionType', 'totalAmount'],
                      },
                    ],
                  },
                  {
                    model: payrollAdjustments,
                    attributes: ['addAdjustment', 'deductAdjustment'],
                  },
                ],
                attributes: [
                  'philhealthContribution',
                  'sssContribution',
                  'pagIbigContribution',
                  'businessMonth',
                  'latePay',
                  'undertimePay',
                  'withholdingTax',
                ],
              });

              const combined = combinePayrollData(deductionReport);

              return {
                month: month,
                formattedData: combined,
              };
            } catch (error) {
              console.log(error);
            }
          })
        );
        deductions.push({
          departmentId: id,
          departmentName: departmentData.departmentName,
          months,
        });
      })
    );

    const companyDetails: any = await company.findByPk(companyId, {
      attributes: ['companyName'],
    });

    return NextResponse.json({
      message: 'Success',
      deductionReport: deductions,
      companyDetails,
    });
  } catch (err: any) {
    if (err && err.name === 'SequelizeDatabaseError') {
      console.log({ message: 'Error', error: err }, { status: 400 });
      return;
    } else {
      return NextResponse.json(
        { message: 'generating reports error', error: err.message },
        { status: 500 }
      );
    }
  }
}

function combinePayrollData(report: any) {
  const combinedData: any = [];
  report.forEach((item: any) => {
    const cashAdvance = item.payroll_deductions.filter(
      (d: any) => d.deduction.deductionType === 'Cash Advance'
    );
    let cashAdvanceSum = 0;

    cashAdvance.forEach((item: any) => {
      cashAdvanceSum += item.deduction.totalAmount;
    });

    const sssLoan = item.payroll_deductions.filter(
      (d: any) =>
        d.deduction.deductionType === 'SSS Loan' ||
        d.deduction.deductionType === 'SSS Calamity Loan'
    );
    let sssLoanSum = 0;

    sssLoan.forEach((item: any) => {
      sssLoanSum += item.deduction.totalAmount;
    });

    const pagIbigLoan = item.payroll_deductions.filter(
      (d: any) => d.deduction.deductionType === 'HDMF Loan'
    );
    let pagIbigLoanSum = 0;

    pagIbigLoan.forEach((item: any) => {
      pagIbigLoanSum += item.deduction.totalAmount;
    });

    const others = item.payroll_deductions.filter(
      (d: any) => d.deduction.deductionType === 'Other'
    );
    let othersSum = 0;

    others.forEach((item: any) => {
      othersSum += item.deduction.totalAmount;
    });

    const deductAdjustments = item.payroll_adjustments;
    let deductAdjustmentsSum = 0;
    let addAdjustmentsSum = 0;

    deductAdjustments.forEach((item: any) => {
      addAdjustmentsSum += item.addAdjustment;
      deductAdjustmentsSum += item.deductAdjustment;
    });

    combinedData.push({
      employeeCode: item.employee.employeeCode,
      employeeStatus: item.employee.employeeStatus,
      firstName: item.employee.user.firstName,
      lastName: item.employee.user.lastName,
      philhealthContribution: item.philhealthContribution,
      sssContribution: item.sssContribution,
      pagIbigContribution: item.pagIbigContribution,
      lateAndUTDeductions: item.latePay + item.undertimePay,
      cashAdvance: cashAdvanceSum,
      sssLoan: sssLoanSum,
      pagIbigLoan: pagIbigLoanSum,
      others: othersSum,
      withholdingTax: item.withholdingTax,
      deductAdjustments:
        deductAdjustmentsSum > addAdjustmentsSum
          ? deductAdjustmentsSum - addAdjustmentsSum
          : 0,
    });
  });

  let combinedContributions: any = {};
  // initialize map
  combinedData.forEach((contribution: any) => {
    let { employeeCode, employeeStatus, firstName, lastName } = contribution;

    if (!combinedContributions[employeeCode]) {
      combinedContributions[employeeCode] = {};
      combinedContributions[employeeCode].employeeCode = employeeCode;
      combinedContributions[employeeCode].employeStatus = employeeStatus;
      combinedContributions[employeeCode].firstName = firstName;
      combinedContributions[employeeCode].lastName = lastName;
      combinedContributions[employeeCode].philhealthContribution = 0;
      combinedContributions[employeeCode].sssContribution = 0;
      combinedContributions[employeeCode].pagIbigContribution = 0;
      combinedContributions[employeeCode].lateAndUTDeductions = 0;
      (combinedContributions[employeeCode].cashAdvance = 0),
        (combinedContributions[employeeCode].sssLoan = 0),
        (combinedContributions[employeeCode].pagIbigLoan = 0),
        (combinedContributions[employeeCode].others = 0);
      combinedContributions[employeeCode].deductAdjustment = 0;
      combinedContributions[employeeCode].withholdingTax = 0;
    }
  });

  combinedData.forEach((contribution: any) => {
    let {
      employeeCode,
      philhealthContribution,
      sssContribution,
      pagIbigContribution,
      lateAndUTDeductions,
      cashAdvance,
      sssLoan,
      pagIbigLoan,
      others,
      withholdingTax,
      deductAdjustments,
    } = contribution;

    if (combinedContributions[employeeCode]) {
      combinedContributions[employeeCode].philhealthContribution +=
        philhealthContribution;
      combinedContributions[employeeCode].sssContribution += sssContribution;
      combinedContributions[employeeCode].pagIbigContribution +=
        pagIbigContribution;
      combinedContributions[employeeCode].lateAndUTDeductions +=
        lateAndUTDeductions;
      (combinedContributions[employeeCode].cashAdvance += cashAdvance),
        (combinedContributions[employeeCode].sssLoan += sssLoan),
        (combinedContributions[employeeCode].pagIbigLoan += pagIbigLoan),
        (combinedContributions[employeeCode].others += others);
      combinedContributions[employeeCode].deductAdjustment += deductAdjustments;
      combinedContributions[employeeCode].withholdingTax += withholdingTax;
    } else {
      combinedContributions[employeeCode] = {
        ...contribution,
      };
    }
    // console.log('after!');
    // console.log(combinedContributions[employeeCode].deductAdjustment);
  });
  let combinedContributionsArray = Object.values(combinedContributions);

  return combinedContributionsArray;
}

function getMonthsBetween(fromMonthYear: any, toMonthYear: any) {
  // Parse the from and to dates
  const [startMonth, startYear] = fromMonthYear.split(' ');
  const [endMonth, endYear] = toMonthYear.split(' ');

  // Create Date objects for start and end
  const startDate = new Date(startYear, getMonthIndex(startMonth));
  const endDate = new Date(endYear, getMonthIndex(endMonth));

  // Initialize result array
  const months = [];

  // Loop through dates and push each month to result
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const monthYearString: any = `${getMonthName(
      currentDate.getMonth()
    )} ${currentDate.getFullYear()}`;
    months.push(monthYearString);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

// Helper function to get month index (0-based)
function getMonthIndex(monthName: any) {
  const monthNames = [
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
  return monthNames.indexOf(monthName);
}

// Helper function to get month name from index (0-based)
function getMonthName(monthIndex: any) {
  const monthNames = [
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
  return monthNames[monthIndex];
}
