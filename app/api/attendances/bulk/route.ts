import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { getRequestLogger } from '@utils/logger';
import { NextRequest, NextResponse } from 'next/server';

import moment from '@constant/momentTZ';
import { logTaskProcess } from '@utils/companyDetailsGetter';
import { uuidv4 } from '@utils/helper';
import { postAttendance } from '@utils/mainFunctions';

export async function POST(req: NextRequest, res: Response) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    let data = await req.json();
    // remove duplicate department IDs
    data = data.filter(
      (item: any, index: number, arr: any) =>
        !arr
          .map((item2: any) => item2.departmentId)
          .includes(item.departmentId, index + 1)
    );

    const responses = [];
    for (let i = 0; i < data.length; i++) {
      const taskCode = uuidv4();
      const taskName = 'Post Attendance';
      const item = data[i];
      const { departmentId, businessMonth, cycle, departmentName } = item;
      let semiWeeklyStartDate = null;
      let semiWeeklyEndDate = null;
      if (cycle && cycle.startsWith('[')) {
        semiWeeklyStartDate = moment(
          cycle.split('-')[0].replace('[', ''),
          'MM/DD/YYYY'
        )
          .toDate()
          .toString();
        semiWeeklyEndDate = moment(
          cycle.split('-')[1].replace(']', ''),
          'MM/DD/YYYY'
        )
          .toDate()
          .toString();
      }

      await logTaskProcess({
        taskCode: taskCode,
        taskName: taskName,
        departmentName: departmentName,
        businessMonth: businessMonth,
        cycle: cycle,
        status: 0,
      });

      // Get Department, Payroll Type and Company Cycle details
      const response = await postAttendance({
        taskCode: taskCode,
        taskName: taskName,
        departmentId: departmentId,
        cycle: cycle,
        businessMonth: businessMonth,
        semiWeeklyStartDate: semiWeeklyStartDate,
        semiWeeklyEndDate: semiWeeklyEndDate,
      });

      responses.push({
        ...response,
        departmentName: `${departmentName} - [${businessMonth} - ${cycle}]`,
      });
    }

    return NextResponse.json(responses);
  } catch (error: any) {
    requestLogger.error({
      label: `Bulk Post Attendance`,
      message: JSON.stringify(error.message),
    });
    return NextResponse.json({
      severity: 'error',
      success: false,
      error: error.message,
      message: 'Something went wrong...',
    });
  }
}
