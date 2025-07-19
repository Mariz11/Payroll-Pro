import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Payroll, Transactions } from 'db/models';
import { Op, Sequelize } from 'sequelize';

export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const payrolls = await Payroll.findAll({
      where: {
        batchUploadId: {
          [Op.not]: null,
        },
      },
      include: [{ model: Transactions, attributes: [] }],
      group: ['businessMonth', 'companyId', 'transaction.transferId'],
      attributes: [
        [Sequelize.literal(`SUM(netPay)`), 'totalNetPay'],
        'businessMonth',
        'companyId',
        'transaction.transferId',
        [
          Sequelize.fn(
            'COALESCE',
            Sequelize.fn('SUM', Sequelize.col('transaction.transactionAmount')),
            0
          ),
          'totalTransferAmount',
        ],
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: {
          payrolls,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === ' SequelizeDatabaseError') {
      console.log('error fetching line chart values', error);
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
