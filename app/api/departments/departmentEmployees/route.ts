import { NextRequest, NextResponse } from 'next/server';
import { Employee, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { sessionData, selectedCompanyData } from '@utils/jwt';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const { searchParams } = new URL(req.url);
  // const companyId = searchParams.get('companyId');
  const departmentId = searchParams.get('departmentId');
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const employees = await Employee.findAll({
      where: {
        companyId: companyId,
        departmentId: departmentId,
        // employeeStatus: 1,
      },
    });

    return NextResponse.json({ message: employees }, { status: 200 });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching Department Employees:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
