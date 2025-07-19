import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'db/connection';
// Get data by ID
export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const id = req.url.split('companies/')[1];
  const url = new URL(req.url);
  const includeEmployees = url.searchParams.get('includeEmployees');

  try {

    const [company]: any = await executeQuery("companies_get_notifications", { companyId })

    let allEmployees: any = [];
    if (includeEmployees == 'true') {
      allEmployees = await executeQuery("employees_get_minimal_data", { companyId });
    }

    const nightDiffDepartments: any = await executeQuery("departments_get_by_apply", {
      companyId: company.companyId,
      applyNightDiff: 1,
    })

    return NextResponse.json({
      companyId: company.companyId,
      workingDays: company.workingDays,
      notifications: company.notifications,
      allowanceForLeaves: company.allowanceForLeaves,
      leavesOnHolidays: company.leavesOnHolidays,
      allowanceOnHolidays: company.allowanceOnHolidays,
      nightDifferential: company.nightDifferential,
      nightDifferentialRate: company.nightDifferentialRate,
      nightDifferentialStartTime: company.nightDifferentialStartHour,
      nightDifferentialEndTime: company.nightDifferentialEndHour,
      regularHoliday: company.regularHoliday,
      regularHolidayRate: company.regularHolidayRate,
      regularHolidayRestDayRate: company.regularHolidayRestDayRate,
      specialHoliday: company.specialHoliday,
      specialHolidayRate: company.specialHolidayRate,
      specialHolidayRestDayRate: company.specialHolidayRestDayRate,
      restDay: company.restDay,
      restDayRate: company.restDayRate,
      nightDiffDepartments: nightDiffDepartments,
      employees: includeEmployees == 'true' ? allEmployees : [],
      isHolidayDayoffPaid: company.isHolidayDayoffPaid,
      useFixedGovtContributionsRate: company.useFixedGovtContributionsRate,
      enableSearchEmployee: company.enableSearchEmployee,
      halfdayAllowancePay: company.halfdayAllowancePay,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting company data:', error.message);
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
    } else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

// Update data
export async function PUT(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('companies/')[1];
  return NextResponse.json({ companyId: id });
}

// Delete data
export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('companyies/')[1];
  return NextResponse.json({ companyId: id });
}
