import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import connection, { executeQuery } from 'db/connection';
import { createActivityLog } from '@utils/activityLogs';

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken)
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { companyId, userId, departmentIds } = await req.json();
  const joinedDepartmentIds = departmentIds?.join(',');
  const transaction = await connection.transaction();

  try {

    const departments = await executeQuery(`departments_get_by_ids`, {
      departmentIds: joinedDepartmentIds
    })

    const checkAttendances = await executeQuery(`attendances_get_by_department_ids`,
      {
        departmentIds: joinedDepartmentIds,
        isPosted: 0
      })

    const checkPayrolls = await executeQuery(`payroll_get_by_department_ids`,
      {
        departmentIds: joinedDepartmentIds,
        isPosted: 0
      })

    const attendanceApplications = await executeQuery(`attendance_applications_get_by_departments`, {
      departmentIds: joinedDepartmentIds,
      isApproved: 0
    })

    const checkAttendanceApplications = attendanceApplications?.map((attendanceApplication: any) => attendanceApplication?.result);

    const deductions = await executeQuery(`deductions_get_by_departments`, {
      departmentIds: joinedDepartmentIds,
      isPosted: 0,
      isUnsettled: 0
    })

    const checkPendingDeductions = await deductions?.map((pendingDeductions: any) => pendingDeductions?.result);

    const unsettledDeductions = await executeQuery(`deductions_get_by_departments`, {
      departmentIds: joinedDepartmentIds,
      isPosted: 1,
      isUnsettled: 1
    })

    const checkUnsettledDeductions = unsettledDeductions?.map((unsettledDeduction: any) => unsettledDeduction?.result)


    if (!departments) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Department/s not found' },
        { status: 404 }
      );
    }
    if (checkAttendances.length > 0) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because some selected department still has attendance entries with a pending status.',
        },
        { status: 409 }
      );
    }
    if (checkAttendanceApplications.length > 0) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because some selected department still has attendance application entries with a pending status.',
        },
        { status: 409 }
      );
    }
    if (checkPayrolls.length > 0) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because some selected department still has payroll entries with a pending status.',
        },
        { status: 409 }
      );
    }
    if (checkPendingDeductions.length > 0) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        message: 'Unable to proceed because some selected department still has pending deductions.',
      },
        { status: 409 });
    }
    if (checkUnsettledDeductions.length > 0) {
      await transaction.rollback();
      return NextResponse.json({
        success: false,
        message: 'Unable to proceed because some selected department still has unsettled deductions.',
      },
        { status: 409 });
    }
    // Remove departmentId of Employees
    await executeQuery(`employees_remove_department_by_departments`, {
      departmentIds: joinedDepartmentIds
    }, [], QueryTypes.UPDATE, transaction as any)

    // Delete department
    await executeQuery(`departments_soft_delete_by_departments`, {
      departmentIds: joinedDepartmentIds
    }, [], QueryTypes.UPDATE, transaction as any);

    await createActivityLog(companyId, userId, 'Deleted departments', transaction);

    await transaction.commit();

    return NextResponse.json(
      { success: true, message: 'Department/s deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error deleting Department/s:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

