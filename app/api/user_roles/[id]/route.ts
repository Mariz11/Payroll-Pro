import { NextResponse } from 'next/server';
import {
  ActivityLog,
  Module,
  ModuleAction,
  RoleAction,
  User,
  UserRole,
} from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { at, includes } from 'lodash';
import { where } from 'sequelize';
import { Op, Sequelize } from 'sequelize';
import moduleAction from 'db/models/moduleAction';
import payroll from 'db/models/payroll';
export async function GET(req: Request, res: Response) {
  const id = req.url.split('user_roles/')[1];
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
    const userRole = await UserRole.findByPk(id);

    const attendanceActions = await RoleAction.findAll({
      where: {
        roleId: id,
        isActive: true,
      },

      include: [
        {
          model: ModuleAction,
          required: true, // This makes the join an inner join
          include: [
            {
              model: Module,
              where: {
                moduleName: 'Attendances',
              },
              required: true, // This makes the join an inner join
            },
          ],
        },
      ],
    });

    const payrollActions = await RoleAction.findAll({
      where: {
        roleId: id,
        isActive: true,
      },
      include: [
        {
          model: ModuleAction,
          required: true, // This makes the join an inner join
          include: [
            {
              model: Module,
              where: {
                moduleName: 'Payrolls',
              },
              required: true, // This makes the join an inner join
            },
          ],
        },
      ],
    });

    return NextResponse.json(
      { sucess: true, message: userRole, attendanceActions, payrollActions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, res: Response) {
  const id = req.url.split('user_roles/')[1];
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
    await User.update(
      {
        roleId: null,
        role: '',
      },
      {
        where: {
          roleId: id,
        },
      }
    );
    const userRoles = await UserRole.destroy({
      where: {
        userRoleId: id,
      },
    });

    return NextResponse.json(
      { sucess: true, message: userRoles },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, res: Response) {
  const id = req.url.split('user_roles/')[1];
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  if (!isValidToken(userToken)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { roleName, moduleAccess, attendanceActions, payrollActions } =
    await req.json();

  // console.log('attendance Actions!');
  // console.log(attendanceActions);
  const testArr = [1];
  // console.log(testArr);

  if (roleName == 'SUPER ADMIN' || roleName == 'SUPER_ADMIN') {
    return NextResponse.json(
      { sucess: false, message: 'cannot add role SUPER ADMIN or SUPER_ADMIN' },
      { status: 400 }
    );
  } else if (roleName == 'ADMIN' || roleName == 'EMPLOYEE') {
    return NextResponse.json(
      { sucess: false, message: 'cannot add role ADMIN or EMPLOYEE' },
      { status: 400 }
    );
  }
  try {
    const userRoleToUpate: any = await UserRole.findOne({
      where: {
        userRoleId: id,
      },
    });

    if (
      userRoleToUpate.roleName == 'ADMIN' ||
      userRoleToUpate.roleName == 'EMPLOYEE' ||
      userRoleToUpate.roleName == 'SUPER_ADMIN' ||
      userRoleToUpate.roleName == 'SUPER ADMIN'
    ) {
      return NextResponse.json({
        success: false,
        message: `Cannot update role name for ${userRoleToUpate.roleName} user`,
      });
    }
    const userRole: any = await UserRole.findOne({
      where: {
        userRoleId: id,
      },
    });
    const userRoles = await UserRole.update(
      {
        roleName: roleName,
        moduleAccess: moduleAccess,
      },
      {
        where: {
          userRoleId: id,
        },
      }
    );

    // tip:isActive column for role actions is used to get all role actions for a specific role

    await ActivityLog.create({
      companyId: companyId,
      userId: seshData.userId,
      message: `Updated Role: ${userRole.roleName}`,
    });
    for (let i = 0; i < attendanceActions.length; i++) {
      // find all existing actions assigned to that role ofr attendance
      const existingAttendanceAction = await RoleAction.findOne({
        where: {
          roleId: id,
          moduleActionId: attendanceActions[i],
        },
      });
      // if it exists just set isActive to true
      if (existingAttendanceAction) {
        await RoleAction.update(
          {
            isActive: true,
          },
          {
            where: {
              roleId: id,
              moduleActionId: attendanceActions[i],
            },
          }
        );
      }
      // if it doesnt exist yet create a new one and set active to true
      else {
        await RoleAction.create({
          roleId: id,
          moduleActionId: attendanceActions[i],
          isActive: true,
        });
      }
    }

    for (let i = 0; i < payrollActions.length; i++) {
      const existingPayrollAction = await RoleAction.findOne({
        where: {
          roleId: id,
          moduleActionId: payrollActions[i],
        },
      });
      if (existingPayrollAction) {
        await RoleAction.update(
          {
            isActive: true,
          },
          {
            where: {
              roleId: id,
              moduleActionId: payrollActions[i],
            },
          }
        );
      } else {
        await RoleAction.create({
          roleId: id,
          moduleActionId: payrollActions[i],
          isActive: true,
        });
      }
    }
    // console.log('hello world');
    // disable all existing role actions that are not found in the selected actions array
    await RoleAction.update(
      {
        isActive: false,
      },
      {
        where: {
          roleId: id,
          moduleActionId: {
            [Op.notIn]: attendanceActions.concat(payrollActions),
          },
        },
      }
    );
    // console.log('gg!');
    // update role column for all users when editing rolename

    User.update(
      {
        // update rolename
        role: roleName,
      },
      {
        where: {
          roleId: id,
          companyId: companyId,
        },
      }
    );
    return NextResponse.json(
      { sucess: true, message: userRoles },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
