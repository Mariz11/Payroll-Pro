import { NextRequest, NextResponse } from 'next/server';
import { Employee, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { QueryTypes } from 'sequelize';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('employee/')[1];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {

    const [employee] = await executeQuery(`employees_get_include_join`, {
      employeeId: id,
      includeUser: true
    });

    return NextResponse.json(
      { success: true, message: employee },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') { console.error('error fetching shifts:', error); }
    else { return NextResponse.json({ message: error, success: false }, { status: 500 }); }
  }

}

export async function PUT(req: Request, res: Response) {
  // const userToken: any = req.headers.get('authorization');

  // if (!isValidToken(userToken)) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const id = req.url.split('employee/')[1];
    const { shiftId } = await req.json();

    const [employee] = await executeQuery(`employees_get`, {
      employeeId: id,
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Shift not found' },
        { status: 404 }
      );
    }

    if (shiftId !== undefined) {
      await executeQuery(`employees_update_shift`, {
        employeeId: id,
        shiftId
      }, [], QueryTypes.UPDATE);
    }

    return NextResponse.json(
      { success: true, message: employee },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error updating shift:', error);
    }
    else {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

  }
}
