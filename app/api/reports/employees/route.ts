import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const roleOfCurrentlyLoggedIn = seshData.role;

  const withSelectedCompany = selectedCompData ? true : false;
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const params: any = {
      employeeStatus: 1,
      includeEmployeeProfile: true,
      includeDepartment: true,
      includeCompany: true
    };

    if ((roleOfCurrentlyLoggedIn == 'SUPER_ADMIN' || roleOfCurrentlyLoggedIn == 'SUPER ADMIN') && withSelectedCompany) {
      params.companyId = selectedCompData.companyId;
    } else if (roleOfCurrentlyLoggedIn !== 'SUPER_ADMIN' && roleOfCurrentlyLoggedIn !== 'SUPER ADMIN') {
      params.companyId = seshData.companyId;
    }

    const [employeeLogs] = await executeQuery(`employees_get_include_join_for_export`, params);

    return NextResponse.json({ employeeLogs });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    }
    else
      console.error('Error getting employees reports: ', error);
      return NextResponse.json({ message: error }, { status: 500 });
  }

}
