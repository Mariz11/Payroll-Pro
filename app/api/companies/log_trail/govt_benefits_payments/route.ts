import { isValidToken, sessionData } from '@utils/jwt';
import { Transactions } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';

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

    const transactions = await Transactions.findAndCountAll({
      where: {
        companyId: companyId,
        status: 1,
        [Op.or]: {
          transactionCode: {
            [Op.startsWith]: `%${search}%`,
          },
        },
      },
      offset: offset,
      limit: limit,
      distinct: true,
      order: [['updatedAt', 'DESC']],
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error getting transactions on api/log_trail/govt_benefits_payments:',
        error.message
      );
    } else {
      return NextResponse.json(error, { status: 500 });
    }
  }
}
