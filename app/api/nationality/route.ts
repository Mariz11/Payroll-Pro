import { NextRequest, NextResponse } from 'next/server';
import { isValidToken } from '@utils/jwt';
import { getNationality } from '@utils/partnerAPIs';

export async function GET(req: NextRequest, res: NextResponse) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken)
  if (!tokenValid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const nationality = await getNationality();
    return NextResponse.json({ sucess: true, data: nationality });
  } catch (error: any) {
    return NextResponse.json({message: error instanceof Error ? error.message : 'Unknown error'}, { status: 500 });
  }
}
