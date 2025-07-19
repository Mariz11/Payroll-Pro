import { isValidToken } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'db/connection';
import { EMPLOYEES_GET_INFO } from '@constant/storedProcedures';

export async function GET(req: Request, res: Response, next: NextRequest): Promise<Response> {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const employeeId = req.url.split('employees/')[1];
    const [employee] = await executeQuery(EMPLOYEES_GET_INFO, { employeeId });

    return NextResponse.json(employee);
  } catch (error) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
