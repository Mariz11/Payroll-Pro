import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const limit = Number(url.searchParams.get('limit')) || 10;

  // Get session data to exclude current company if needed
  const seshData: any = await sessionData();
  const excludeCompanyId = url.searchParams.get('excludeCurrentCompany') === 'true'
    ? seshData.companyId
    : null;

  try {
    const params: any = {
      search,
      limit
    };

    // Only add excludeCompanyId if it's provided
    if (excludeCompanyId) {
      params.excludeCompanyId = excludeCompanyId;
    }

    const companyOptions = await executeQuery(`companies_get_dropdown_options`, params);

    return NextResponse.json({ options: companyOptions });
  } catch (error: any) {
    console.error('Error fetching company options:', error);
    return NextResponse.json(
      { message: 'Error fetching company options', error: error.message },
      { status: 500 }
    );
  }
}
