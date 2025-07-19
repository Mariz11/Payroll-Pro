import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { NextRequest, NextResponse } from 'next/server';

import { hasHtmlTags } from '@utils/helper';
import { Attendance, Employee, EmployeeProfile, Holiday } from 'db/models';

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const employeeId = seshData.employeeId;

  try {
    const url = new URL(req.url);
    const businessMonth = url.searchParams.get('businessMonth');
    const companyId = url.searchParams.get('companyId');
    const employeeId = url.searchParams.get('employeeId');
    const cycle = url.searchParams.get('cycle');
    if ((hasHtmlTags(businessMonth), hasHtmlTags(cycle))) {
      return NextResponse.json(
        { success: false, message: 'Input/s contain/s possible script tags' },
        { status: 400 }
      );
    }

    // if(hasSQLKeywords(businessMonth) || hasSQLKeywords(cycle)) {
    //   return NextResponse.json({ success: false, message: 'Input/s contain/s possible SQL keywords' }, { status: 400 });

    // }
    const data = await Employee.findOne({
      where: {
        employeeId: employeeId,
      },
      include: [
        {
          model: EmployeeProfile,
        },
        {
          model: Attendance,
          where: {
            businessMonth,
            companyId,
            employeeId,
            cycle,
          },
          attributes: [
            'date',
            'isPresent',
            'isDayOff',
            'isLeave',
            'overtimeHours',
          ],
          include: [
            {
              attributes: ['holidayType'],
              model: Holiday,
            },
          ],
        },
      ],

      attributes: {
        exclude: [
          'snackStart',
          'snackEnd',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      },
    });
    // const data2 = await Attendance.findAll({
    //   where: {
    //     companyId: companyId,
    //     businessMonth: businessMonth,
    //     cycle: cycle,
    //     employeeId: employeeId,
    //   },
    //   include: [
    //     {
    //       model: Employee,
    //       include: [
    //         {
    //           model: EmployeeProfile,
    //         },
    //         {
    //           attributes: ['departmentName'],
    //           model: Department,
    //         },

    //         {
    //           attributes: {
    //             exclude: [
    //               'snackStart',
    //               'snackEnd',
    //               'createdAt',
    //               'updatedAt',
    //               'deletedAt',
    //             ],
    //           },
    //           model: Shift,
    //         },
    //       ],
    //     },
    //     {
    //       model: Holiday,
    //     },
    //   ],
    // });

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching attendances:', error.message);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}
