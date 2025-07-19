import { NextResponse } from 'next/server';
import { Module, ModuleAction, UserRole, RoleAction } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';
import moduleAction from 'db/models/moduleAction';

export async function GET(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  if (!isValidToken(userToken)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRoles = await UserRole.findAll({
      // where: {
      //   companyId: companyId,
      // },
      order: ['userRoleId'],
      where: {
        companyId: companyId,
      },
      attributes: { exclude: ['moduleAccess'] },
    });
    return NextResponse.json(userRoles);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
