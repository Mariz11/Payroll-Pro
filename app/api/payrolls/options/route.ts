import { NextRequest, NextResponse } from 'next/server';
import { selectedCompanyData, sessionData } from '@utils/jwt';
import moment from '@constant/momentTZ';
import { executeQuery } from 'db/connection';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  try {
    // const { searchParams } = new URL(req.url);
    // const status = searchParams.get('status');
    // let rezult = 0;
    // const departmentName = searchParams.get('departmentName');
    // const businessMonth = searchParams.get('businessMonth');

    const [companyDetails]: any = await executeQuery('companies_get_one', {
      companyId
    })

    const { status, departmentId, businessMonth, search } = await req.json();

    const [departmentNamesData]: any = await executeQuery('payroll_get_department_options', {
      companyId,
      status: status == 'PENDING' ? 0 : 1,
      excludedDisbursementStatus: 2,
      businessMonth: departmentId == '' && businessMonth != '' ? businessMonth : undefined,
      createdAt: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      enableSearchEmployee: companyDetails?.enableSearchEmployee,
      search
    })

    const departmentNamesRes = departmentNamesData.result;

    const [businessMonthsData]: any = await executeQuery('payroll_get_business_months_options', {
      companyId,
      departmentId: departmentId != '' ? departmentId : undefined,
      status: status == 'PENDING' ? 0 : 1,
      excludedDisbursementStatus: 2,
      businessMonth: departmentId == '' && businessMonth != '' ? businessMonth : undefined,
      createdAt: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      enableSearchEmployee: companyDetails?.dataValues?.enableSearchEmployee,
      search
    })

    const businessMonthsRes = businessMonthsData.result;

    return NextResponse.json({
      departmentOpts: departmentNamesRes,
      businessmonthOpts: businessMonthsRes,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    });
  }
}
