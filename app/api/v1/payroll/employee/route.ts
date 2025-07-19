import moment from '@constant/momentTZ';
import {
  ML_SMS_PASSWORD,
  ML_SMS_SENDER,
  ML_SMS_USERNAME,
  SMS_API,
} from '@constant/partnerAPIDetails';
import { getPremiumAttendanceBreakdown } from '@utils/companyDetailsGetter';
import { tokenChecker } from '@utils/externalApiFunctions';
import { properCasing } from '@utils/helper';
import { getRequestLogger } from '@utils/logger';
import {
  failedDisbursementEmailContent,
  payslipEmailContent,
} from '@utils/notificationContentFormatter';
import { sendEmail } from '@utils/partnerAPIs';
import axios from 'axios';
import {
  AllowanceBreakdown,
  Attendance,
  Batch_uploads,
  Company,
  Deduction,
  Employee,
  EmployeeProfile,
  Holiday,
  Payroll,
  PayrollDeductions,
  TransferToEmployee,
} from 'db/models';
import Configuration from 'db/models/configuration';
import notifications from 'db/models/notifications';
import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';

export async function PATCH(req: NextRequest, res: Response) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Batch Upload Agent',
      message: JSON.stringify({
        success: false,
        message: 'Invalid Token.',
        statusCode: 401,
      }),
    });
    return NextResponse.json(
      { success: false, message: 'Invalid Token.', statusCode: 401 },
      { status: 401 }
    );
  }

  try {
    const {
      companyAccountId,
      employeeAccountId,
      netSalary,
      batchNumber,
      operator,
      transactionDate,
      transactionCode,
      status,
      statusCode,
    }: {
      companyAccountId: string;
      employeeAccountId: string;
      netSalary: number;
      batchNumber: string;
      operator: {
        id: string;
        name: string;
      };
      transactionDate: string;
      transactionCode: string;
      status: number;
      statusCode: string | null;
    } = await req.json();

    const payload = {
      companyAccountId,
      employeeAccountId,
      netSalary,
      batchNumber,
      operator,
      transactionDate,
      transactionCode,
      status,
      statusCode,
    };

    if (
      !companyAccountId ||
      !employeeAccountId ||
      !netSalary ||
      !batchNumber ||
      !operator ||
      !transactionDate ||
      status == undefined
    ) {
      requestLogger.error({
        label: 'Batch Upload Agent',
        message: JSON.stringify({
          success: false,
          message: 'Missing required properties.',
          payload: payload,
          statusCode: 400,
        }),
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required properties.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (status == 1 && !transactionCode) {
      requestLogger.error({
        label: 'Batch Upload Agent',
        message: JSON.stringify({
          success: false,
          message: 'Missing required properties.',
          statusCode: 400,
          payload: payload,
        }),
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required properties.',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    if (status < 1 || status > 2) {
      requestLogger.error({
        label: 'Batch Upload Agent',
        message: JSON.stringify({
          statusCode: 400,
          message: '[status] only accepts 1 or 2 value.',
          success: false,
          payload: payload,
        }),
      });
      return NextResponse.json(
        {
          statusCode: 400,
          message: '[status] only accepts 1 or 2 value.',
          success: false,
        },
        { status: 400 }
      );
    }

    if (status > 1 && statusCode == null) {
      requestLogger.error({
        label: 'Batch Upload Agent',
        message: JSON.stringify({
          statusCode: 400,
          message: 'Must supply a value for statusCode.',
          success: false,
          payload: payload,
        }),
      });
      return NextResponse.json(
        {
          statusCode: 400,
          message: 'Must supply a value for statusCode.',
          success: false,
        },
        { status: 400 }
      );
    }

    const payroll: any = await Payroll.findOne({
      include: [
        {
          model: PayrollDeductions,
          include: [Deduction],
        },
        {
          attributes: [],
          model: Employee,
          where: {
            ckycId: employeeAccountId,
          },
        },
        {
          attributes: [],
          model: Company,
          where: {
            accountId: companyAccountId,
          },
        },
        {
          attributes: [],
          model: Batch_uploads,
          where: {
            batchNumber: batchNumber,
          },
        },
      ],
      // where: {
      //   modeOfPayroll: 'ML WALLET',
      //   disbursementStatus: 0,
      //   disbursementCode: null,
      //   isPosted: 1,
      // },
    });

    if (payroll) {
      if (status == 1) {
        const { payroll_id, payroll_deductions } = payroll;
        if (payroll_deductions.length > 0) {
          for (let j = 0; j < payroll_deductions.length; j++) {
            const payrollDeduction = payroll_deductions[j].dataValues;
            const {
              payrollDeductionId,
              employeeId,
              deductionId,
              amountPaid,
              isDeferred,
              isCollected,
              deduction,
            } = payrollDeduction;
            if (!isDeferred && !isCollected) {
              // Increment amountPaid for the deduction
              await Deduction.update(
                {
                  amountPaid: deduction.amountPaid + amountPaid,
                },
                {
                  where: {
                    deductionId: deductionId,
                  },
                }
              );

              await PayrollDeductions.update(
                {
                  isCollected: true,
                },
                {
                  where: {
                    payrollDeductionId: payrollDeductionId,
                  },
                }
              );
            }

            // Set isCollected to true even if it is DEFERRED because it will be collected on the next cycle
            await PayrollDeductions.update(
              {
                isCollected: true,
              },
              {
                where: {
                  isDeferred: true,
                  employeeId: employeeId,
                  payroll_id: {
                    [Op.ne]: payroll_id,
                  },
                },
              }
            );

            // Increment noOfIterations for the deduction
            await Deduction.update(
              {
                noOfIterations: Sequelize.literal('noOfIterations + ' + 1),
              },
              {
                where: {
                  deductionId: deductionId,
                },
              }
            );
          }
        }
      }
      // Updating status from Batch upload team
      const updatedPayrollId: any = await Payroll.update(
        {
          disbursementStatus: status,
          disbursementCode: transactionCode,
          statusCode: statusCode,
        },
        {
          where: {
            payroll_id: payroll.payroll_id,
          },
        }
      );

      // Process sending of payslip via email
      const updatedPayroll: any = await Payroll.findByPk(payroll.payroll_id);

      const companyDetails: any = await Company.findOne({
        where: {
          companyId: payroll.companyId,
        },
      });
      const emailNotificationSettings: any = await notifications.findOne({
        where: {
          serviceType: 'EMAIL',
          companyId: payroll.companyId,
        },
      });
      const payrollForEmail: any = await Payroll.findOne({
        include: [
          {
            model: PayrollDeductions,
            include: [
              {
                model: Deduction,
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
            model: Employee,

            include: [
              {
                model: AllowanceBreakdown,
              },
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
                  businessMonth: updatedPayroll.businessMonth,
                  cycle: updatedPayroll.cycle,
                  companyId: updatedPayroll.companyId,
                  departmentId: updatedPayroll.departmentId,
                },
                include: [
                  {
                    attributes: ['holidayType'],
                    model: Holiday,
                  },
                ],
                required: false,
              },
            ],
          },
        ],
        where: {
          payroll_id: updatedPayroll.payroll_id,
        },
      });
      if (
        emailNotificationSettings &&
        emailNotificationSettings.isEnabled &&
        updatedPayroll.disbursementStatus == 1
      ) {
        const res: any = await getPremiumAttendanceBreakdown({
          employeeDetails: {
            employeeId: payrollForEmail?.employee?.employeeId,
            departmentId: payrollForEmail?.employee?.departmentId,
            daysOff: payrollForEmail.daysOff,
          },
          attendanceDetails: {
            businessMonth: payrollForEmail?.businessMonth,
            cycle: payrollForEmail?.cycle,
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
          overtimeOnRH,
          overtimeOnRHRestDay,
          overtimeOnSHRestDay,
          overtimeOnRestDays,
        } = res.data;

        // Assign values to payrollReport[i]
        payrollForEmail.workedOnRestDays = workedOnRestDays;
        payrollForEmail.workedOnRegularHoliday = workedOnRegularHoliday;
        payrollForEmail.workedOnRegularHolidayWhileRestDay =
          workedOnRegularHolidayWhileRestDay;
        payrollForEmail.halfDayPresentOnRegularHoliday =
          halfDayPresentOnRegularHoliday;
        payrollForEmail.halfDayPresentOnSpecialHoliday =
          halfDayPresentOnSpecialHoliday;
        payrollForEmail.workedOnSpecialHoliday = workedOnSpecialHoliday;
        payrollForEmail.workedOnSpecialHolidayWhileRestDay =
          workedOnSpecialHolidayWhileRestDay;
        payrollForEmail.overtimeOnRegularDays = overtimeOnRegularDays;
        payrollForEmail.overtimeOnHolidays = overtimeOnHolidays;
        payrollForEmail.overtimeOnRestDays = overtimeOnRestDays;
        payrollForEmail.overtimeOnRH = overtimeOnRH;
        payrollForEmail.overtimeOnRHRestDay = overtimeOnRHRestDay;
        payrollForEmail.overtimeOnSHRestDay = overtimeOnSHRestDay;
        sendEmail({
          to: payrollForEmail.employee.employee_profile.emailAddress,
          subject: `${properCasing(companyDetails.companyName)} Payslip for ${
            payrollForEmail.businessMonth
          } ${properCasing(payrollForEmail.cycle)}`,
          content: payslipEmailContent({
            payroll: payrollForEmail,
            companyName: companyDetails.companyName,
          }),
        });
      }

      // failed disbursement email and sms notification
      if (updatedPayroll.disbursementStatus == 2) {
        const res = await Configuration.findAll();
        const appConfigData: any = res[0];
        const emailContacts = appConfigData.emailContacts
          ? appConfigData.emailContacts.split(',')
          : [];
        const phoneContacts = appConfigData.phoneContacts
          ? appConfigData.phoneContacts.split(',')
          : [];
        // SMS_API({

        // })
        for (let i = 0; i < phoneContacts.length; i++) {
          const content = `Disbursement for ${payrollForEmail.employee.employee_profile.employeeFullName} for ${payrollForEmail.businessMonth} ${payrollForEmail.cycle} has failed. The disbursement amount is ${updatedPayroll.netPay}`;
          const sendSmsFunc = async () => {
            const sendSMS = await axios.post(
              SMS_API,
              {
                username: ML_SMS_USERNAME,
                password: ML_SMS_PASSWORD,
                sender: ML_SMS_SENDER,
                mobileno: phoneContacts[i],
                msg: content,
                service_type: 'ML Payroll',
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            requestLogger.info({
              label: 'SMS API',
              message: JSON.stringify(sendSMS?.data ?? sendSMS),
            });
          };
          sendSmsFunc();
        }

        // email all contacts for failed disbursement details
        // get time stamp
        const timeStamp = moment().format('LL - LT');
        for (let i = 0; i < emailContacts.length; i++) {
          sendEmail({
            to: emailContacts[i],
            subject: `Failed Disbursement for ${payrollForEmail.employee.employee_profile.employeeFullName} (${timeStamp})`,
            content: failedDisbursementEmailContent({
              businessMonth: payrollForEmail.businessMonth,
              cycle: payrollForEmail.cycle,
              amount: updatedPayroll.netPay,
              employeeFullName:
                payrollForEmail.employee.employee_profile.employeeFullName,
            }),
          });
        }
      }
    } else {
      const CAtransaction: any = await TransferToEmployee.findOne({
        where: {
          disbursementStatus: 0,
          disbursementCode: null,
          batchNumber: batchNumber,
        },
      });

      if (!CAtransaction) {
        requestLogger.error({
          label: 'Batch Upload Agent: CA',
          message: JSON.stringify({
            statusCode: 404,
            message: `No record matched with [${batchNumber}] on our database.`,
            success: false,
            payload: {
              companyAccountId: companyAccountId,
              employeeAccountId: employeeAccountId,
              netSalary: netSalary,
              batchNumber: batchNumber,
              operator: operator,
              transactionDate: transactionDate,
              transactionCode: transactionCode,
              status: status,
            },
          }),
        });
        return NextResponse.json(
          {
            statusCode: 404,
            message: `No record matched with [${batchNumber}] on our database.`,
            success: false,
          },
          { status: 404 }
        );
      }

      await TransferToEmployee.update(
        {
          disbursementStatus: status,
          disbursementCode: transactionCode,
        },
        {
          where: {
            id: CAtransaction.id,
          },
        }
      );

      // if (status == 1) {
      //   const employeeDetails: any = await Employee.findOne({
      //     where: {
      //       employeeId: CAtransaction.employeeId,
      //     },
      //     include: [EmployeeProfile],
      //   });
      //   const companyDetails: any = await Company.findByPk(
      //     CAtransaction.companyId
      //   );

      //   const {
      //     firstName,
      //     middleName,
      //     lastName,
      //     emailAddress,
      //     contactNumber,
      //     employeeFullName,
      //   } = employeeDetails;

      //   // Send Verification code via Email
      //   sendEmail({
      //     to: emailAddress,
      //     subject: `Cash Advance [${transactionCode}]`,
      //     content: `Hello ${employeeFullName}, you received PHP ${amountFormatter(
      //       CAtransaction.disbursedAmount
      //     )} on your MCash account as your Cash Advance request with transaction code [${transactionCode}] has been approved. For more information, you may contact: ${
      //       companyDetails.emailAddress
      //     }/${companyDetails.contactNumber}. Thank you!`,
      //   });
      //   // Send Verification code via SMS
      //   sendSMS({
      //     recepientNo: contactNumber,
      //     content: `Hello ${employeeFullName}, you received PHP ${amountFormatter(
      //       CAtransaction.disbursedAmount
      //     )} on your MCash account as your Cash Advance request with transaction code [${transactionCode}] has been approved. For more information, you may contact: ${
      //       companyDetails.emailAddress
      //     }/${companyDetails.contactNumber}. Thank you!`,
      //     sender: 'MLWALLET',
      //   });
      // }

      requestLogger.info({
        label: 'Batch Upload Agent: CA',
        message: JSON.stringify({
          statusCode: 200,
          success: true,
          message: `Employee#${employeeAccountId}'s CA has been processed.`,
          payload: payload,
        }),
      });
    }

    return NextResponse.json(
      {
        statusCode: 200,
        success: true,
        message: `Employee#${employeeAccountId}'s payroll successfully updated.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    requestLogger.error({
      label: 'Batch Upload Agent',
      message: JSON.stringify(error),
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong...',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
