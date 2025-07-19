import { NextRequest, NextResponse } from 'next/server';
import { Attendance, Holiday, TaskProcesses } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ActivityLog, User } from 'db/models';
import { Op } from 'sequelize';
import { hasHtmlTags } from '@utils/helper';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest, res: NextResponse) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const userId = seshData.userId;
    const checkInProgressTasks = await TaskProcesses.count({
      where: {
        userId: userId,
        status: 0,
      },
    });
    if (checkInProgressTasks > 0) {
      return NextResponse.json(
        { success: true, message: { isLocked: false } },
        { status: 200 }
      );
    }

    const user: any = await User.findOne({ where: { userId: userId } });
    if (user?.isLocked) {
      return NextResponse.json(
        { success: false, message: { isLocked: true } },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { success: true, message: { isLocked: false } },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SeqeulizeDatabaseError') {
      console.error('Error getting lock status:', error);
    } else {
      return NextResponse.json(
        { success: false, message: 'Error getting lock status' },
        { status: 500 }
      );
    }
  }
}
// set user to unlocked
export async function PUT(req: Request, res: Response) {
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

// set user to locked
export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();

  try {
    const userId = seshData.userId;
    const checkInProgressTasks = await TaskProcesses.count({
      where: {
        userId: userId,
        status: 0,
      },
    });
    if (checkInProgressTasks > 0) {
      return NextResponse.json(
        { success: true, isLocked: false },
        { status: 200 }
      );
    }

    await User.update({ isLocked: true }, { where: { userId: userId } });
    return NextResponse.json(
      { success: true, message: 'User is now locked', isLocked: true },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SeqeulizeDatabaseError') {
      console.error('Error locking user:', error);
    } else
      return NextResponse.json(
        { success: false, message: 'Error locking user' },
        { status: 500 }
      );
  }
}
