import { isValidToken, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    // const offset = Number(url.searchParams.get('offset'));
    // const limit = Number(url.searchParams.get('limit'));

    const companies: any = await executeQuery(`companies_get_sidebar`, {
      excludeCompanyId: seshData.companyId,
    });

    return NextResponse.json(companies);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error Occured', content: error },
      { status: 500 }
    );
  }
}
