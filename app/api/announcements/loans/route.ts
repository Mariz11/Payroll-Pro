import { hasHtmlTags } from '@utils/helper';
import { NextResponse } from 'next/server';
export async function PATCH(req: Request, res: Response) {
  //   const url = req.url.split('announcements/')[1];
  //   const announcementId = url.split('/')[0];
  //   const userToken: any = req.headers.get('authorization');
  //   const seshData: any = await sessionData();
  //   const selectedCompData: any = await selectedCompanyData();
  //   const companyId = selectedCompData
  //     ? selectedCompData.companyId
  //     : seshData.companyId;

  //   const role = seshData?.role;
  //   if (!isValidToken(userToken)) {
  //     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  //   }
  let { title, content, order, departments, image } = await req.json();
  if (hasHtmlTags(title) || hasHtmlTags(image)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }

  // if(hasSQLKeywords(title)) {
  //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });
  // }
  try {
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully posted',
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
