import {
  LOCATION_GET_CURRENT_ASSIGNMENT,
  LOCATION_GET_VALIDATION,
} from '@constant/storedProcedures';
import { tokenChecker } from '@utils/apiEndpointFunctions';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

export async function GET(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'GET') {
    try {
      if (!(await tokenChecker(userToken)))
        throw new Error('INVALID_TOKEN');

      const { searchParams } = new URL(req.url);
      const ckycId = searchParams.get('ckycId');
      if (!ckycId) {
        throw new Error('CKYC_ID_REQUIRED');
      }
      const location = await executeQuery(
        LOCATION_GET_CURRENT_ASSIGNMENT,
        { ckycId },
        [],
        QueryTypes.SELECT
      );

      if (!location || location.length === 0) {
        throw new Error('LOCATION_NOT_FOUND');
      }

      return NextResponse.json({ location: location?.[0] }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching location:', error);

      if (error.message === 'INVALID_TOKEN') {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }
      if (error.message === 'CKYC_ID_REQUIRED') {
        return NextResponse.json(
          { error: 'CKYC ID is required' },
          { status: 400 }
        );
      }
      if (error.message === 'LOCATION_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Location not found for the provided CKYC ID' },
          { status: 404 }
        );
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
