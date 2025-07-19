import { uuidv4 } from '@utils/helper';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { Company, Department } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
// import {
//   ML_SMS_PASSWORD,
//   ML_SMS_SENDER,
//   ML_SMS_USERNAME,
//   SMS_API,
// } from '@constant/partnerAPIDetails';
// import { postPayroll } from '@utils/mainFunctions';

export async function POST(req: Request, res: Response, next: NextRequest) {
  return NextResponse.json('Temporary disabled');

  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  // try {
  //   // throw new Error('Unauthorized');
  //   const companyDetails: any = await Company.findByPk(companyId);
  //   let data = await req.json();

  //   // remove duplicate department IDs
  //   data = data.filter(
  //     (item: any, index: number, arr: any) =>
  //       !arr
  //         .map((item2: any) => item2.departmentId)
  //         .includes(item.departmentId, index + 1)
  //   );

  //   const responses = [];
  //   for (let x = 0; x < data.length; x++) {
  //     const item = data[x];
  //     const uuid = uuidv4();
  //     const departmentId = item.departmentId;
  //     const departmentDetails: any = await Department.findByPk(departmentId);
  //     const businessMonthCycle = item.businessMonthCycle.split(' - ');
  //     const businessMonth = businessMonthCycle[0];
  //     const cycle = businessMonthCycle[1];

  //     // posting payroll logic start
  //     const response = await postPayroll({
  //       uuid: uuid,
  //       businessMonthCycle: businessMonthCycle,
  //       businessMonth: businessMonth,
  //       cycle: cycle,
  //       departmentId: departmentId,
  //       companyDetails: companyDetails,
  //       isReposting: false,
  //     });
  //     responses.push({
  //       ...response,
  //       departmentName: `${departmentDetails.departmentName} - [${businessMonth} - ${cycle}]`,
  //     });
  //   }

  //   return NextResponse.json(responses);
  // } catch (error: any) {
  //   return NextResponse.json({
  //     severity: 'error',
  //     success: false,
  //     error: error.message,
  //     errorName: error?.name,
  //     message: error.message,
  //   });
  // }
}
