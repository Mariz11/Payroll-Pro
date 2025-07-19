export const shiftsManagement = [
  {
    shiftName: 'Day Shifter',
    timeIn: new Date('2023-08-15T08:00:00'),
    timeOut: new Date('2023-08-15T17:00:00'),
    lunchIn: new Date('2023-08-15T12:00:00'),
    lunchOut: new Date('2023-08-15T13:00:00'),
  },
  {
    shiftName: 'Night Shifter',
    timeIn: new Date('2023-08-15T08:00:00'),
    timeOut: new Date('2023-08-15T17:00:00'),
    lunchIn: new Date('2023-08-15T12:00:00'),
    lunchOut: new Date('2023-08-15T13:00:00'),
  },
];

export const deductionsManagement = [
  {
    postingStatus: 'open',
    employeeName: 'John Doe',
    deductionType: 'Cash Advance',
    timePeriod: 'One Time',
    totalAmount: 9999.99,
    amountPaid: 9999.99,
    status: 'Paid',
  },
  {
    postingStatus: 'close',
    employeeName: 'Jane Doe',
    deductionType: 'SSS Loan',
    timePeriod: 'Per Cycle',
    totalAmount: 9999.99,
    amountPaid: 9999.99,
    status: 'Unpaid',
  },
];
