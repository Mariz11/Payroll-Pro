import { NextRequest, NextResponse } from 'next/server';
import {
  Employee,
  Department,
  ActivityLog,
  EmployeeProfile,
  Attendance,
  Payroll,
  AttendanceApplication,
  Deduction,
} from 'db/models';
import { isValidToken } from '@utils/jwt';
import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import connection, { executeQuery } from 'db/connection';
import { createActivityLog } from '@utils/activityLogs';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const id = req.url.split('departments/')[1];
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const department = await Department.findByPk(id, {
      include: [
        {
          attributes: ['employeeId', 'departmentId'],
          model: Employee,

          include: [
            {
              attributes: [
                'employeeProfileId',
                'firstName',
                'lastName',
                'middleName',
                'suffix',
                'employeeFullName',
              ],
              model: EmployeeProfile,
            },
          ],
        },
      ],
    });
    return NextResponse.json(
      { success: true, message: department },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching Departments:', error);
    else
      return NextResponse.json(
        { success: false, message: 'Error fetching Departments' },
        { status: 500 }
      );
  }
}

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const transaction = await connection.transaction();
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { companyId, userId } = await req.json();

  try {
    const id = req.url.split('departments/')[1];

    const joinedDepartmentIds = [id].join(',');

    const [department]: any = await executeQuery(`departments_get`, { departmentId: id });

    const [checkAttendance]: any = await executeQuery(`attendances_get_one`,
      { departmentId: id, isPosted: 0 }
    )

    const [checkPayroll] = await executeQuery(`payroll_get_basic`, { departmentId: id, isPosted: 0 });

    const [attendanceApplications]: any = await executeQuery(`attendance_applications_get_by_departments`, {
      departmentIds: joinedDepartmentIds,
      isApproved: 0
    })
    const checkAttendanceApplication = attendanceApplications?.result ?? null;

    const [deductions]: any = await executeQuery(`deductions_get_by_departments`, {
      departmentIds: joinedDepartmentIds,
      isPosted: 0,
      isUnsettled: 0
    })

    const checkPendingDeductions = deductions?.result ?? null;

    const [unSettledDeductions]: any = await executeQuery(`deductions_get_by_departments`, {
      departmentIds: joinedDepartmentIds,
      isPosted: 1,
      isUnsettled: 1
    })
    const checkUnsettledDeductions = unSettledDeductions?.result ?? null;

    if (!department) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }
    if (checkAttendance) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because this department still has attendance entries with a pending status.',
        },
        { status: 409 }
      );
    }
    if (checkAttendanceApplication) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because this department still has attendance application entries with a pending status.',
        },
        { status: 409 }
      );
    }
    if (checkPayroll) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because this department still has payroll entries with a pending status.',
        },
        { status: 409 }
      );
    }
    if (checkPendingDeductions) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because this department still has pending deductions.',
        },
        { status: 409 }
      );
    }
    if (checkUnsettledDeductions) {
      await transaction.rollback();
      return NextResponse.json(
        {
          success: false,
          message:
            'Unable to proceed because this department still has unsettled deductions.',
        },
        { status: 409 }
      );
    }

    // Remove departmentId of Employees
    await executeQuery(`employees_remove_department_by_departments`, {
      departmentIds: joinedDepartmentIds
    }, [], QueryTypes.UPDATE, transaction as any)

    // Delete department
    await executeQuery(`departments_soft_delete_by_departments`, {
      departmentIds: joinedDepartmentIds
    }, [], QueryTypes.UPDATE, transaction as any);

    await createActivityLog(companyId, userId, 'Deleted a Department', transaction);

    await transaction.commit();
    return NextResponse.json(
      { success: true, message: 'Department deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error deleting Department:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const transaction = await connection.transaction();
  try {
    const id = req.url.split('departments/')[1];
    const { departmentName, companyId, userId } = await req.json();
    if (hasHtmlTags(departmentName)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    if (hasSQLKeywords(departmentName)) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }

    const [department]: any = await executeQuery(`departments_get`, { departmentId: id });
    if (!department) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }

    // Update Holiday properties
    await executeQuery(`departments_update`, {
      departmentId: department.departmentId,
      departmentName: departmentName
    }, [], QueryTypes.UPDATE, transaction as any);

    await createActivityLog(companyId, userId, 'Updated a Department', transaction);

    await transaction.commit();
    return NextResponse.json(
      { success: true, message: 'Department updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error updating Department:', error.message);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
