import { NextRequest, NextResponse } from 'next/server';
import { Deduction, Payroll, PayrollDeductions } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op } from 'sequelize';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const employeeId = seshData.employeeId;

  try {
    const payrolls = await Payroll.findAll({
      where: {
        companyId: companyId,
        employeeId: employeeId,
        isPosted: true,
      },
      include: [{ model: PayrollDeductions, include: [Deduction] }],
      order: [['createdAt', 'DESC']],
      limit: 1,
    });

    return NextResponse.json(
      { sucess: true, message: payrolls },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching shifts:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
