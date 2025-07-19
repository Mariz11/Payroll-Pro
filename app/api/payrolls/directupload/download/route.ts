import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const { searchParams } = new URL(req.url);
  const { selectedDepartmentId, businessMonth, cycle } = await req.json();

  try {

    const employeeList: any = await executeQuery('payroll_get_available_employees', {
      companyId,
      departmentId: selectedDepartmentId,
      businessMonth,
      cycle,
      employeeStatus: 1,
      withPayroll: 0
    });

    const employees = employeeList?.map((item: any) => item.employeeData);

    const excludedEmployeeList: any = await executeQuery('payroll_get_available_employees', {
      companyId,
      departmentId: selectedDepartmentId,
      businessMonth,
      cycle,
      employeeStatus: 1,
      withPayroll: 1
    });

    const excludedEmployees = excludedEmployeeList?.map((item: any) => item.employeeData);

    return NextResponse.json({ employees, excludedEmployees });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 500 }
      );
    }
  }
}
