import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { PayrollDeductions } from 'db/models';
import { Payroll, Transactions } from 'db/models/index';

import { Sequelize } from 'sequelize';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const seshData: any = await sessionData();
    const selectedCompData: any = await selectedCompanyData();
    const companyId = selectedCompData
      ? selectedCompData.companyId
      : seshData.companyId;

    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const deductionId = url.searchParams.get('deductionId');

    const payments = await PayrollDeductions.findAndCountAll({
      where: {
        isDeferred: false,
        isCollected: true,
        deductionId: deductionId,
      },
      include: [
        {
          model: Transactions,
        },
        {
          attributes: [
            'businessMonth',
            'cycle',
            [
              Sequelize.fn(
                'CONCAT',
                'payroll_deductions.payroll.businessMonth',
                ' - ',
                'payroll_deductions.payroll.cycle'
              ),
              'businessMonthCycle',
            ],
          ],
          model: Payroll,
          where: {
            isPosted: true,
            companyId: companyId,
          },
          required: true,
        },
      ],
      offset: offset,
      limit: limit,
      order: [['payrollDeductionId', 'DESC']],
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.log(error);
    else
      return NextResponse.json(error);
  }

}
