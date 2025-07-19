import { NextRequest, NextResponse } from 'next/server';
import { Module, ModuleAction } from 'db/models';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { includes } from 'lodash';

export async function GET(req: Request, res: Response) {
  const userToken: any = req.headers.get('authorization');
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const search = url.searchParams.get('search');
    const modules = await Module.findAll({
      include: [{ model: ModuleAction, required: false }],
    });
    return NextResponse.json(
      { sucess: true, message: modules },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
