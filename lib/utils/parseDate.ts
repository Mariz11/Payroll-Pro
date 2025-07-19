export function ParseDate(date: string) {
  const newDate = new Date(date);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
    newDate.getDay()
  ];
  const month = monthNames[newDate.getMonth()];

  const formattedDate = `${dayOfWeek} ${month} ${newDate.getDate()} ${newDate.getFullYear()} 00:00:00 GMT+0800 (Philippine Standard Time)`;

  return formattedDate;
}

export function ParseDateStringtoFormatted(dateValue: string) {
  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
