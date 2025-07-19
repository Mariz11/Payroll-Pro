import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, User } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { executeQuery } from 'db/connection';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { createActivityLog } from '@utils/activityLogs';

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
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');

    const departmentsResult = await executeQuery(`departments_get_paginated`, {
      companyId,
      search: search,
      offset,
      limit
    }, [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW);

    // Transform the paginated data
    const departments: { rows: any[]; count: number } = transformPaginatedData(departmentsResult);

    const departmentDetails = await Promise.all(
      departments.rows.map(async (item) => {
        const employeeResult: any = await executeQuery(
          'employees_get_count',
          {
            departmentId: item.departmentId
          }
          , [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW
        );

        return {
          ...item,
          employeeCount: employeeResult[0]['0'].total
        };
      })
    );

    // Return the merged data with the total count
    return NextResponse.json(
      {
        success: true,
        message: {
          rows: departmentDetails,
          count: departments.count
        }
      },
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
  if (hasHtmlTags(departmentName)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }

  if (hasSQLKeywords(departmentName)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible SQL keywords' },
      { status: 400 }
    );
  }
  try {
    const [department]: any = await executeQuery(`departments_insert`, {
      departmentName: departmentName,
      companyId: companyId,
    }, [], QueryTypes.INSERT, null, QueryReturnTypeEnum.RAW);

    await createActivityLog(companyId, userId, 'Added a new Department');

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
