import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, sessionData } from '@utils/jwt';
import { userCredentialEmailContent } from '@utils/notificationContentFormatter';
import { sendEmail } from '@utils/partnerAPIs';

import activityLog from 'db/models/activityLog';
import user from 'db/models/user';

import { hasHtmlTags, isPasswordCommon } from '@utils/helper';
import bcrypt from 'bcrypt';
import { User, UserRole } from 'db/models';

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const {
    userId,
    companyId,
    password,
    emailAddress,
    isResetPassword,
    chosenRole,
  } = await req.json();
  if (hasHtmlTags(emailAddress)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }

  if (hasHtmlTags(password)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailAddress)) {
    return NextResponse.json(
      { success: false, message: 'Invalid email address' },
      { status: 400 }
    );
  }

  // if(emailAddress.match(/select|insert|delete|update|drop|sleep|create|alter|execute/i)) {
  //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });
  // }
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const upperCaseAndSpecialCharactersRE =
    /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

  if (isResetPassword) {
    if (password.length < 8) {
      return NextResponse.json({
        status: 409,
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    if (isPasswordCommon(password)) {
      return NextResponse.json({
        status: 409,
        success: false,
        message: 'Password you entered is common, please create a stronger one',
      });
    }

    if (password.length > 30) {
      return NextResponse.json({
        status: 409,
        success: false,
        message: 'Password must not exceed 30 characters',
      });
    }
    // check if password contains at least one uppercase character, number and special character
    if (
      !upperCaseAndSpecialCharactersRE.test(password) ||
      password == password.toLowerCase()
    ) {
      return NextResponse.json({
        status: 409,
        success: false,
        message:
          'Please create a stronger password using a mix of uppercase and lowercase letters, numbers, and special characters.',
      });
    }
    await user.update(
      {
        password: bcrypt.hashSync(password, 10),
      },
      {
        where: {
          userId: userId,
        },
      }
    );
  }
  // console.log(chosenRole);
  // console.log('chosen role!');
  let userRole: any;
  if (!chosenRole) {
    userRole = await UserRole.findOne({
      where: {
        roleName: 'EMPLOYEE',
        companyId: companyId,
      },
    });
  } else {
    userRole = await UserRole.findOne({
      where: {
        userRoleId: chosenRole,
        companyId: companyId,
      },
    });
  }
  const isDefaultAdmin: boolean = userRole && userRole.isDefault;
  if (
    seshData.role != 'SUPER ADMIN' &&
    seshData.role != 'SUPER_ADMIN' &&
    !isDefaultAdmin
  ) {
    // console.log('superIdol!');
    // console.log(userId);
    await User.update(
      {
        roleId: userRole.userRoleId,
        role: userRole.roleName,
      },
      {
        where: {
          userId: userId,
        },
      }
    );
  }
  await activityLog.create({
    companyId: companyId,
    userId: userId,
    message: 'Reset own password',
  });
  if (isResetPassword) {
    sendEmail({
      to: emailAddress,
      subject: `You have reset your password`,
      content: userCredentialEmailContent({
        username: emailAddress,
        password: password,
        logo: 'ML Payroll Pro',
      }),
    });
  }

  return NextResponse.json({ message: 'Success' });
}
