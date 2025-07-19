import { MCASH_MLWALLET } from '@constant/variables';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { isValidToken, sessionData } from '@utils/jwt';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { executeQuery } from 'db/connection';
import { Batch_uploads, Payroll } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op, QueryTypes, Sequelize } from 'sequelize';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const seshData: any = await sessionData();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');
    const companyId = url.searchParams.get('companyId');

    const processedCompanyId = companyId === 'undefined' || !companyId ? undefined : companyId;

    const batchUploads = await executeQuery(
      `payrolls_get_salary_disbursement`,
      {
        companyId: processedCompanyId,
        search: search,
        offset: offset,
        limit: limit,
      },
      [],
      QueryTypes.SELECT,
      null,
      QueryReturnTypeEnum.RAW
    );
    const hasContent = batchUploads.length === 3;
    const batchResult = hasContent ? transformPaginatedData(batchUploads) : undefined;
    return NextResponse.json({
      count: batchResult?.count ?? [],
      rows: batchResult?.rows ?? [],
    });

  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error getting batch uploads on api/log_trail/salary_disbursements:',
        error.message
      );
    } else {
      return NextResponse.json(error, { status: 500 });
    }
  }
}
