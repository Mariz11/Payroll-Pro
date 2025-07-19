import { NextRequest, NextResponse } from 'next/server';
import { LocationSchema } from 'lib/schemas/locationSchema';
import { ZodError } from 'zod';
import { executeQuery } from 'db/connection';
import { QueryTypes } from 'sequelize';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { checkDuplicateLocation } from '@utils/checkDuplicateLocation';
import { LOCATION_GET_DETAILS } from '@constant/storedProcedures';
import { isValidToken } from '@utils/jwt';

// This endpoint is used to add a location and its details
// It checks for a valid token, processes the request, and returns the result
export async function POST(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'POST') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');
      const body = await req.json();
      if (!body || Object.keys(body).length === 0)
        throw new Error('INVALID_BODY');

      const validate_body = LocationSchema.safeParse(body);
      if (!validate_body.success)
        throw new ZodError(validate_body.error.issues);

      const {
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
        signature,
        employee_ids,
      } = body;

      //Check if location name already exists
      const hasConflictName = executeQuery(
        'location_get_name_if_exist',
        {
          name: name.trim(),
          company_id: company_id,
        },
        [],
        QueryTypes.SELECT,
        null,
        QueryReturnTypeEnum.RAW
      );
      const hasResult: any = await hasConflictName;
      const isExist =
        hasResult && hasResult.length > 0 ? hasResult[0]['0'].is_exist : false;
      if (isExist === 1) {
        throw new Error('LOCATION_NAME_ALREADY_EXISTS');
      }

      // Check if has conflict
      const hasConflict = await checkDuplicateLocation({
        locationId: null,
        address: address,
        companyId: company_id,
        startDate: start_date,
        endDate: end_date,
      });
      if (hasConflict) throw new Error('CONFLICT');

      const result: any = await executeQuery(
        LOCATION_GET_DETAILS,
        {
          name,
          address,
          company_id,
          validity,
          longitude,
          latitude,
          radius,
          start_date,
          end_date,
          time_from,
          time_to,
          signature,
          employee_ids: JSON.stringify(employee_ids),
        },
        [],
        QueryTypes.INSERT,
        null,
        QueryReturnTypeEnum.RAW
      );

      return NextResponse.json({ result }, { status: 200 });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: error.errors.map((e: any) => e.message).join(', '),
          },
          { status: 400 }
        );
      }
      if (error instanceof Error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          return NextResponse.json(
            {
              message: 'Duplicate entry detected.',
            },
            { status: 409 }
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
            { error: 'Location settings has conflict' },
            { status: 409 }
          );
        }
        if (error.message === 'INVALID_TOKEN') {
          return NextResponse.json(
            { success: false, error: 'Invalid Token' },
            { status: 401 }
          );
        }

        if (error.message === 'INVALID_BODY') {
          return NextResponse.json(
            { success: false, error: 'Invalid Body' },
            { status: 400 }
          );
        }
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
