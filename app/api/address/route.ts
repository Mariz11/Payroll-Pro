import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { executeQuery } from 'db/connection';
import { ADDRESS_GET_CITIES } from '@constant/storedProcedures';

export async function GET(req: NextRequest, res: NextResponse) {
  const userToken: any = req.headers.get('authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const address = await executeQuery(ADDRESS_GET_CITIES);
    const cityAddresses = address?.map((item: any) => item.city_data);

    return NextResponse.json(
      { success: true, data: cityAddresses },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error.message);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error(error.message);
    } else {
      return NextResponse.json(error, { status: 500 });
    }
  }
}
