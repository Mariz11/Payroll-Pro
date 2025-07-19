import { NextRequest, NextResponse } from 'next/server';
import { Employee } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  //   const companyId = searchParams.get('companyId');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const employeeStatus1Count = await Employee.count({
      where: { employeeStatus: 1 },
    });

    const employeeStatus2Count = await Employee.count({
      where: { employeeStatus: 2 },
    });
    const employeeStatus3Count = await Employee.count({
      where: { employeeStatus: 3 },
    });
    const employeeStatus0OrNullCount = await Employee.count({
      where: {
        [Op.or]: [{ employeeStatus: 0 }, { employeeStatus: null }],
      },
    });

    const totalCount = await Employee.count({});

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
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error fetching employee counts', error);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
