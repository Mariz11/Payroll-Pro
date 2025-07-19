import { NextRequest, NextResponse } from 'next/server';
import { Attendance, Holiday } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog, User } from 'db/models';
import { Op } from 'sequelize';
import { hasHtmlTags } from '@utils/helper';
import bcrypt from 'bcrypt';

export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const { password } = await req.json();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const userId = seshData.userId;
    const user: any = await User.findOne({ where: { userId: userId } });
    const verifyPass = await bcrypt.compare(password.trim(), user.password);
    if (!verifyPass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Credentials',
        },
        {
          status: 200,
        }
      );
    }
    // if password is correct
    await User.update({ isLocked: false }, { where: { userId: userId } });
    return NextResponse.json(
      { success: true, message: 'User is now unlocked' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SeqeulizeDatabaseError') {
      console.error('Error unlocking user:', error);
    } else
      return NextResponse.json(
        { success: false, message: 'Error unlocking user' },
        { status: 500 }
      );
  }
}
