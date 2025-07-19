import { NextResponse } from 'next/server';
import { Module, ModuleAction, UserRole, RoleAction } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';
import moduleAction from 'db/models/moduleAction';

export async function GET(req: Request, res: Response) {
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
  let customWhere: any = {
    [Op.or]: {
      roleName: {
        [Op.startsWith]: `%${search}%`,
      },
    },
    companyId: companyId,
  };

  if (!isValidToken(userToken)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRoles = await UserRole.findAndCountAll({
      // where: {
      //   companyId: companyId,
      // },
      where: customWhere,

      offset: offset,
      limit: limit,
      distinct: true,
      order: ['userRoleId'],
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

export async function POST(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const { roleName } = await req.json();

  try {
    if (roleName == 'SUPER ADMIN' || roleName == 'SUPER_ADMIN') {
      return NextResponse.json(
        {
          sucess: false,
          message: 'cannot add role SUPER ADMIN or SUPER_ADMIN',
        },
        { status: 400 }
      );
    } else if (roleName == 'ADMIN' || roleName == 'EMPLOYEE') {
      return NextResponse.json(
        { sucess: false, message: 'cannot add role ADMIN or EMPLOYEE' },
        { status: 400 }
      );
    }
    const defaultModules = [
      'Dashboard',
      'Attendances',
      'Attendance Applications',
      'Payrolls',
      'Account',
    ];

    const module_access = JSON.stringify(
      (
        await Module.findAll({
          where: {
            moduleName: defaultModules,
          },
        })
      ).map((module: any) => ({ moduleId: module.moduleId }))
    );

    const user_role: any = await UserRole.create({
      companyId: companyId,
      roleName: roleName,
      moduleAccess: module_access,
    });
    const attendanceModule: any = await Module.findOne({
      where: { moduleName: 'Attendances' },
    });
    const payrollModule: any = await Module.findOne({
      where: { moduleName: 'Payrolls' },
    });
    if (attendanceModule) {
      const attendanceActions: any = await ModuleAction.findAll({
        where: {
          moduleId: attendanceModule.moduleId,
        },
      });
      for (let i = 0; i < attendanceActions.length; i++) {
        await RoleAction.create({
          roleId: user_role.userRoleId,
          moduleActionId: attendanceActions[i].moduleActionId,
          isActive: true,
        });
      }
    }
    if (payrollModule) {
      const payrollActions: any = await ModuleAction.findAll({
        where: {
          moduleId: payrollModule.moduleId,
        },
      });
      for (let i = 0; i < payrollActions.length; i++) {
        await RoleAction.create({
          roleId: user_role.userRoleId,
          moduleActionId: payrollActions[i].moduleActionId,
          isActive: true,
        });
      }
    }

    return NextResponse.json(
      { success: true, message: user_role },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating user role:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
