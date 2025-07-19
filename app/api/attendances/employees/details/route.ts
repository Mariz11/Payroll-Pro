import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { executeQuery } from 'db/connection';



export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const businessMonth = url.searchParams.get('businessMonth');
    const companyId = url.searchParams.get('companyId');
    const employeeId = url.searchParams.get('employeeId');
    const cycle = url.searchParams.get('cycle');
    if (hasHtmlTags(businessMonth), hasHtmlTags(cycle)) {
      return NextResponse.json({ success: false, message: 'Input/s contain/s possible script tags' }, { status: 400 });
    }

    if (hasSQLKeywords(businessMonth) || hasSQLKeywords(cycle)) {
      return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });
    }

    const dataList = await executeQuery(`attendances_get_employee_details`, {
      companyId,
      businessMonth,
      cycle,
      employeeId,
    });
    const data = dataList?.map((item: any) => item.attendanceDetails);

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching attendances:', error.message);
    }
    else
      return NextResponse.json(
        { message: error },
        { status: 500 }
      );
  }
}
