import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { createActivityLog } from '@utils/activityLogs';
import { hasHtmlTags } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import connection, { executeQuery } from 'db/connection';
import departmentAnnouncement from 'db/models/departmentAnnouncement';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  //   const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  let companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const role = seshData?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'SUPER ADMIN';

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');

    const announcementList = await executeQuery(
      `announcements_get_all`,
      {
        isSuperAdmin,
        companyId,
        search,
        limit,
        offset,
      },
      [],
      QueryTypes.SELECT,
      null,
      QueryReturnTypeEnum.RAW
    );

    // Transform the paginated data
    const announcements: { rows: any[]; count: number } =
      transformPaginatedData(announcementList);

    return NextResponse.json({
      count: announcements.count ?? [],
      rows: announcements.rows ?? [],
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching announcements:', error.message);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const transaction = await connection.transaction();
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const userId = seshData.userId;
  const role = seshData.role;

  let { title, content, order, departments, companies, image } =
    await req.json();
  // if (seshData.role === 'SUPER_ADMIN') {
  //   // super admin only has one entry in the department Ids which is a row with a department
  //   // id of null so that's why departmets turned to [null]
  //   departments = [null];
  // }
  try {
    // check for script injection
    if (hasHtmlTags(title) || hasHtmlTags(image)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    // if(hasSQLKeywords(title)) {
    //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });
    // }

    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'SUPER ADMIN';
    const type = isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN';

    const [announcementId]: any = await executeQuery(
      `announcements_insert`,
      { title, content, order, image: image ? image : '', type },
      [],
      QueryTypes.INSERT,
      transaction as any
    );

    await createActivityLog(companyId, userId, 'Added a new Announcement', transaction as any);

    if (seshData.role !== 'SUPER_ADMIN' && seshData.role !== 'SUPER ADMIN') {
      departments.forEach(async (deptId: number) => {
        await departmentAnnouncement.create({
          companyId: companyId,
          departmentId: deptId,
          announcementId: announcementId,
        });
      });
    } else {
      // await departmentAnnouncement.create({
      //   companyId: companyId,
      //   departmentId: null,
      //   announcementId: announcement?.announcementId,
      // });
      departments.forEach(async (compId: number) => {
        await departmentAnnouncement.create({
          companyId: compId,
          departmentId: null,
          announcementId: announcementId,
        }, { transaction });
      });
    }

    await transaction.commit();

    return NextResponse.json(
      { success: true, message: 'successfully created announcement/s' },
      { status: 201 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error creating announcement:', error.message);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
