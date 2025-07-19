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
    const customWhere: any =
      seshData.role !== 'SUPER_ADMIN' && seshData.role !== 'SUPER ADMIN'
        ? {
            where: {
              companyId: {
                [Op.not]: seshData.companyId,
              },
            },
          }
        : {};
    data = await Company.findAndCountAll({
      distinct: true,
      order: [['companyName', 'ASC']],
      attributes: ['companyName', 'companyId'],
      paranoid: false,
      where: customWhere,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(error);
  }
}
