import { NextRequest, NextResponse } from 'next/server';
import { Employee, EmployeeProfile, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { sessionData, selectedCompanyData } from '@utils/jwt';
import { Op } from 'sequelize';
export async function GET(req: Request, res: Response, next: NextRequest) {
  const { searchParams } = new URL(req.url);
  // const companyId = searchParams.get('companyId');
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const employees = await Employee.findAll({
      where: {
        companyId: companyId,
        departmentId: null,
      },
      attributes: ['employeeId', 'departmentId'],
      include: [
        {
          model: EmployeeProfile,
          attributes: [
            'employeeId',
            'firstName',
            'lastName',
            'middleName',
            'suffix',
            'employeeFullName',
          ],
        },
      ],
    });

    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching shifts:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
