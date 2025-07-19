import { decodeJWT, isValidToken, sessionData } from '@utils/jwt';
import {
  deactivateCompany,
  generatePassword,
  registerCompanyToKYC,
  registerEmployeeToKYC,
  sendEmail,
} from '@utils/partnerAPIs';
import {
  userCredentialEmailContent,
  verifyUserEmailContent,
} from '@utils/notificationContentFormatter';
import {
  ActivityLog,
  Company,
  CompanyCharge,
  CompanyPayCycle,
  Employee,
  Module,
  User,
  UserRole,
} from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { hasHtmlTags } from '@utils/helper';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const seshData: any = await sessionData();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');
    const mode = url.searchParams.get('dropDown');
    let data = null;

    if (mode && mode === 'dropDown') {
      data = await Company.findAndCountAll({
        distinct: true,
        order: [['companyName', 'ASC']],
        attributes: ['companyName', 'companyId'],
        paranoid: false,
      });
    } else {
      data = await Company.findAndCountAll({
        where: {
          companyId: {
            [Op.not]: seshData.companyId,
          },
          [Op.or]: {
            companyName: {
              [Op.startsWith]: `%${search}%`,
            },
            companyAddress: {
              [Op.startsWith]: `%${search}%`,
            },
            accountId: {
              [Op.startsWith]: `%${search}%`,
            },
            maxEmployee: {
              [Op.startsWith]: `%${search}%`,
            },
            emailAddress: {
              [Op.startsWith]: `%${search}%`,
            },
          },
        },
        include: [{ model: CompanyPayCycle }],
        offset: offset,
        limit: limit,
        distinct: true,
        order: [['companyName', 'ASC']],
      });

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          const company: any = data.rows[i];
          const userDetails: any = await User.findOne({
            where: {
              companyId: company.companyId,
              isDefault: 1,
            },
          });

          data.rows[i].dataValues.userDetails = userDetails;
        }
      }
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(error);
  }
}

export async function POST(nextReq: NextRequest, nextRes: NextResponse) {
  const userToken: any = nextReq.headers.get('authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const payload = await nextReq.json();
    const { companyDetails } = payload;

    if (!companyDetails) {
      return NextResponse.json(
        { message: 'Missing Arguments' },
        { status: 400 }
      );
    }

    // Register Company to CKYC and Insert Company Details
    const registerCompany = await registerCompanyToKYC(
      companyDetails.companyName
    );
    if (!registerCompany.success) {
      return NextResponse.json(registerCompany, {
        status: registerCompany.statusCode,
      });
    }
    const { responseData } = registerCompany;
    companyDetails.accountId = responseData.companyAccountId;
    companyDetails.subAccountId = responseData.companySubAccountId;
    companyDetails.tierLabel = responseData.tierLabel;
    const insertCompany: any = await Company.create(companyDetails);
    const companyId = insertCompany.companyId;

    const admin_module_access = JSON.stringify(
      (
        await Module.findAll({
          where: { moduleId: { [Op.notIn]: [16, 17, 18, 19] } },
        })
      ).map((module: any) => ({ moduleId: module.moduleId }))
    );

    const employee_module_access = JSON.stringify(
      (
        await Module.findAll({
          where: { moduleId: { [Op.in]: [15, 16, 17, 18, 19] } },
        })
      ).map((module: any) => ({ moduleId: module.moduleId }))
    );
    // Craete Default Roles
    const adminRole: any = await UserRole.create({
      roleName: 'ADMIN',
      companyId: companyId,
      moduleAccess: admin_module_access,
    });

    await UserRole.create({
      roleName: 'EMPLOYEE',
      companyId: companyId,
      moduleAccess: employee_module_access,
    });

    // Create Admin Account
    const unHashPass = generatePassword();
    let userAcctDetails: any = {};
    userAcctDetails.username = companyDetails.emailAddress;
    userAcctDetails.emailAddress = companyDetails.emailAddress;
    userAcctDetails.firstName = companyDetails.companyName;
    userAcctDetails.lastName = 'Admin';
    userAcctDetails.contactNumber = companyDetails.contactNumber;
    userAcctDetails.companyId = companyId;
    userAcctDetails.role = 'ADMIN';
    userAcctDetails.isDefault = 1;
    userAcctDetails.roleId = adminRole.userRoleId;
    userAcctDetails.password = await bcrypt.hash(unHashPass, 10);
    await User.create(userAcctDetails);

    // Send Email Notification
    const companyCharges: any = companyDetails.companyCharges;

    const companyChargesPromises = companyCharges.map(async (charge: any) => {
      const companyCharge = charge;
      const companyChargeObj: any = {};
      companyChargeObj.tierStart = companyCharge.tierStart;
      companyChargeObj.tierEnd = companyCharge.tierEnd;
      companyChargeObj.charge = companyCharge.charge;
      companyChargeObj.tierNumber = companyCharge.tier;
      companyChargeObj.companyId = insertCompany.companyId;
      await CompanyCharge.create(companyChargeObj);
    });

    await Promise.all(companyChargesPromises);
    
    const logo = 'ML Payroll Pro';
    sendEmail({
      to: companyDetails.emailAddress,
      subject: `Welcome, ${companyDetails.companyName}`,
      content: userCredentialEmailContent({
        username: userAcctDetails.username,
        password: unHashPass,
        logo: logo,
      }),
    });

    await ActivityLog.create({
      companyId: seshData.companyId,
      userId: seshData.userId,
      message: `Created a company ${companyDetails.companyName}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully Created',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(
        {
          success: false,
          message: 'Something went wrong...',
          error: { ...error },
        },
        { status: 500 }
      );
  }
}

export async function PUT(nextReq: NextRequest, nextRes: NextResponse) {
  const userToken: any = nextReq.headers.get('authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const payload = await nextReq.json();
    const { companyDetails } = payload;

    if (!companyDetails) {
      return NextResponse.json(
        { message: 'Missing Arguments' },
        { status: 400 }
      );
    }

    // Prevents from spamming the request
    let companyAcctStatus = null;
    if (companyDetails.companyStatus != companyDetails.isActive) {
      if (companyDetails.companyStatus == 0) {
        companyAcctStatus = await deactivateCompany({
          companyAccountId: companyDetails.accountId,
          status: 'INACTIVE',
        });
      } else {
        companyAcctStatus = await deactivateCompany({
          companyAccountId: companyDetails.accountId,
          status: 'ACTIVE',
        });
      }
      companyDetails.isActive = companyDetails.companyStatus;
    }

    // delete removed tier charges
    // console.log('ok///!!!');
    const tierChargesIds = companyDetails.companyCharges.map(
      (item: any) => item.companyChargeId
    );
    // console.log('tierChargesIds', tierChargesIds);
    await CompanyCharge.destroy({
      where: {
        companyChargeId: {
          [Op.notIn]: tierChargesIds,
        },
        companyId: companyDetails.companyId,
      },
    });

    // If new tier charges were added, create
    if (companyDetails.newTierCharges.length > 0) {
      for (const item of companyDetails.newTierCharges) {
        await CompanyCharge.create({
          tierStart: item.tierStart,
          tierEnd: item.tierEnd,
          charge: item.charge,
          tierNumber: item.tier,
          companyId: companyDetails.companyId,
        });
      }
    }
    // Update Company Details
    const companyName = companyDetails.companyName;
    const companyId = companyDetails.companyId;
    delete companyDetails.companyName;
    if (!companyDetails.urlLogo) delete companyDetails.urlLogo;

    const prevData = await Company.update(companyDetails, {
      where: {
        companyId: companyId,
      },
    });
    // update old tier charges
    for (let i = 0; i < companyDetails.companyCharges.length; i++) {
      const companyCharge = companyDetails.companyCharges[i];
      const companyChargeObj: any = {};
      companyChargeObj.tierStart = companyCharge.tierStart;
      companyChargeObj.tierEnd = companyCharge.tierEnd;
      companyChargeObj.charge = companyCharge.charge;
      companyChargeObj.tierNumber = companyCharge.tier;
      await CompanyCharge.update(companyChargeObj, {
        where: {
          companyChargeId: companyCharge.companyChargeId,
        },
      });
    }
    // let userAcctDetails: any = {};
    // userAcctDetails.username = companyDetails.emailAddress;
    // userAcctDetails.emailAddress = companyDetails.emailAddress;
    // userAcctDetails.contactNumber = companyDetails.contactNumber;
    // userAcctDetails.isActive = companyDetails.companyStatus;
    // await User.update(userAcctDetails, {
    //   where: {
    //     userId: companyDetails.userId,
    //   },
    // });
    // console.log('hi!');

    await ActivityLog.create({
      companyId: seshData.companyId,
      userId: seshData.userId,
      message: `Updated company ${companyName}`,
    });
    await User.update(
      {
        isActive: companyDetails.companyStatus == 0 ? false : true,
      },
      {
        where: {
          companyId: companyId,
        },
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully Updated',
        companyAcctStatus: companyAcctStatus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    // if (error.name && error.name === 'SequelizeDatabaseError')
    //   console.log(error);
    // else
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong...',
        errorMessage: error.message,
        error: error,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(nextReq: NextRequest, nextRes: NextResponse) {
  const userToken: any = nextReq.headers.get('authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { companyDetails } = await nextReq.json();
    const companyId = companyDetails.companyId;
    const accountId = companyDetails.accountId;

    // Prevents from spamming the request
    const companyAcctStatus = await deactivateCompany({
      companyAccountId: accountId,
      status: 'INACTIVE',
    });

    // Delete company
    await Company.destroy({
      where: {
        companyId: companyId,
      },
    });

    // Delete users
    await User.destroy({
      where: {
        companyId: companyId,
      },
    });

    // Delete employees
    await Employee.destroy({
      where: {
        companyId: companyId,
      },
    });

    // Delete company charges
    await CompanyCharge.destroy({
      where: {
        companyId: companyId,
      },
    });

    await ActivityLog.create({
      companyId: seshData.companyId,
      userId: seshData.userId,
      message: `Deleted company ${companyDetails.companyName}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully deleted',
        companyAcctStatus: companyAcctStatus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error deleting company:', error.message);
    else
      return NextResponse.json(
        {
          success: false,
          message: 'Something went wrong...',
          error: { ...error },
        },
        { status: 500 }
      );
  }
}
