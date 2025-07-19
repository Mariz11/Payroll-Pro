import { LOCATION_GET_DATA } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { tokenChecker } from '@utils/externalApiFunctions';
import { isValidToken } from '@utils/jwt';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

export async function GET(req: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  if (req.method === 'GET') {
    try {
      if (!(await isValidToken(userToken))) throw new Error('INVALID_TOKEN');

      const { searchParams } = new URL(req.url);
      const companyId = searchParams.get('companyId');
      const role = searchParams.get('role');
      const limit = searchParams.get('limit') || 10;
      const offset = searchParams.get('offset') || 0;
      const searchPhrase = searchParams.get('searchPhrase') || '*';

      const result: any = await executeQuery(
        LOCATION_GET_DATA,
        {
          companyId,
          role,
          searchPhrase,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
        [],
        QueryTypes.SELECT,
        null,
        QueryReturnTypeEnum.RAW
      );

      const hasContent = result.length === 3;
      const details = hasContent ? transformPaginatedData(result) : undefined;

      return NextResponse.json({
        count: details?.count ?? 0,
        rows: details?.rows ?? [],
      });
    } catch (error: any) {
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
