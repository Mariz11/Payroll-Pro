import { NextRequest, NextResponse } from 'next/server';
import { Company, Holiday } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op } from 'sequelize';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const companies = await Company.findAll();
    return NextResponse.json(
      { sucess: true, message: companies },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') { console.log('error fetching companies', error); }
    else
      return NextResponse.json(
        { message: error },
        { status: 500 }
      );
  }

}
