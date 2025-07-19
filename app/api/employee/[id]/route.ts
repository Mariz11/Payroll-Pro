import { NextRequest, NextResponse } from 'next/server';
import { Employee, Shift, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { Op } from 'sequelize';
import { tokenChecker } from '@utils/apiEndpointFunctions';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('employee/')[1];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await tokenChecker(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: User,
        },
        {
          model: Shift,
          attributes: ['timeOut', 'timeIn', 'workingHours'],
        },
      ],
    });
    return NextResponse.json(
      { success: true, message: employee },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching shifts:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

export async function PUT(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const id = req.url.split('employee/')[1];
    const { shiftId } = await req.json();

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Shift not found' },
        { status: 404 }
      );
    }

    if (shiftId !== undefined) {
      employee.set('shiftId', shiftId);
    }

    await employee.save();

    return NextResponse.json(
      { success: true, message: 'Shift updated successfully' },
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
