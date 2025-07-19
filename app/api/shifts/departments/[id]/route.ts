import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, EmployeeProfile } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('departments/')[1];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {

    const employeeList: any = await executeQuery(`employees_get_by_shifts`, {
      departmentId: id,
      employeesWithoutShift: true
    });
    const employees = employeeList.map((item: any) => item.employee)
    return NextResponse.json(
      { success: true, message: { employees } },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error fetching shifts:', error);
    } else {
      return NextResponse.json(
        { message: error, success: false },
        { status: 500 }
      );
    }
  }
}
