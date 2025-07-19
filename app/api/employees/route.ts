import { GCPLogger } from 'lib/classes/logger/GCPLogger';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import {
  deactivateEmployee,
  generatePassword,
  resetEmployeeVerification,
  sendEmail,
  sendSMS,
} from '@utils/partnerAPIs';
import {
  userCredentialEmailContent,
  userCredentialSMSContent,
  verifyUserEmailContent,
  verifyUserSMSContent,
} from '@utils/notificationContentFormatter';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connection from 'db/connection';
import { MCASH_MLWALLET, EMPLOYEE_STATUS } from '@constant/variables';
import { tokenChecker } from '@utils/apiEndpointFunctions';
import { Employee } from 'lib/classes/Employee';
import { createActivityLog } from '@utils/activityLogs';

const getUserAndCompanyData = async (isThirdPartyOrigin: boolean, data: any) => {
  if (isThirdPartyOrigin) {
    return {
      userId: data.userId,
      companyId: data.companyId,
      companyTierLabel: data.tierLabel,
    };
  }

  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();

  return {
    userId: seshData.userId,
    companyId: selectedCompData?.companyId ?? seshData.companyId,
    companyTierLabel: selectedCompData?.tierLabel ?? seshData.company.tierLabel,
  };
}

export async function GET(req: Request, res: Response, next: NextRequest): Promise<Response> {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();

  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const userId = seshData.userId;

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset')) ?? 0;
    const limit = Number(url.searchParams.get('limit')) ?? 5;
    const search = url.searchParams.get('search') ?? '';
    const departmentId = url.searchParams.get('departmentId') ?? '';
    const modeOfPayroll = url.searchParams.get('modeOfPayroll') ?? '';

    const employee = new Employee();
    const data = await employee.searchEmployees({ companyId, departmentId, modeOfPayroll, search, limit, offset });

    return NextResponse.json(data);
  } catch (error) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(req: Request, res: Response): Promise<Response> {
  const startTime = Date.now();
  const log = new GCPLogger();

  log.setReq({
    url: req.url,
    method: req.method,
    startTime
  });

  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);

  if (!tokenValid) {
    const isThirdPartyOrigin = await tokenChecker(userToken);
    if (!isThirdPartyOrigin) {
      log.warn(userToken);
      log.warn({ tokenChecker: isThirdPartyOrigin });

      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }

  const employee = new Employee();

  try {
    const {
      employeeId, // escape validation since value still to be generated
      role, // replace with the right field `userRoleId`
      ...data
    } = await req.json();

    const {
      userId,
      companyId,
      companyTierLabel
    } = await getUserAndCompanyData(!tokenValid, data);

    Object.assign(data, {
      companyId: data.companyId ?? companyId,
      userRoleId: data.userRoleId ?? role,
      tierLabel: companyTierLabel, // Assign company name when reactivating the account
      employeeStatus: data.employeeStatus ?? EMPLOYEE_STATUS.indexOf(data.modeOfPayroll === 'KWARTA PADALA' ? 'ACTIVATED' : 'PENDING')
    });

    employee.setData(data);
    employee.checkScriptTags();
    employee.checkSQLInjection();
    await employee.checkFields();
    await employee.checkDuplicate();

    const validationErrors = employee.getCheckErrors();
    let errors: string[] = [];
    errors.push(...validationErrors);
    if (errors.length) {
      await log.warn({ message: errors });
      return NextResponse.json({ message: errors.join('. ') }, { status: 400 });
    }
    Object.assign(data, employee.getData());

    const registerEmployee: any = await employee.addKYC();
    log.warn({ registerEmployee: JSON.stringify(registerEmployee) });
    if (!registerEmployee.success) {
      await log.warn({ message: registerEmployee });
      return NextResponse.json({ message: `KYC validation error: ${registerEmployee.message}` }, { status: 400 });
    }

    const { responseData } = registerEmployee;
    Object.assign(data, {
      tierLabel: responseData?.tier?.label || '',
      ckycId: responseData?.ckycId || '',
      mlWalletId: responseData?.moneyAccountId || ''
    });
    const { tierLabel, ckycId, mlWalletId } = data;
    employee.updateData({ tierLabel, ckycId, mlWalletId });

    try {
      await connection.transaction(async (t: any) => {
        const employeeId = await employee.addEmployee();
        employee.updateData({ employeeId });

        if (data.allowanceBreakdown) {
          const allowanceBreakdownId = await employee.addAllowanceBreakdowns();
          employee.updateData({ allowanceBreakdownId });
          await employee.updateEmployeeAllowanceBreakdown();
        }

        await employee.addLeaves();
        await employee.addBenefits();
        await employee.addProfile();

        const password = generatePassword();
        const hashPass = await bcrypt.hash(password, 10);

        const adminUser = await employee.getAdminUser();
        adminUser ? employee.addAdminUser(adminUser) : employee.addNormalUser(hashPass);

        if (MCASH_MLWALLET.includes(data.modeOfPayroll)) {
          const verificationCode = await employee.addVerificationCode();

          sendEmail({
            to: data.emailAddress,
            subject: `${verificationCode} is your verification code`,
            content: verifyUserEmailContent({
              verificationCode,
              logo: companyTierLabel,
            }),
          });

          sendSMS({
            recepientNo: data.contactNumber,
            content: verifyUserSMSContent({
              verificationCode,
            }),
            sender: 'MLWALLET',
          });
        } else if (data.modeOfPayroll == 'KWARTA PADALA') {
          if (!adminUser) {
            const companyDetails = await employee.getCompanyDetails();

            sendEmail({
              to: data.emailAddress,
              subject: `Account Credentials`,
              content: userCredentialEmailContent({
                username: data.emailAddress,
                password: password,
                logo: companyTierLabel,
              }),
            });

            sendSMS({
              recepientNo: data.contactNumber,
              content: userCredentialSMSContent({
                username: data.emailAddress,
                password,
                companyName: companyTierLabel,
                contactNumber: companyDetails.contactNumber,
                emailAddress: companyDetails.emailAddress,
              }),
              sender: 'MLHUILLIER',
            });
          }
        }
      });
    } catch (error: any) {
      await log.error({ message: error });
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    await createActivityLog(
      companyId,
      userId,
      `Added new Employee [Employee Code: ${data.employeeCode}]`
    );

    const successMessage = 'Successfully created';
    await log.info({ message: successMessage });
    return NextResponse.json({ message: successMessage });
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    await log.error({ message: error });
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PUT(req: Request, res: Response): Promise<Response> {
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

  const employee = new Employee();

  try {
    const {
      role, // replace with the right field `userRoleId`
      ...data
    } = await req.json();

    Object.assign(data, {
      employeeStatus: typeof data.employeeStatus === 'boolean' ? Number(data.employeeStatus) : data.employeeStatus,
      mlWalletStatus: typeof data.mlWalletStatus === 'boolean' ? Number(data.mlWalletStatus) : data.mlWalletStatus
    });

    Object.assign(data, {
      userRoleId: data.userRoleId ?? role
    });

    employee.setData(data);
    employee.checkScriptTags();
    employee.checkSQLInjection();
    await employee.checkFields();
    await employee.checkDuplicate();
    await employee.checkLoan();

    const validationErrors = employee.getCheckErrors();
    let errors: string[] = [];
    errors.push(...validationErrors);
    if (errors.length) return NextResponse.json({ message: errors.join('. ') }, { status: 400 });
    Object.assign(data, employee.getData());

    const updatedEmployee: any = await employee.updateKYC(userId);
    if (!updatedEmployee.success) return NextResponse.json(updatedEmployee, { status: updatedEmployee.statusCode });

    await employee.updateEmployee();
    await employee.updateLeaves();

    employee.setData(data);

    const selectedEmployee = await employee.getEmployee();
    if (data.allowanceBreakdown) {
      if (!selectedEmployee.allowanceBreakdownId) {
        const allowanceBreakdownId = await employee.addAllowanceBreakdowns();
        employee.updateData({ allowanceBreakdownId });

        await employee.updateEmployeeAllowanceBreakdown();
      } else {
        await employee.updateAllowanceBreakdowns();
      }
    }

    const benefit = await employee.getBenefit();
    if (benefit) {
      await employee.updateBenefits(benefit.employeeBenefitsId);
    } else {
      await employee.addBenefits();
    }

    await employee.updateProfile();
    await employee.updateUser();
    await createActivityLog(
      companyId,
      userId,
      `Updated Employee [Employee Code: ${data.employeeCode}]`
    );

    return NextResponse.json({ message: 'Successfully updated' });
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.log(error);
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(req: Request, res: Response): Promise<Response> {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyTierLabel = selectedCompData
    ? selectedCompData.tierLabel
    : seshData.company.tierLabel;
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const userId = seshData.userId;

  try {
    const data = await req.json();
    const employee = new Employee();

    employee.setData(data);
    await employee.checkFields();
    await employee.checkAttendance();
    await employee.checkPayroll();
    await employee.checkAttendanceApp();
    await employee.checkPendingDeduction();
    await employee.checkUnsettledDeductions();

    const validationErrors = employee.getCheckErrors();
    let errors: string[] = [];
    errors.push(...validationErrors);
    if (errors.length) return NextResponse.json({ message: errors.join('. ') }, { status: 400 });
    Object.assign(data, employee.getData());

    const user = await employee.getUser();
    const selectedEmployee = await employee.getEmployee();
    const isDefaultAdmin: boolean = user && user.isDefault;

    if (MCASH_MLWALLET.includes(selectedEmployee.modeOfPayroll)) {
      await employee.updateVerificationCode();
    }

    if (data.tierLabel != companyTierLabel) {
      if (isDefaultAdmin) {
        await employee.updateEmployeeId()
      } else {
        await employee.deleteUser();
      }
      await employee.deleteEmployee();
      return NextResponse.json({ success: true, message: 'Successfully Deleted' });
    }

    const reset = await resetEmployeeVerification({ ckycId: data.ckycId });
    if (!reset.success) return NextResponse.json(reset, { status: reset.statusCode });

    const deactivateEmployeeTier = await deactivateEmployee({ ckycId: data.ckycId, tierLabel: data.tierLabel });
    if (!deactivateEmployeeTier.success) {
      if (deactivateEmployeeTier?.responseData?.code == 'CUSTOMER_NOT_COMPANY_EMPLOYEE_ERROR') {
        data.tierLabel = null;
      } else {
        return NextResponse.json(deactivateEmployeeTier, { status: deactivateEmployeeTier.statusCode });
      }
    } else {
      data.tierLabel = deactivateEmployeeTier?.responseData?.label; // Change to Buyer teir when deleting account
    }

    employee.updateData({ tierLabel: data.tierLabel });
    await employee.deactivateEmployee();

    if (isDefaultAdmin) {
      await employee.updateEmployeeId();
    } else {
      await employee.deleteUser();
    }

    await createActivityLog(
      companyId,
      userId,
      `Deleted Employee [Employee Code: ${selectedEmployee.employeeCode}]`
    );

    return NextResponse.json({ message: 'Successfully Deleted' });
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
