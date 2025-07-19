import { NextRequest, NextResponse } from 'next/server';
import { Attendance, Holiday, Payroll } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const holidayId = req.url.split('holidays/')[1].split('/')[0];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();
    const action = url.searchParams.get('action');
    const companyId = selectedCompData
      ? selectedCompData.companyId
      : seshData.companyId;
    const attendances: any = await Attendance.findAll({
      where: {
        holidayId: holidayId,
        isPosted: true,
        companyId: companyId,
      },
      attributes: ['businessMonth', 'cycle'],
      group: ['businessMonth', 'cycle'],
    });
    let hasPostedPayroll = false;
    let hasPendingPayroll = false;
    for (const attendance of attendances) {
      if (action === 'edit') {
        const pendingPayroll = await Payroll.findOne({
          where: {
            businessMonth: attendance.businessMonth,
            cycle: attendance.cycle,
            companyId: companyId,
            isPosted: false,
          },
        });
        if (pendingPayroll) {
          hasPendingPayroll = true;
          break;
        }
      }
      const payrolls = await Payroll.findOne({
        where: {
          businessMonth: attendance.businessMonth,
          cycle: attendance.cycle,
          companyId: companyId,
          isPosted: true,
        },
      });
      if (payrolls) {
        hasPostedPayroll = true;
        break;
      }
    }
    // console.log('hasPostedPayroll!', hasPostedPayroll);
    return NextResponse.json(
      {
        success: true,
        message: {
          hasPendingPayroll: hasPendingPayroll,
          hasPostedPayroll: hasPostedPayroll,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching shifts:', error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
