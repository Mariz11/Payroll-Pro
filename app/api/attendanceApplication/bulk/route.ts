import { NextRequest, NextResponse } from 'next/server';

import { updateAttendanceApp } from '@utils/attendanceAppFunctions';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { executeQuery } from 'db/connection';

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  let { action, rowData } = await req.json();

  let successCount = 0;
  let currentRowData = null;
  let errorMessageArr: any = [];
  try {
    rowData = rowData.filter(
      (item: any, index: number, arr: any) =>
        !arr
          .map((item2: any) => item2.attendanceAppId)
          .includes(item.attendanceAppId, index + 1)
    );

    for (let i = 0; i < rowData.length; i++) {
      const {
        attendanceAppId,
        companyId,
        employeeId,
        type,
        reason,
        fromDate,
        toDate,
        dateOvertime,
        timeFrom,
        timeTo,
        numberOfDays,
        employee,
        createdAt,
      } = rowData[i];
      currentRowData = rowData[i];
      const [attendanceApp]: any = await executeQuery(
        `attendance_application_get_number_of_hours`,
        { attendanceAppId: currentRowData.attendanceAppId }
      );

      let numberOfHours = attendanceApp.numberOfHours;

      const res = await updateAttendanceApp({
        action,
        employee,
        dateOvertime,
        employeeId,
        fromDate,
        toDate,
        numberOfDays,
        reason,
        timeFrom,
        timeTo,
        type,
        numberOfHours,
        attendanceAppId,
        companyId,
        seshData,
      });
      if (res.severity == 'error') {
        errorMessageArr.push(res.summary);
      } else if (res.severity == 'success') {
        successCount++;
      }
    }
    if (errorMessageArr.length > 0) {
      return NextResponse.json({
        success: false,
        severity: 'error',
        summary:
          successCount > 0
            ? 'Some attendance applications were not updated'
            : 'Failed to update attendance application',
        errorMessageArr: errorMessageArr,
        life: 5000,
      });
    }

    return NextResponse.json({
      success: true,
      severity: 'success',
      summary:
        action == 'APPROVE'
          ? `Selected attendance applications has been approved`
          : action == 'DISAPPROVE'
            ? `Selected attendance applications has been disapproved`
            : action == 'CANCEL'
              ? `Selected attendance applications has been cancelled`
              : '',
    });
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error submitting attendance applications:', error.message);
    } else
      return NextResponse.json({
        success: false,
        severity: successCount > 0 ? 'warn' : 'error',
        summary:
          successCount > 0
            ? `Some attendance applications were not submitted`
            : 'Something went wrong...',
        error: error,
      });
  }
}
