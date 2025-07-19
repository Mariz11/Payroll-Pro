import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { TaskProcesses } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response, nextReq: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  // const companyId = searchParams.get('companyId');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const task = await TaskProcesses.findAll({
      where: {
        companyId: companyId,
        isAcknowledged: 0,
      },
      order: [['taskId', 'DESC']],
    });

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error fetching shifts:', error);
    } else {
      return NextResponse.json(
        { message: error, success: false },
        { status: 500 }
      );
    }
  }
}

export async function PUT(req: Request, res: Response, nextReq: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { taskId, action } = await req.json();

    let updateObjs: any = {
      isAcknowledged: true,
      status: 'Completed',
    };
    if (action == 'CANCEL') {
      updateObjs = {
        status: 'Cancelled',
        isAcknowledged: 1,
      };
    }
    await TaskProcesses.update(updateObjs, {
      where: {
        taskId: taskId,
      },
    });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('error fetching shifts:', error);
    } else {
      return NextResponse.json(
        { message: error, success: false },
        { status: 500 }
      );
    }
  }
}
