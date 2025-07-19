import { NextRequest, NextResponse } from 'next/server';
import {
  isValidToken,
  selectedCompanyData,
  sessionData,
} from '@utils/jwt';

import { QueryTypes } from 'sequelize';
import { getCycleDates } from '@utils/companyDetailsGetter';
import moment from '@constant/momentTZ';
import { attendanceImportHeaders } from '@constant/csvData';
import { removeExtraSpaces } from '@utils/helper';
import { ATTENDANCES_GET_EMPLOYEES } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { executeQuery } from 'db/connection';
import { transformPaginatedData } from '@utils/transformPaginatedData';

// Cache for processed cycle dates
const cycleDateCache = new Map<string, any[]>();

// Pre-process headers once
const processedHeaders = attendanceImportHeaders.map(header => header.label);

export async function GET(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');

  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const businessMonth = url.searchParams.get('businessMonth');
    const cycle = url.searchParams.get('cycle');
    const companyId = url.searchParams.get('companyId');
    const departmentId = url.searchParams.get('departmentId');
    const search = url.searchParams.get('search');
    const isPosted = url.searchParams.get('isPosted');

    const dataList = await executeQuery(ATTENDANCES_GET_EMPLOYEES, {
      companyId,
      businessMonth,
      departmentId,
      isPosted,
      cycle,
      search,
      offset,
      limit,
    }, [], QueryTypes.SELECT, null, QueryReturnTypeEnum.RAW);

    const attendanceData = transformPaginatedData(dataList);

    return NextResponse.json({
      count: attendanceData.count ?? [],
      rows: attendanceData.rows ?? [],
    });
  } catch (error: any) {
    console.log(error);
    if (error.name && error.name === 'SequelizeDatabaseError') {
      console.error('Error fetching attendances:', error.message);
    } else return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(req: Request, res: Response, next: NextRequest) {
  const userToken: any = req.headers.get('Authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid)
    return NextResponse.json(
      { message: 'Unauthorized', summary: 'Unauthorized' },
      { status: 401 }
    );
  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;

  try {
    const payload = await req.json();
    const BATCH_SIZE = 1000;
    const CACHE_KEY = `${payload.businessMonth}-${payload.cycle}-${payload.payrollType}`;

    // Check cache for processed cycle dates
    let processedCycleDates: any = cycleDateCache.get(CACHE_KEY);
    if (!processedCycleDates) {
      const cycleDates = await getCycleDates({
        cycle: payload.cycle,
        businessMonth: payload.businessMonth,
        payrollType: payload.payrollType,
        semiWeeklyStartDate: payload.startDate,
        semiWeeklyEndDate: payload.endDate,
      });

      processedCycleDates = cycleDates.map((date: any) => ({
        date: moment(date),
        dayName: moment(date).format('dddd').toUpperCase()
      }));

      cycleDateCache.set(CACHE_KEY, processedCycleDates);
    }

    // Combined query for employees with and without shifts
    const [noShift, employeeList, excludedEmployees]: any = await Promise.all([
      executeQuery(`attendances_employees_without_shifts_get_list`, {
        companyId,
        employeeStatus: 1,
        departmentId: payload.departmentId,
      }),
      executeQuery('attendances_employees_get_shift_list', {
        companyId,
        departmentId: payload.departmentId,
        businessMonth: payload.businessMonth,
        cycle: payload.cycle,
        employeeStatus: 1,
        withPayroll: 0
      }),
      executeQuery('attendances_employees_get_shift_list', {
        companyId,
        departmentId: payload.departmentId,
        businessMonth: payload.businessMonth,
        cycle: payload.cycle,
        employeeStatus: 1,
        withPayroll: 1
      })
    ]);

    if (noShift.length > 0) {
      return NextResponse.json({
        severity: 'error',
        success: false,
        summary: `Please assign shift first on the ff employees [${noShift
          .map((item: any) => item.employeeFullName)
          .join(', ')}]`,
      });
    }

    const employees = employeeList?.map((item: any) => item.employees);

    if (employees.length == 0 && excludedEmployees[0]?.total_employees_with_payroll == 0) {
      return NextResponse.json({
        severity: 'warn',
        success: false,
        summary: 'No Employee records found',
      });
    }

    const finalData = [[`${payload.businessMonth}-${payload.cycle}`], []];
    let processedCount = 0;
    const totalEmployees = employees.length;

    try {
      for (let i = 0; i < employees.length; i += BATCH_SIZE) {
        const batch = employees.slice(i, i + BATCH_SIZE);
        const batchResults = [];

        for (const employee of batch) {
          // Process employee data
          const daysOff = employee.dayOff ?
            new Set(employee.dayOff.split(',').map((day: any) =>
              removeExtraSpaces(day.toUpperCase()))) : new Set();

          // Pre-process shift times once per employee
          const shiftTimes = {
            timeIn: moment(employee.shift.timeIn, 'HH:mm:ss'),
            timeOut: moment(employee.shift.timeOut, 'HH:mm:ss'),
            lunchStart: moment(employee.shift.lunchStart, 'HH:mm:ss'),
            lunchEnd: moment(employee.shift.lunchEnd, 'HH:mm:ss')
          };

          // Generate attendance rows
          const attendanceDataArr = processedCycleDates.map((cycleDate: any) => {
            const isDayOff = daysOff.has(cycleDate.dayName);
            return [
              cycleDate.date.format('MM/DD/YYYY'),
              isDayOff ? '' : shiftTimes.timeIn.format('LT'),
              isDayOff ? '' : shiftTimes.lunchStart.format('LT'),
              isDayOff ? '' : shiftTimes.lunchEnd.format('LT'),
              isDayOff ? '' : shiftTimes.timeOut.format('LT'),
              isDayOff ? 'DAY-OFF' : 'PRESENT'
            ];
          });

          // Add to batch results
          batchResults.push(
            [employee.employeeCode, employee.employee_profile.employeeFullName],
            processedHeaders,
            ...attendanceDataArr,
            []
          );

          processedCount++;
          if (processedCount % 100 === 0) {
            console.log(`Processed ${processedCount}/${totalEmployees} employees (${Math.round((processedCount / totalEmployees) * 100)}%)`);
          }
        }

        // Add batch results to final data
        finalData.push(...batchResults);

        // Clear memory
        batchResults.length = 0;
        if (global.gc) {
          global.gc();
        }
      }

      let response: any = {
        success: true,
        severity: 'success',
        summary: 'Attendance template downloaded successfully',
        data: finalData,
      };

      if (finalData.length <= 2 || (employees.length == 0 && excludedEmployees[0]?.total_employees_with_payroll > 0)) {
        response = {
          success: false,
          severity: 'warn',
          summary: 'Attendance template downloaded unsuccessfully',
          detail: 'All Employees already have existing payroll data or have not started in this specific business month and cycle',
        };
      } else if (excludedEmployees[0]?.total_employees_with_payroll > 0) {
        response = {
          data: finalData,
          success: true,
          severity: 'warn',
          summary: 'Attendance template downloaded successfully',
          detail: 'Employees that already have payroll and employees that have not started in this specific business month and cycle are excluded.',
        };
      }

      return NextResponse.json(response);

    } catch (batchError) {
      console.error('Error processing batch:', batchError);
      return NextResponse.json({
        severity: 'error',
        success: false,
        summary: 'Error processing employee data',
        detail: `Processed ${processedCount}/${totalEmployees} employees before error`
      });
    }

  } catch (error) {
    return NextResponse.json(error);
  }
}
