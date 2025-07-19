import { MCASH_MLWALLET } from '@constant/variables';
import {
  getQualifiedEmployees,
  tokenChecker,
} from '@utils/externalApiFunctions';
import { amountFormatter } from '@utils/helper';
import { getRequestLogger } from '@utils/logger';
import { getSalaryLoanFunds } from '@utils/partnerAPIs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Get Qualified Employees',
      message: JSON.stringify({
        success: false,
        message: 'Invalid Token.',
        payload: {
          token: userToken,
        },
        statusCode: 401,
      }),
    });
    return NextResponse.json(
      { success: false, message: 'Invalid Token.', statusCode: 401 },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    if (
      !body.companyName ||
      !body.employeeTenureship ||
      !body.employeeTenureshipUnit ||
      !body.modeOfPayroll
    ) {
      requestLogger.error({
        label: 'Get Qualified Employees',
        message: JSON.stringify({
          success: false,
          message: 'Missing required parameters or incorrect values provided.',
          payload: {
            companyName: body.companyName,
            employeeTenureship: body.employeeTenureship,
            employeeTenureshipUnit: body.employeeTenureshipUnit,
            modeOfPayroll: body.modeOfPayroll,
            // qualifyingTerm: body.qualifyingTerm,
          },
          statusCode: 400,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameters or incorrect values provided.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const payload = {
      companyName: body.companyName,
      employeeTenureship: body.employeeTenureship,
      employeeTenureshipUnit: body.employeeTenureshipUnit,
      modeOfPayroll: body.modeOfPayroll,
      qualifyingTerm: body.qualifyingTerm || 3,
    };

    const { companyName, employeeTenureship, modeOfPayroll, qualifyingTerm } =
      body;
    let { employeeTenureshipUnit } = body;
    employeeTenureshipUnit = employeeTenureshipUnit
      ? employeeTenureshipUnit.toUpperCase()
      : employeeTenureshipUnit;

    if (
      !(
        modeOfPayroll == 'KWARTA PADALA' ||
        MCASH_MLWALLET.includes(modeOfPayroll)
      )
    ) {
      requestLogger.error({
        label: 'Get Qualified Employees',
        message: JSON.stringify({
          success: false,
          message: `Value for 'modeOfPayroll' must be either 'MCash' or 'KWARTA PADALA'`,
          payload: payload,
          statusCode: 400,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: `Value for 'modeOfPayroll' must either be 'MCash' or 'KWARTA PADALA'`,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (typeof employeeTenureship == 'string' || employeeTenureship < 1) {
      requestLogger.error({
        label: 'Get Qualified Employees',
        message: JSON.stringify({
          success: false,
          message: `Value for 'employeeTenureship' must be a number or greater than 0`,
          payload: payload,
          statusCode: 400,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: `Value for 'employeeTenureship' must be a number or greater than 0`,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (typeof qualifyingTerm == 'string' || qualifyingTerm < 1) {
      requestLogger.error({
        label: 'Get Qualified Employees',
        message: JSON.stringify({
          success: false,
          message: `Value for 'qualifyingTerm' must be a number or greater than 0`,
          payload: payload,
          statusCode: 400,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: `Value for 'qualifyingTerm' must be a number or greater than 0`,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (
      !(employeeTenureshipUnit == 'MONTHS' || employeeTenureshipUnit == 'YEARS')
    ) {
      requestLogger.error({
        label: 'Get Qualified Employees',
        message: JSON.stringify({
          success: false,
          message: `Value for 'employeeTenureshipUnit' must be either 'MONTHS' or 'YEARS'`,
          payload: payload,
          statusCode: 400,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: `Value for 'employeeTenureshipUnit' must either be 'MONTHS' or 'YEARS'`,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const getQualifedEmps = await getQualifiedEmployees({
      companyName,
      employeeTenureship,
      employeeTenureshipUnit,
      modeOfPayroll,
      qualifyingTerm,
    });

    if (getQualifedEmps.length > 0) {
      let totalLoanableAmount = 0;
      getQualifedEmps.forEach((i: any) => {
        const qe = i.qualifiedEmployees;
        totalLoanableAmount += qe.reduce(
          (acc: any, j: any) => acc + parseFloat(j.loanableAmount),
          0
        );
      });

      const checkFunds: any = await getSalaryLoanFunds();
      if (checkFunds.success) {
        if (checkFunds.responseData.salaryLoansBalance < totalLoanableAmount) {
          return NextResponse.json(
            {
              success: false,
              message: `Not enough balance for Salary Loans funds. Total Loanable amount: PHP ${amountFormatter(
                totalLoanableAmount
              )}. Current Salary Loan funds: PHP ${amountFormatter(
                checkFunds.responseData.salaryLoansBalance
              )}`,
              statusCode: 409,
            },
            { status: 409 }
          );
        }
      }
    } else {
      requestLogger.error({
        label: 'Get Qualified Employees',
        message: JSON.stringify({
          success: false,
          message: `Company '${companyName}' doesn't exist on our database.`,
          payload: payload,
          statusCode: 404,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: `Company '${companyName}' doesn't exist on our database.`,
          statusCode: 404,
        },
        { status: 404 }
      );
    }

    requestLogger.info({
      label: 'Get Qualified Employees',
      message: JSON.stringify({
        success: true,
        payload: {
          companyName,
          employeeTenureship,
          employeeTenureshipUnit,
          modeOfPayroll,
        },
        statusCode: 200,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        data: getQualifedEmps,
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);

    requestLogger.error({
      label: 'Get Qualified Employees',
      message: JSON.stringify(error),
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong...',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
