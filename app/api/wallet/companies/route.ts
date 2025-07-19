import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  getCompanyBalance,
  getTotalWalletBalanceFromAllCompanies,
} from '@utils/partnerAPIs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const balance = await getTotalWalletBalanceFromAllCompanies();
    return NextResponse.json(balance);
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === ' SequelizeDatabaseError') { console.log('error fetching wallet balance', error); }
    else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}
