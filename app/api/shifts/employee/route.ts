import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, EmployeeProfile, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { sessionData, selectedCompanyData } from '@utils/jwt';
import { Op } from 'sequelize';
import { filter } from 'lodash';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  // const companyId = searchParams.get('companyId');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const filter = url.searchParams.get('filter') || '';
  const offset = Number(url.searchParams.get('offset'));
  const limit = Number(url.searchParams.get('limit'));

  try {
    // const employees = await Employee.findAndCountAll({
    //   where: {
    //     companyId: companyId,
    //     employeeStatus: 1,
    //   },
    //   include: [
    //     {
    //       model: EmployeeProfile,
    //     },
    //     {
    //       model: Department,
    //     },
    //   ],
    // });
    const employeesAssignable = await Employee.findAndCountAll({
      where: {
        companyId: companyId,
        employeeStatus: 1,
        shiftId: null,
        [Op.or]: {
          '$employee_profile.firstName$': {
            [Op.startsWith]: `%${filter}%`,
          },
          '$employee_profile.lastName$': {
            [Op.startsWith]: `%${filter}%`,
          },
        },
      },
      include: [
        {
          model: EmployeeProfile,
        },
        {
          model: Department,
        },
      ],
      ...(filter == '' && limit && { limit }),
      ...(filter == '' && offset && { offset }),
    });

    return NextResponse.json({ employeesAssignable }, { status: 200 });
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
export async function PATCH(req: Request, res: Response) {
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
    const { shiftId, employeeIds } = await req.json();

    if (shiftId !== undefined) {
      // employee.set('shiftId', shiftId);
      // console.log('hello world');
      // console.log(employeeIds);
      // console.log(shiftId);
      if (employeeIds.includes('all')) {
        await Employee.update(
          { shiftId: shiftId },
          {
            where: {
              companyId: companyId,
              employeeStatus: 1,
              shiftId: null,
            },
          }
        );
      } else {
        await Employee.update(
          { shiftId: shiftId },
          {
            where: {
              employeeId: {
                [Op.in]: employeeIds,
              },
            },
          }
        );
      }
      // await Employee.update(
      //   { shiftId: null },
      //   {
      //     where: {
      //       employeeId: {
      //         [Op.notIn]: employeeIds,
      //       },
      //       shiftId: shiftId,
      //     },
      //   }
      // );
    }

    // await employee.save();

    return NextResponse.json(
      { success: true, message: 'success' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error updating shift:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
