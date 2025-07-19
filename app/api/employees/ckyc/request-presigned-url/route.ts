import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { isValidToken } from '@utils/jwt';
import { requestPreSignedImageURLS } from '@utils/partnerAPIs';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  const url = new URL(req.url);
  const ckycId: any = url.searchParams.get('ckycId');

  const userToken: any = req.headers.get('authorization');
  const formData = await req.formData();
  const file: any = formData.get('file');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!file) {
    return NextResponse.json({ error: 'No files received.' }, { status: 400 });
  }

  const { type, name } = file;
  const extension = name.split('.').pop();
  if (hasHtmlTags(type) || hasHtmlTags(name)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible script tags' },
      { status: 400 }
    );
  }
  if (hasSQLKeywords(type) || hasSQLKeywords(name)) {
    return NextResponse.json(
      { success: false, message: 'Input/s contain/s possible SQL keywords' },
      { status: 400 }
    );
  }

  try {
    const requestPreSignedURL = await requestPreSignedImageURLS({
      ckycId: ckycId,
      images: [
        {
          mimeType: type,
          fileName: 'customerPhoto',
          extension: extension,
        },
      ],
    });

    if (!requestPreSignedURL.success) {
      return NextResponse.json(requestPreSignedURL, {
        status: requestPreSignedURL.statusCode,
      });
    }
    const presignedURL = requestPreSignedURL.responseData.data[0];

    return NextResponse.json(presignedURL);
  } catch (e: any) {
    return NextResponse.json(e);
  }
}
