import { NextRequest, NextResponse } from 'next/server';
import { Employee } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  //   const companyId = searchParams.get('companyId');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const employeeStatus1Count = await Employee.count({
      where: { employeeStatus: 1 },
    });

    const employeeStatus2Count = await Employee.count({
      where: { employeeStatus: 2 },
    });
    const employeeStatus3Count = await Employee.count({
      where: { employeeStatus: 3 },
      paranoid: false,
    });
    const employeeStatus0OrNullCount = await Employee.count({
      where: {
        [Op.or]: [{ employeeStatus: 0 }, { employeeStatus: null }],
      },
      paranoid: false,
    });

    const totalCount = await Employee.count({ paranoid: false });

    return NextResponse.json(
      {
        success: true,
        message: {
          employeeStatus1Count,
          employeeStatus2Count,
          employeeStatus3Count,
          employeeStatus0OrNullCount,
          totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') { console.log('error fetching employee counts', error); }
    else return NextResponse.json(
      { message: error },
      { status: 500 }
    );
  }
}
