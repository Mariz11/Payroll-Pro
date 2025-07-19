import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Announcement, ViewDetails } from 'db/models';
import { NextResponse } from 'next/server';
export async function GET(req: Request, res: Response) {
  const url = req.url.split('announcements/')[1];
  const userId = url.split('users/')[1];

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

  const announcement = await Announcement.findAll({
    where: {
      userId: Number(userId),
    },
    order: [['updatedAt', 'DESC'], 'title'],
    attributes: { exclude: ['deletedAt', 'createdAt'] },
    include: {
      model: ViewDetails,
      limit: 1,
    },
  });
  try {
    return NextResponse.json(
      {
        success: true,
        message: announcement,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error sending announcement to user:', error.message);
    } else {
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
    }
  }
}
