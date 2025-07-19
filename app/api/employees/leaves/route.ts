import { isValidToken } from '@utils/jwt';
import { EmployeeLeave } from 'db/models/index';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const params = req.url.split('?')[1];

  const employeeId = params.split('&')[0]?.split('=')[1];
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const employeLeaves = await EmployeeLeave.findAll({
    where: {
      employeeId: Number(employeeId),
    },
  });

  return NextResponse.json({ data: employeLeaves });

}
