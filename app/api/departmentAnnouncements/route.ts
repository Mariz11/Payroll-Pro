import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';
export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  //   const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  let role: any = null;
  // we check for dashboard access since department announcements are shown in dashboard
  if (seshData.role == 'SUPER_ADMIN') {
    role = 'SUPER_ADMIN';
  } else {
    // console.log('ok');
    // console.log(seshData);
    const [user]: any = await executeQuery(`users_get_user_role`, { userId: seshData?.userId });
    const moduleAccess: any = JSON.parse(user.user_role.moduleAccess);
    role = moduleAccess.find((item: any) => item.moduleId === 1)
      ? 'ADMIN'
      : moduleAccess.find((item: any) => item.moduleId === 16)
        ? 'EMPLOYEE'
        : null;
  }
  // console.log('rolez');
  // console.log(role);

  try {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPER ADMIN') {

      const announcementList = await executeQuery(`announcements_get_posted`, {
        companyId,
        userId: seshData.userId,
        isPosted: 1,
        role
      });

      const announcements = announcementList?.map((item: any) => item.announcement);

      return NextResponse.json(announcements);
      // const announcements = await DepartmentAnnouncement.findAll({
      //   include: [
      //     {
      //       model: Announcement,
      //       where: {
      //         isPosted: true,
      //       },
      //       attributes: {
      //         include: ['createdAt'],
      //         exclude: ['updatedAt', 'deletedAt'],
      //       },
      //       // order: ['order', 'title'],
      //     },
      //   ],
      //   where: {
      //     [Op.or]: [{ departmentId: null }, { companyId: companyId }],
      //   },
      //   // attributes: [
      //   // ],
      //   order: [
      //     [Announcement, 'order', 'ASC'],
      //     [Announcement, 'title', 'ASC'],
      //   ],
      //   group: [
      //     'announcementId',
      //     'departmentAnnouncementId',
      //     'companyId',
      //     'departmentId',
      //     'announcement.announcementId',
      //     'announcement.title',
      //     'announcement.content',
      //     'announcement.image',
      //     'announcement.order',
      //     'announcement.createdAt',
      //     'announcement.updatedAt',
      //     'announcement.deletedAt',
      //   ],

      //   // offset: 0,
      //   // limit: 100,
      //   // distinct: true,
      //   //   subQuery: false,
      // });
    } else {
      const [employee]: any = await executeQuery(`employees_get`, {
        employeeId: seshData.employeeId
      });
      const departmentId: number = employee?.departmentId;
      const companyId: number = employee?.companyId;

      const announcementsResult: any = await executeQuery(`department_announcements_by_company`, {
        companyId,
        departmentId,
        userId: seshData.userId,
        isPosted: 1
      });

      const announcements = announcementsResult?.map((item: any) => item?.result)

      return NextResponse.json(announcements);
    }
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        { success: false, message: 'Error fetching announcements' },
        { status: 500 }
      );
  }
}
