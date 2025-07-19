import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { isValidToken } from '@utils/jwt';
import { Company } from 'db/models';
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
    const { companyId, companyName } = body;
    if (hasHtmlTags(companyName)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    // if(companyName.match(/select|insert|delete|update|drop|sleep|create|alter|execute/i)) {
    //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });
    // }

    const duplicateCompanyName = await Company.findOne({
      where: {
        companyId: {
          [Op.not]: companyId,
        },
        companyName: companyName.trim(),
      },
    });
    let count = 0;
    if (duplicateCompanyName) count = 1;
    return NextResponse.json({ count: count });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else return NextResponse.json(error, { status: 500 });
  }
}
