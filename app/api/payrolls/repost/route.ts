import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
// import { postPayroll } from '@utils/mainFunctions';
import { Company } from 'db/models';
import { NextResponse } from 'next/server';

export async function POST(req: Request, res: Response) {
  return NextResponse.json('Temporary disabled');
  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  // try {
  //   const payload = await req.json();
  //   const uuid = payload.uuid;
  //   const departmentId = payload.departmentId;
  //   const businessMonthCycle = payload.businessMonthCycle.split(' - ');
  //   const businessMonth = businessMonthCycle[0];
  //   const cycle = businessMonthCycle[1];
  //   // const disbursementSchedule = payload.disbursementSchedule;
  //   const companyDetails: any = await Company.findByPk(companyId);

  //   const response = await postPayroll({
  //     uuid: uuid,
  //     businessMonthCycle: businessMonthCycle,
  //     businessMonth: businessMonth,
  //     cycle: cycle,
  //     departmentId: departmentId,
  //     companyDetails: companyDetails,
  //     isReposting: true,
  //   });

  //   return NextResponse.json(response);
  // } catch (error: any) {
  //   return NextResponse.json({
  //     severity: 'error',
  //     success: false,
  //     error: error.message,
  //     message: 'Something went wrong...',
  //   });
  // }
}
