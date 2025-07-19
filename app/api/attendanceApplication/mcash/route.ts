import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { AttendanceViaMCashSchema } from 'lib/schemas/attendanceViaMCash';
import {
  ATTENDANCE_APPLICATION_VIA_MCASH,
  LOCATION_GET_VALIDATION,
} from '@constant/storedProcedures';
import { QueryTypes } from 'sequelize';
import { ZodError } from 'zod';
import { tokenChecker } from '@utils/apiEndpointFunctions';

export async function PUT(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'PUT') {
    try {
       if (!(await tokenChecker(userToken))) throw new Error('INVALID_TOKEN');

      const body = await req.json();

      if (!body || Object.keys(body).length === 0)
        throw new Error('INVALID_BODY');

      const validate_body = AttendanceViaMCashSchema.safeParse(body);
      if (!validate_body.success)
        throw new ZodError(validate_body.error.issues);

      const { locationId, ckycId, latitude, longitude, dateTime, status } =
        body;

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

      //Uncomment this if you want to check if the employee's location exists          
      //Check if the employee's location exists
      // if (isInRange === -1)
      //   throw new Error('ASSIGNED_LOCATION_DOES_EXIST');

      const location = isInRange === 1 || isInRange === -1 ? true : false;

      if (!location) throw new Error('OUT_OF_RANGE');

      const result: any = await executeQuery(
        ATTENDANCE_APPLICATION_VIA_MCASH,
        {
          p_locationId: locationId ?? null,
          p_ckycId: ckycId ?? null,
          p_latitude: latitude ?? null,
          p_longitude: longitude ?? null,
          p_dateTime: dateTime ?? null,
          p_status: status ?? null,
        },
        [],
        QueryTypes.UPDATE,
        null,
        QueryReturnTypeEnum.RAW
      );
      const { update_result, update_message } = await result[0];

      if (update_result > 1) {
        throw new Error(update_message);
      }

      return NextResponse.json(
        {
          message: update_message,
          result: result[0],
          success: new Boolean(update_result).valueOf(),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error recording attendance:', error);

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

      if (error.message === 'ASSIGNED_LOCATION_DOES_EXIST') {
        return NextResponse.json(
          { success: false, error: 'No assigned location for this employee' },
          { status: 404 }
        );
      }

      if (error.message === 'EMPLOYEE_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        );
      }

      if (error.message === 'SCHEDULE_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'Schedule not found' },
          { status: 404 }
        );
      }

      if (error.message === 'ATTENDANCE_ALREADY_EXIST') {
        return NextResponse.json(
          { success: false, error: 'Attendace already recorded' },
          { status: 400 }
        );
      }

      if (error.message === 'OUT_OF_RANGE') {
        return NextResponse.json(
          { error: "Employee's location is out of range" },
          { status: 416 }
        );
      }

      if (error.message === 'INVALID_TOKEN') {
        return NextResponse.json(
          { success: false, error: 'Invalid Token' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          content: { error },
        },
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
