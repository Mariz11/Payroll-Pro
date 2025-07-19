import { NextRequest, NextResponse } from 'next/server';
import {
  Employee,
} from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {

    const searchParams = new URL(req.url).searchParams;
    const search = searchParams.get('search') || '';
    const employeeStatus = searchParams.get('employeeStatus') || '1';
    const payrollType = searchParams.get('payrollType') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;

    const params = {
      companyId,
      search,
      employeeStatus: parseInt(employeeStatus),
      payrollType,
      employeeId
    };

    const result = await executeQuery('employees_get_all_list', params);

    // const employees = await Employee.findAll({
    //   where: {
    //     companyId,
    //     employeeStatus: 1,
    //   },
    //   include: [
    //     {
    //       model: EmployeeProfile,
    //     },
    //     {
    //       model: Shift,
    //       required: true,
    //     },
    //     {
    //       model: Department,
    //       attributes: ['payrollTypeId'],
    //       where: {
    //         payrollTypeId: {
    //           [Op.not]: null,
    //         },
    //       },
    //       include: [
    //         {
    //           model: PayrollType,
    //           attributes: ['type'],
    //           // required: true,
    //         },
    //       ],
    //     },
    //   ],
    // });
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching shifts:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const { shiftId, departmentId } = await req.json();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await Employee.update(
      { shiftId: shiftId },
      { where: { departmentId: departmentId } }
    );

    return NextResponse.json(
      { message: 'Shifts updated successfully for department' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error updating shifts for department:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
