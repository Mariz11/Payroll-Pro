import { isValidToken } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';

import { hasHtmlTags } from '@utils/helper';
import { AttendanceApplication, ChangedSchedule } from 'db/models';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('employeeId');
    if (hasHtmlTags(employeeId)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    // if(hasSQLKeywords(employeeId)) {
    //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });

    // }

    const data = await AttendanceApplication.findAll({
      attributes: ['attendanceAppId', 'employeeId', 'type'],
      where: {
        type: 'Change Schedule',
        isApproved: 1,
        employeeId: employeeId,
      },
      include: [ChangedSchedule],
    });

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching attendances:', error.message);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
