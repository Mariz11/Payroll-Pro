import { NextResponse } from 'next/server';

export async function POST(
  req: Request
  //   { params }: { params: { id: string } }
) {
  return NextResponse.json(
    {
      success: false,
      message: 'This endpoint is not available.',
      statusCode: 409,
    },
    { status: 409 }
  );
}
