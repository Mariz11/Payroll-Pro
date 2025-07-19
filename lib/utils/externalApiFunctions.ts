'use server';
import {
  Attendance,
  City,
  Company,
  CompanyPayCycle,
  Country,
  Deduction,
  Department,
  Employee,
  EmployeeProfile,
  Payroll,
  PayrollType,
  Province,
  User,
} from 'db/models';
import { API_KEY, SECRET_KEY } from '@constant/partnerAPIDetails';
import moment from '@constant/momentTZ';
import crypto from 'crypto';
import { selectedCompanyData, sessionData } from './jwt';
import { Op, Sequelize } from 'sequelize';
import { getEmployeeLoans, getSalaryLoanFunds } from './partnerAPIs';
import { amountFormatter } from './helper';
import { MCASH_MLWALLET } from '@constant/variables';

export async function tokenChecker(userToken: string) {
  const passPhrase = `${API_KEY}|${SECRET_KEY}|${moment().format(
    'YYYY-MM-DD'
  )}`;

  const signature = `Bearer ${crypto
    .createHash('sha512')
    .update(passPhrase)
    .digest('hex')}`;

  return userToken == signature;
}

export async function payloadValidator({
  payload,
  expectedKeys,
}: {
  payload: any;
  expectedKeys: any[];
}) {
  const propertiesSent = Object.keys(payload);
  const errors: any = [];

  propertiesSent.forEach((propKey: any) => {
    let invalidCount = 0;
    expectedKeys.forEach((expKey: any) => {
      if (expKey != propKey) {
        invalidCount++;
      } else {
        return;
      }
    });
    if (invalidCount == expectedKeys.length) {
      errors.push(propKey);
    }
  });

  let response = {
    errors: errors.length,
    message: 'No issues found',
  };

  if (errors.length > 0) {
    response = {
      errors: errors.length,
      message: `Unknown property ${errors.length > 1 ? 'names' : 'name'
        } found: [${errors.join(', ')}]`,
    };
  }

  return response;
}

export async function getQualifiedEmployees({
  companyName,
  employeeTenureship,
  employeeTenureshipUnit,
  modeOfPayroll,
  qualifyingTerm,
}: {
  companyName: string;
  employeeTenureship: number;
  employeeTenureshipUnit: string;
  modeOfPayroll: string;
  qualifyingTerm: number;
}) {
  let companyDetails: any = [];
  if (companyName.toUpperCase() == 'ALL') {
    companyDetails = await Company.findAll({
      offset: 1,
      where: {
        isActive: 1,
      },
    });
  } else {
    companyDetails = await Company.findAll({
      where: {
        isActive: 1,
        $col: Sequelize.where(
          Sequelize.fn('upper', Sequelize.col('companyName')),
          companyName.toUpperCase()
        ),
      },
    });
  }

  const data = [];
  let totalLoanableAmount = 0;
  for (let i = 0; i < companyDetails.length; i++) {
    const companyDetail = companyDetails[i];
    const currentDate = moment().format('YYYY-MM-DD');
    const employees: any = await Employee.findAll({
      where: {
        companyId: companyDetail.companyId,
        departmentId: {
          [Op.not]: null,
        },
        employeeStatus: 1,
        modeOfPayroll: MCASH_MLWALLET.filter((i) =>
          i.includes(modeOfPayroll.toUpperCase())
        ).length
          ? {
            [Op.in]: MCASH_MLWALLET,
          }
          : {
            [Op.eq]: `%${modeOfPayroll}%`,
          },
      },
      attributes: [
        'employeeId',
        'ckycId',
        'mlWalletId',
        'departmentId',
        'modeOfPayroll',
        [Sequelize.col('employee_profile.firstName'), 'firstName'],
        [Sequelize.col('employee_profile.middleName'), 'middleName'],
        [Sequelize.col('employee_profile.lastName'), 'lastName'],
        [Sequelize.col('employee_profile.suffix'), 'suffix'],
        [Sequelize.col('employee_profile.contactNumber'), 'contactNumber'],
        [
          Sequelize.col('employee_profile.emergencyContactNumber1'),
          'emergencyContactNumber1',
        ],
        [
          Sequelize.col('employee_profile.emergencyContactNumber2'),
          'emergencyContactNumber2',
        ],
        [Sequelize.col('employee_profile.birthDate'), 'birthDate'],
        [Sequelize.col('employee_profile.emailAddress'), 'emailAddress'],
        [Sequelize.col('employee_profile.gender'), 'gender'],
        [Sequelize.col('employee_profile.nationality'), 'nationality'],
        [Sequelize.col('employee_profile.civilStatus'), 'civilStatus'],
        [Sequelize.col('employee_profile.city.name'), 'city'],
        [Sequelize.col('employee_profile.province.name'), 'province'],
        [Sequelize.col('employee_profile.country.name'), 'country'],
        'hiringDate',
        'startDate',
        [
          Sequelize.literal(
            `CASE WHEN employeeStatus THEN 'ACTIVE' ELSE 'INACTIVE' END`
          ),
          'employeeStatus',
        ],
      ],
      include: [
        {
          attributes: ['departmentName'],
          model: Department,
          include: [
            {
              attributes: ['type'],
              model: PayrollType,
              include: [
                {
                  attributes: [
                    'cycle',
                    'payDate',
                    'cutOffStartDate',
                    'cutOffEndDate',
                  ],
                  model: CompanyPayCycle,
                  where: {
                    companyId: companyDetail.companyId,
                  },
                },
              ],
            },
          ],
        },
        {
          attributes: [],
          model: EmployeeProfile,
          include: [City, Province, Country],
        },
      ],
    });
    const qualifiedEmployees = [];
    for (let j = 0; j < employees.length; j++) {
      const { ckycId, startDate, employeeId } = employees[j];
      const employeeDetails = employees[j];

      // Check existing Salary Loans
      const getLoans = await getEmployeeLoans({ ckycId: ckycId });

      if (getLoans.success) {
        const loans = getLoans.data;
        if (loans.length > 0) {
          if (
            loans.filter(
              (loan: any) =>
                (loan.status == 'DISBURSED' || loan.is_bad_debt == true) &&
                loan.loan_type.loan_type_name == 'Salary Loan'
            ).length > 0
          ) {
            continue;
          }
        }
      }

      let duration: number = 0;
      if (employeeTenureshipUnit == 'MONTHS') {
        duration = parseInt(
          moment
            .duration(moment(currentDate).diff(moment(startDate)))
            .asMonths()
            .toFixed()
        );
      } else if (employeeTenureshipUnit == 'YEARS') {
        duration = parseInt(
          moment
            .duration(moment(currentDate).diff(moment(startDate)))
            .asYears()
            .toFixed()
        );
      }

      const currentMonthYear = moment().format('MMMM YYYY');
      const businessMonths = [];
      for (let b = qualifyingTerm; b > 0; b--) {
        businessMonths.push(
          moment(currentMonthYear).subtract(b, 'month').format('MMMM YYYY')
        );
      }

      // Check if employee tenureship is greater than or equal to tenureship provided
      if (duration >= employeeTenureship) {
        const payrolls = await Payroll.findAll({
          attributes: ['businessMonth', 'netPay'],
          where: {
            employeeId: employeeId,
            businessMonth: businessMonths,
            netPay: {
              [Op.gte]: 1000,
            },
            isPosted: 1,
          },
        });

        const payrollMonths = Array.from(
          new Set(payrolls.map((payroll: any) => payroll.businessMonth))
        );

        // Marked as not qualified if number of payrolls is not equal to qualifyingTerm
        if (payrollMonths.length != qualifyingTerm) {
          continue;
        }

        const monthWithLowestNetPay: any = payrolls.sort((a: any, b: any) =>
          a.netPay > b.netPay ? 1 : -1
        )[0];
        const loanableAmount = monthWithLowestNetPay
          ? parseFloat((monthWithLowestNetPay.netPay / 2).toFixed(2))
          : 0.0;

        if (loanableAmount <= 0) continue;

        qualifiedEmployees.push({
          tenureShip: duration,
          tenureShipUnit: employeeTenureshipUnit,
          details: employeeDetails,
          payrolls: payrolls,
          monthWithLowestNetPay: monthWithLowestNetPay,
          loanableAmount: loanableAmount,
        });
        totalLoanableAmount += loanableAmount;
      }
    }
    data.push({
      companyName: companyDetail.companyName,
      qualifiedEmployees: qualifiedEmployees,
    });
  }

  return data;
}
