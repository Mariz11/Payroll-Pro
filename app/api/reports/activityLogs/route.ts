import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const fromDate = url.searchParams.get('fromDate');
  const toDate = url.searchParams.get('toDate');

  const activityLogs: any = await executeQuery(`activity_logs_get_include_join`, {
    companyId,
    fromDate,
    toDate,
    includeUsers: true,
    includeCompanies: true
  });

  return NextResponse.json({ activityLogs });
}
