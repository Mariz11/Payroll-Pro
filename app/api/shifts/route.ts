import { NextRequest, NextResponse } from 'next/server';
import { Shift, Employee, User, Department, EmployeeProfile } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op, QueryTypes } from 'sequelize';
import moment from '@constant/momentTZ';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import connection, { executeQuery } from 'db/connection';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { transformPaginatedData } from '@utils/transformPaginatedData';
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
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');

    const formattedSearch = moment(search, 'hh:mm A').isValid()
      ? moment(search, 'hh:mm A').format('HH:mm:00')
      : undefined;

    const shiftsResult = await executeQuery(`shifts_search_paginated`, {
      companyId,
      search: search,
      formattedSearch,
      offset: offset,
      limit: limit
    }, [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW);

    // Transform the paginated data
    const shifts: { rows: any[]; count: number } = transformPaginatedData(shiftsResult);


    return NextResponse.json(
      { success: true, message: shifts },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error fetching shifts', error);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
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
  // console.log(workingHours);
  // console.log(lunchStart);
  // console.log(lunchEnd);
  // return;
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
    // extract decimal point from working Hours
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
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error creating shift', error);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
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
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error updating shifts for department', error);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
