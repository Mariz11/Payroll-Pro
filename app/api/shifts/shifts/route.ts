import { NextRequest, NextResponse } from 'next/server';
import { Shift, Employee, User, Department, EmployeeProfile } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op, QueryTypes } from 'sequelize';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import connection, { executeQuery } from 'db/connection';
import { createActivityLog } from '@utils/activityLogs';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const shifts = await executeQuery(`shifts_get_by_company`, { companyId });

    return NextResponse.json(
      { success: true, message: shifts },
      { status: 200 }
    );
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

export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
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
  const transaction = await connection.transaction();
  try {

    if (hasHtmlTags(shiftName)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (hasSQLKeywords(shiftName)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    // extract decimal values to check if .01 exists
    const decimalValue = workingHours % 1;
    // remove 0.01
    if (decimalValue <= 0.01 && decimalValue > 0) {
      workingHours = +workingHours.toFixed(0);
    }

    const [shift] = await executeQuery(`shifts_insert`, {
      companyId,
      shiftName,
      timeIn,
      timeOut,
      lunchStart,
      lunchEnd,
      workingHours
    }, [], QueryTypes.INSERT, transaction as any);

    await createActivityLog(companyId, userId, 'Added a new shift', transaction);

    await transaction.commit();

    return NextResponse.json(
      { success: true, message: shift },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error creating shift:', error);
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
  const { shiftId, departmentId } = await req.json();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await executeQuery(`employees_update_department_shift`, {
      departmentId,
      shiftId
    }, [], QueryTypes.UPDATE);

    return NextResponse.json(
      { message: 'Shifts updated successfully for department' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error updating shifts for department:', error);
    } else {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  }
}
