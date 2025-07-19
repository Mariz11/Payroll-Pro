import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Department, TaskProcesses } from 'db/models';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const seshData: any = await sessionData();

  try {
    const stuckUpTasks: any = await TaskProcesses.findAll({
      attributes: [
        'taskId',
        'taskName',
        'departmentName',
        'businessMonth',
        'cycle',
      ],
      where: {
        userId: seshData.userId,
        status: 2,
      },
    });

    return NextResponse.json(stuckUpTasks);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error getting stuck up tasks on api/configurations/processes/interruptedProcesses:',
        error.message
      );
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PUT(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    // Parse taskIds from the request body
    const body = await req.json();
    const { taskIds } = body;

    await TaskProcesses.update(
      {
        status: 1,
      },
      {
        where: {
          taskId: taskIds,
        },
      }
    );

    return NextResponse.json({ message: 'Tasks updated successfully' });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(
        'Error updating tasks on api/configurations/processes/interruptedProcesses:',
        error.message
      );
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}