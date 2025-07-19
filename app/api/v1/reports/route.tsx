import { getPremiumAttendanceBreakdown } from '@utils/companyDetailsGetter';
import { tokenChecker } from '@utils/externalApiFunctions';
import { getRequestLogger } from '@utils/logger';
import {
  Company,
  Deduction,
  Department,
  Employee,
  EmployeeProfile,
  Ledger,
  PayrollDeductions,
  TransferToEmployee,
} from 'db/models';
import payroll from 'db/models/payroll';
import payrollAdjustments from 'db/models/payrollAdjustments';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: Response, next: NextRequest) {
  const requestLogger = getRequestLogger(req);
  // const userToken: any = req.headers.get('Authorization');

  const url = new URL(req.url);
  const userToken: any = req.headers.get('authorization');
  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Get Companies',
      message: JSON.stringify({
        success: false,
        message: 'Invalid Token.',
        payload: {
          token: userToken,
        },
        statusCode: 401,
      }),
    });
    return NextResponse.json(
      { success: false, message: 'Invalid Token.', statusCode: 401 },
      { status: 401 }
    );
  }
  let {
    businessMonth,
    companyId,
    cycle,
    offset,
    limit,
  }: {
    businessMonth: string;
    companyId: number;
    cycle: string;
    offset?: number;
    limit?: number;
  } = await req.json();

  const payload = {
    businessMonth: businessMonth,
    companyId: companyId,
    cycle: cycle,
  };
  if (!businessMonth || !cycle || !companyId) {
    return NextResponse.json(
      {
        success: false,
        message: 'Missing required properties',
        statusCode: 400,
        payload: payload,
      },
      {
        status: 400,
      }
    );
  }
  if (cycle) {
    cycle = cycle.toUpperCase();
  }
  try {
    const company: any = await Company.findOne({
      where: {
        companyId: companyId,
      },
      attributes: ['companyName'],
    });
    const payrollReport: any = await payroll.findAll({
      where: {
        businessMonth: businessMonth,
        cycle: cycle,
        companyId: companyId,
        isPosted: true,
      },
      ...(offset && { offset: offset }),
      ...(limit && { limit: limit }),
      attributes: {
        exclude: [
          'departmentId',
          'fullCycleName',
          'shortDescription',
          'batchUploadId',
          'transferTransactionId',
          'isDirect',
          'disbursementSchedule',
          'failedRemarks',
          'statusCode',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'sickLeaveDays',
          'sickLeavePay',
          'vacationLeaveDays',
          'vacationLeavePay',
          'soloParentLeaveDays',
          'soloParentLeavePay',
          'paternityLeaveDays',
          'paternityLeavePay',
          'maternityLeaveDays',
          'maternityLeavePay',
          'serviceIncentiveLeaveDays',
          'serviceIncentiveLeavePay',
          'otherLeaveDays',
          'otherLeavePay',
          'emergencyLeaveDays',
          'emergencyLeavePay',
          'birthdayLeaveDays',
          'birthdayLeavePay',
          'sssERShare',
          'sssECShare',
          'pagIbigERShare',
          'philHealthERShare',
          'chargePerEmployee',
          'employmentStatus',
          'isMonthlyRated',
          'regularHolidays',
          'specialHolidays',
          'monthlyBasicPay',
          'companyId',
          'businessMonthCycle',
        ],
      },
      // da
      include: [
        {
          model: Department,
          attributes: ['departmentId', 'departmentName'],
          paranoid: false,
        },
        {
          model: Employee,
          attributes: ['employeeId', 'employeeCode', 'mlWalletId', 'dayOff'],
          include: [
            {
              model: EmployeeProfile,
              attributes: [
                'firstName',
                'lastName',
                'middleName',
                'suffix',
                'employeeFullName',
                'contactNumber',
              ],
            },
            // {
            //   model: Attendance,
            //   attributes: [
            //     'date',
            //     'isPresent',
            //     'isDayOff',
            //     'isLeave',
            //     'isHalfDay',
            //     'overtimeHours',
            //   ],
            //   where: {
            //     businessMonth: businessMonth,
            //     cycle: cycle,
            //     companyId: companyId,
            //   },
            //   include: [
            //     {
            //       attributes: ['holidayType'],
            //       model: Holiday,
            //     },
            //   ],
            //   required: false,
            // },
            // {
            //   model: AllowanceBreakdown,
            // },
          ],
          paranoid: false,
        },
        // {
        //   model: PayrollDeductions,
        //   include: [
        //     {
        //       model: Deduction,
        //       attributes: [
        //         'deductionType',
        //         'amountPaid',
        //         'isPosted',
        //         'remarks',
        //       ],
        //       include: [
        //         {
        //           model: TransferToEmployee,
        //           attributes: ['disbursementStatus'],
        //         },
        //         {
        //           model: Ledger,
        //           attributes: ['amount', 'desc'],
        //         },
        //       ],
        //     },
        //   ],
        // },
        // {
        {
          model: payrollAdjustments,
          attributes: ['desc', 'addAdjustment', 'deductAdjustment'],
        },
      ],
    });

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
        // console.log('employeeName!');
        // console.log(employeeName);
        // console.log(item.payroll_id);
        const res: any = await getPremiumAttendanceBreakdown({
          employeeDetails: {
            employeeId: item?.employee?.employeeId,
            departmentId: item?.department.departmentId,
            daysOff: item.daysOff,
          },
          attendanceDetails: {
            businessMonth: item?.businessMonth,
            cycle: item?.cycle,
          },
        });
        // console.log('res!');
        // console.log(res.data);
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
        } = res.data;
        const regDaysPresent =
          payrollReport[i].daysWorked -
          (workedOnRestDays +
            workedOnRegularHoliday +
            workedOnRegularHolidayWhileRestDay +
            workedOnSpecialHoliday +
            workedOnSpecialHolidayWhileRestDay);
        // Assign values to payrollReport[i]
        const payrollDeductions = await PayrollDeductions.findAll({
          where: {
            payroll_id: payrollReport[i].payroll_id,
          },

          include: [
            {
              model: Deduction,
              attributes: [
                'deductionType',
                'amountPaid',
                'isPosted',
                'remarks',
              ],
              include: [
                {
                  model: TransferToEmployee,
                  attributes: ['disbursementStatus'],
                },
                {
                  model: Ledger,
                  attributes: ['amount', 'desc'],
                },
              ],
            },
          ],
        });
        const cashAdvanceSum = payrollDeductions
          .filter((deduc: any) => {
            // Add conditions for filtering
            return (
              deduc.deduction.deductionType === 'Cash Advance' &&
              !deduc.isDeferred &&
              deduc.deduction.isPosted === true &&
              deduc.deduction.transfer_to_employee_acct_transaction
                ?.disbursementStatus === true
            );
          })
          .reduce((sum: number, deduc: any) => {
            // Accumulate the sum of amountPaid
            return sum + deduc.amountPaid;
          }, 0);

        const sssLoanSum = payrollDeductions
          .filter((deduc: any) => {
            // Add conditions for filtering
            return (
              deduc.deduction.deductionType === 'SSS Loan' &&
              !deduc.isDeferred &&
              deduc.deduction.isPosted === true
            );
          })
          .reduce((sum: number, deduc: any) => {
            // Accumulate the sum of amountPaid
            return sum + deduc.amountPaid;
          }, 0);

        const sssCalamityLoanSum = payrollDeductions
          .filter((deduc: any) => {
            // Add conditions for filtering
            return (
              deduc.deduction.deductionType === 'SSS Calamity Loan' &&
              !deduc.isDeferred &&
              deduc.deduction.isPosted === true
            );
          })
          .reduce((sum: number, deduc: any) => {
            // Accumulate the sum of amountPaid
            return sum + deduc.amountPaid;
          }, 0);

        const pagIbigLoanSum = payrollDeductions
          .filter((deduc: any) => {
            // Add conditions for filtering
            return (
              deduc.deduction.deductionType === 'HDMF Loan' &&
              !deduc.isDeferred &&
              deduc.deduction.isPosted === true
            );
          })
          .reduce((sum: number, deduc: any) => {
            // Accumulate the sum of amountPaid
            return sum + deduc.amountPaid;
          }, 0);

        // const ledgerSum = payroll?.payroll_deductions
        //   .filter((deduc: any) => {
        //     // Add conditions for filtering
        //     return (
        //       deduc.deduction.deductionType === 'Ledger' &&
        //       !deduc.isDeferred &&
        //       deduc.deduction.isPosted === true
        //     );
        //   })
        //   .reduce((sum: number, deduc: any) => {
        //     // Accumulate the sum of amountPaid
        //     return sum + deduc.amountPaid;
        //   }, 0);

        const otherSum = payrollDeductions
          .filter((deduc: any) => {
            // Add conditions for filtering
            return (
              deduc.deduction.deductionType === 'Other' &&
              !deduc.isDeferred &&
              deduc.deduction.isPosted === true
            );
          })
          .reduce((sum: number, deduc: any) => {
            // Accumulate the sum of amountPaid
            return sum + deduc.amountPaid;
          }, 0);
        console.log('status!');
        console.log(payrollReport[i].isPosted);
        console.log(payrollReport[i].disbursementStatus);
        const absentOnRHD =
          payrollReport[i].regularHolidaysAbsent +
          halfDayPresentOnRegularHoliday * 0.5;
        const regDaysAbsent =
          payrollReport[i].daysAbsent +
          halfDayAbsent * 0.5 -
          payrollReport[i].specialHolidaysAbsent;

        payrollReport[i].dataValues.status = payrollReport[i].isPosted
          ? payrollReport[i].disbursementStatus == 0
            ? payrollReport[i].netPay <= 0
              ? 'Posted'
              : 'On Going'
            : payrollReport[i].disbursementStatus == 1
            ? 'Disbursed'
            : 'Failed'
          : '';
        const dailyRate = payrollReport[i].dailyRate;
        payrollReport[i].dataValues.regDaysPresent = regDaysPresent;
        payrollReport[i].dataValues.regDaysPresentPay =
          regDaysPresent * payrollReport[i].dailyRate;
        payrollReport[i].dataValues.workedOnRestDays = workedOnRestDays;
        payrollReport[i].dataValues.workedOnRestDaysPay =
          workedOnRestDays *
          payrollReport[i].dailyRate *
          (payrollReport[i].restDayRate / 100);
        payrollReport[i].dataValues.regDaysAbsent = regDaysAbsent;
        payrollReport[i].dataValues.regDaysAbsentPay =
          regDaysAbsent * dailyRate;
        payrollReport[i].dataValues.workedOnRHD = workedOnRegularHoliday;
        payrollReport[i].dataValues.workedOnRHDPay =
          workedOnRegularHoliday *
          dailyRate *
          (payrollReport[i].regularHolidayRate / 100);
        payrollReport[i].dataValues.workedOnRHDRD =
          workedOnRegularHolidayWhileRestDay;
        payrollReport[i].dataValues.workedOnRHDRDPay =
          workedOnRegularHolidayWhileRestDay *
          dailyRate *
          (payrollReport[i].regularHolidayRestDayRate / 100);
        // payrollReport[i].dataValues.halfDayPresentOnRegularHoliday =
        //   halfDayPresentOnRegularHoliday;
        payrollReport[i].dataValues.workedOnSPHD = workedOnSpecialHoliday;
        payrollReport[i].dataValues.workedOnSPHDPay =
          workedOnSpecialHoliday *
          dailyRate *
          (payrollReport[i].specialHolidayRate / 100);
        payrollReport[i].dataValues.workedOnSPHDRDDay =
          workedOnSpecialHolidayWhileRestDay;
        payrollReport[i].dataValues.workedOnSPHDRDPay =
          workedOnSpecialHolidayWhileRestDay *
          dailyRate *
          (payrollReport[i].specialHolidayRestDayRate / 100);
        payrollReport[i].dataValues.halfDayPresentOnSpecialHoliday =
          halfDayPresentOnSpecialHoliday;
        payrollReport[i].dataValues.overtimeOnRegularDays =
          overtimeOnRegularDays;
        payrollReport[i].dataValues.overtimeOnRegularDaysPay =
          overtimeOnRegularDays * payrollReport[i].overtimeRateRegDays;
        payrollReport[i].dataValues.overtimeOnHolidays = overtimeOnHolidays;
        payrollReport[i].dataValues.overtimeOnHolidaysPay =
          overtimeOnHolidays * payrollReport[i].overtimeRateHolidays;
        payrollReport[i].dataValues.overtimeOnRestDays = overtimeOnRestDays;
        payrollReport[i].dataValues.overtimeOnRestDaysPay =
          overtimeOnRestDays * payrollReport[i].overtimeRateRestDays;
        payrollReport[i].dataValues.halfDayAbsent = halfDayAbsent;
        payrollReport[i].dataValues.regularHolidaysAbsent = absentOnRHD;
        payrollReport[i].dataValues.regularHolidaysAbsentPay =
          absentOnRHD * dailyRate;
        payrollReport[i].dataValues.cashAdvance = cashAdvanceSum;
        payrollReport[i].dataValues.sssLoan = sssLoanSum + sssCalamityLoanSum;
        payrollReport[i].dataValues.pagIbigLoan = pagIbigLoanSum;
        payrollReport[i].dataValues.others = otherSum;
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
            payrollReport[i].dataValues.addAdjustment = result;
          } else if (result < 0) {
            payrollReport[i].dataValues.deductAdjustment = result;
          }
        }
      })
    );
    // console.log('Updated payrollReport:', payrollReport[0]);
    return NextResponse.json({
      success: true,
      companyName: company.companyName,
      businessMonth: businessMonth,
      cycle: cycle,
      data: payrollReport,
      statusCode: 200,
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
