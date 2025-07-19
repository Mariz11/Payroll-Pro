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
  const limit = Number(url.searchParams.get('limit')) || 10;
  const departmentId = url.searchParams.get('departmentId');
  
  // Get company ID from session or selected company
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const params: any = {
      companyId,
      search,
      limit
    };

    // Only add departmentId if it's provided and not 'null' or 'undefined'
    if (departmentId && departmentId !== 'null' && departmentId !== 'undefined') {
      params.departmentId = Number(departmentId);
    }

    const employeeOptions = await executeQuery(`employees_get_dropdown_options`, params);

    return NextResponse.json({ options: employeeOptions });
  } catch (error: any) {
    console.error('Error fetching employee options:', error);
    return NextResponse.json(
      { message: 'Error fetching employee options', error: error.message },
      { status: 500 }
    );
  }
}
