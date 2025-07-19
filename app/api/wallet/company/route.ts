import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { getCompanyBalance } from '@utils/partnerAPIs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyAccountId = selectedCompData
    ? selectedCompData.accountId
    : seshData.company.accountId;

  try {
    const url = new URL(req.url);
    const companyAccountIdQuery = url.searchParams.get('companyAccountId');

    const balance = await getCompanyBalance({
      companyAccountId: companyAccountIdQuery
        ? companyAccountIdQuery
        : companyAccountId,
    });

    return NextResponse.json(balance);
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error fetching wallet balance', error);
    } else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}
