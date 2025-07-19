import { NextRequest, NextResponse } from 'next/server';

import { userCredentialEmailContent } from '@utils/notificationContentFormatter';
import { generatePassword, sendEmail } from '@utils/partnerAPIs';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';

import activityLog from 'db/models/activityLog';
import user from 'db/models/user';

import bcrypt from 'bcrypt';
import { Op, Sequelize } from 'sequelize';
import { Company, Employee, UserRole } from 'db/models';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { message } from 'antd';

export async function POST(req: Request, res: Response, next: NextRequest) {
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
    const {
      role,
      firstName,
      middleName,
      lastName,
      suffix,
      birthDate,
      contactNumber,
      emailAddress,
      chosenRole,
    } = await req.json();

    if (
      hasHtmlTags(role) ||
      hasHtmlTags(firstName) ||
      hasHtmlTags(lastName) ||
      hasHtmlTags(middleName) ||
      hasHtmlTags(suffix) ||
      hasHtmlTags(emailAddress) ||
      hasHtmlTags(contactNumber)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (
      hasSQLKeywords(role) ||
      hasSQLKeywords(firstName) ||
      hasSQLKeywords(lastName) ||
      hasSQLKeywords(middleName) ||
      hasSQLKeywords(suffix) ||
      hasSQLKeywords(contactNumber)
    ) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailAddress)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // if (
    //   emailAddress.match(
    //     /select|insert|delete|update|drop|sleep|create|alter|execute/i
    //   )
    // ) {
    //   return NextResponse.json(
    //     { success: false, message: 'Input/s contain/s possible SQL keywords' },
    //     { status: 400 }
    //   );
    // }

    const duplicateEmail = await user.findOne({
      where: {
        [Op.and]: [{ deletedAt: null }, { emailAddress: emailAddress }],
      },
    });

    const duplicateContactNum = await user.findOne({
      where: {
        [Op.and]: [{ deletedAt: null }, { contactNumber: contactNumber }],
      },
    });

    if (duplicateEmail) {
      return NextResponse.json(
        { status: false, message: 'Email Address already exists' },
        { status: 409 }
      );
    }

    if (duplicateContactNum) {
      return NextResponse.json(
        { status: false, message: 'Contact Number already exists' },
        { status: 409 }
      );
    }

    const generatedPassword = generatePassword();

    const roleType = () => {
      if (role === 'SUPER_ADMIN') {
        return 'SUPER_ADMIN';
      }
    };
    let roleName = null;
    let userRole: any = null;
    if (roleType() !== 'SUPER_ADMIN') {
      userRole = await UserRole.findOne({
        where: {
          userRoleId: chosenRole,
          companyId: companyId,
        },
      });
      roleName = userRole.roleName;
    } else {
      // default for super admin
      let customWhere = {
        roleName: roleType()?.replace('_', ' '),
        companyId: companyId,
      };
      // console.log(customWhere);

      // if he has selected a company on side nav as super admin
      // super admin can only create admins when selecting companies
      if (seshData.companyId != companyId) {
        customWhere = {
          roleName: 'ADMIN',
          companyId: companyId,
        };
      }
      userRole = await UserRole.findOne({
        where: customWhere,
      });
      // console.log(userRole);
      if (seshData.companyId != companyId) {
        roleName = 'ADMIN';
      } else {
        roleName = 'SUPER_ADMIN';
      }
    }

    const newUsers = await user.create({
      firstName,
      middleName,
      lastName,
      suffix,
      birthDate,
      contactNumber,
      emailAddress,
      role: roleName,
      companyId,
      username: emailAddress,
      password: await bcrypt.hash(generatedPassword, 10),
      isActive: 1,
      roleId: userRole?.userRoleId,
    });

    await activityLog.create({
      companyId: companyId,
      userId: newUsers.dataValues.userId,
      message: 'Added a new user',
    });

    sendEmail({
      to: emailAddress,
      subject: `Welcome, ${firstName} ${lastName}`,
      content: userCredentialEmailContent({
        username: emailAddress,
        password: generatedPassword,
        logo: 'ML Payroll Pro',
      }),
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error creating user', error);
    } else
      return NextResponse.json(
        {
          success: false,
          errorMessage: error.message,
          error,
          message: 'Error while creating user',
        },
        {
          status: 500,
        }
      );
  }
}

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  const offset = Number(url.searchParams.get('offset'));
  const limit = Number(url.searchParams.get('limit'));
  const search = url.searchParams.get('search');

  const currentLoggedInDetails: any = await user.findOne({
    attributes: ['userId', 'isDefault', 'role'],
    where: {
      userId: seshData.userId,
    },
  });

  let customWhere: any = {
    userId: {
      [Op.not]: seshData.userId,
    },
    [Op.or]: {
      firstName: {
        [Op.startsWith]: `%${search}%`,
      },
      lastName: {
        [Op.startsWith]: `%${search}%`,
      },
      middleName: {
        [Op.startsWith]: `%${search}%`,
      },
      suffix: {
        [Op.startsWith]: `%${search}%`,
      },
      emailAddress: {
        [Op.startsWith]: `%${search}%`,
      },
      role: {
        [Op.startsWith]: `%${search}%`,
      },
    },
  };


  if (
    seshData.role !== 'SUPER_ADMIN' ||
    (seshData.role == 'SUPER_ADMIN' && selectedCompData)
  ) {
    customWhere.companyId = companyId;
  }

  const users = await user.findAndCountAll({
    where: customWhere,
    include: [
      {
        model: Company,
      },
      {
        model: Employee,
      },
    ],
    offset: offset,
    limit: limit,
    distinct: true,
    order: [
      ['companyID', 'ASC'],
      ['role', 'ASC'],
      ['lastName', 'ASC'],
    ],
  });

  return NextResponse.json(users);
}
