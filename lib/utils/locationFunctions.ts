import moment from 'moment';

type Schedule = {
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
};

enum LocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

export const CalculateScheduleValidity = (schedule: Schedule) => {
  const startDateTime = moment(
    `${schedule.dateFrom} ${schedule.timeFrom}`,
    'YYYY-MM-DD HH:mm:ss'
  );
  const endDateTime = moment(
    `${schedule.dateTo} ${schedule.timeTo}`,
    'YYYY-MM-DD HH:mm:ss'
  );
  const duration = moment.duration(endDateTime.diff(startDateTime));
  const diffDays = duration.days();
  const diffHours = duration.hours();
  const diffMinutes = duration.minutes();
  let validity = '';
  if (diffDays > 0) validity += `${diffDays}d `;
  if (diffHours > 0) validity += `${diffHours}h `;
  if (diffMinutes > 0) validity += `${diffMinutes}m`;
  return validity.trim() || '0m';
};

export const checkIfLocationIsLive = (endDate: string) => {
  const currentDate = moment();
  const endDateTime = moment(new Date(endDate));
  return endDateTime.isAfter(currentDate);
};

export const convertDateTime = (
  data:
    | string
    | {
        date: string;
        time: string;
      },
  format = 'MMMM DD, YYYY hh:mm A'
): string => {
  if (!data) return '';
  if (typeof data === 'string') return moment(new Date(data)).format(format);
  if (typeof data === 'object') {
    const { date, time } = data;
    const combined = moment(date).set({
      hour: moment(time, 'HH:mm:ss.SSSSSS').hour(),
      minute: moment(time, 'HH:mm:ss.SSSSSS').minute(),
      second: moment(time, 'HH:mm:ss.SSSSSS').second(),
      millisecond: moment(time, 'HH:mm:ss.SSSSSS').millisecond(),
    });

    return combined.format(format);
  }

  return '';
};

export const convertDate = (date: any, format = 'YYYY-MM-DD'): string => {
  if (!date) return '';
  return moment(new Date(date)).format(format);
};

export const convertTime = (date: any, format = 'HH:mm:ss'): string => {
  if (!date) return '';
  return moment(new Date(date)).format(format);
};

export const convertLocationStatus = (status: string): LocationStatus => {
  switch (status) {
    case 'ACTIVE':
    case '1':
      return LocationStatus.ACTIVE;
    case 'INACTIVE':
    case '0':
      return LocationStatus.INACTIVE;
    case '2':
    case 'EXPIRED':
      return LocationStatus.EXPIRED;
    default:
      return LocationStatus.UNKNOWN;
  }
};
