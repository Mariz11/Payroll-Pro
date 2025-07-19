import { executeQuery } from 'db/connection';
import { NextResponse } from 'next/server';
import { LOCATION_CRON_UPDATE_LOCATIONS_STATUS_TO_EXPIRED } from '@constant/storedProcedures';
import moment from '@constant/momentTZ';

export async function GET() {
  try {
    const result: any = await executeQuery(
      LOCATION_CRON_UPDATE_LOCATIONS_STATUS_TO_EXPIRED
    );
    const { message, affectedRows, datelog } = result?.[0];

    return NextResponse.json(
      {
        success: true,
        message: message || 'Locations status updated successfully',
        affectedRows: affectedRows || 0,
        date: datelog ? moment(datelog).format('YYYY-MM-DD HH:mm:ss') : null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', content: error },
      { status: 500 }
    );
  }
}
