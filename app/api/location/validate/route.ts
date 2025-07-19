import { LOCATION_GET_VALIDATION } from '@constant/storedProcedures';
import { tokenChecker } from '@utils/externalApiFunctions';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

export async function GET(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'GET') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const { searchParams } = new URL(req.url);
      const ckycId = searchParams.get('ckycId');
      const longitude = searchParams.get('longitude');
      const latitude = searchParams.get('latitude');

      const validateLocation = await executeQuery(
        LOCATION_GET_VALIDATION,
        {
          ckycId: ckycId,
          longitude: parseFloat(longitude as string),
          latitude: parseFloat(latitude as string),
        },
        [],
        QueryTypes.SELECT
      );
      const isInRange =
        validateLocation.length > 0
          ? validateLocation.map((item: any) => item.isInRange)[0]
          : null;
      const location = isInRange === 1 ? true : false;

      return NextResponse.json({ location }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching employees:', error);

      if (error.message === 'INVALID_TOKEN') {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: `Method ${req.method} Not Allowed` },
      { status: 405 }
    );
  }
}
