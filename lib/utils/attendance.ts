import moment from '@constant/momentTZ';

export async function dateTimeFormatter(
  date: Date | string,
  time: Date | string | null
) {
  // Format the date to YYYY-MM-DD
  const formattedDate = moment(date).format('YYYY-MM-DD');
  let dateTime = `${formattedDate} ${time}`;

  // If the combined dateTime is not valid, try parsing time separately
  if (!moment(dateTime).isValid()) {
    const formattedTime = moment(time, 'LT').isValid()
      ? moment(time, 'LT').format('HH:mm:ss')
      : moment(`${formattedDate} ${time}`, 'YYYY-MM-DD h:mm A').format(
          'HH:mm:ss'
        );

    return `${formattedDate} ${formattedTime}`;
  }

  // Format the valid dateTime to desired format
  return moment(dateTime, 'YYYY-MM-DD h:mm A').format('YYYY-MM-DD HH:mm:ss');
}

export function extractDay(dateString: string) {
  const dateArray = dateString.split('-');
  if (dateArray.length === 3) {
    const day = parseInt(dateArray[2], 10);
    if (!isNaN(day)) {
      return day;
    }
  }
  return null;
}

export function getDayOfWeek(dateString: string) {
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const date = new Date(dateString);

  if (!isNaN(date.getTime())) {
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  }

  return null;
}

export function formatTimeTo12Hour(timeString: string) {
  const parts = timeString.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (!isNaN(hours) && !isNaN(minutes)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
    }
  }

  return null;
}
export function getPreviousMonthWithYear(monthYear: string) {
  // Array of months in order
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Split the input into month and year
  const [monthName, yearString] = monthYear.split(' ');
  const year = parseInt(yearString, 10);

  // Check if the input is valid
  if (!months.includes(monthName) || isNaN(year)) {
    throw new Error(
      "Invalid input format. Use 'Month Year', e.g., 'January 2024'"
    );
  }

  // Find the index of the given month
  const currentIndex = months.indexOf(monthName);

  // Calculate the previous month's index
  const previousIndex = (currentIndex - 1 + months.length) % months.length;

  // Adjust the year if the month is December
  const previousYear = currentIndex === 0 ? year - 1 : year;

  // Return the previous month and year
  return `${months[previousIndex]} ${previousYear}`;
}
function getPreviousMonth(monthName: string) {
  // Array of months in order
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Find the index of the given month
  const currentIndex = months.indexOf(monthName);

  // Check if the input is valid
  if (currentIndex === -1) {
    throw new Error('Invalid month name');
  }

  // Calculate the previous month's index
  const previousIndex = (currentIndex - 1 + months.length) % months.length;

  // Return the previous month
  return months[previousIndex];
}
