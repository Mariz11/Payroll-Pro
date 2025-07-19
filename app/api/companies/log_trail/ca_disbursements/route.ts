import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { isValidToken, sessionData } from '@utils/jwt';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { Op, QueryTypes } from 'sequelize';

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

    const searchTerm = search === 'undefined' || search === '' || !search ? undefined : search;
    const processedCompanyId = companyId === 'undefined' || !companyId ? undefined : companyId;

    const transactions = await executeQuery(
      `transfer_to_employee_acct_transactions_get_cash_advance`,
      {
        companyId: processedCompanyId,
        search: searchTerm,
        offset: offset,
        limit: limit,
      },
      [],
      QueryTypes.SELECT,
      null,
      QueryReturnTypeEnum.RAW
    );

    const hasContent = transactions.length === 3;

    const transResult = hasContent ? transformPaginatedData(transactions) : undefined;
    return NextResponse.json({
      count: transResult?.count ?? [],
      rows: transResult?.rows ?? [],
    });

  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error getting transactions on api/log_trail/ca_disbursements:',
        error.message
      );
    } else {
      return NextResponse.json(error, { status: 500 });
    }
  }
}
