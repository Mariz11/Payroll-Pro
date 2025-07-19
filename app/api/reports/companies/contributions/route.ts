import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const { employeeId, departmentId, limit, offset } = await req.json();

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

    if (employeeId !== 'No Employee') {
      params.employeeId = Number(employeeId);
    } else if (departmentId !== 'No Department') {
      params.departmentId = Number(departmentId);
    }

    const [employeeData]: any = await executeQuery(`employees_get_include_join`, params);

    return NextResponse.json(
      { payrollData: employeeData?.results },
      { status: 200 }
    );

  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }

}

// ========

// try {
//   console.log(employeeId, departmentId);
//   // const departmentData = await department.findOne({
//   //   where: {
//   //     departmentId: Number(departmentId),
//   //   },
//   // });
//   // const payrollData = await payroll.findAll({
//   //   where: {
//   //     companyId: departmentData?.dataValues.companyId,
//   //   },
//   // });
//   return NextResponse.json({ payrollData: [] }, { status: 200 });
// } catch (error) {
//   console.log(error);
//   return NextResponse.json({ message: 'Error Occued' }, { status: 500 });
// }
