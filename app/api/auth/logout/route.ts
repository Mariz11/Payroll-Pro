import { cookies } from 'next/headers';
// import {
//     ActivityLog,
//     Company,
//     CompanyPayCycle,
//     Employee,
//     User,
//     Blacklist
// } from 'db/models';

import Blacklist from 'db/models/blacklist';
import { convertJwtExpToDateTime, decodeJWT, signJWTAccessToken } from 'lib/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import moment from '@constant/momentTZ';




export async function POST(req: Request, res: Response, next: NextRequest) {
  const body = await req.json();
  // const { username, password } = body;
  const cookieStore = cookies();

  try {
    // const token = await signJWTAccessToken(userData);

    // uncomment below to create a blacklist of tokens that are not yet expired
    // await Blacklist.create({
    //     token: cookies().get('user-token')?.value,
    //     expiration: convertJwtExpToDateTime(cookies().get('user-token')?.value as string),
    // });

    // delete user tokens
    await cookies().delete('user-token');
    await cookies().delete('selected-company');
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

