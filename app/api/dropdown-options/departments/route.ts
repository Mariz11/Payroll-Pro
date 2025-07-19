import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  
  // Get company ID from session or selected company
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const departmentOptions = await executeQuery(`departments_get_dropdown_options`, {
      companyId,
      search
    });

    return NextResponse.json({ options: departmentOptions });
  } catch (error: any) {
    console.error('Error fetching department options:', error);
    return NextResponse.json(
      { message: 'Error fetching department options', error: error.message },
      { status: 500 }
    );
  }
}
