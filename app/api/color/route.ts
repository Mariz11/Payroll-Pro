import { NextRequest, NextResponse } from 'next/server';
import {
  isValidToken,
  selectedCompanyData,
  sessionData,
  signJWTAccessToken,
} from '@utils/jwt';
import { Company } from 'db/models';

export async function PUT(req: any, res: any) {
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
    const body = await req.json();

    const { color } = body;
    // console.log(color);
    const res = await Company.update(
      {
        defaultColor: color,
      },
      {
        where: {
          companyId: companyId,
        },
      }
    );
    return NextResponse.json({
      severity: 'success',
      success: true,
      message: 'Color successfully saved',
      color: color,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error updating attendances:', error.message);
    } else
      return NextResponse.json({
        severity: false,
        // payrollArr: payrollArr,
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}
