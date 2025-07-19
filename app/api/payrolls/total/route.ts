import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  Batch_uploads,
  Company,
  Department,
  Employee,
  EmployeeProfile,
  Payroll,
  Transactions,
} from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';

import moment from '@constant/momentTZ';
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
    const url = new URL(req.url);

    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const departmentId = url.searchParams.get('departmentId');
    const businessMonth = url.searchParams.get('businessMonth');

    const [companyDetails]: any = await executeQuery('companies_get_one', {
      companyId
    })

    const payrollData = await executeQuery('payroll_get_batch_total', {
      companyId,
      search,
      status,
      departmentId: departmentId != '' && departmentId != null ? Number(departmentId) : undefined,
      businessMonth: businessMonth != '' && businessMonth != null ? businessMonth : undefined,
      excludedDisbursementStatus: 2,
      createdAt: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      enableSearchEmployee: companyDetails?.enableSearchEmployee
    });

    return NextResponse.json({ payrollData });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else {
      return NextResponse.json(error);
    }
  }
}
