import { cookies } from 'next/headers';
import {
  ActivityLog,
  Company,
  CompanyPayCycle,
  Employee,
  User,
} from 'db/models';
import { signJWTAccessToken } from 'lib/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import moment from '@constant/momentTZ';
import { verifyReCaptcha } from '@utils/partnerAPIs';

const TOKEN_AGE = process.env.TOKEN_AGE
  ? parseInt(process.env.TOKEN_AGE)
  : 86400000;

export async function POST(req: Request, res: Response, next: NextRequest) {
  const body = await req.json();
  const { username, password, reCaptchaToken } = body;

  try {
    const verify = await verifyReCaptcha({
      reCaptchaToken: reCaptchaToken,
    });
    if (!verify.success) {
      return NextResponse.json(
        {
          success: false,
          message: `ReCaptcha Error: ${JSON.stringify({ ...verify })}`,
        },
        {
          status: 401,
        }
      );
    }

    const user: any = await User.findOne({
      where: {
        username: username.trim(),
      },
      attributes: [
        'username',
        'password',
        'isActive',
        'role',
        'roleId',
        'userId',
      ],
      include: [
        {
          model: Company,
          attributes: [
            'companyId',
            'tierLabel',
            'companyName',
            'companyAddress',
            'accountId',
            'subAccountId',
            'maxEmployee',
            'chargePerEmployee',
            'emailAddress',
            'urlLogo',
            'tcAccepted',
          ],
        },
        {
          attributes: [
            'employeeStatus',
            'mlWalletStatus',
            'ckycId',
            'employeeId',
          ],
          model: Employee,
        },
      ],
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Credentials',
        },
        {
          status: 401,
        }
      );
    }

    const verifyPass = await bcrypt.compare(password.trim(), user.password);
    if (!verifyPass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Credentials',
        },
        {
          status: 401,
        }
      );
    }

    if (user.isActive != 1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account not yet activated.',
        },
        {
          status: 404,
        }
      );
    }
    const userData = user.toJSON();
    delete userData.password;

    const token = await signJWTAccessToken(userData);
    cookies().delete('manual-login-token');

    cookies().set('manual-login-token', token, {
      expires: Date.now() + TOKEN_AGE,
    });

    const response = {
      success: true,
      userData: user,
      companyName: user.company.companyName,
      // role: user.role,
      // companyId: user.companyId,
      message: 'Authenticated',
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error logging in:', error.message);
    } else
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        {
          status: 404,
        }
      );
  }
}
