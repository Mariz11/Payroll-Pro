import { LOCATION_SOFT_DELETE } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { query } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

// This endpoint is used to remove a location
// It checks for a valid token, processes the request, and returns the result
export async function DELETE(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  if (req.method === 'DELETE') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const { searchParams } = new URL(req.url);
      const locationId = searchParams.get('locationId');
      if (!locationId) throw new Error('INVALID_BODY');

      const deleteLocation = await executeQuery(
        LOCATION_SOFT_DELETE,
        {
          locationId: parseInt(locationId as string),
        },
        [],
        QueryTypes.UPDATE,
        null,
        QueryReturnTypeEnum.DEFAULT
      );

      return NextResponse.json({ deleteLocation }, { status: 200 });
    } catch (error: any) {
      if (error.message === 'INVALID_TOKEN') {
        return NextResponse.json(
          { success: false, error: 'Invalid Token' },
          { status: 401 }
        );
      }

      if (error.message === 'INVALID_BODY') {
        return NextResponse.json(
          { error: 'Location ID query parameter is required' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Internal Server Error', content: error },
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
