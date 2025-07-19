'use server';
import { ATTENDANCES_BULKIMPORT_GET_NIGHT_DIFF } from '@constant/storedProcedures';
import { executeQuery } from 'db/connection';
import { AttendanceApplication } from 'db/models';
import moment from '@constant/momentTZ';
export default async function getFiledNightDifferentialHours(
  attendanceDate: string,
  employeeId: number
) {
  const nightDiffApplication: any = await executeQuery(
    ATTENDANCES_BULKIMPORT_GET_NIGHT_DIFF,
    {
      employeeId: employeeId,
      dateOvertime: attendanceDate,
      isApproved: 1,
      type: 'Night Differential',
    }
  );

  if (nightDiffApplication) {
    return nightDiffApplication.numberOfHours;
  } else {
    return 0;
  }
}
