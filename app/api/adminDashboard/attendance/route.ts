import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op, QueryTypes } from 'sequelize';
import { executeQuery } from 'db/connection';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { transformPaginatedData } from '@utils/transformPaginatedData';

export async function GET(req: NextRequest, res: NextResponse) {
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

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));

    const attendanceList = await executeQuery(
      `attendances_get_paginated`, { companyId, limit, offset },
      [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW
    );
    const hasContent = attendanceList.length === 3;
    const attendanceResult = hasContent ? transformPaginatedData(attendanceList) : undefined;

    return NextResponse.json(
      {
        success: true,
        message: {
          count: attendanceResult?.count ?? 0,
          rows: attendanceResult?.rows ?? []
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching activityLogs:', error);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
