import { LOCATION_GET_ASSIGNED_EMPLOYEES_PAGINATED } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { isValidToken } from '@utils/jwt';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

// This endpoint retrieves employees assigned to a specific location with pagination support.
// It checks for a valid token, processes the request, and returns the paginated data.
export async function GET(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'GET') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const { searchParams } = new URL(req.url);
      const locationId = searchParams.get('locationId');
      const limit = searchParams.get('limit') || 10;
      const offset = searchParams.get('offset') || 0;

      const result = await executeQuery(
        LOCATION_GET_ASSIGNED_EMPLOYEES_PAGINATED,
        {
          locationId: parseInt(locationId as string),
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
        [],
        QueryTypes.SELECT,
        null,
        QueryReturnTypeEnum.RAW
      );

      const hasContent = result.length === 3;
      console.log('result', result);
      const assignedEmployees = hasContent
        ? transformPaginatedData(result)
        : undefined;

      return NextResponse.json(
        {
          count: assignedEmployees?.count ?? 0,
          rows: assignedEmployees?.rows ?? [],
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error fetching employees:', error);

      if (error.message === 'INVALID_TOKEN') {
        return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
      }

      return NextResponse.json(
        { error: 'Internal Server Error', content: error },
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
