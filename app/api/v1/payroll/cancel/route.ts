import moment from '@constant/momentTZ';
import {
  ML_SMS_PASSWORD,
  ML_SMS_SENDER,
  ML_SMS_USERNAME,
  SMS_API,
} from '@constant/partnerAPIDetails';
import { tokenChecker } from '@utils/externalApiFunctions';
import { getRequestLogger } from '@utils/logger';
import { cancelledDisbursementEmailContent } from '@utils/notificationContentFormatter';
import { sendEmail } from '@utils/partnerAPIs';
import axios from 'axios';
import { Employee, EmployeeProfile, Payroll } from 'db/models';
import Configuration from 'db/models/configuration';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, res: Response) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  if (!(await tokenChecker(userToken))) {
    requestLogger.error({
      label: 'Disbursement Cancellation',
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
      oldTransactionCode,
      newTransactionCode,
    }: {
      oldTransactionCode: string;
      newTransactionCode: string;
    } = await req.json();

    if (!oldTransactionCode) {
      requestLogger.error({
        label: 'Batch Upload Agent',
        message: JSON.stringify({
          success: false,
          message: 'Missing required properties.[oldTransactionCode]',
          payload: {
            oldTransactionCode: oldTransactionCode,
            newTransactionCode: newTransactionCode,
          },
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
    const payroll: any = await Payroll.findOne({
      where: {
        disbursementCode: oldTransactionCode,
      },
      include: [
        {
          model: Employee,
          include: [
            {
              model: EmployeeProfile,
            },
          ],
        },
      ],
    });

    if (payroll) {
      if (payroll.disbursementStatus === 3) {
        requestLogger.error({
          label: 'Disbursement Cancellation',
          message: JSON.stringify({
            success: false,
            message: 'Payroll is already cancelled.',
            payload: {
              oldTransactionCode: oldTransactionCode,
              newTransactionCode: newTransactionCode,
            },
            statusCode: 400,
          }),
        });
        return NextResponse.json(
          {
            success: false,
            message: 'Payroll is already cancelled.',
            statusCode: 400,
          },
          { status: 400 }
        );
      }
      let newDisbursementCode = oldTransactionCode;
      if (newTransactionCode) {
        newDisbursementCode = payroll.disbursementCode;
        let tempDisbursementCode = newDisbursementCode.split(',');
        tempDisbursementCode.push(newTransactionCode);
        newDisbursementCode = tempDisbursementCode.join(',');
      }

      await Payroll.update(
        {
          disbursementCode: newDisbursementCode,
          disbursementStatus: 3,
        },
        {
          where: {
            payroll_id: payroll.payroll_id,
          },
        }
      );
    } else {
      requestLogger.error({
        label: 'Disbursement Cancellation',
        message: JSON.stringify({
          success: false,
          message: `Payroll not found with transactionCode: [${oldTransactionCode}]`,
          payload: {
            oldTransactionCode: oldTransactionCode,
            newTransactionCode: newTransactionCode,
          },
          statusCode: 404,
        }),
      });
      return NextResponse.json(
        {
          statusCode: 404,
          success: true,
          message: `Payroll not found with transactionCode: [${oldTransactionCode}]`,
        },
        { status: 404 }
      );
    }
    const res = await Configuration.findAll();
    const appConfigData: any = res[0];
    const emailContacts = appConfigData.emailContacts
      ? appConfigData.emailContacts.split(',')
      : [];
    const phoneContacts = appConfigData.phoneContacts
      ? appConfigData.phoneContacts.split(',')
      : [];
    // SMS_API({
    const payrollForEmail = payroll;
    // })
    for (let i = 0; i < phoneContacts.length; i++) {
      const content = `Disbursement [${oldTransactionCode}] for ${payrollForEmail.employee.employee_profile.employeeFullName} for ${payrollForEmail.businessMonth} ${payrollForEmail.cycle} has been cancelled. The disbursement amount is ${payrollForEmail.netPay}`;
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
    }

    // email all contacts for failed disbursement details
    // get time stamp
    const timeStamp = moment().format('LL - LT');
    for (let i = 0; i < emailContacts.length; i++) {
      sendEmail({
        to: emailContacts[i],
        subject: `Cancelled Disbursement for ${payrollForEmail.employee.employee_profile.employeeFullName} (${timeStamp})`,
        content: cancelledDisbursementEmailContent({
          businessMonth: payrollForEmail.businessMonth,
          cycle: payrollForEmail.cycle,
          amount: payrollForEmail.netPay,
          employeeFullName:
            payrollForEmail.employee.employee_profile.employeeFullName,
          oldTransactionCode: oldTransactionCode,
          newTransactionCode: newTransactionCode,
        }),
      });
    }

    return NextResponse.json(
      {
        statusCode: 200,
        success: true,
        message: `Payroll successfully cancelled.`,
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
