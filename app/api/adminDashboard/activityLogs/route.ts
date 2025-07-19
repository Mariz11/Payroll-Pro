import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { QueryTypes } from 'sequelize';
import { transformPaginatedData } from '@utils/transformPaginatedData';

export async function GET(req: NextRequest, res: NextResponse) {
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

    const logList = await executeQuery(
      `activity_logs_get`, { companyId, limit, offset },
      [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW
    );

    const hasContent = logList.length === 3;
    const logListResult = hasContent ? transformPaginatedData(logList) : undefined;

    return NextResponse.json(
      {
        success: true,
        message: {
          count: logListResult?.count ?? 0,
          rows: logListResult?.rows ?? [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching activityLogs:', error);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, res: NextResponse) {
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

  const userId = seshData.userId;

  try {
    const url = new URL(req.url);
    const message: string | null = url.searchParams.get('message');
    // const messageAllowedList = [
    //   'Generated a Payroll Report',
    //   'Generated Payslip',
    // ];
    if (message === null) {
      await executeQuery(
        `activity_logs_insert`,
        {
          userId,
          companyId,
          message: 'Invalid message was passed when generating activity log',
        },
        [],
        QueryTypes.INSERT
      );
      return NextResponse.json(
        {
          severity: 'error',
          success: false,
          message: 'Invalid message was passed',
        },
        { status: 400 }
      );
    }
    const [activityLogs] = await executeQuery(
      `activity_logs_insert`,
      { userId, companyId, message },
      [],
      QueryTypes.INSERT
    );
    return NextResponse.json(
      { success: true, message: activityLogs },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching activityLogs:', error.message);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
