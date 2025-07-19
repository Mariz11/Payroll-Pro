import { getPremiumAttendanceBreakdown } from '@utils/companyDetailsGetter';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  AllowanceBreakdown,
  Attendance,
  Company,
  Deduction,
  Employee,
  EmployeeProfile,
  Holiday,
  PayrollDeductions,
  TransferToEmployee,
} from 'db/models';
import payroll from 'db/models/payroll';
import payrollAdjustments from 'db/models/payrollAdjustments';
import { NextRequest, NextResponse } from 'next/server';
import { Model, Op } from 'sequelize';

export async function GET(req: Request, res: Response, next: NextRequest) {
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
  const businessMonthCycle: any = url.searchParams.get('businessMonthCycle');
  const businessMonth = businessMonthCycle.split(' - ')[0];
  const employeeId = url.searchParams.get('employeeId');
  let cycle = businessMonthCycle.split(' - ')[1];
  const cycleShortened = cycle.split(' ')[0];
  const isDirect = url.searchParams.get('isDirect');

  const payrollReport: any = await payroll.findAll({
    where: {
      businessMonth: businessMonth,
      cycle: {
        [Op.or]: [
          {
            [Op.startsWith]: cycle,
          },
          {
            [Op.startsWith]: cycleShortened,
          },
        ],
      },

      companyId: companyId,
      employeeId: employeeId,
      isDirect: isDirect == 'true' ? true : false,
    },
    include: [
      {
        model: Employee,
        include: [
          {
            model: EmployeeProfile,
          },
          {
            model: Company,
            attributes: ['companyName'],
          },
          {
            model: Attendance,
            attributes: [
              'date',
              'isPresent',
              'isDayOff',
              'isLeave',
              'overtimeHours',
            ],
            where: {
              businessMonth: businessMonth,
              cycle: {
                [Op.or]: [
                  {
                    [Op.startsWith]: cycle,
                  },
                  {
                    [Op.startsWith]: cycleShortened,
                  },
                ],
              },
              companyId: companyId,
            },
            include: [
              {
                attributes: ['holidayType'],
                model: Holiday,
              },
            ],

            required: isDirect == 'true' ? false : true,
          },
          {
            model: AllowanceBreakdown,
          },
        ],
      },
      {
        model: PayrollDeductions,
        include: [
          {
            model: Deduction,
            attributes: ['deductionType', 'amountPaid', 'isPosted'],
            include: [
              {
                model: TransferToEmployee,
                attributes: ['disbursementStatus'],
              },
            ],
          },
        ],
      },
      {
        model: payrollAdjustments,
        attributes: ['desc', 'addAdjustment', 'deductAdjustment'],
      },
    ],
  });
  await Promise.all(
    payrollReport.map(async (item: any, i: number) => {
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

      const {
        workedOnRestDays,
        workedOnRegularHoliday,
        workedOnRegularHolidayWhileRestDay,
        halfDayPresentOnRegularHoliday,
        halfDayPresentOnSpecialHoliday,
        workedOnSpecialHoliday,
        workedOnSpecialHolidayWhileRestDay,
        overtimeOnRegularDays,
        overtimeOnHolidays,
        overtimeOnRestDays,
      } = res.data;

      // Assign values to payrollReport[i]
      payrollReport[i].dataValues.workedOnRestDays = workedOnRestDays;
      payrollReport[i].dataValues.workedOnRegularHoliday =
        workedOnRegularHoliday;
      payrollReport[i].dataValues.workedOnRegularHolidayWhileRestDay =
        workedOnRegularHolidayWhileRestDay;
      payrollReport[i].dataValues.halfDayPresentOnRegularHoliday =
        halfDayPresentOnRegularHoliday;
      payrollReport[i].dataValues.halfDayPresentOnSpecialHoliday =
        halfDayPresentOnSpecialHoliday;
      payrollReport[i].dataValues.workedOnSpecialHoliday =
        workedOnSpecialHoliday;
      payrollReport[i].dataValues.workedOnSpecialHolidayWhileRestDay =
        workedOnSpecialHolidayWhileRestDay;
      payrollReport[i].dataValues.overtimeOnRegularDays = overtimeOnRegularDays;
      payrollReport[i].dataValues.overtimeOnHolidays = overtimeOnHolidays;
      payrollReport[i].dataValues.overtimeOnRestDays = overtimeOnRestDays;
    })
  );

  return NextResponse.json({
    message: 'Success',
    payrollReport,
  });
}
