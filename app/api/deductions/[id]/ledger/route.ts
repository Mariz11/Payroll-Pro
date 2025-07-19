import { NextRequest, NextResponse } from 'next/server';

import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Deduction, Ledger } from 'db/models/index';


export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);

  const deductionId = req.url.split('deductions/')[1].split('/ledger')[0];
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  else {
    try {
      const seshData: any = await sessionData();
      const selectedCompData: any = await selectedCompanyData();
      const companyId = selectedCompData
        ? selectedCompData.companyId
        : seshData.companyId;

      const deduction: any = await Deduction.findOne({
        where: {
          deductionId: Number(deductionId),
        },
        include: [
          { model: Ledger, attributes: ['ledgerId', 'amount', 'desc'] },
        ],
      });
      console.log('deduction!', deduction.ledgers);
      const ledgerList = await Ledger.findAll({
        where: {
          deductionId: Number(deductionId),
        },
        attributes: ['ledgerId', 'amount', 'desc'],
      });

      return NextResponse.json(ledgerList);
    } catch (error: any) {
      if (error.name && error.name === 'SequelizeDatabaseError')
        console.log(error);
      else return NextResponse.json(error, { status: 500 });
    }
  }
}
