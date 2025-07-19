import { NextResponse } from 'next/server';
import { AllowanceBreakdown } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
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
    const allowanceBreakdowns = await AllowanceBreakdown.findByPk(id);

    return NextResponse.json(
      { sucess: true, message: allowanceBreakdowns },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching allowance breakdowns:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, res: Response) {
  const id = req.url.split('allowanceBreakdowns/')[1];
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
    const allowanceBreakdowns = await AllowanceBreakdown.destroy({
      where: {
        userRoleId: id,
      },
    });

    return NextResponse.json(
      { sucess: true, message: allowanceBreakdowns },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching allowance breakdowns:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, res: Response) {
  const id = req.url.split('allowanceBreakdowns/')[1];
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const { roleName, moduleAccess } = await req.json();

  try {
    const allowanceBreakdowns = await AllowanceBreakdown.update(
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

    return NextResponse.json(
      { sucess: true, message: allowanceBreakdowns },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating allowance breakdowns:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
