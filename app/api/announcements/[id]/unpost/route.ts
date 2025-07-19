import { isValidToken } from '@utils/jwt';
import { Announcement } from 'db/models';
import { NextResponse } from 'next/server';
export async function PATCH(req: Request, res: Response) {
  //   const { searchParams } = new URL(req.url);

  const url = req.url.split('announcements/')[1];
  const announcementId = url.split('/')[0];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const announcement = await Announcement.update(
      { isPosted: false, usersSeen: null },
      {
        where: {
          announcementId: announcementId,
        },
      }
    );
    // await ViewDetails.destroy({
    //   where: {
    //     announcementId: announcementId,
    //   },
    // });
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully unposted',
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
