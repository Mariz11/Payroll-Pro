import { NextRequest, NextResponse } from 'next/server';
import {
  isValidToken,
  selectedCompanyData,
  sessionData,
} from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const [company]: any = await executeQuery(`companies_get_employees`, {
    companyId: companyId,
  });

  const companyData = company.companyData;
  return NextResponse.json({ companyData }, { status: 200 });
}
