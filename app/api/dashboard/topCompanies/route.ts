import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

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

    const params = {
      companyId: companyId
    };

    const topCompanies = await executeQuery('companies_get_top', params);

    return NextResponse.json(
      { success: true, message: topCompanies },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error fetching top companies', error);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
