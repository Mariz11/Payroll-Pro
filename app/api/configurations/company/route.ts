import { isValidToken, selectedCompanyData, sessionData } from "@utils/jwt";
import { logger } from "@utils/logger";
import { executeQuery } from "db/connection";
import { Company } from "db/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('authorization');
  const log = (message: string, data?: any) => {
    logger.info(`[Get Company details] ${message}`, data || '');
  };
  const url = new URL(req.url);
  const seshData: any = await sessionData();
  const tokenValid = await isValidToken(userToken);
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const company = await Company.findOne({
      where: {
        companyId: companyId,
      },
    });


    return NextResponse.json(
      { message: company, success: true },
      { status: 200 }
    );
  } catch (err: any) {
    log("Error getting company details", { error: err });
    if (err.name === 'SequelizeDatabaseError') return console.log(err.message);
    console.log(err.message);
    return NextResponse.json(
      { message: err.message, success: false },
      { status: 500 }
    );
  }
}