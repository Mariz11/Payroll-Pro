import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { getEmployeeWalletBalance } from '@utils/partnerAPIs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const ckycId = seshData.employee.ckycId;
    const tierLabel = seshData.company.tierLabel;

    const balance = await getEmployeeWalletBalance({
      ckycId: ckycId,
      tierLabel: tierLabel,
    });

    return NextResponse.json(balance);
  } catch (error: any) {
    console.log(error);
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
