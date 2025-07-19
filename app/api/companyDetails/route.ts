import { NextRequest, NextResponse } from 'next/server';
import { isValidToken, signJWTAccessToken } from '@utils/jwt';
import company from 'db/models/company';
import { cookies } from 'next/headers';
import { CompanyPayCycle } from 'db/models';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');

  const url = new URL(req.url);
  const companyId = Number(url.searchParams.get('companyId'));
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const companyData = await company.findOne({
    attributes: [
      'companyId',
      'tierLabel',
      'companyName',
      'companyAddress',
      'accountId',
      'subAccountId',
      'maxEmployee',
      'chargePerEmployee',
      'emailAddress',
      'urlLogo',
      'defaultColor',
    ],
    where: {
      companyId: companyId,
    },
    include: [
      {
        attributes: {
          exclude: ['deductibleContributions'],
        },
        model: CompanyPayCycle,
      },
    ],
  });

  if (companyData) {
    const TOKEN_AGE = process.env.TOKEN_AGE
      ? parseInt(process.env.TOKEN_AGE)
      : 86400000;
    const token = await signJWTAccessToken(companyData.toJSON());
    cookies().set('selected-company', token, {
      expires: Date.now() + TOKEN_AGE,
      httpOnly: true,
      secure: true,
    });
  } else {
    cookies().delete('selected-company');
  }

  return NextResponse.json({ companyData }, { status: 200 });
}
