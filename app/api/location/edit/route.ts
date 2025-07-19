import { LOCATION_UPDATE_DETAILS } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { checkDuplicateLocation } from '@utils/checkDuplicateLocation';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { EditLocationSchema } from 'lib/schemas/locationSchema';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';
import { ZodError } from 'zod';

// This endpoint is used to update a location and its details
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

      const {
        location_id,
        company_id,
        name,
        address,
        validity,
        longitude,
        latitude,
        start_date,
        end_date,
        time_from,
        time_to,
        radius,
      } = body;

      //Check if location name already exists
      const hasConflictName = executeQuery(
        'location_get_name_if_exist',
        {
          name: name.trim(),
          company_id: company_id,
          location_id: location_id,
        },
        [],
        QueryTypes.SELECT,
        null,
        QueryReturnTypeEnum.RAW
      );
      const hasResult: any = await hasConflictName;
      const isExist = hasResult[0]?.is_exist || 0;
      if (isExist === 1) {
        throw new Error('LOCATION_NAME_ALREADY_EXISTS');
      }

      //Check if has conflict
      const hasConflict = await checkDuplicateLocation({
        address: address,
        locationId: location_id,
        companyId: company_id,
        startDate: start_date,
        endDate: end_date,
      });
      if (hasConflict) throw new Error('CONFLICT');

      const result: any = await executeQuery(
        LOCATION_UPDATE_DETAILS,
        {
          p_location_id: location_id,
          p_name: name ?? null,
          p_address: address ?? null,
          p_validity: validity ?? null,
          p_longitude: longitude ?? null,
          p_latitude: latitude ?? null,
          p_start_date: start_date,
          p_end_date: end_date,
          p_time_from: time_from ?? null,
          p_time_to: time_to ?? null,
          p_radius: radius ?? null,
        },
        [],
        QueryTypes.UPDATE,
        null,
        QueryReturnTypeEnum.RAW
      );
      if (!result || result[0].rowsUpdated === 0) {
        throw new Error('N0_ROWS_UPDATED');
      }

      return NextResponse.json(
        { affectedRows: result?.affectedRows },
        { status: 200 }
      );
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

      if (error.message === 'LOCATION_NAME_ALREADY_EXISTS') {
        return NextResponse.json(
          { error: 'Location name already exists' },
          { status: 409 }
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
