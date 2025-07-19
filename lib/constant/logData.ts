export const logsColumn = {
  label1: 'Name',
  label2: 'Time & Date',
};

export const latestActivityData = [
  { name: 'Amy Matthews', action: 'Logged In', timeDate: new Date() }, // Current date and time
  {
    name: 'John Doe',
    action: 'Added New User',
    timeDate: new Date('2023-12-22T13:00:00'),
  },
  {
    name: 'Jane Smith',
    action: 'Timed In',
    timeDate: new Date('2023-08-15T15:00:00'),
  }, // 3:00 PM - Thursday
  {
    name: 'Michael Brown',
    action: 'Deleted A User',
    timeDate: new Date('2023-06-31T22:00:00'),
  }, // 10:00 PM - June 27s
];

export const latestAttendanceData = [
  { name: 'Amy Matthews', action: 'Logged In', timeDate: new Date() }, // Current date and time
  {
    name: 'John Doe',
    action: 'Late',
    timeDate: new Date('2023-08-22T13:00:00'),
  },
  {
    name: 'Jane Smith',
    action: 'Present',
    timeDate: new Date('2023-08-15T15:00:00'),
  }, // 3:00 PM - Thursday
  {
    name: 'Michael Brown',
    action: 'Absent',
    timeDate: new Date('2023-06-31T22:00:00'),
  }, // 10:00 PM - June 27s
];

export const employeeAttendance = [
  { name: 'Present - Time in', action: '', timeDate: new Date() }, // Current date and time
  {
    name: 'Absent',
    action: ' ',
    timeDate: new Date('2023-08-22T13:00:00'),
  },
  {
    name: 'Present',
    action: '',
    timeDate: new Date('2023-08-15T15:00:00'),
  }, // 3:00 PM - Thursday
  {
    name: 'Absent',
    action: '',
    timeDate: new Date('2023-06-31T22:00:00'),
  }, // 10:00 PM - June 27s
];
