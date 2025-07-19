import moment from '@constant/momentTZ';

export interface HalfDayStatus {
  isHalfDay: boolean;
  isHalfDayIncomplete: boolean;
  whichHalf?: 'FIRST' | 'SECOND';
}

export interface AdjustedTimes {
  employeeTimeIn: string;
  employeeTimeOut: string;
  shiftTimeIn: string;
  shiftTimeOut: string;
  shiftLunchStart: string | null;
  shiftLunchEnd: string | null;
  employeeLunchOut: string | null;
  employeeLunchIn: string | null;
}

export const addOneDay = (time: string) =>
  moment(time).add('1', 'day').format('YYYY-MM-DD HH:mm:ss');

export const adjustTimesForNightShift = ({
  employeeTimeIn,
  employeeTimeOut,
  shiftTimeIn,
  shiftTimeOut,
  shiftLunchStart,
  shiftLunchEnd,
  employeeLunchOut,
  employeeLunchIn,
}: {
  employeeTimeIn: string;
  employeeTimeOut: string;
  shiftTimeIn: string;
  shiftTimeOut: string;
  shiftLunchStart: string | null;
  shiftLunchEnd: string | null;
  employeeLunchOut: string | null;
  employeeLunchIn: string | null;
}): AdjustedTimes => {
  // Create copies of the input times
  let adjustedEmployeeTimeIn = employeeTimeIn;
  let adjustedEmployeeTimeOut = employeeTimeOut;
  let adjustedShiftTimeIn = shiftTimeIn;
  let adjustedShiftTimeOut = shiftTimeOut;
  let adjustedShiftLunchStart = shiftLunchStart;
  let adjustedShiftLunchEnd = shiftLunchEnd;
  let adjustedEmployeeLunchOut = employeeLunchOut;
  let adjustedEmployeeLunchIn = employeeLunchIn;

  // Handle night shift (when shift end time is less than shift start time)
  if (shiftTimeOut < shiftTimeIn) {
    // Adjust employee time in
    if (shiftTimeIn > employeeTimeIn && shiftTimeOut > employeeTimeIn) {
      adjustedEmployeeTimeIn = addOneDay(employeeTimeIn);
    }

    // Adjust employee time out
    if (employeeTimeOut < shiftTimeIn || employeeTimeOut < employeeTimeIn) {
      adjustedEmployeeTimeOut = addOneDay(employeeTimeOut);
    }

    // Adjust shift time out
    adjustedShiftTimeOut = addOneDay(shiftTimeOut);

    // Adjust lunch times if they exist
    if (shiftLunchStart && shiftLunchEnd) {
      if (shiftLunchStart < shiftTimeIn) {
        adjustedShiftLunchStart = addOneDay(shiftLunchStart);
      }
      if (shiftLunchEnd < shiftLunchStart) {
        adjustedShiftLunchEnd = addOneDay(shiftLunchEnd);
      }
    }

    if (employeeLunchOut && employeeLunchIn) {
      if (employeeLunchOut < employeeTimeIn) {
        adjustedEmployeeLunchOut = addOneDay(employeeLunchOut);
      }
      if (employeeLunchIn < employeeLunchOut) {
        adjustedEmployeeLunchIn = addOneDay(employeeLunchIn);
      }
    }
  } else {
    // For regular shifts, only adjust if time out is before time in
    if (employeeTimeOut < employeeTimeIn) {
      adjustedEmployeeTimeOut = addOneDay(employeeTimeOut);
    }
  }

  return {
    employeeTimeIn: adjustedEmployeeTimeIn,
    employeeTimeOut: adjustedEmployeeTimeOut,
    shiftTimeIn: adjustedShiftTimeIn,
    shiftTimeOut: adjustedShiftTimeOut,
    shiftLunchStart: adjustedShiftLunchStart,
    shiftLunchEnd: adjustedShiftLunchEnd,
    employeeLunchOut: adjustedEmployeeLunchOut,
    employeeLunchIn: adjustedEmployeeLunchIn,
  };
};

export const calculateHalfDayStatus = (
  times: {
    employeeTimeIn: string;
    employeeTimeOut: string;
    shiftTimeIn: string;
    shiftTimeOut: string;
    employeeLunchOut: string | null;
    employeeLunchIn: string | null;
  },
  halfDay: number
): HalfDayStatus => {
  const firstHalfShiftStart = times.shiftTimeIn;
  const firstHalfShiftEnd = moment(times.shiftTimeIn)
    .add(halfDay, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  const secondHalfShiftStart = moment(times.shiftTimeOut)
    .subtract(halfDay, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  const secondHalfShiftEnd = times.shiftTimeOut;

  let isHalfDay = false;
  let isHalfDayIncomplete = false;
  let whichHalf: 'FIRST' | 'SECOND' | undefined;

  const isSameDayShift = isSameDay(
    times.employeeTimeIn,
    times.employeeTimeOut,
    times.shiftTimeIn,
    times.shiftTimeOut
  );
  // Check for first half day
  if (
    times.employeeTimeOut > firstHalfShiftStart &&
    times.employeeTimeOut <= secondHalfShiftStart &&
    !times.employeeLunchOut &&
    !times.employeeLunchIn &&
    isSameDayShift
  ) {
    isHalfDay = true;
    whichHalf = 'FIRST';
  }
  // Check for second half day
  else if (
    times.employeeTimeIn >= firstHalfShiftEnd &&
    times.employeeTimeOut > secondHalfShiftStart &&
    !times.employeeLunchOut &&
    !times.employeeLunchIn &&
    isSameDayShift
  ) {
    isHalfDay = true;
    whichHalf = 'SECOND';
  }

  // Check if half day is incomplete
  if (isHalfDay) {
    if (whichHalf === 'FIRST') {
      const lateHours = calculateLateHours(
        times.employeeTimeIn,
        firstHalfShiftStart
      );
      isHalfDayIncomplete =
        times.employeeTimeOut < firstHalfShiftEnd || lateHours > 1;
    } else if (whichHalf === 'SECOND') {
      const lateHours = calculateLateHours(
        times.employeeTimeIn,
        secondHalfShiftStart
      );
      isHalfDayIncomplete =
        times.employeeTimeOut < secondHalfShiftEnd || lateHours > 0;
    }
  }

  return {
    isHalfDay,
    isHalfDayIncomplete,
    whichHalf,
  };
};

export const calculateLateHours = (
  actualTime: string,
  expectedTime: string
): number => {
  const lateHrsInMins = moment(actualTime).diff(expectedTime, 'minutes');
  return lateHrsInMins < 0 ? 0 : lateHrsInMins / 60;
};

export const calculateCreditableOvertime = (
  timeOut: string,
  shiftTimeOut: string
): number => {
  if (timeOut <= shiftTimeOut) return 0;

  let overtime = moment(timeOut).diff(moment(shiftTimeOut), 'minutes') / 60;
  const decimalValue = overtime % 1;

  if (decimalValue >= 0.0 && decimalValue < 0.5) {
    overtime = Math.trunc(overtime);
  } else if (decimalValue >= 0.5 && decimalValue <= 0.99) {
    overtime = Math.trunc(overtime) + 0.5;
  }

  return overtime;
};

export const calculateLunchBreakHours = (
  lunchOut: string | null,
  lunchIn: string | null
): number => {
  if (!lunchOut || !lunchIn) return 0;

  return parseFloat(
    (moment(lunchIn).diff(moment(lunchOut), 'minutes') / 60).toFixed(2)
  );
};

export const calculateUndertimeHours = (
  timeOut: string,
  shiftTimeOut: string,
  shiftLunchStart: string | null,
  shiftLunchEnd: string | null
): number => {
  if (timeOut >= shiftTimeOut) return 0;

  let undertime = moment(shiftTimeOut).diff(timeOut, 'minutes') / 60;

  // Apply lunch break deduction if applicable
  if (shiftLunchStart && timeOut <= shiftLunchStart && shiftLunchEnd) {
    const lunchBreakHours = parseFloat(
      (moment(shiftLunchEnd).diff(shiftLunchStart, 'minutes') / 60).toFixed(2)
    );
    undertime = undertime > 0 ? undertime - lunchBreakHours : 0;
  }

  return undertime;
};

export const isSameDay = (
  time1: string,
  time2: string,
  shiftTimeIn: string,
  shiftTimeOut: string
): boolean => {
  // For night shifts (when shift end time is less than shift start time)
  if (shiftTimeOut < shiftTimeIn) {
    // If it's a night shift, we expect the times to be on different days
    return (
      moment(time1).format('YYYY-MM-DD') !== moment(time2).format('YYYY-MM-DD')
    );
  }

  // For regular shifts, times should be on the same day
  return (
    moment(time1).format('YYYY-MM-DD') === moment(time2).format('YYYY-MM-DD')
  );
};
