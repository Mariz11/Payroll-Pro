import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { UserRole } from 'db/models';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Extract companyId and roleName from query parameters
  const url = new URL(req.url);
  const companyId = Number(url.searchParams.get('companyId'));
  let roleName = url.searchParams.get('roleName');

  if (!companyId || !roleName) {
    return NextResponse.json({ message: 'Missing companyId or roleName' }, { status: 400 });
  }

  // Format roleName to lowercase and trimmed
  roleName = roleName.trim().toLowerCase();

  try {
    const duplicateEntry = await UserRole.findOne({
      where: {
        companyId: companyId,
        roleName: roleName,
      },
    });
    return NextResponse.json({ duplicate: duplicateEntry ? 1 : 0 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
