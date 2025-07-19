import { isValidToken, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const urlParams = req.url.split('transactions/')[1];
    const transactionCode = urlParams.split('/')[0];

    const res = await executeQuery(`activity_logs_get_by_transaction_code`, {
      companyId: seshData.companyId,
      transactionCode: transactionCode,
    });

    const data = res.map((item: any) => item.activity_logs)

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting transaction logs:', error.message);
    }
    else
      return NextResponse.json(
        { message: error },
        { status: 500 }
      );
  }
}
