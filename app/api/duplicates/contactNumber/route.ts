import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { isValidToken } from '@utils/jwt';
import { User } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';

// Get data by Contact Number
export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { companyId, contactNumber } = body;
    if (hasHtmlTags(contactNumber)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    // if(hasSQLKeywords(contactNumber)) {
    //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });
    // }
    const duplicateContactNum = await User.findOne({
      where: {
        companyId: {
          [Op.not]: companyId,
        },
        contactNumber: contactNumber.trim(),
      },
    });
    let count = 0;
    if (duplicateContactNum) count = 1;
    return NextResponse.json({ count: count });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json('Error Getting Duplicate Contact Number', {
        status: 500,
      });
  }
}
