import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { COMPANIES_GET } from '@constant/storedProcedures';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
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
    const [company]: any = await executeQuery(COMPANIES_GET, { companyId });

    return NextResponse.json(
      { sucess: true, message: company },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching shifts:', error.message);
    }
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
