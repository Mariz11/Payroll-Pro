import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {

    const [employeeData]: any = await executeQuery(`employees_get_include_join`, {
      companyId,
      employeeStatus: 1,
      includeEmployeeProfile: true,
    });

    const departmentData: any = await executeQuery(`departments_get`, {
      companyId,
      paranoid: 1
    });

    return NextResponse.json({
      employeeData: employeeData?.results,
      departmentData,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else {
      console.info(`[Company Reports] ERROR`, error || '');
      return NextResponse.json({ message: 'Error Occued' }, { status: 500 });
    }
      
  }
}
