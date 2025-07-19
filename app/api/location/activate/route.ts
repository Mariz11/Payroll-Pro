import { LOCATION_UPDATE_IS_ACTIVE } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { checkDuplicateLocation } from '@utils/checkDuplicateLocation';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { EditLocationSchema } from 'lib/schemas/locationSchema';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';
import { ZodError } from 'zod';

// This endpoint is used to update the column is_active in a location table.
// It checks for a valid token, processes the request, and returns the result
export async function PUT(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'PUT') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const body = await req.json();

      if (!body || Object.keys(body).length === 0)
        throw new Error('INVALID_BODY');

      const validate_body = EditLocationSchema.safeParse(body);
      if (!validate_body.success)
        throw new ZodError(validate_body.error.issues);

      const { locationId, companyId, start_date, end_date, is_active } = body;

      //Check if has conflict
      const hasConflict = await checkDuplicateLocation({
        address: null,
        locationId: locationId,
        companyId: companyId,
        startDate: start_date,
        endDate: end_date,
      });
      if (hasConflict) throw new Error('CONFLICT');

      const result: any = await executeQuery(
        LOCATION_UPDATE_IS_ACTIVE,
        {
          p_location_id: locationId,
          p_is_active: is_active,
        },
        [],
        QueryTypes.UPDATE,
        null,
        QueryReturnTypeEnum.RAW
      );

      if (!result || result[0].rowsUpdated === 0) {
        throw new Error('N0_ROWS_UPDATED');
      }

      return NextResponse.json({ result }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating location:', error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid body',
            issues: error.issues,
          },
          { status: 400 }
        );
      }

      if (error.message === 'N0_ROWS_UPDATED') {
        return NextResponse.json(
          { success: false, error: 'No rows updated' },
          { status: 400 }
        );
      }

      if (error.message === 'CONFLICT') {
        return NextResponse.json(
          { error: 'Location has conflict' },
          { status: 409 }
        );
      }

      if (error.message === 'INVALID_TOKEN') {
        return NextResponse.json(
          { success: false, error: 'Invalid Token' },
          { status: 401 }
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
