import { NextRequest, NextResponse } from 'next/server';
import { Employee, EmployeeProfile } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const employeeId = seshData.employeeId;

  try {
    const employee = await Employee.findByPk(employeeId, {
      include: EmployeeProfile,
    });
    return NextResponse.json(
      { success: true, message: employee },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching shifts:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
