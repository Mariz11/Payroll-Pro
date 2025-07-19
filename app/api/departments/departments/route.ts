import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, User } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op } from 'sequelize';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // const companyId = searchParams.get('companyId');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const departments = await Department.findAll({
      where: {
        companyId: companyId,
      },
      // include: [
      //   {
      //     model: Employee,
      //     include: [{ model: User }],
      //   },
      // ],
    });
    return NextResponse.json(
      { sucess: true, message: departments },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching departments:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(req: Request, res: Response) {
  const { searchParams } = new URL(req.url);
  const { departmentName, companyId, userId } = await req.json();
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const department = await Department.create({
      departmentName: departmentName,
      companyId: companyId,
    });

    await ActivityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Added a new Department',
    });

    return NextResponse.json(
      { success: true, message: department },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error creating department:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
