import { NextRequest, NextResponse } from 'next/server';
import {
  Attendance,
  Company,
  Deduction,
  Employee,
  EmployeeProfile,
  Holiday,
  Payroll,
  PayrollDeductions,
  TransferToEmployee,
} from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Op, and } from 'sequelize';
import payroll from 'db/models/payroll';
import payrollAdjustments from 'db/models/payrollAdjustments';
import { getPremiumAttendanceBreakdown } from '@utils/companyDetailsGetter';

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
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');
    let payrolls = await Payroll.findAndCountAll({
      where: {
        companyId: companyId,
        employeeId: employeeId,
        [Op.or]: {
          businessMonth: {
            [Op.startsWith]: `%${search}%`,
          },
          cycle: {
            [Op.startsWith]: `%${search}%`,
          },
        },
      },
      include: [
        {
          model: PayrollDeductions,
          include: [{ model: Deduction, include: [TransferToEmployee] }],
        },
        { model: payrollAdjustments },
      ],
      offset: offset,
      limit: limit,
      distinct: true,
      subQuery: false,
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
