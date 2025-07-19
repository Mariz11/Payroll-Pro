import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const data = await executeQuery(`departments_get_attendance`, {
      companyId: companyId,
    });

    const filteredData = data.map((item: any) => item.department_details).filter(
      (item: any) => item.attendances.length > 0
    );

    return NextResponse.json(filteredData);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error getting departments on api/companies/departments:',
        error.message
      );
    } else {
      console.log('Error: ',error);
      return NextResponse.json({ message: error }, { status: 500 })
    };
  }
}
