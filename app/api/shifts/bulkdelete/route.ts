import { NextRequest, NextResponse } from 'next/server';
import {
  Shift,
  Employee,
  Department,
  ActivityLog,
  EmployeeProfile,
} from 'db/models';
import { isValidToken } from '@utils/jwt';
import { Op, QueryTypes } from 'sequelize';
import connection, { executeQuery } from 'db/connection';
import { createActivityLog } from '@utils/activityLogs';

export async function DELETE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { companyId, userId, shiftIds } = await req.json();

  const transaction = await connection.transaction();
  try {

    const [shifts] = await executeQuery(`shifts_delete_bulk`, {
      shiftIds: JSON.stringify(shiftIds),
    }, [], QueryTypes.UPDATE, transaction as any);

    if (!shifts) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: 'Shifts not found' },
        { status: 404 }
      );
    }

    await executeQuery(`employees_nullify_shift`, {
      shiftIds: JSON.stringify(shiftIds),
    }, [], QueryTypes.UPDATE, transaction as any);

    await createActivityLog(companyId, userId, 'Deleted shifts', transaction);

    await transaction.commit();

    return NextResponse.json(
      { success: true, message: 'Shift/s deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    await transaction.rollback();
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error deleting shift:', error);
    } else {
      return NextResponse.json(
        { success: false, message: error },
        { status: 500 }
      );
    }
  }
}
