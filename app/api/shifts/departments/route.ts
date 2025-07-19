import { NextRequest, NextResponse } from 'next/server';
import { Department, Employee, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {

    const departments = await executeQuery(`departments_get_include_join`, {
      companyId,
      employeesWithoutShift: true
    });

    return NextResponse.json(
      { sucess: true, message: departments },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error fetching departments:', error);
    }
    else {
      return NextResponse.json({ message: error, success: false }, { status: 500 });
    }

  }
}
