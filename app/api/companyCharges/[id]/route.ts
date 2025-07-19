import { NextResponse } from 'next/server';
import company from 'db/models/company';
import { executeQuery } from 'db/connection';

export async function GET(req: Request, res: Response) {
  //   const userToken: any = req.headers.get('authorization');

  try {
    const companyId = req.url.split('companyCharges/')[1];
    const companyCharges = await executeQuery(`company_charges_get`, {
      companyId,
    });

    if (company) {
      return NextResponse.json(
        { success: true, message: companyCharges },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Company not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error getting company charges:', error.message);
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
    } else
      return NextResponse.json({
        severity: 'error',
        success: false,
        error: error.message,
        message: 'Something went wrong...',
      });
  }
}
