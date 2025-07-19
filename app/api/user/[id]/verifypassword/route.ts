import { Company, CompanyPayCycle, Employee, User } from 'db/models';
import {
  isValidToken,
  selectedCompanyData,
  sessionData,
  signJWTAccessToken,
} from 'lib/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { oldPassword } = body;

    const user: any = await User.findByPk(seshData.userId);

    if (user) {
      const verifyPass = await bcrypt.compare(
        oldPassword.trim(),
        user.password
      );
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
      } else {
        return NextResponse.json(
          {
            success: true,
            message: 'Verified',
          },
          {
            status: 200,
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json('Error Verifing Password', { status: 500 });
  }
}
