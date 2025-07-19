import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, sessionData } from '@utils/jwt';
import { AttendanceApplication } from 'db/models';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const employeeId = seshData.employeeId;
  const companyId = seshData.companyId;

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const attendances = await AttendanceApplication.findAndCountAll({
      where: { companyId: companyId, employeeId: employeeId },
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: limit,
      distinct: true,
      subQuery: false,
    });
    return NextResponse.json(
      { sucess: true, message: attendances },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching attendanceApplicationLogs:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
