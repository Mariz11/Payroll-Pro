import { getRequestLogger } from '@utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const requestLogger = getRequestLogger(req);
  const userToken: any = req.headers.get('authorization');

  return NextResponse.json(
    {
      success: false,
      message: 'This endpoint is not available.',
      statusCode: 409,
    },
    { status: 409 }
  );
}
