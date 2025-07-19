import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const data = await executeQuery(`payroll_types_get`);
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting payroll types on api/companies/payroll_types:', error.message);
    }
    else
      return NextResponse.json(
        { message: error },
        { status: 500 }
      );
  }

}
