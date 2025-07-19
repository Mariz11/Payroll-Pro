import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Department, TaskProcesses } from 'db/models';
import { executeQuery } from 'db/connection';
import { QueryTypes } from 'sequelize';

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const seshData: any = await sessionData();
  const companyId = seshData.companyId;

  try {
    const body = await req.json();
    const { taskCode, taskName, departmentName, businessMonth, cycle } = body;

    const res = await executeQuery(
      'tasks_processes_insert',
      {
        userId: seshData.userId,
        taskCode: taskCode,
        companyId: companyId,
        taskName: taskName,
        departmentName: departmentName,
        businessMonth: businessMonth,
        cycle: cycle,
        status: 0,
      },
      [],
      QueryTypes.INSERT
    );

    return NextResponse.json({ message: 'Task process inserted successfully', result: res });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error inserting task process on api/configurations/processes/logProcesses:',
        error.message
      );
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function UPDATE(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    // Parse taskCode from the request body
    const body = await req.json();
    const { taskCode } = body;

    const res = await executeQuery(
      `tasks_processes_update`,
      {
        p_taskCode: taskCode,
        p_userId: null,
        p_companyId: null,
        p_taskName: null,
        p_departmentName: null,
        p_businessMonth: null,
        p_cycle: null,
        status: 1,
      },
      [],
      QueryTypes.UPDATE
    );

    return NextResponse.json({ message: 'Task process updated successfully', result: res });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error updating task process on api/configurations/processes/logProcesses:',
        error.message
      );
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}