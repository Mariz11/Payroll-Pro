import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData, signJWTAccessToken } from '@utils/jwt';

import {
  Attendance,
  AttendanceApplication,
  CompanyPayCycle,
  Department,
  Employee,
  EmployeeProfile,
  Holiday,
  Shift,
} from 'db/models';



export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const businessMonth = url.searchParams.get('businessMonth');
    const companyId = url.searchParams.get('companyId');
    const employeeId = url.searchParams.get('employeeId');
    const cycle = url.searchParams.get('cycle');

    const data = await Attendance.findAll({
      where: {
        companyId: companyId,
        businessMonth: businessMonth,
        cycle: cycle,
        employeeId: employeeId,
      },
      include: [
        {
          model: Employee,
          include: [
            {
              model: EmployeeProfile,
            },
            {
              attributes: ['departmentName'],
              model: Department,
              paranoid: false,
            },
          ],
        },
        {
          model: Holiday,
        },
      ],
    });

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    }
    else {
      return NextResponse.json('Something went wrong...')
    }

  }
}
