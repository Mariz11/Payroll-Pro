import { userCredentialEmailContent } from '@utils/notificationContentFormatter';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { ParseDateStringtoFormatted } from '@utils/parseDate';
import { sendEmail } from '@utils/partnerAPIs';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { ActivityLog, Company, User } from 'db/models';
import bcrypt from 'bcrypt';
import { hasHtmlTags, hasSQLKeywords, isPasswordCommon } from '@utils/helper';

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const params = req.url.split('user/')[1];
  const id = params.split('/')[0];
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const { companyName, companyDetails, userDetails } = await req.json();
    if (
      hasHtmlTags(companyName) ||
      hasHtmlTags(userDetails?.emailAddress) ||
      hasHtmlTags(userDetails.firstName) ||
      hasHtmlTags(userDetails.lastName) ||
      hasHtmlTags(userDetails.middleName) ||
      hasHtmlTags(userDetails.suffix)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    //  security validation start
    if (
      hasSQLKeywords(userDetails.firstName) ||
      hasSQLKeywords(userDetails.lastName) ||
      hasSQLKeywords(userDetails.middleName) ||
      hasSQLKeywords(userDetails.suffix)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }

    if (userDetails.password && isPasswordCommon(userDetails.password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'The password you entered is frequently used. Please create a stronger one.',
        },
        { status: 400 }
      );
    }

    if (
      userDetails.emailAddress &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
        userDetails?.emailAddress
      )
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (userDetails && userDetails.emailAddress) {
      const checkUserEmail = await User.findOne({
        where: {
          emailAddress: userDetails.emailAddress,
          userId: {
            [Op.not]: Number(id),
          },
        },
      });

      if (checkUserEmail) {
        return NextResponse.json({
          status: 409,
          success: false,
          message: 'Email Address already exists',
        });
      }
    }
    // console.log('ok3');
    if (userDetails.contactNumber) {
      const checkUserNumber = await User.findOne({
        where: {
          contactNumber: userDetails.contactNumber,
          userId: {
            [Op.not]: Number(id),
          },
        },
      });

      if (checkUserNumber) {
        return NextResponse.json({
          status: 409,
          success: false,
          message: 'Contact Number already exists',
        });
      }
    }

    if (companyDetails) {
      await Company.update(companyDetails, {
        where: {
          companyId: companyId,
        },
      });
    }

    let unhashPass = '';
    if (!userDetails.password) {
      delete userDetails.password;
    } else {
      unhashPass = userDetails.password;
      const upperCaseAndSpecialCharactersRE =
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

      if (unhashPass.length < 8) {
        return NextResponse.json({
          status: 409,
          success: false,
          message: 'Password must be at least 8 characters long',
        });
      }
      if (unhashPass.length > 30) {
        return NextResponse.json({
          status: 409,
          success: false,
          message: 'Password must not exceed 30 characters',
        });
      }
      // check if password contains at least one uppercase character, number and special character
      if (
        !upperCaseAndSpecialCharactersRE.test(unhashPass) ||
        unhashPass == unhashPass.toLowerCase()
      ) {
        return NextResponse.json({
          status: 409,
          success: false,
          message:
            'Please create a stronger password using a mix of uppercase and lowercase letters, numbers, and special characters.',
        });
      }
      userDetails.password = bcrypt.hashSync(userDetails.password, 10);
    }

    // Update User details
    userDetails.username = userDetails.emailAddress;
    await User.update(userDetails, {
      where: {
        userId: Number(id),
      },
    });

    await ActivityLog.create({
      companyId: companyId,
      userId: Number(id),
      message: 'Updated Account Details',
    });

    if (userDetails.password) {
      sendEmail({
        to: userDetails.emailAddress,
        subject: `You have reset your password`,
        content: userCredentialEmailContent({
          username: userDetails.emailAddress,
          password: unhashPass,
          logo: companyName,
        }),
      });
    }

    return NextResponse.json(
      { success: true, message: 'Successfully Updated' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log('error updating account details', error);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PATCH(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('user/')[1];

  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { isActive } = await req.json();

    const updateUserStatus = await User.findOne({
      where: {
        userId: Number(id),
      },
    });

    await User.update(
      { isActive: Number(isActive) },
      {
        where: {
          userId: Number(id),
        },
      }
    );

    await ActivityLog.create({
      companyId: updateUserStatus?.dataValues.companyId,
      userId: updateUserStatus?.dataValues.userId,
      message: 'Updated a user status',
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('user/')[1];

  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const deleteUser = await User.findOne({
      where: {
        userId: Number(id),
      },
    });

    await User.update(
      { deletedAt: new Date() },
      {
        where: {
          userId: Number(id),
        },
      }
    );

    await ActivityLog.create({
      companyId: deleteUser?.dataValues.companyId,
      userId: deleteUser?.dataValues.userId,
      message: 'Deleted a user',
    });

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
