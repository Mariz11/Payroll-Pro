import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: NextRequest, res: NextResponse) {
  const userToken: any = req.headers.get('authorization');
  // const companyId = searchParams.get('companyId');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const employeeList = await executeQuery(`employees_get_top`, {
      companyId,
      limit: 10,
      employeeStatus: 1,
    });

    const employees = employeeList?.map((item: any) => item.employee);

    return NextResponse.json(
      { success: true, message: employees },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching employees:', error.message);
    } else {
      return NextResponse.json({ message: error }, { status: 500 });
    }
  }
}
