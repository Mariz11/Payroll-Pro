import { hasHtmlTags, hasSQLKeywords } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { AllowanceBreakdown } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const allowanceBreakdowns = await AllowanceBreakdown.findAll({
      where: {
        companyId: companyId,
      },
    });
    return NextResponse.json(
      { sucess: true, message: allowanceBreakdowns },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching allowance breakdowns:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  const { allowanceType, amount } = await req.json();
  await req.json();

  try {
    if (hasHtmlTags(allowanceType) || hasHtmlTags(amount)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }
    if (hasSQLKeywords(allowanceType) || hasSQLKeywords(amount)) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible SQL keywords' },
        { status: 400 }
      );
    }
    const data = await AllowanceBreakdown.create({
      companyId: companyId,
      allowanceType: allowanceType,
      amount: amount,
    });

    return NextResponse.json({ success: true, message: data }, { status: 200 });
  } catch (error) {
    console.error('Error creating user role:', error);
    return NextResponse.json(error);
  }
}
