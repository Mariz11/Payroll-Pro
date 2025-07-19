import { tokenChecker } from '@utils/externalApiFunctions';
import { getRequestLogger } from '@utils/logger';
import { Company, Payroll } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');
  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Get Companies',
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
    // const companies = await Company.findAll({
    //   attributes: ['companyId', 'companyName'],
    //   paranoid: false,
    //   order: [['companyName', 'ASC']],
    //   include: {
    //     model: Payroll,
    //     paranoid: false,
    //     attributes: ['businessMonth', 'cycle'],
    //   },
    // });
    const allPayrolls = await Payroll.findAll({
      attributes: ['businessMonth', 'cycle'],
      group: [
        'company.companyId',
        'businessMonth',
        'company.companyName',
        'cycle',
      ],
      include: {
        model: Company,
        attributes: ['companyName', 'companyId'],
        paranoid: false,
      },
      where: {
        isPosted: true,
      },
    });
    // console.log('allPayrolls!', allPayrolls);
    const transformDataWithMap = (inputArray: any) => {
      const companyMap = new Map();

      inputArray.forEach((item: any) => {
        // Check if the company exists in the Map
        // console.log('item!', item);
        const companyPlusCompanyName = `${item.company.companyId}<3${item.company.companyName}`;
        if (!companyMap.has(companyPlusCompanyName)) {
          companyMap.set(companyPlusCompanyName, new Map());
        }

        const businessMonthsMap = companyMap.get(companyPlusCompanyName);
        // console.log('ok2');
        // console.log(companyMap.get(companyPlusCompanyName));
        // Check if the businessMonth exists in the company's map
        if (!businessMonthsMap.has(item.businessMonth)) {
          businessMonthsMap.set(item.businessMonth, new Set());
        }
        // console.log('ok3');
        const cyclesSet = businessMonthsMap.get(item.businessMonth);

        // Add the cycle to the Set
        cyclesSet.add(item.cycle);
      });

      // Convert the Map structure back into the desired output format
      const result: any = [];
      // console.log('companyMap!', companyMap);
      companyMap.forEach((businessMonthsMap, companyPlusCompanyName) => {
        const businessMonths: any = [];
        businessMonthsMap.forEach((cyclesSet: any, businessMonth: any) => {
          businessMonths.push({
            businessMonth,
            cycles: Array.from(cyclesSet),
          });
        });
        let [companyId, companyName] = companyPlusCompanyName.split('<3');
        result.push({
          companyId,
          companyName,
          businessMonths,
        });
      });

      return result;
    };
    const data = transformDataWithMap(allPayrolls);
    return NextResponse.json(
      {
        success: true,
        data: data,
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    requestLogger.error({
      label: 'Get Companies',
      message: JSON.stringify({
        success: false,
        message: JSON.stringify(error),
        statusCode: 500,
      }),
    });
    return NextResponse.json(
      {
        success: false,
        error: JSON.stringify(error),
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Get Companies',
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

    if (!body.companyName) {
      requestLogger.error({
        label: 'Get Companies',
        message: JSON.stringify({
          success: false,
          message: 'Missing required properties or incorrect values provided.',
          payload: { companyName: body.companyName },
          statusCode: 400,
        }),
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Missing required properties or incorrect values provided.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const { companyName } = body;

    const payload = {
      companyName,
    };

    let data: any = null;
    if (companyName.toUpperCase() == 'ALL') {
      data = await Company.findAll({
        attributes: ['companyId', 'companyName', 'isActive'],
        where: {
          isActive: true,
          companyName: {
            [Op.not]: 'SUPER ADMIN COMPANY',
          },
        },
      });
    } else {
      data = await Company.findOne({
        attributes: ['companyId', 'companyName', 'isActive'],
        where: {
          companyName: companyName,
        },
      });
    }

    if (!data || data.length == 0) {
      requestLogger.error({
        label: 'Get Companies',
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
      label: 'Get Companies',
      message: JSON.stringify({
        success: true,
        payload: payload,
        statusCode: 200,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        data: data,
        statusCode: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);

    requestLogger.error({
      label: 'Get Companies',
      message: error.message,
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
