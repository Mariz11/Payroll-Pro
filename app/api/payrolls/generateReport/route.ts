import { getPremiumAttendanceBreakdown } from '@utils/companyDetailsGetter';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { error } from 'console';
import { executeQuery } from 'db/connection';
import {
  AllowanceBreakdown,
  Attendance,
  Company,
  Deduction,
  Department,
  Employee,
  EmployeeProfile,
  Holiday,
  Ledger,
  PayrollDeductions,
  TransferToEmployee,
} from 'db/models';
import company from 'db/models/company';
import payroll from 'db/models/payroll';
import payrollAdjustments from 'db/models/payrollAdjustments';
import { NextRequest, NextResponse } from 'next/server';
import { Model, Op } from 'sequelize';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const selectedCompData: any = await selectedCompanyData();
  const seshData: any = await sessionData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const url = new URL(req.url);
  // const departmentId = url.searchParams.get('departmentId');
  // const businessMonthCycle: any = url.searchParams.get('businessMonthCycle');
  const { businessMonthCycle, departmentId } = await req.json();
  const businessMonth = businessMonthCycle.split(' - ')[0];
  const cycle = businessMonthCycle.split(' - ')[1];

  try {

    const [companyRate]: any = await executeQuery('companies_get_rates', {
      companyId: companyId ?? undefined,
    })

    const [department]: any = await executeQuery('departments_get', {
      companyId: companyId ?? undefined,
      departmentId: departmentId ?? undefined,
    })

    const payrollReportData: any = await executeQuery('payrolls_get_employee_details', {
      businessMonth,
      cycle,
      departmentId: departmentId ?? undefined,
      companyId: companyId ?? undefined,
      isPosted: 1,
    });

    const payrollReport = payrollReportData?.map((payroll: any) => payroll?.payroll_details);

    // for (let i = 0; i < payrollReport.length; i++) {
    //   const item = payrollReport[i];
    //   const employeeName = item.employee?.employee_profile?.employeeFullName;
    //   await getPremiumAttendanceBreakdown({
    //     employeeDetails: {
    //       employeeId: item?.employee?.employeeId,
    //       departmentId: item?.employee?.departmentId,
    //       daysOff: item.daysOff,
    //     },
    //     attendanceDetails: {
    //       businessMonth: item?.businessMonth,
    //       cycle: item?.cycle,
    //     },
    //   }).then((res: any) => {
    //     const response = res;

    //     const {
    //       workedOnRestDays,
    //       workedOnRegularHoliday,
    //       workedOnRegularHolidayWhileRestDay,
    //       halfDayPresentOnRegularHoliday,
    //       workedOnSpecialHoliday,
    //       workedOnSpecialHolidayWhileRestDay,
    //       overtimeOnRegularDays,
    //       overtimeOnHolidays,
    //       overtimeOnRestDays,
    //     } = response.data;
    //     payrollReport[i].workedOnRestDays = workedOnRestDays;
    //     payrollReport[i].workedOnRegularHoliday = workedOnRegularHoliday;
    //     payrollReport[i].workedOnRegularHolidayWhileRestDay =
    //       workedOnRegularHolidayWhileRestDay;
    //     payrollReport[i].halfDayPresentOnRegularHoliday =
    //       halfDayPresentOnRegularHoliday;
    //     payrollReport[i].workedOnSpecialHoliday = workedOnSpecialHoliday;
    //     payrollReport[i].workedOnSpecialHolidayWhileRestDay =
    //       workedOnSpecialHolidayWhileRestDay;
    //     payrollReport[i].overtimeOnRegularDays = overtimeOnRegularDays;
    //     payrollReport[i].overtimeOnHolidays = overtimeOnHolidays;
    //     payrollReport[i].overtimeOnRestDays = overtimeOnRestDays;
    //     console.log('payrollz');
    //     console.log(payrollReport[i]);
    //   });
    // }
    await Promise.all(
      payrollReport.map(async (item: any, i: number) => {
        const employeeName = item.employee?.employee_profile?.employeeFullName;
        const res: any = await getPremiumAttendanceBreakdown({
          employeeDetails: {
            employeeId: item?.employee?.employeeId,
            departmentId: item?.employee?.departmentId,
            daysOff: item.daysOff,
          },
          attendanceDetails: {
            businessMonth: item?.businessMonth,
            cycle: item?.cycle,
          },
        });

        const defaultValues = {
          workedOnRestDays: undefined,
          workedOnRegularHoliday: undefined,
          workedOnRegularHolidayWhileRestDay: undefined,
          halfDayPresentOnRegularHoliday: undefined,
          workedOnSpecialHoliday: undefined,
          workedOnSpecialHolidayWhileRestDay: undefined,
          halfDayPresentOnSpecialHoliday: undefined,
          overtimeOnRegularDays: undefined,
          overtimeOnHolidays: undefined,
          overtimeOnRestDays: undefined,
          halfDayAbsent: undefined,
        };

        const {
          workedOnRestDays,
          workedOnRegularHoliday,
          workedOnRegularHolidayWhileRestDay,
          halfDayPresentOnRegularHoliday,
          workedOnSpecialHoliday,
          workedOnSpecialHolidayWhileRestDay,
          halfDayPresentOnSpecialHoliday,
          overtimeOnRegularDays,
          overtimeOnHolidays,
          overtimeOnRestDays,
          halfDayAbsent,
        } = res?.data || defaultValues;

        // Assign values to payrollReport[i]
        payrollReport[i].workedOnRestDays = workedOnRestDays;
        payrollReport[i].workedOnRegularHoliday =
          workedOnRegularHoliday;
        payrollReport[i].workedOnRegularHolidayWhileRestDay =
          workedOnRegularHolidayWhileRestDay;
        payrollReport[i].halfDayPresentOnRegularHoliday =
          halfDayPresentOnRegularHoliday;
        payrollReport[i].workedOnSpecialHoliday =
          workedOnSpecialHoliday;
        payrollReport[i].workedOnSpecialHolidayWhileRestDay =
          workedOnSpecialHolidayWhileRestDay;
        payrollReport[i].halfDayPresentOnSpecialHoliday =
          halfDayPresentOnSpecialHoliday;
        payrollReport[i].overtimeOnRegularDays =
          overtimeOnRegularDays;
        payrollReport[i].overtimeOnHolidays = overtimeOnHolidays;
        payrollReport[i].overtimeOnRestDays = overtimeOnRestDays;
        payrollReport[i].halfDayAbsent = halfDayAbsent;
        console.log('tol!', payrollReport[i].payroll_adjustements);
        if (
          payrollReport[i].payroll_adjustments &&
          payrollReport[i].payroll_adjustments.length > 0
        ) {
          const totalAddAdjustment = payrollReport[
            i
          ].payroll_adjustments.reduce(
            (a: any, b: any) => a + b.addAdjustment,
            0
          );
          const totalDeductAdjustment = payrollReport[
            i
          ].payroll_adjustments.reduce(
            (a: any, b: any) => a + b.deductAdjustment,
            0
          );
          const result = totalAddAdjustment - totalDeductAdjustment;
          console.log('res!', result);
          if (result > 0) {
            payrollReport[i].addAdjustment = result;
          } else if (result < 0) {
            payrollReport[i].deductAdjustment = result;
          }
        }
      })
    );
    console.log('Updated payrollReport:', payrollReport[0]);
    return NextResponse.json({
      message: 'Success',
      payrollReport,
      companyRate,
      departmentName: department.departmentName,
    });
  } catch (err: any) {
    if (err && err.name === 'SequelizeDatabaseError') {
      console.log({ message: 'Error', error: err }, { status: 400 });
      return;
    } else {
      return NextResponse.json(
        { message: 'generating reports error', error: err.message },
        { status: 500 }
      );
    }
  }
}
