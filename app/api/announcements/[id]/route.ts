import { createActivityLog } from '@utils/activityLogs';
import { hasHtmlTags } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import connection, { executeQuery } from 'db/connection';
import { Announcement, User } from 'db/models';
import departmentAnnouncement from 'db/models/departmentAnnouncement';
import { NextResponse } from 'next/server';
import { Op, QueryTypes } from 'sequelize';

export async function PUT(req: Request, res: Response) {
  const announcementId: number = Number(req.url.split('announcements/')[1]);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const userId = seshData.userId;
  const selectedCompData: any = await selectedCompanyData();
  const { title, content, order, departments, image, companies } =
    await req.json();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const role = seshData?.role;


  const transaction = await connection.transaction();

  try {
    if (hasHtmlTags(title) || hasHtmlTags(image)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    if (role !== 'SUPER_ADMIN' && role !== 'SUPER ADMIN') {
      await executeQuery(
        `department_announcements_delete`,
        {
          announcementId,
          companyIds: null,
          departmentIds: JSON.stringify(departments)
        },
        [],
        QueryTypes.UPDATE,
        transaction as any
      );
      // await ViewDetails.destroy({
      //   where: {
      //     [Op.and]: {
      //       announcementId: announcementId,
      //       departmentId: { [Op.notIn]: departments },
      //     },
      //   },
      // });
    } else {
      // console.log('ok!');
      await executeQuery(
        `department_announcements_delete`,
        { announcementId, companyIds: JSON.stringify(departments), departmentIds: null },
        [],
        QueryTypes.UPDATE,
        transaction as any
      );

      await executeQuery(
        `view_details_delete`,
        { announcementId, companyIds: JSON.stringify(departments), departmentIds: null },
        [],
        QueryTypes.UPDATE,
        transaction as any
      );
    }

    await executeQuery(
      `announcements_update`,
      {
        announcementId,
        title,
        content,
        order,
        image: image ? image : '',
        usersSeen: null,
      },
      [],
      QueryTypes.UPDATE,
      transaction as any
    );

    // await ViewDetails.update(
    //   { isViewed: false },
    //   {
    //     where: {
    //       announcementId,
    //     },
    //   }
    // );
    if (role !== 'SUPER_ADMIN' && role !== 'SUPER ADMIN') {
      departments.forEach(async (deptId: number) => {
        const res = await departmentAnnouncement.findOrCreate({
          where: {
            announcementId: announcementId,
            departmentId: deptId,
          },
          // add remaining data
          defaults: {
            companyId: companyId,
            departmentId: deptId,
            announcementId: announcementId,
          },
        });
        const announcement: any = await Announcement.findOne({
          where: {
            announcementId: announcementId,
          },
          attributes: ['isPosted'],
        });

        if (announcement.isPosted === true) {
          // const employees: any = await Employee.findAll({
          //   where: {
          //     departmentId: deptId,
          //     companyId: companyId,
          //   },
          //   include: [
          //     {
          //       model: User,
          //       attributes: ['userId'],
          //       limit: 1,
          //     },
          //   ],
          // });
          // employees.forEach(async (emp: any) => {
          //   if (emp.user) {
          //     await ViewDetails.findOrCreate({
          //       where: {
          //         announcementId,
          //         departmentId: deptId,
          //         userId: emp.user.userId,
          //       },
          //     });
          //   }
          // });
          const superAdmins: any = await User.findAll({
            where: {
              role: { [Op.or]: ['SUPER_ADMIN', 'SUPER ADMIN'] },
            },
            attributes: ['userId'],
          });
          // for all super admins for select company
          // superAdmins.forEach(async (admin: any) => {
          //   await ViewDetails.findOrCreate({
          //     where: {
          //       announcementId: announcementId,
          //       departmentId: null,
          //       userId: admin.userId,
          //     },
          //   });
          // });
          // await ViewDetails.findOrCreate({
          //   where: {
          //     announcementId: announcementId,
          //     departmentId: null,
          //     userId: seshData.userId,
          //   },
          // });
        }
      });
    } else {
      // departments here is using company id's
      departments.forEach(async (compId: number) => {
        // console.log('update!');
        const res = await departmentAnnouncement.findOrCreate({
          where: {
            announcementId: announcementId,
            companyId: compId,
          },
          // add remaining data
          defaults: {
            companyId: compId,
            departmentId: null,
            announcementId: announcementId,
          },
        });
        const announcement: any = await Announcement.findOne({
          where: {
            announcementId: announcementId,
          },
          attributes: ['isPosted'],
        });

        if (announcement.isPosted === true) {
          // const users: any = await User.findAll({
          //   where: {
          //     companyId: compId,
          //   },
          //   attributes: ['userId'],
          //   // include: [
          //   //   {
          //   //     model: User,
          //   //     attributes: ['userId'],
          //   //     limit: 1,
          //   //   },
          //   // ],
          // });
          // users.forEach(async (user: any) => {
          //   if (user) {
          //     await ViewDetails.findOrCreate({
          //       where: {
          //         announcementId,
          //         companyId: compId,
          //         userId: user.userId,
          //       },
          //     });
          //   }
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
          //       companyId: compId,
          //       departmentId: null,
          //       userId: admin.userId,
          //     },
          //   });
          // });
          // await ViewDetails.findOrCreate({
          //   where: {
          //     announcementId: announcementId,
          //     departmentId: null,
          //     userId: seshData.userId,
          //   },
          // });
        }
      });
    }

    await createActivityLog(companyId, userId, 'Updated an Announcement', transaction);
    await transaction.commit();

    return NextResponse.json(
      {
        success: true,
        message: 'successfully up dated announcement id:' + announcementId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error updating announcements:', error.message);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

export async function DELETE(req: Request, res: Response) {
  //   const { searchParams } = new URL(req.url);
  const announcementId = req.url.split('announcements/')[1];
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  // const companyId = selectedCompData
  //   ? selectedCompData.companyId
  //   : seshData.companyId;

  const transaction = await connection.transaction();

  try {
    await executeQuery(
      `department_announcements_delete`,
      { announcementId, companyIds: null, departmentIds: null },
      [],
      QueryTypes.UPDATE,
      transaction as any
    );

    await executeQuery(
      `view_details_delete`,
      { announcementId, companyIds: null, departmentIds: null },
      [],
      QueryTypes.UPDATE,
      transaction as any
    );

    await executeQuery(
      `announcements_delete`,
      { announcementId },
      [],
      QueryTypes.UPDATE,
      transaction as any
    );

    await transaction.commit();

    return NextResponse.json(
      {
        success: true,
        message: 'successfully deleted announcement id:' + announcementId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error deleting announcements:', error.message);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
