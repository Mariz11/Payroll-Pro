import { isValidToken } from '@utils/jwt';
import { Company, Employee } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';

export async function PUT(req: NextRequest, nextRes: NextResponse) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await req.json();
    const { companyName } = payload;

    if (!companyName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company Name not found',
        },
        { status: 404 }
      );
    }

    const company: any = await Company.findOne({
      where: {
        companyName: companyName,
      },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company Name not found',
        },
        { status: 404 }
      );
    }

    await Employee.update(
      {
        employeeStatus: 1,
        mlWalletStatus: 1,
      },
      {
        where: {
          companyId: company.companyId,
          employeeStatus: {
            [Op.not]: 3,
          },
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: `Employees under ${companyName} were successfully activated`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error activating employees on api/companies/manual/activation/employees:',
        error.message
      );
    } else
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
