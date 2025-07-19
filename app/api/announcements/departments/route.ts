import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, User } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op } from 'sequelize';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // const companyId = searchParams.get('companyId');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');

    const departments = await Department.findAndCountAll({
      where: {
        companyId: companyId,
      },

      offset: offset,
      limit: limit,
      distinct: true,
      subQuery: false,
    });
    return NextResponse.json(
      { sucess: true, message: departments },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching departments:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
