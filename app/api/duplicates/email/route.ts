import { hasHtmlTags } from '@utils/helper';
import { isValidToken } from '@utils/jwt';
import { User } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';

// Get data by Email Address
export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { companyId, emailAddress } = body;
    if (hasHtmlTags(emailAddress)) {
      return NextResponse.json({ success: false, message: 'Input/s contain/s possible script tags' }, { status: 400 });
    }
    
    const duplicateEmail = await User.findOne({
      where: {
        companyId: {
          [Op.not]: companyId,
        },
        emailAddress: emailAddress.trim(),
      },
    });
    let count = 0;
    if (duplicateEmail) count = 1;
    return NextResponse.json({ count: count });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(error, { status: 500 });
  }
}
