import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes, Sequelize } from 'sequelize';
import {} from '@constant/storedProcedures';
import { executeQuery } from 'db/connection';
import { tokenChecker } from '@utils/apiEndpointFunctions';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await tokenChecker(userToken);

    if (!tokenValid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    let clock_status = 'CLOCK IN';
    const { searchParams } = new URL(req.url);
    const ckycId = searchParams.get('ckycId');
    const dateTime = searchParams.get('dateTime');

    const get_clock_status = await executeQuery(
      'attendance_clock_in_out_status',
      {
        ckycId: ckycId,
        dateTime: dateTime,
      },
      [],
      QueryTypes.SELECT
    );

    console.log('get_clock_status:', get_clock_status);

    const result = {
      timeIn: null,
      lunchTimeOut: null,
      lunchTimeIn: null,
      timeOut: null,
      ...(get_clock_status[0] || {}),
    };
    const {
      timeIn = null,
      lunchTimeOut = null,
      lunchTimeIn = null,
      timeOut = null,
    }: any = result;

    // timeIn, lunchTimeOut, lunchTimeIn, timeOut
    switch (true) {
      case !timeIn:
        clock_status = 'CLOCK IN';
        break;
      case !timeOut:
        clock_status = 'CLOCK OUT';
        break;
      case !lunchTimeIn:
        clock_status = 'CLOCK IN';
        break;
      case !lunchTimeOut:
        clock_status = 'CLOCK OUT';
        break;
      default:
        clock_status = 'COMPLETED';
        break;
    }

    return NextResponse.json({
      clock_status: clock_status,
      attendance: result,
    });
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting clockin/out status:', error.message);
    } else {
      console.log(error);
    }
    return NextResponse.json({
      success: false,
      summary: error.message,
      error: error,
    });
  }
}
