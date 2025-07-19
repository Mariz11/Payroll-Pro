import { getCurrentOrNewShiftDetails } from '@utils/companyDetailsGetter';
import getNightDifferentialHours from '@utils/getNightDifferentialHours';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
// import { postPayroll } from '@utils/mainFunctions';
import {
  ActivityLog,
  Attendance,
  Batch_uploads,
  Company,
  Department,
  Employee,
  EmployeeProfile,
  Payroll,
  PayrollDeductions,
  Transactions,
} from 'db/models';
import moment from '@constant/momentTZ';
import { NextRequest, NextResponse } from 'next/server';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { executeQuery } from 'db/connection';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { transformPaginatedData } from '@utils/transformPaginatedData';

export async function GET(req: Request, res: Response, next: NextRequest) {
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
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    let result = 0;
    const departmentId = url.searchParams.get('departmentId');
    const businessMonth = url.searchParams.get('businessMonth');

    const [companyDetails]: any = await executeQuery(`companies_get_one`, {
      companyId
    })

    const payrollDataResult = await executeQuery(`payroll_get_computed`, {
      companyId,
      search,
      offset,
      limit,
      status,
      departmentId: departmentId != '' && departmentId != null ? Number(departmentId) : undefined,
      businessMonth: businessMonth != '' && businessMonth != null ? businessMonth : undefined,
      excludedDisbursementStatus: 2,
      createdAt: moment('January 21, 2025').format('YYYY-MM-DD HH:mm:ss'),
      enableSearchEmployee: companyDetails?.enableSearchEmployee
    }, [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW)

    const data = transformPaginatedData(payrollDataResult);
    const res = { count: data?.count ?? [], rows: data?.rows?.[0] ?? [] };

    return NextResponse.json({ ...res, res: result });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else {
      return NextResponse.json(error);
    }
  }
}

export async function POST(req: Request, res: Response) {
  return NextResponse.json('Temporary disabled');
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  // try {
  //   const payload = await req.json();
  //   const uuid = payload.uuid;
  //   const departmentId = payload.departmentId;
  //   const businessMonthCycle = payload.businessMonthCycle.split(' - ');
  //   const businessMonth = businessMonthCycle[0];
  //   const cycle = businessMonthCycle[1];
  //   // const disbursementSchedule = payload.disbursementSchedule;
  //   const companyDetails: any = await Company.findByPk(companyId);

  //   const response = await postPayroll({
  //     uuid: uuid,
  //     businessMonthCycle: businessMonthCycle,
  //     businessMonth: businessMonth,
  //     cycle: cycle,
  //     departmentId: departmentId,
  //     companyDetails: companyDetails,
  //     isReposting: false,
  //   });

  //   return NextResponse.json(response);
  // } catch (error: any) {
  //   return NextResponse.json({
  //     severity: 'error',
  //     success: false,
  //     error: error.message,
  //     message: 'Something went wrong...',
  //   });
  // }
}

export async function PATCH(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await req.json();

    for (let i = 0; i < payload.length; i++) {
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
        creditableOvertime,
      } = payload[i];

      await Attendance.update(
        {
          timeIn: timeIn,
          timeOut: timeOut,
          lunchTimeIn: lunchTimeIn,
          lunchTimeOut: lunchTimeOut,
          overtimeHours: overtimeHours,
          undertimeHours: undertimeHours,
          lateHours: lateHours,
          nightDiffHours: nightDiffHours,
          isLeave: isLeave,
          isPresent: isPresent,
          isDayOff: isDayOff,
          creditableOvertime: creditableOvertime,
        },
        {
          where: {
            attendanceId: attendanceId,
          },
        }
      );
    }

    return NextResponse.json({
      severity: 'success',
      success: true,
      message: 'Successfully Updated',
      data: payload,
    });
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else {
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
    }
  }
}

export async function DELETE(req: Request, res: Response) {
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
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.departmentId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Deletion failed. No department set for this cycle.',
          },
          { status: 400 }
        );
      }

      const payrolls = await Payroll.findAll({
        where: {
          businessMonth: item.businessMonth,
          cycle: item.cycle,
          companyId: companyId,
          departmentId: item.departmentId,
          isPosted: 0,
        },
      });

      // Deletes Payroll deduction
      const payrollIDs = payrolls.map((i: any) => i.payroll_id);
      await PayrollDeductions.destroy({
        where: {
          payroll_id: {
            [Op.in]: payrollIDs,
          },
        },
      });

      // Deletes Payroll entries
      await Payroll.destroy({
        where: {
          payroll_id: {
            [Op.in]: payrollIDs,
          },
        },
      });

      // Set back Attendance to unposted
      const employeeIDs = payrolls.map((i: any) => i.employeeId);

      // Check if Night diff config is still enabled
      // If not, set night diff hours to 0
      const companyDetails: any = await Company.findByPk(companyId);

      const departmentDetails: any = await Department.findByPk(
        item.departmentId
      );
      if (
        !companyDetails.nightDifferential &&
        !departmentDetails.applyNightDiff
      ) {
        await Attendance.update(
          {
            nightDiffHours: 0,
            isPosted: false,
            datePosted: null,
          },
          {
            where: {
              businessMonth: item.businessMonth,
              cycle: item.cycle,
              companyId: companyId,
              departmentId: item.departmentId,
              employeeId: {
                [Op.in]: employeeIDs,
              },
            },
          }
        );
      } else {
        const attendancesToRecalculate: any = await Attendance.findAll({
          where: {
            businessMonth: item.businessMonth,
            cycle: item.cycle,
            companyId: companyId,
            departmentId: item.departmentId,
            employeeId: {
              [Op.in]: employeeIDs,
            },
          },
        });
        for (let i = 0; i < attendancesToRecalculate.length; i++) {
          const attendance = attendancesToRecalculate[i];
          // if (attendance.employeeId == 4) {
          //   console.log('data!');
          // }
          let shift = null;
          const getShiftDetails = await getCurrentOrNewShiftDetails({
            employeeId: attendance.employeeId,
            attendanceDate: attendance.date,
          });
          if (getShiftDetails.success) {
            shift = getShiftDetails.shift;
          }

          let nightDiffHours = 0;
          if (
            attendance.isPresent ||
            (attendance.isHalfDay && attendance.isLeave)
          ) {
            nightDiffHours = getNightDifferentialHours(
              attendance.date,
              attendance.timeIn,
              attendance.lunchTimeOut,
              attendance.lunchTimeIn,
              attendance.timeOut,
              companyDetails.nightDifferentialStartHour,
              companyDetails.nightDifferentialEndHour,
              shift.timeIn
            );
          }
          await Attendance.update(
            {
              nightDiffHours: nightDiffHours,
              isPosted: false,
              datePosted: null,
            },
            {
              where: {
                attendanceId: attendance.attendanceId,
              },
            }
          );
        }
      }
      await ActivityLog.create({
        companyId: companyId,
        userId: userId,
        message: `Deleted Payroll [${departmentDetails.departmentName} - ${item.businessMonth} - ${item.cycle}]`,
      });
    }
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully deleted',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.log(error);
    } else
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