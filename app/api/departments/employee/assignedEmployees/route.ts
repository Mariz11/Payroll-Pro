import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { QueryTypes } from 'sequelize';
import { executeQuery } from 'db/connection';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { QueryReturnTypeEnum } from '@enums/query-return-type';

export async function GET(req: NextRequest, res: NextResponse) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');
    const departmentId = url.searchParams.get('departmentId');

    const employeeResult: any = await executeQuery(
      'employees_get_by_department',
      {
        departmentId: departmentId == 'undefined' ? undefined : departmentId,
        offset,
        limit,
        search
      }
      , [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW
    );

    const employees: { rows: any[]; count: number } = transformPaginatedData(employeeResult);

    // Return the merged data with the total count
    return NextResponse.json(
      {
        success: true,
        message: {
          rows: employees.rows,
          count: employees.count
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
