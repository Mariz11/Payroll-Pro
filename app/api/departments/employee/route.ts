import { NextRequest, NextResponse } from 'next/server';
import { Employee, EmployeeProfile, User } from 'db/models';
import { isValidToken } from '@utils/jwt';
import { sessionData, selectedCompanyData } from '@utils/jwt';
import { Op, QueryTypes } from 'sequelize';
import connection, { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const { searchParams } = new URL(req.url);
  // const companyId = searchParams.get('companyId');
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
    const employees = await Employee.findAll({
      where: {
        companyId: companyId,
        employeeStatus: 1,
      },
      include: [{ model: EmployeeProfile }],
    });

    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error fetching shifts:', error);
    else return NextResponse.json({ message: error }, { status: 500 });
  }
}
export async function PUT(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const id = req.url.split('employee/')[1];
    const { departmentId, employeeIds } = await req.json();

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    if (departmentId !== undefined) {
      // employee.set('departmentId', departmentId);
      await Employee.update(
        { departmentId: departmentId },
        {
          where: {
            employeeId: {
              [Op.in]: employeeIds,
            },
          },
        }
      );
    }

    // await employee.save();

    return NextResponse.json(
      { success: true, message: employee },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error updating shift:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}

export async function PATCH(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const transaction = await connection.transaction();
  try {
    const { departmentId, employeeIds, removedEmployeeIds } = await req.json();

    if (departmentId !== undefined || departmentId !== null) {
      // Process employeeIds in batches of 1000
      const batchSize = 1000;
      for (let i = 0; i < employeeIds.length; i += batchSize) {
        const batch = employeeIds.slice(i, i + batchSize);
        await executeQuery(`employees_update_department`, {
          departmentId,
          employeeIds: batch.join(',')
        }, [], QueryTypes.UPDATE, transaction as any);
      }

      // Process removedEmployeeIds in batches
      if (removedEmployeeIds.length > 0) {
        for (let i = 0; i < removedEmployeeIds.length; i += batchSize) {
          const batch = removedEmployeeIds.slice(i, i + batchSize);
          await executeQuery(`employees_remove_department`, {
            departmentId,
            employeeIds: batch.join(',')
          }, [], QueryTypes.UPDATE, transaction as any);
        }
      }

      await transaction.commit();
    }

    return NextResponse.json(
      { success: true, message: 'success' },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError')
      console.error('Error updating shift:', error);
    else
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
  }
}
