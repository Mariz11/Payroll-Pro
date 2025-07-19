import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { TaskProcesses } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: Request, res: Response, nextReq: NextRequest) {
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const userId = seshData.userId;
  try {
    const { token, processingTasks } = await req.json();
    const tokenValid = await isValidToken(token);
    if (!tokenValid) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let dynamicWhere: any = {
      companyId: companyId,
      userId: userId,
      status: 0,
    };

    if (processingTasks.length > 0) {
      dynamicWhere = {
        taskCode: processingTasks.map((i: any) => i.taskId),
      };
    }

    await TaskProcesses.update(
      {
        status: 2,
      },
      {
        where: dynamicWhere,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully Cancelled',
    });
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
