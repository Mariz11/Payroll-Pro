import { userCredentialEmailContent } from '@utils/notificationContentFormatter';
import { isValidToken, sessionData } from '@utils/jwt';
import { ParseDateStringtoFormatted } from '@utils/parseDate';
import { sendEmail } from '@utils/partnerAPIs';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { ActivityLog, Company, Employee, User } from 'db/models';
import bcrypt from 'bcrypt';
import { isNumber } from 'lodash';
import user from 'db/models/user';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const userId = req.url.split('user/')[1];

  const userInfo: any = await User.findOne({
    attributes: {
      exclude: ['password'],
    },
    where: {
      userId: userId,
    },
    include: [Company],
  });
  delete userInfo.password;
  return NextResponse.json(userInfo);
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('user/')[1];
  const seshData: any = await sessionData();

  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { companyId, companyName, companyDetails, userDetails } =
      await req.json();
    if (hasHtmlTags(companyName)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    // if (
    //   companyName.match(
    //     /select|insert|delete|update|drop|sleep|create|alter|execute/i
    //   )
    // ) {
    //   return NextResponse.json(
    //     { success: false, message: 'Input/s contain/s possible SQL keywords' },
    //     { status: 400 }
    //   );
    // }
    // JSON input validation
    if (!isNumber(companyId)) {
      return NextResponse.json({
        status: 400,
        success: false,
        message: 'Invalid Company Id',
      });
    }
    if (
      userDetails.contactNumber.length != 11 ||
      userDetails.contactNumber[0] != '0' ||
      userDetails.contactNumber[1] != '9'
    ) {
      return NextResponse.json({
        status: 400,
        success: false,
        message: 'Invalid Contact Number Format',
      });
    }

    if (userDetails.emailAddress) {
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

    // Update Company details
    if (companyDetails) {
      await Company.upsert(companyDetails);
    }

    let unhashPass = '';
    if (!userDetails.password) {
      delete userDetails.password;
    } else {
      unhashPass = userDetails.password;
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
    console.log(error);

    return NextResponse.json({
      success: false,
      message: 'Error updating account details',
      // error,
    });
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
