import moment from '@constant/momentTZ';
import {
  ATTENDANCES_BULKIMPORT_GET_CHECK_DUPLICATE,
  ATTENDANCES_BULKIMPORT_GET_COMPANYDETAILS,
  ATTENDANCES_BULKIMPORT_GET_HOLIDAY,
  ATTENDANCES_BULKIMPORT_GET_PAYROLL_DUPLICATE,
} from '@constant/storedProcedures';
import { dateTimeFormatter } from '@utils/attendance';
import {
  computeUndertimeLateHours,
  getCurrentOrNewShiftDetails,
} from '@utils/companyDetailsGetter';
import getNightDifferentialHours from '@utils/getNightDifferentialHours';
import { isValidToken, selectedCompanyData, sessionData } from '@utils/jwt';
import { getRequestLogger } from '@utils/logger';
import connection, { executeQuery, executeRawQuery } from 'db/connection';
import { Attendance } from 'db/models';
import { NextRequest, NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';
import { createActivityLog } from '@utils/activityLogs';

interface AttendanceRecord {
  employeeCode: string;
  employeeName: string;
  businessMonth: string;
  cycle: string;
  date: string;
  timeIn: string | null;
  timeOut: string | null;
  lunchTimeIn: string | null;
  lunchTimeOut: string | null;
  status: string;
}

interface EmployeeDetails {
  employeeId: number;
  employeeCode: string;
  shiftId: number;
  departmentId: number;
  companyId: number;
  startDate: string;
  departmentName: string;
  applyNightDiff: boolean;
}

interface CompanyDetails {
  nightDifferential: boolean;
  nightDifferentialStartHour: string;
  nightDifferentialEndHour: string;
}

interface CompanyDetailsResponse extends Array<CompanyDetails> {
  0: CompanyDetails;
}

interface AttendanceApplication {
  type: string;
  dateOvertime?: string;
  fromDate?: string;
  toDate?: string;
  timeFrom?: string;
  timeTo?: string;
  isApproved: number;
  numberOfHours?: number;
}

export async function POST(req: NextRequest, res: Response) {
  const logger = getRequestLogger(req);
  const log = (message: string, data?: any) => {
    logger.info(`[Bulk Import Attendance] ${message}`, data || '');
  };

  const userToken: any = req.headers.get('authorization');
  const tokenValid = await isValidToken(userToken);
  if (!tokenValid) {
    log('Unauthorized access attempt');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const seshData: any = await sessionData();
  const selectedCompData: any = await selectedCompanyData();
  const companyId = selectedCompData
    ? selectedCompData.companyId
    : seshData.companyId;
  const userId = seshData.userId;
  const errors: Array<{ headerTitle: string; error: string }> = [];
  let departmentName = '';
  let businessMonthCycle = '';

  const transaction = await connection.transaction();

  try {
    const { data } = await req.json();
    log('Starting bulk import process', {
      recordCount: data.length,
      businessMonth: data[0]?.businessMonth,
      cycle: data[0]?.cycle,
    });

    // Group data by employee code
    const employeeGroups = (data as AttendanceRecord[]).reduce((acc: { [key: string]: AttendanceRecord[] }, curr) => {
      if (!acc[curr.employeeCode]) {
        acc[curr.employeeCode] = [];
      }
      acc[curr.employeeCode].push(curr);
      return acc;
    }, {});

    console.log(employeeGroups)

    log('Grouped attendance data by employee', {
      employeeCount: Object.keys(employeeGroups).length
    });

    // Process employees in batches of 10
    const batchSize = 10;
    const employeeEntries = Object.entries(employeeGroups);
    const batches = [];

    for (let i = 0; i < employeeEntries.length; i += batchSize) {
      batches.push(employeeEntries.slice(i, i + batchSize));
    }

    log('Split employees into batches', {
      totalBatches: batches.length,
      batchSize
    });

    let allProcessedData: any[] = [];

    // Process each batch sequentially
    for (const batch of batches) {
      // Process employees within the batch in parallel
      const batchPromises = batch.map(async ([employeeCode, employeeRecords]) => {
        let attendanceData: any[] = [];
        const { businessMonth, cycle } = employeeRecords[0];

        try {
          // Get employee details (only once per employee)
          const [employeeDetails] = await executeQuery(
            'attendances_bulkimport_get_employee_details',
            { companyId, employeeCode }
          ) as [EmployeeDetails];

          departmentName = employeeDetails.departmentName;
          businessMonthCycle = `${businessMonth} - ${cycle}`;

          if (!employeeDetails) {
            errors.push({
              headerTitle: employeeRecords[0].employeeName,
              error: 'No records matched on our database.',
            });
            return [];
          }

          // Check for duplicate payroll (only once per employee)
          const [duplicatePayrollData]: any = await executeQuery(
            ATTENDANCES_BULKIMPORT_GET_PAYROLL_DUPLICATE,
            {
              companyId,
              employeeIdParams: employeeDetails.employeeId,
              businessMonth,
              cycle,
            }
          )

          const duplicatePayroll = duplicatePayrollData?.duplicatePayroll;

          if (duplicatePayroll) {
            log('Duplicate payroll found', {
              employeeCode,
              businessMonth,
              cycle
            });
            errors.push({
              headerTitle: employeeRecords[0].employeeName,
              error: `It seems there is an existing Payroll entry for this employee for ${businessMonth} - ${cycle}.`,
            });
            return [];
          }

          // Get company details (only once per employee)
          const companyDetails = await executeQuery(
            ATTENDANCES_BULKIMPORT_GET_COMPANYDETAILS,
            { companyId: employeeDetails.companyId }
          ) as CompanyDetailsResponse;

          // Process each attendance record for the employee
          for (const record of employeeRecords) {
            let {
              employeeName,
              date,
              timeIn,
              lunchTimeOut,
              lunchTimeIn,
              timeOut,
              status,
            } = record;

            log('Processing employee data', {
              employeeCode,
              date,
              employeeName,
            });

            try {
              const attendanceDate = moment(date, 'MM/DD/YYYYY').format('YYYY-MM-DD');

              if (!employeeDetails.departmentId) {
                log('No department assigned', { errors });
                if (
                  errors.filter((e: any) => e.headerTitle == employeeName).length == 0
                ) {
                  errors.push({
                    headerTitle: employeeName,
                    error: `Not assigned to any department yet.`,
                  });
                }
                continue;
              }

              if (!employeeDetails.shiftId) {
                log('No shift assigned', { errors });
                if (
                  errors.filter((e: any) => e.headerTitle == employeeName).length == 0
                ) {
                  errors.push({
                    headerTitle: employeeName,
                    error: `Not assigned to any shift yet.`,
                  });
                }
                continue;
              }

              // Checking for duplicate Attendance
              const [duplicateAttendanceData]: any = await executeQuery(
                ATTENDANCES_BULKIMPORT_GET_CHECK_DUPLICATE,
                {
                  companyId,
                  employeeIdParams: employeeDetails.employeeId,
                  businessMonth,
                  cycle,
                  date: attendanceDate,
                }
              );

              const duplicateAttendance = duplicateAttendanceData?.duplicateAttendance;

              if (duplicateAttendance) {
                log('Duplicate attendance found', {
                  employeeCode,
                  date: attendanceDate,
                });
                if (
                  errors.filter((e: any) => e.headerTitle == employeeName).length == 0
                ) {
                  errors.push({
                    headerTitle: employeeName,
                    error: `It seems there is an existing Attendance entry for this employee on ${moment(attendanceDate).format('MM/DD/YYYY')}.`,
                  });
                }
                continue;
              }

              if (
                !(
                  status == 'PRESENT' ||
                  status == 'ABSENT' ||
                  status == 'DAY-OFF' ||
                  status == 'LEAVE'
                )
              ) {
                errors.push({
                  headerTitle: employeeName,
                  error: `On ${moment(attendanceDate).format(
                    'MM/DD/YYYY'
                  )}, Status value should either be PRESENT / ABSENT / DAY-OFF / LEAVE`,
                });
                continue;
              }

              if (
                (timeIn && !moment(timeIn, 'LT').isValid()) ||
                (timeIn && !(timeIn.includes('AM') || timeIn.includes('PM')))
              ) {
                errors.push({
                  headerTitle: employeeName,
                  error: `On ${moment(attendanceDate).format(
                    'MM/DD/YYYY'
                  )}, Invalid time format on TIME-IN column`,
                });
                continue;
              }

              if (
                (timeOut && !moment(timeOut, 'LT').isValid()) ||
                (timeOut && !(timeOut.includes('AM') || timeOut.includes('PM')))
              ) {
                errors.push({
                  headerTitle: employeeName,
                  error: `On ${moment(attendanceDate).format(
                    'MM/DD/YYYY'
                  )}, Invalid time format on TIME-OUT column`,
                });
                continue;
              }
              if (
                (lunchTimeIn && !moment(lunchTimeIn, 'LT').isValid()) ||
                (lunchTimeIn &&
                  !(lunchTimeIn.includes('AM') || lunchTimeIn.includes('PM')))
              ) {
                errors.push({
                  headerTitle: employeeName,
                  error: `On ${moment(attendanceDate).format(
                    'MM/DD/YYYY'
                  )}, Invalid time format on LUNCH-IN column`,
                });
                continue;
              }
              if (
                (lunchTimeOut && !moment(lunchTimeOut, 'LT').isValid()) ||
                (lunchTimeOut &&
                  !(lunchTimeOut.includes('AM') || lunchTimeOut.includes('PM')))
              ) {
                errors.push({
                  headerTitle: employeeName,
                  error: `On ${moment(attendanceDate).format(
                    'MM/DD/YYYY'
                  )}, time format on LUNCH-OUT column`,
                });
                continue;
              }

              // Get attendance applications for this date
              const attendanceApplications = await executeQuery(
                `attendance_application_by_employee`,
                {
                  employeeId: employeeDetails.employeeId
                }
              )
              const applications = attendanceApplications || [];
              log('Attendance applications', { applications });

              if (applications.length > 0) {
                log('Processing attendance applications', {
                  applications,
                });
                if (
                  applications.find(
                    (application: any) =>
                      application.type.toLowerCase() == 'overtime' &&
                      application.dateOvertime == attendanceDate &&
                      application.isApproved == 1
                  )
                ) {
                  if (
                    status.toUpperCase() == 'ABSENT' ||
                    status.toUpperCase() == 'LEAVE' ||
                    status.toUpperCase() == 'DAY-OFF'
                  ) {
                    errors.push({
                      headerTitle: `${employeeName} has conflict with application for overtime`,
                      error: `On ${attendanceDate}, employee has overtime application`,
                    });
                    continue;
                  }
                }
              }

              const holiday: any = await executeQuery(
                ATTENDANCES_BULKIMPORT_GET_HOLIDAY,
                {
                  companyId,
                  attendanceDate,
                }
              );

              let overtime: any = 0;
              let isOnLeave: any = false;
              let isHalfDay = false;
              let remarks = null;
              let isHalfDayPresent = false;
              let lateHrsInDecimal = 0;
              let undertimeHrsInDecimal = 0;
              let shift: any = null;
              let creditableOvertime = 0;
              let isHalfDayIncomplete = false;
              const getShiftDetails = await getCurrentOrNewShiftDetails({
                employeeId: employeeDetails.employeeId,
                attendanceDate: attendanceDate,
              });
              shift = getShiftDetails.shift;

              if (getShiftDetails.success) {
                if (getShiftDetails.isDayOff) {
                  if (getShiftDetails.isNewShift) {
                    remarks = '[Change Schedule: Day-off]';
                  }
                  status = 'DAY-OFF';
                  timeIn = null;
                  lunchTimeOut = null;
                  lunchTimeIn = null;
                  timeOut = null;
                } else {
                  if (getShiftDetails.isNewShift) {
                    remarks = `[Change Schedule: ${moment(
                      shift.timeIn,
                      'HH:mm:ss'
                    ).format('LT')}-${moment(shift.timeOut, 'HH:mm:ss').format(
                      'LT'
                    )}]`;
                  }
                }
              }
              const attendanceDateFormatted = new Date(attendanceDate);
              const employeeTimeIn = await dateTimeFormatter(
                attendanceDateFormatted,
                timeIn
              );
              const employeeTimeOut = await dateTimeFormatter(
                attendanceDateFormatted,
                timeOut
              );
              const employeeLunchOut = lunchTimeOut
                ? await dateTimeFormatter(attendanceDateFormatted, lunchTimeOut)
                : null;
              const employeeLunchIn = lunchTimeIn
                ? await dateTimeFormatter(attendanceDateFormatted, lunchTimeIn)
                : null;
              const shiftTimeIn = await dateTimeFormatter(
                attendanceDateFormatted,
                shift.timeIn
              );
              const shiftTimeOut = await dateTimeFormatter(
                attendanceDateFormatted,
                shift.timeOut
              );
              const shiftLunchIn = shift.lunchTimeIn
                ? await dateTimeFormatter(attendanceDateFormatted, shift.lunchTimeIn)
                : null;
              const shiftLunchOut = shift.lunchTimeOut
                ? await dateTimeFormatter(attendanceDateFormatted, shift.lunchTimeOut)
                : null;
              let momentTimeOut = moment(employeeTimeOut);
              let momentTimeIn = moment(employeeTimeIn);
              let momentLunchOut = null;
              let momentLunchIn = null;
              if (momentTimeOut.isBefore(momentTimeIn)) {
                momentTimeOut.add(1, 'day');
              }
              if (employeeLunchIn && !employeeLunchOut) {
                errors.push({
                  headerTitle: `${employeeName} has invalid lunch out/in`,
                  error: `On ${attendanceDate}, has lunch in but no lunch out`,
                });
                continue;
              } else if (!employeeLunchIn && employeeLunchOut) {
                errors.push({
                  headerTitle: `${employeeName} has invalid lunch out/in`,
                  error: `On ${attendanceDate}, has lunch out but no lunch in`,
                });
                continue;
              }
              if (employeeLunchOut && employeeLunchIn) {
                momentLunchOut = moment(employeeLunchOut);
                momentLunchIn = moment(employeeLunchIn);

                if (momentLunchOut.isBefore(momentTimeIn)) {
                  momentLunchOut.add(1, 'day');
                }
                if (momentLunchOut.isAfter(momentLunchIn)) {
                  momentLunchIn.add(1, 'day');
                }

                if (
                  !(
                    momentLunchIn.isSameOrAfter(momentTimeIn) &&
                    momentLunchIn.isSameOrBefore(momentTimeOut)
                  ) ||
                  !(
                    momentLunchOut.isSameOrAfter(momentTimeIn) &&
                    momentLunchOut.isSameOrBefore(momentTimeOut)
                  )
                ) {
                  errors.push({
                    headerTitle: `${employeeName} has invalid lunch out/in`,
                    error: `On ${attendanceDate}, lunch out and lunch in should be within time in and time out`,
                  });
                  continue;
                }
              }
              if (moment(timeOut, 'LT').isValid()) {
                const computeAttendance: any = await computeUndertimeLateHours({
                  employeeLogDetails: {
                    date: new Date(attendanceDate),
                    timeIn: timeIn ? new Date(timeIn) : null,
                    lunchTimeOut: lunchTimeOut ? new Date(lunchTimeOut) : null,
                    lunchTimeIn: lunchTimeIn ? new Date(lunchTimeIn) : null,
                    timeOut: timeOut ? new Date(timeOut) : null,
                  },
                  shiftDetails: shift,
                  attendanceValues: {
                    employeeTimeIn: employeeTimeIn,
                    employeeLunchOut: employeeLunchOut,
                    employeeLunchIn: employeeLunchIn,
                    employeeTimeOut: employeeTimeOut,
                    shiftTimeIn: shiftTimeIn,
                    shiftTimeOut: shiftTimeOut,
                    shiftLunchStart: shiftLunchOut,
                    shiftLunchEnd: shiftLunchIn,
                    attendanceDate: new Date(attendanceDate),
                  },
                });

                log('Computed attendance details', { computeAttendance });
                if (computeAttendance.success) {
                  isHalfDayPresent = computeAttendance.data.isHalfDay;
                  lateHrsInDecimal = computeAttendance.data.lateHours;
                  undertimeHrsInDecimal = computeAttendance.data.undertimeHours;
                  creditableOvertime = computeAttendance.data.creditableOvertime;
                  isHalfDayIncomplete = computeAttendance.data.isHalfDayIncomplete;
                }
              }

              if (isHalfDayIncomplete && isHalfDayPresent) {
                isHalfDayPresent = false;
                status = 'ABSENT';
              }

              if (applications?.length > 0) {
                overtime = applications.find(
                  (ap: any) =>
                    ap.type?.toLowerCase() == 'overtime' &&
                    ap.dateOvertime == attendanceDate &&
                    ap.isApproved == 1
                );
                if (overtime) {
                  overtime = overtime.numberOfHours;
                } else {
                  overtime = 0;
                }
              }

              if (applications.length > 0) {
                const workingHours = shift.workingHours;
                // calculate half day hours
                const halfDay = parseFloat((workingHours / 2).toFixed(2));
                // calculate first half of shift
                const firstHalfShiftStart = shift.timeIn;
                const firstHalfShiftEnd = moment(`${date} ${shift.timeIn}`)
                  .add(halfDay, 'hours')
                  .format('HH:mm:ss');
                const secondHalfShiftStart = moment(`${date} ${shift.timeOut}`)
                  .subtract(halfDay, 'hours')
                  .format('HH:mm:ss');
                const secondHalfShiftEnd = shift.timeOut;

                let attendanceApp: any = applications.find(
                  (application: any) =>
                    (application.type.toLowerCase().includes('leave') ||
                      application.type == 'Official Business') &&
                    attendanceDate >= application.fromDate &&
                    attendanceDate <= application.toDate &&
                    application.isApproved == 1
                );

                if (attendanceApp) {
                  // if first half shift
                  if (
                    attendanceApp.timeFrom === firstHalfShiftStart &&
                    attendanceApp.timeTo === firstHalfShiftEnd
                  ) {
                    timeIn = secondHalfShiftStart;
                    timeOut = secondHalfShiftEnd;
                    lunchTimeIn = null;
                    lunchTimeOut = null;
                    isHalfDay = true;
                  } else if (
                    attendanceApp.timeFrom === secondHalfShiftStart &&
                    attendanceApp.timeTo === secondHalfShiftEnd
                  ) {
                    timeIn = firstHalfShiftStart;
                    timeOut = firstHalfShiftEnd;
                    lunchTimeIn = null;
                    lunchTimeOut = null;
                    isHalfDay = true;
                  }

                  if (attendanceApp.type?.toLowerCase().includes('leave')) {
                    isOnLeave = true;
                  }

                  remarks = remarks
                    ? `${remarks}, [${attendanceApp.type}: ${moment(
                      attendanceApp.timeFrom,
                      'HH:mm:ss'
                    ).format('LT')}-${moment(
                      attendanceApp.timeTo,
                      'HH:mm:ss'
                    ).format('LT')}]`
                    : `[${attendanceApp.type}: ${moment(
                      attendanceApp.timeFrom,
                      'HH:mm:ss'
                    ).format('LT')}-${moment(
                      attendanceApp.timeTo,
                      'HH:mm:ss'
                    ).format('LT')}]`;
                }
              }

              attendanceData.push({
                companyId: employeeDetails.companyId,
                employeeId: employeeDetails.employeeId,
                departmentId: employeeDetails.departmentId,
                businessMonth: businessMonth,
                cycle: cycle,
                date: attendanceDate,
                timeIn: moment(timeIn, 'LT').isValid()
                  ? moment(timeIn, 'LT').format('HH:mm:ss')
                  : null,
                timeOut: moment(timeOut, 'LT').isValid()
                  ? moment(timeOut, 'LT').format('HH:mm:ss')
                  : null,
                lunchTimeIn: isHalfDay
                  ? null
                  : moment(lunchTimeIn, 'LT').isValid()
                    ? moment(lunchTimeIn, 'LT').format('HH:mm:ss')
                    : null,
                lunchTimeOut: isHalfDay
                  ? null
                  : moment(lunchTimeOut, 'LT').isValid()
                    ? moment(lunchTimeOut, 'LT').format('HH:mm:ss')
                    : null,
                holidayId: holiday?.[0]?.holidayId ? holiday?.[0].holidayId : null,
                creditableOvertime: isHalfDayPresent ? 0 : creditableOvertime,
                overtimeHours: overtime,
                undertimeHours:
                  status.toUpperCase() != 'PRESENT' || isHalfDayPresent
                    ? 0
                    : undertimeHrsInDecimal,
                lateHours: status.toUpperCase() != 'PRESENT' ? 0 : lateHrsInDecimal,
                nightDiffHours:
                  status.toUpperCase() == 'PRESENT' &&
                    companyDetails[0].nightDifferential &&
                    employeeDetails.applyNightDiff
                    ? getNightDifferentialHours(
                      attendanceDate,
                      moment(timeIn, 'LT').isValid()
                        ? moment(timeIn, 'LT').format('HH:mm:ss')
                        : null,
                      isHalfDay
                        ? null
                        : moment(lunchTimeOut, 'LT').isValid()
                          ? moment(lunchTimeOut, 'LT').format('HH:mm:ss')
                          : null,
                      isHalfDay
                        ? null
                        : moment(lunchTimeIn, 'LT').isValid()
                          ? moment(lunchTimeIn, 'LT').format('HH:mm:ss')
                          : null,
                      moment(timeOut, 'LT').isValid()
                        ? moment(timeOut, 'LT').format('HH:mm:ss')
                        : null,
                      companyDetails[0].nightDifferentialStartHour,
                      companyDetails[0].nightDifferentialEndHour,
                      shift.timeIn
                    )
                    : 0,
                isPresent:
                  (status.toUpperCase() == 'PRESENT' ||
                    status.toUpperCase() == 'LEAVE') &&
                    !isOnLeave
                    ? 1
                    : 0,
                isDayOff:
                  status.toUpperCase() == 'ABSENT'
                    ? 0
                    : status.toUpperCase() == 'DAY-OFF'
                      ? 1
                      : 0,
                isLeave: isOnLeave ? 1 : 0,
                isHalfDay: isHalfDay || isHalfDayPresent ? 1 : 0,
                remarks: remarks,
              });
            } catch (error: any) {
              log('Error processing employee attendance', {
                error: error.message,
                employeeName,
              });
              errors.push({
                headerTitle: employeeName,
                error: error.message,
              });
              attendanceData = [];
              return [];
            }
          }

          return attendanceData;
        } catch (error: any) {
          log('Error processing employee attendance', {
            error: error.message,
            employeeCode,
          });
          errors.push({
            headerTitle: employeeRecords[0].employeeName,
            error: error.message,
          });
          return [];
        }
      });

      // Wait for current batch to complete and collect results
      const batchResults = await Promise.all(batchPromises);
      allProcessedData = [...allProcessedData, ...batchResults.flat()];

      log('Completed processing batch', {
        processedEmployees: batch.length,
        totalProcessedSoFar: allProcessedData.length
      });
    }

    // Replace the original Promise.all with our batched results
    const allAttendanceData = allProcessedData;

    if (errors.length > 0 && allAttendanceData.length > 0) {
      await transaction.rollback();
      return NextResponse.json({
        severity: 'error',
        success: false,
        message: errors,
      });
    }

    log("allAttendanceData", { allAttendanceData })

    if (allAttendanceData.length > 0) {
      // Split the data into chunks of 1000 records
      const chunkSize = 500;
      const chunks = [];
      for (let i = 0; i < allAttendanceData.length; i += chunkSize) {
        chunks.push(allAttendanceData.slice(i, i + chunkSize));
      }

      try {
        // Process chunks in parallel with transaction
        log("processing chunks", { chunks })
        log("processing chunks length", { length: chunks.length })
        // await Promise.all(
        //   chunks.map(chunk => Attendance.bulkCreate(chunk, { transaction }))
        // );

        for (const chunk of chunks) {
          await Attendance.bulkCreate(chunk, { transaction });
        }

        log("done processing chunks", { chunks })

        // Create activity log with transaction
        await createActivityLog(
          companyId,
          userId,
          `Imported Attendance [${data[0].businessMonth} - ${data[0].cycle}]`,
          transaction
        );

        // If everything is successful, commit the transaction
        await transaction.commit();

        return NextResponse.json({
          severity: 'success',
          success: true,
          message: `${departmentName} - [${businessMonthCycle}] has been imported`,
        });
      } catch (error) {
        // Rollback on error during write operations
        log("check error here", { error })
        await transaction.rollback();
        return NextResponse.json({
          severity: 'error',
          success: false,
          message: [
            {
              headerTitle: 'Error on adding attendance',
              error: "Something went wrong on adding attendance"
            },
          ],
        });
      }
    } else if (allAttendanceData.length == 0) {
      // Rollback if no valid records to import
      await transaction.rollback();
      return NextResponse.json({
        severity: 'error',
        success: false,
        message: [
          {
            headerTitle: 'Attendance may have already exists',
            error: `It seems the attendance of [${departmentName} - ${businessMonthCycle}] already exists.`,
          },
        ],
      });
    }
  } catch (error: any) {
    // Ensure transaction is rolled back on any error
    if (transaction) {
      await transaction.rollback();
    }
    console.error('[Bulk Import Attendance] Error:', error.message);
    errors.push({
      headerTitle: 'Something went wrong...',
      error: JSON.stringify(error.message),
    });

    return NextResponse.json({
      severity: 'error',
      success: false,
      message: errors,
    });
  }
}
