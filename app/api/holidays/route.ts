import { NextRequest, NextResponse } from 'next/server';
import { Attendance, Holiday, Payroll } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog } from 'db/models';
import { Op } from 'sequelize';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import connection from 'db/connection';
import { getRequestLogger } from '@utils/logger';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
    const holidays = await Holiday.findAndCountAll({
      where: {
        companyId: companyId,
        [Op.or]: {
          holidayName: {
            [Op.startsWith]: `%${search}%`,
          },
          holidayType: {
            [Op.startsWith]: `%${search}%`,
          },
          holidayDate: {
            [Op.startsWith]: `%${search}%`,
          },
        },
      },
      offset: offset,
      limit: limit,
      distinct: true,
      subQuery: false,
    });
    return NextResponse.json(
      { sucess: true, message: holidays },
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

export async function POST(req: NextRequest, res: NextResponse) {
  const logger = getRequestLogger(req);
  const log = (message: string, data?: any) => {
    logger.info(`[Create Holiday] ${message}`, data || '');
  };
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);

  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const transaction = await connection.transaction();
  const { holidayDate, holidayType, holidayName, companyId, userId } =
    await req.json();

  try {
    if (hasHtmlTags(holidayType) || hasHtmlTags(holidayName)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (hasSQLKeywords(holidayType) || hasSQLKeywords(holidayName)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    // check if holiday has pending payroll values;
    const attendances: any = await Attendance.findAll({
      where: {
        date: holidayDate,
        isPosted: true,
        companyId: companyId,
      },
      attributes: ['businessMonth', 'cycle'],
      group: ['businessMonth', 'cycle'],
    });
    for (const attendance of attendances) {
      const pendingPayroll = await Payroll.findOne({
        where: {
          businessMonth: attendance.businessMonth,
          cycle: attendance.cycle,
          companyId: companyId,
          isPosted: false,
        },
      });
      if (pendingPayroll) {
        // console.log('conflict;!');
        await transaction.rollback();
        return NextResponse.json(
          {
            success: false,
            message:
              'Holiday cannot be created as it has pending payroll data. Please unpost pending payroll data and try again.',
          },
          { status: 200 }
        );
      }
    }

    const holiday: any = await Holiday.create({
      holidayDate: holidayDate,
      holidayType: holidayType,
      holidayName: holidayName,
      companyId: companyId,
    }, { transaction });

    await Attendance.update(
      {
        holidayId: holiday.holidayId,
      },
      {
        where: {
          date: holidayDate,
          companyId: companyId,
          isPosted: false,
          deletedAt: null,
        },
        transaction
      }
    );

    await ActivityLog.create({
      companyId: companyId,
      userId: userId,
      message: 'Added a new Holiday',
    }, { transaction });

    await transaction.commit();

    return NextResponse.json(
      { success: true, message: holiday },
      { status: 200 }
    );
  } catch (error: any) {
    log("Error creating holiday", { error })
    await transaction.rollback();
    return NextResponse.json(
      { success: false, message: "Something went wrong, Please try again later" },
      { status: 500 }
    );
  }
}
