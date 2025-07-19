import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { executeQuery } from 'db/connection';
import { LocationCheckBody } from 'lib/schemas/locationSchema';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';
import { ZodError } from 'zod';
import {
  LOCATION_GET_AVAILABLE_EMPLOYEES,
  LOCATION_SOFT_ADD_EMPLOYEE,
  LOCATION_SOFT_DELETE_EMPLOYEE,
} from '@constant/storedProcedures';
import { isValidToken } from '@utils/jwt';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';

// This endpoint is used to fetch available employees for a specific location
// It checks for a valid token, processes the request, and returns the paginated data
export async function GET(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'GET') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const { searchParams } = new URL(req.url);
      const companyId = searchParams.get('companyId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const limit = searchParams.get('limit') || 10;
      const offset = searchParams.get('offset') || 0;

      const start_date = startDate ? `${startDate} 00:00:00.000` : null;
      const end_date = endDate ? `${endDate} 23:59:59.999` : null;

      const result: any = await executeQuery(
        LOCATION_GET_AVAILABLE_EMPLOYEES,
        {
          companyId: parseInt(companyId as string),
          startDate: start_date,
          endDate: end_date,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
        [],
        QueryTypes.SELECT,
        null,
        QueryReturnTypeEnum.RAW
      );

      const hasContent = result.length === 3;
      const availableEmployees = hasContent
        ? transformPaginatedData(result)
        : undefined;

      return NextResponse.json(
        {
          count: availableEmployees?.count ?? 0,
          rows: availableEmployees?.rows ?? [],
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error fetching employees:', error);

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

// This endpoint is used to delete an employee from a specific location
// It checks for a valid token, processes the request, and returns the paginated data
export async function DELETE(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'DELETE') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const body = await req.json();
      const { locationId, employeeIds } = body;

      const filteredEmployees = employeeIds
        .filter((item: number) => typeof item === 'number' && !isNaN(item))
        .join(',');

      const result: any = await executeQuery(
        LOCATION_SOFT_DELETE_EMPLOYEE,
        {
          locationId: parseInt(locationId as string),
          employeeId: filteredEmployees,
        },
        [],
        QueryTypes.UPDATE,
        null,
        QueryReturnTypeEnum.DEFAULT
      );

      return NextResponse.json(
        {
          result,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error fetching employees:', error);

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

// This endpoint is used to add an array of employees from a specific location
// It checks for a valid token, processes the request, and returns the paginated data
export async function POST(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'POST') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const body = await req.json();
      const { locationId, employeeIds } = body;

      const validate = LocationCheckBody.safeParse(body);
      if (!validate.success) throw new ZodError(validate.error.issues);

      const result: any = await executeQuery(
        LOCATION_SOFT_ADD_EMPLOYEE,
        {
          locationId: parseInt(locationId as string),
          employeeId: JSON.stringify(employeeIds),
        },
        [],
        QueryTypes.INSERT,
        null,
        QueryReturnTypeEnum.DEFAULT
      );

      return NextResponse.json(
        {
          result,
        },
        { status: 200 }
      );
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
