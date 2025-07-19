import { NextRequest, NextResponse } from 'next/server';
import { Attendance, Holiday, Payroll, PayrollDeductions } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('holidays/')[1];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const holiday = await Holiday.findByPk(id);
    return NextResponse.json(
      { success: true, message: holiday },
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

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { companyId, userId } = await req.json();

  try {
    const id = req.url.split('holidays/')[1];
    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();
    const companyId = selectedCompData
      ? selectedCompData.companyId
      : seshData.companyId;

    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return NextResponse.json(
        { success: false, message: 'Holiday not found' },
        { status: 404 }
      );
    }
    const attendances: any = await Attendance.findAll({
      where: {
        holidayId: id,
        companyId: companyId,
      },
      attributes: ['businessMonth', 'cycle'],
      group: ['businessMonth', 'cycle'],
    });
    // reset all posted attendances back to pending
    for (const attendance of attendances) {
      {
        await Attendance.update(
          {
            isPosted: false,
          },
          {
            where: {
              companyId: companyId,
              businessMonth: attendance.businessMonth,
              cycle: attendance.cycle,
              isPosted: true,
            },
          }
        );
        const payrolls: any = await Payroll.findAll({
          where: {
            companyId: companyId,
            businessMonth: attendance.businessMonth,
            cycle: attendance.cycle,
            isPosted: false,
          },
          attributes: ['payroll_id'],
        });
        for (const payroll of payrolls) {
          await PayrollDeductions.destroy({
            where: {
              payroll_id: payroll.payroll_id,
            },
          });
          await Payroll.destroy({
            where: {
              payroll_id: payroll.payroll_id,
            },
          });
        }
      }
    }
    // delete holidays on attendances

    await holiday.destroy();

    await ActivityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Deleted a Holiday',
    });

    return NextResponse.json(
      { success: true, message: 'Holiday deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting Holiday:', error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const id = req.url.split('holidays/')[1];
    const { holidayName, holidayDate, holidayType, companyId, userId } =
      await req.json();
    if (hasHtmlTags(holidayType) || hasHtmlTags(holidayName)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (hasSQLKeywords(holidayType) || hasSQLKeywords(holidayName)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    const holiday = await Holiday.findByPk(id);
    if (!holiday) {
      return NextResponse.json(
        { success: false, message: 'Holiday not found' },
        { status: 404 }
      );
    }

    // Update Holiday properties
    holiday.set('holidayName', holidayName);
    // holiday.set('holidayDate', holidayDate);
    holiday.set('holidayType', holidayType);

    await holiday.save();

    await ActivityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Updated a holiday',
    });

    return NextResponse.json(
      { success: true, message: 'Holiday updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.log('error updating holiday', error);
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
