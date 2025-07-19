import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const departmentId: any = url.searchParams.get('departmentId');
  const businessMonth: any = url.searchParams.get('businessMonth');

  try {

    const attendanceReportList = await executeQuery(`attendances_get_report`, {
      companyId,
      departmentId,
      businessMonth,
    });

    const attendanceReport = attendanceReportList?.map(
      (item: any) => item.attendanceReport
    );

    return NextResponse.json({
      message: 'Success',
      attendanceReport,
    });
  } catch (err: any) {
    if (err && err.name === 'SequelizeDatabaseError') {
      console.log({ message: 'Error', error: err }, { status: 400 });
      return;
    } else {
      return NextResponse.json(
        { message: 'generating reports error', error: err.message },
        { status: 500 }
      );
    }
  }
}
