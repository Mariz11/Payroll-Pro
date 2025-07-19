import { NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Employee } from 'lib/classes/Employee';
import { createActivityLog } from '@utils/activityLogs';
import { deactivateEmployee, resetEmployeeVerification } from '@utils/partnerAPIs';

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
  const userId = seshData.userId;

  try {
    const data = await req.json();
    const employee = new Employee();

    employee.setData(data);
    employee.checkScriptTags();
    employee.checkSQLInjection();
    await employee.checkFields();
    await employee.checkAttendance();
    await employee.checkPayroll();
    await employee.checkAttendanceApp();
    await employee.checkPendingDeduction();
    await employee.checkUnsettledDeductions();

    const validationErrors = employee.getCheckErrors();
    let errors: string[] = [];
    errors.push(...validationErrors);
    if (errors.length) return NextResponse.json({message: errors.join('. ')}, {status: 400});
    Object.assign(data, employee.getData());

    const user = await employee.getUser();
    const isDefaultAdmin: boolean = user && user.isDefault;

    const resetVerification = await resetEmployeeVerification({ckycId: data.ckycId});
    if (!resetVerification?.success) return NextResponse.json(resetVerification, {status: resetVerification.statusCode});

    const deactivateTier = await deactivateEmployee({ckycId: data.ckycId, tierLabel: data.tierLabel});
    if (!deactivateTier?.success) {
      if (deactivateTier?.responseData?.code == 'CUSTOMER_NOT_COMPANY_EMPLOYEE_ERROR') {
        data.tierLabel = null;
      } else {
        return NextResponse.json(deactivateTier, {status: deactivateTier.statusCode});
      }
    } else {
      data.tierLabel = deactivateTier?.responseData?.label; // Change to Buyer teir when deactivating account
    }

    employee.updateData({tierLabel: data.tierLabel});
    await employee.deactivateEmployee();
    if (!isDefaultAdmin) await employee.deactivateUser();

    await createActivityLog(
      companyId,
      userId,
      `Deactivated Employee [Employee Code: ${data.employeeCode}]`
    );

    return NextResponse.json({success: true, message: 'Successfully Deactivated'});
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
