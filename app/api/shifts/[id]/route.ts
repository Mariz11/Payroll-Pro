import { NextRequest, NextResponse } from 'next/server';
import {
  Shift,
  Employee,
  Department,
  ActivityLog,
  EmployeeProfile,
} from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { message } from 'antd';
import connection, { executeQuery } from 'db/connection';
import { QueryTypes } from 'sequelize';
import { createActivityLog } from '@utils/activityLogs';
const { Op } = require('sequelize');

// Get data by ID
export async function GET(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('shifts/')[1];
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const offset = Number(url.searchParams.get('offset'));
  const limit = Number(url.searchParams.get('limit'));
  const filter = url.searchParams.get('filter') || '';

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    // const shift = await Shift.findByPk(id, {
    //   include: [
    //     {
    //       model: Employee,
    //       required: false,
    //       where: { employeeStatus: 1 },
    //       include: [EmployeeProfile, Department],
    //     },
    //   ],
    // });
    const shift: any = await Employee.findAndCountAll({
      where: {
        companyId: companyId,
        employeeStatus: 1,
        shiftId: id,
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
      limit: limit,
      offset: offset,
    });
    // console.log(shift);
    return NextResponse.json(
      { success: true, message: shift },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(error);
    } else {
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
    }
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const id = req.url.split('shifts/')[1];
    let {
      shiftName,
      timeIn,
      timeOut,
      lunchStart,
      lunchEnd,
      companyId,
      userId,
      workingHours,
    } = await req.json();
    if (hasHtmlTags(shiftName)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (hasSQLKeywords(shiftName)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    const shift = await Shift.findByPk(id);
    if (!shift) {
      return NextResponse.json(
        { success: false, message: 'Shift not found' },
        { status: 404 }
      );
    }
    // extract decimal values to check if .01 exists
    const decimalValue = workingHours % 1;
    // remove 0.01
    if (decimalValue <= 0.01 && decimalValue > 0) {
      workingHours = +workingHours.toFixed(0);
    }

    // Update Shift properties
    shift.set('shiftName', shiftName);
    shift.set('timeIn', timeIn);
    shift.set('timeOut', timeOut);
    shift.set('lunchStart', lunchStart);
    shift.set('lunchEnd', lunchEnd);
    shift.set('companyId', companyId);
    shift.set('workingHours', workingHours);

    await shift.save();

    await ActivityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Updated a shift',
    });

    return NextResponse.json(
      { success: true, message: shift },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error updating shift:', error);
    } else {
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { companyId, userId } = await req.json();

  const transaction = await connection.transaction();

  try {
    const id = req.url.split('shifts/')[1];

    const [shift] = await executeQuery(`shifts_get`, {
      shiftId: id
    });

    if (!shift) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Shift not found' },
        { status: 404 }
      );
    }

    await executeQuery(`shifts_delete`, {
      shiftId: id,
    }, [], QueryTypes.UPDATE, transaction as any);

    await executeQuery(`employees_nullify_shift`, {
      shiftIds: JSON.stringify([id]),
    }, [], QueryTypes.UPDATE, transaction as any);

    await createActivityLog(companyId, userId, 'Deleted a shift', transaction);

    await transaction.commit();

    return NextResponse.json(
      { success: true, message: 'Shift deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error deleting shift:', error);
    } else {
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
    }
  }
}
