import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Announcement } from 'db/models';
import departmentAnnouncement from 'db/models/departmentAnnouncement';
import { NextResponse } from 'next/server';
export async function PATCH(req: Request, res: Response) {
  const url = req.url.split('announcements/')[1];
  const announcementId = url.split('/')[0];
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const role = seshData?.role;

  try {
    await Announcement.update(
      { isPosted: true },
      {
        where: {
          announcementId: announcementId,
        },
      }
    );
    let announcement: any = null;
    if (role !== 'SUPER_ADMIN' && role !== 'SUPER ADMIN') {
      announcement = await Announcement.findOne({
        where: {
          announcementId: announcementId,
        },
        include: [
          {
            model: departmentAnnouncement,
            where: {
              companyId: companyId,
            },
          },
        ],
      });
    } else {
      announcement = await Announcement.findOne({
        where: {
          announcementId: announcementId,
        },
        include: [
          {
            model: departmentAnnouncement,
            where: {
              announcementId: announcementId,
            },
          },
        ],
      });
    }
    // if (announcement) {
    //   if (role !== 'SUPER_ADMIN' && role !== 'SUPER ADMIN') {
    // announcement.department_announcements.forEach(
    //   async (departmentAnnouncement: any) => {
    //     const employees = await User.findAll({
    //       where: {
    //         companyId: departmentAnnouncement.companyId,
    //       },
    //       attributes: ['userId'],
    //       include: [
    //         {
    //           model: Employee,
    //           where: {
    //             departmentId: departmentAnnouncement.departmentId,
    //           },
    //         },
    //       ],
    //     });
    //     employees.forEach(async (emp: any) => {
    //       if (emp.employee) {
    //         await ViewDetails.create({
    //           announcementId: announcementId,
    //           departmentId: departmentAnnouncement.departmentId,
    //           userId: emp.userId,
    //         });
    //       }
    //     });
    //   }
    // );
    // const superAdmins: any = await User.findAll({
    //   where: {
    //     role: { [Op.or]: ['SUPER_ADMIN', 'SUPER ADMIN'] },
    //   },
    //   attributes: ['userId'],
    // });
    // // for all super admins for select company
    // superAdmins.forEach(async (admin: any) => {
    //   await ViewDetails.findOrCreate({
    //     where: {
    //       announcementId: announcementId,
    //       departmentId: null,
    //       userId: admin.userId,
    //     },
    //   });
    // });
    // create view details for admin himself
    // if (role !== 'SUPER_ADMIN' && role !== 'SUPER ADMIN') {
    //   await ViewDetails.findOrCreate({
    //     where: {
    //       announcementId: announcementId,
    //       departmentId: null,
    //       userId: seshData.userId,
    //     },
    //   });
    // }
    // } else if (role === 'SUPER_ADMIN' || role === 'SUPER ADMIN') {
    // const companies = await departmentAnnouncement.findAll({
    //   where: {
    //     announcementId,
    //   },
    // });
    // companies.forEach(async (company: any) => {
    //   const allUsers = await User.findAll({
    //     attributes: ['userId'],
    //     where: {
    //       companyId: company.companyId,
    //     },
    //   });
    //   allUsers.forEach(async (user: any) => {
    //     await ViewDetails.findOrCreate({
    //       where: {
    //         announcementId: announcementId,
    //         userId: user.userId,
    //         departmentId: null,
    //         companyId: company.companyId,
    //       },
    //     });
    //   });
    // });
    // const superAdmins: any = await User.findAll({
    //   where: {
    //     role: { [Op.or]: ['SUPER_ADMIN', 'SUPER ADMIN'] },
    //   },
    //   attributes: ['userId'],
    // });
    // // for all super admins for select company
    // superAdmins.forEach(async (admin: any) => {
    //   await ViewDetails.findOrCreate({
    //     where: {
    //       announcementId: announcementId,
    //       departmentId: null,
    //       userId: admin.userId,
    //     },
    //   });
    // });
    // }
    // }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully posted',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error deleting announcements:', error.message);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
