import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  Department,
  Employee,
  EmployeeBenefit,
  EmployeeLeave,
  EmployeeProfile,
  Payroll,
  Shift,
  User,
  VerificationCode,
} from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const data = await User.findAll({
      attributes: {
        exclude: ['password'],
      },
      where: {
        companyId: companyId,
        role: {
          [Op.notIn]: ['SUPER_ADMIN', 'SUPER ADMIN', 'EMPLOYEE'],
        },
        isActive: 1,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(error);
  }
}
