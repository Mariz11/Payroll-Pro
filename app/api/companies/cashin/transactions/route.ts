import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { createActivityLog } from '@utils/activityLogs';
import { isValidToken, sessionData } from '@utils/jwt';
import { getRequestLogger } from '@utils/logger';
import { getBranchCashInTransaction } from '@utils/partnerAPIs';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import connection, { executeQuery } from 'db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';

export async function GET(req: NextRequest, res: Response) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('Authorization');
  const seshData: any = await sessionData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const transaction = await connection.transaction();
  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');

    const result = await executeQuery(
      `cash_in_transactions_get_all`,
      {
        companyId: seshData.companyId,
        search: search,
        offset: offset,
        limit: limit,
      },
      [],
      QueryTypes.SELECT,
      null,
      QueryReturnTypeEnum.RAW
    );
    const data = transformPaginatedData(result);

    if (data.rows.length > 0) {
      for (let i = 0; i < data.rows.length; i++) {
        const row = data.rows[i];
        if (!['CANCELLED', 'SUCCESS', 'PAID', 'EXPIRED'].includes(row.status)) {
          const cashInTransaction = await getBranchCashInTransaction({
            transactionCode: row.transactionCode,
            transactionType: row.transactionType,
          });
          if (cashInTransaction && cashInTransaction.success) {
            const { responseData } = cashInTransaction;
            const response = responseData.data ?? responseData.responseData;
            if (response) {
              const { status, transactionCode } = response;
              if (row.status != status) {
                await executeQuery(
                  `cash_in_transactions_update_status`,
                  {
                    cashInTransId: row.cashInTransId,
                    status: status,
                  },
                  [],
                  QueryTypes.UPDATE,
                  transaction as any
                );

                row.status = status;
                await createActivityLog(
                  seshData.companyId,
                  seshData.userId,
                  `[SYSTEM] Cash In transaction [RefNo: ${transactionCode}] ${status == 'PROCESSING'
                    ? 'has been PROCESSED'
                    : status == 'SUCCESS'
                      ? 'was SUCCESSFUL'
                      : 'has been ' + status
                  }`,
                  transaction
                );
              }
            }
          }
        }
        data.rows[i] = row;
      }

    }

    await transaction.commit();
    return NextResponse.json(data);
  } catch (error: any) {
    await transaction.rollback();
    requestLogger.error({
      label: `${req.url} ${req.method}`,
      message: JSON.stringify(error.message),
    });
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting cashin transactions:', error.message);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
