import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import payroll from 'db/models/payroll';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {

    const data = await executeQuery(`payrolls_get_business_month`, {
      companyId: companyId,
      isPosted: 1,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error getting departments on api/companies/paycycles/departments:',
        error.message
      );
    } else {
      console.info(`[Payroll Business Months] ERROR`, error || '');
      return NextResponse.json({ message: error }, { status: 500 })
    };
  }
}
