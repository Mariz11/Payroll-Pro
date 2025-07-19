import { NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  sendEmail,
  sendSMS,
} from '@utils/partnerAPIs';
import {
  verifyUserEmailContent,
  verifyUserSMSContent,
} from '@utils/notificationContentFormatter';
import { MCASH_MLWALLET } from '@constant/variables';
import { Employee as Employee } from 'lib/classes/Employee';
import { createActivityLog } from '@utils/activityLogs';

export async function PATCH(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const companyName = selectedCompData
    ? selectedCompData.companyName
    : seshData.company.companyName;
  const userId = seshData.userId;
  const companyTierLabel = selectedCompData
    ? selectedCompData.tierLabel
    : seshData.company.tierLabel;

  try {
    const data = await req.json();
    const employee = new Employee();

    Object.assign(data, {
      companyId: data.companyId ?? companyId,
      tierLabel: companyTierLabel, // Set company name as tier label when reactivating account
      mismatchedInfos: data.mismatchedInfos ?? null
    });

    employee.setData(data);
    employee.checkScriptTags();
    employee.checkSQLInjection();
    await employee.checkFields();

    const validationErrors = employee.getCheckErrors();
    let errors: string[] = [];
    errors.push(...validationErrors);
    if (errors.length) return NextResponse.json({message: errors.join('. ')}, {status: 400});
    Object.assign(data, employee.getData());

    const registerEmployee: any = await employee.addKYC();
    if (!registerEmployee.success) return NextResponse.json({message: `KYC validation error: ${registerEmployee.message}`}, {status: 400});

    const { responseData } = registerEmployee;
    Object.assign(data, {
      tierLabel: responseData?.tier?.label || '',
      ckycId: responseData?.ckycId || '',
      mlWalletId: responseData?.moneyAccountId || ''
    });
    const { tierLabel, ckycId, mlWalletId } = data;
    employee.updateData({ tierLabel, ckycId, mlWalletId });

    await employee.updateEmployeeMinimal();
    await employee.activateEmployee();

    const isMCash = MCASH_MLWALLET.includes(data.modeOfPayroll);
    if (isMCash) {
      await employee.updateVerificationCode();
      const verificationCode = await employee.addVerificationCode();
      
      sendEmail({
        to: data.emailAddress,
        subject: `${verificationCode} is your verification code`,
        content: verifyUserEmailContent({
          verificationCode: verificationCode,
          logo: companyName
        }),
      });

      sendSMS({
        recepientNo: data.contactNumber,
        content: verifyUserSMSContent({ verificationCode: verificationCode }),
        sender: 'MLWALLET',
      });
    } else if (data.modeOfPayroll == 'KWARTA PADALA') {
      await employee.activateUser();
    }

    await createActivityLog(
      companyId,
      userId,
      isMCash ? 
        `Sent Employee Verification Code [Employee Code: ${data.employeeCode}]` : 
        `Reactivated employee [Employee Code: ${data.employeeCode}]`
    );

    return NextResponse.json({
      message: isMCash ?
        'Verification code has been sent to the employee' : 
        `[Employee Code: ${data.employeeCode}] has been reactivated successfully.`
    });
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
  
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}