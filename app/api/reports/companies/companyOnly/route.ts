import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';
import moment from '@constant/momentTZ';
import {
  Company,
  Department,
  Employee,
  EmployeeBenefit,
  EmployeeProfile,
  User,
} from 'db/models';

import employee from 'db/models/employee';
import payroll from 'db/models/payroll';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {

    const companyList = await executeQuery(`companies_get_include_join`, {
      includeDepartments: true
    });

    return NextResponse.json({ companyList });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    }
    else
      return NextResponse.json({ message: 'Error Occued' }, { status: 500 });
  }

}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const { companyId, departmentId, limit, offset } = await req.json();
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {

    const params: any = {
      companyId: Number(companyId),
      employeeStatus: 1,
      includeEmployeeProfile: true,
      includeEmployeeBenefit: true,
      includePayrolls: true,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    };

    if (departmentId !== 'No Department') {
      params.departmentId = Number(departmentId);
    }

    const [employeeData]: any = await executeQuery(`employees_get_include_join`, params);

    return NextResponse.json(
      { payrollData: employeeData?.results },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    }
    else
      return NextResponse.json({ message: error }, { status: 500 });

  }

}
