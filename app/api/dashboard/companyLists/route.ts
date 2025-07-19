import { NextRequest, NextResponse } from 'next/server';
import { Company } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const companies = await Company.findAll({});
    return NextResponse.json(
      { sucess: true, message: companies },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') { console.log('error fetching shifts', error); }
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }

}

