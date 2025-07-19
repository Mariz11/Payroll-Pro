import { cookies } from 'next/headers';
import {
  ActivityLog,
  Company,
  CompanyPayCycle,
  Employee,
  User,
} from 'db/models';
import { decodeJWT, signJWTAccessToken } from 'lib/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import moment from '@constant/momentTZ';

const TOKEN_AGE = process.env.TOKEN_AGE
  ? parseInt(process.env.TOKEN_AGE)
  : 86400000;

export async function POST(req: Request, res: Response, next: NextRequest) {
  const body = await req.json();
  const { username, password } = body;
  const cookieStore = cookies();
  const userToken: any = decodeJWT(
    cookieStore.get('manual-login-token')?.value as string
  );
  try {
    if (userToken == undefined)
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid Credentials',
        },
        {
          status: 401,
        }
      );

    const user: any = await User.findOne({
      where: {
        username: username.trim(),
      },
      attributes: ['username', 'password', 'isActive', 'role'],
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

    if (user.company.companyId != userToken.company.companyId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User Must Belong to the Company',
        },
        {
          status: 401,
        }
      );
    } else {
      cookies().delete('manual-login-token');
    }

    // const token = await signJWTAccessToken(userData);

    const response = {
      success: true,
      // userData: user,
      // companyName: user.company.companyName,
      // role: user.role,
      // companyId: user.companyId,
      message: 'Logged Out',
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error logging out:', error.message);
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
