import { NextResponse } from 'next/server';
import { Module, ModuleAction, User, UserRole } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { deleteCookie } from 'app/actions';
import roleAction from 'db/models/roleAction';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const url = new URL(req.url);
    const moduleName = url.searchParams.get('module');

    const [userData]: any = await executeQuery('users_get_roles', {
      userId: seshData.userId
    })

    const user: any = userData?.result

    let userActions: any = [];
    if (module) {

      const [modulePage]: any = await executeQuery('modules_get_by_names', {
        moduleNames: [moduleName]
      })

      if (modulePage) {
        console.log('modulePage:' + modulePage.moduleId);
        const [actionsResult]: any = await executeQuery('role_actions_get', {
          moduleId: modulePage.moduleId,
          roleId: user.roleId,
        })

        const actions = actionsResult.result;

        // console.log('actions!');
        // console.log(actions);
        userActions = actions;
      }
    }

    if (user && user.user_role) {
      return NextResponse.json(
        { sucess: true, message: user.user_role, userActions },
        { status: 200 }
      );
    } else {
      deleteCookie('selected-company');
      deleteCookie('user-token');
      deleteCookie('manual-login-token');
      return NextResponse.json(
        { sucess: true, message: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
