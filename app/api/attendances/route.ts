import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';

import moment from '@constant/momentTZ';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { createActivityLog } from '@utils/activityLogs';
import { logTaskProcess } from '@utils/companyDetailsGetter';
import { uuidv4 } from '@utils/helper';
import { getRequestLogger } from '@utils/logger';
import { postAttendance } from '@utils/mainFunctions';
import { transformPaginatedData } from '@utils/transformPaginatedData';
import connection, { executeQuery } from 'db/connection';
import { Department } from 'db/models';
import { QueryTypes } from 'sequelize';

export async function GET(req: NextRequest, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const departmentId = Number(url.searchParams.get('departmentId'));
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');

    const [companyDetails]: any = await executeQuery('companies_get_one', {
      companyId,
    });

    const [userList]: any = await executeQuery(`attendances_get_user_roles`, {
      userId: seshData.userId,
    });

    const user = userList?.users;

    let moduleAccess = [];
    if (user && user.user_role) {
      moduleAccess = JSON.parse(user.user_role.moduleAccess);
    }

    let role: string | null = 'ADMIN';
    if (!user.user_role) {
      role = seshData.role;
    } else {
      role = moduleAccess.find((item: any) => item.moduleId === 2)
        ? 'ADMIN'
        : moduleAccess.find((item: any) => item.moduleId === 17)
          ? 'EMPLOYEE'
          : null;
    }

    const attendanceList: any = await executeQuery(
      `attendances_get_data`,
      {
        companyId,
        status,
        search,
        role,
        employeeId: seshData.employeeId,
        departmentId: departmentId ? departmentId : undefined,
        offset,
        limit,
        enableSearchEmployee: companyDetails?.enableSearchEmployee,
      },
      [],
      QueryTypes.SELECT,
      null,
      QueryReturnTypeEnum.RAW
    );

    const attendanceData = transformPaginatedData(attendanceList);

    return NextResponse.json({
      count: attendanceData.count ?? [],
      rows: attendanceData.rows ?? [],
    });
  } catch (error) {
    return NextResponse.json(error);
  }
}

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
    const payload = await req.json();
    const departmentId = payload.departmentId;
    const businessMonthCycle = payload.businessMonthCycle.split(' - ');
    const businessMonth = businessMonthCycle[0];
    let cycle = businessMonthCycle[1];
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
    const departmentDetails: any = await Department.findByPk(departmentId);
    const taskCode = uuidv4();
    const taskName = 'Post Attendance';
    await logTaskProcess({
      taskCode: taskCode,
      taskName: taskName,
      departmentName: departmentDetails.departmentName,
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

    return NextResponse.json(response);
  } catch (error: any) {
    console.log(error);
    requestLogger.error({
      label: `Post Attendance`,
      message: JSON.stringify(error.message),
    });
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error updating attendances:', error.message);
    } else
      return NextResponse.json({
        severity: 'error',
        // payrollArr: payrollArr,
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}

export async function PATCH(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await req.json();

    const attendanceUpdatePromises = payload.map(async (item: any) => {
      const {
        attendanceId,
        timeIn,
        timeOut,
        lunchTimeIn,
        lunchTimeOut,
        overtimeHours,
        undertimeHours,
        lateHours,
        nightDiffHours,
        isLeave,
        isPresent,
        isDayOff,
        isHalfDay,
        creditableOvertime,
      } = item;

      await executeQuery(
        `attendances_update`,
        {
          attendanceId,
          timeIn,
          timeOut,
          lunchTimeIn,
          lunchTimeOut,
          undertimeHours,
          lateHours,
          nightDiffHours,
          isLeave,
          isPresent,
          isDayOff,
          creditableOvertime,
          isHalfDay: isHalfDay == '' ? 0 : isHalfDay,
        },
        [],
        QueryTypes.UPDATE
      );
    });

    await Promise.all(attendanceUpdatePromises);

    return NextResponse.json({
      severity: 'success',
      success: true,
      message: 'Successfully Updated',
      data: payload,
    });
  } catch (error: any) {
    console.log(error);
    console.error(
      'Error updating attendances on api/attendances:',
      error.message
    );
    return NextResponse.json({
      severity: 'error',
      success: false,

      message: 'Something went wrong...',
    });
  }
}

export async function DELETE(req: NextRequest, res: Response) {
  const logger = getRequestLogger(req);
  const log = (message: string, data?: any) => {
    logger.info(`[Delete Attendance] ${message}`, data || '');
  };
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

  let successCount = 0;
  const transaction = await connection.transaction();
  try {
    const data = await req.json();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.departmentId) {
        const [department]: any = await executeQuery(`departments_get`, {
          departmentId: item.departmentId,
        });

        log("department data", { department })
        await transaction.rollback();
        return NextResponse.json(
          {
            success: false,
            message: `Deletion failed. No department set for this cycle.
              [[${item.businessMonth} - ${item.cycle} for ${department.departmentName} ]
            `,
          },
          { status: 400 }
        );
      }

      log("start deleting data", {
        businessMonth: item.businessMonth,
        cycle: item.cycle,
        companyId: companyId,
        departmentId: item.departmentId,
        isPosted: 0,
      })

      await executeQuery(
        `attendances_delete`,
        {
          businessMonth: item.businessMonth,
          cycle: item.cycle,
          companyId: companyId,
          departmentId: item.departmentId,
          isPosted: 0,
        },
        [],
        QueryTypes.UPDATE,
        transaction as any
      );

      log("Done deleting data", {
        businessMonth: item.businessMonth,
        cycle: item.cycle,
        companyId: companyId,
        departmentId: item.departmentId,
        isPosted: 0,
      })

      await createActivityLog(
        companyId,
        userId,
        `Deleted Attendance [${item.businessMonth} - ${item.cycle}]`,
        transaction
      );

      successCount++;
    }

    await transaction.commit();

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully Deleted',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    await transaction.rollback();
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong...',
        error: { ...error },
      },
      { status: 500 }
    );
  }
}
