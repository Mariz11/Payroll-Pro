import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, EmployeeProfile, User } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';

export async function GET(req: NextRequest, res: NextResponse) {
  // const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  // const selectedCompData: any = await selectedCompanyData();
  // const seshData: any = await sessionData();
  // let companyId = selectedCompData
  //   ? selectedCompData.companyId
  //   : seshData.companyId;

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));

    const activityLogs = await ActivityLog.findAndCountAll({
      include: [
        {
          model: User,
          paranoid: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: limit,
      distinct: true,
      subQuery: false,
    });

    return NextResponse.json(
      { sucess: true, message: activityLogs },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') { console.log('error fetching activityLogs', error); }
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }


}
