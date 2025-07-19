import { NextResponse } from 'next/server';
import {
  Announcement,
  Department,
  Employee,
  User,
  ViewDetails,
} from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import departmentAnnouncement from 'db/models/departmentAnnouncement';
import { department } from '@constant/addShiftDropDownData';
import { Sequelize } from 'sequelize';
export async function PATCH(req: Request, res: Response) {
  const announcementId = req.url.split('viewDetails/')[1];
  //   const viewDetailsId = url.split('/')[0];
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  // console.log(announcementId);
  const role = seshData?.role;
  const userId = seshData?.userId;
  try {
    // await ViewDetails.update(
    //   {
    //     isViewed: true,
    //   },
    //   {
    //     where: {
    //       viewDetailsId,
    //     },
    //   }
    // );
    await Announcement.update(
      {
        usersSeen: Sequelize.literal(
          `CONCAT(IFNULL(usersSeen, ''), ',${userId}')`
        ),
      },
      {
        where: {
          announcementId: announcementId,
        },
      }
    );
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully Viewed',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    if (error.name) {
      console.log(error.name);
    }
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error viewing announcements', error);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
