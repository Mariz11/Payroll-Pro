import { isValidToken } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { logger } from '@utils/logger';

const GENERATE_FAILED_REGISTRATION_CSV = process.env.GCP_CLOUD_FUNCTION_URL_GENERATE_FAILED_REGISTRATION_CSV || '';

export async function GET(req: Request, res: Response, next: NextRequest): Promise<Response> {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const docId = params.get('docId');

    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(GENERATE_FAILED_REGISTRATION_CSV);
    const gcfResponse = await client.request({
      url: GENERATE_FAILED_REGISTRATION_CSV,
      method: 'POST',
      data: {
        docId
      }
    });

    return NextResponse.json(gcfResponse.data);
  } catch (error) {
    logger.error({
      message: 'Failed to generate CSV',
      error
    });

    return NextResponse.json({message: `${error instanceof Error ? error.message : error}`}, { status: 500 });
  }
}
