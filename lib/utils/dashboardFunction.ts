import { time } from 'console';

export function formatDateTime(dateTime: Date) {
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  } as Intl.DateTimeFormatOptions;
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Choose "long", "short", "narrow", or omit for the default
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  const now = new Date();
  const diff = now.getTime() - dateTime.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return dateTime.toLocaleTimeString('en-US', options) + ' - Today';
  } else if (diffDays === 1) {
    return dateTime.toLocaleTimeString('en-US', options) + ' - Yesterday';
  } else {
    return (
      dateTime.toLocaleTimeString('en-US', options) +
      ' - ' +
      dateTime.toLocaleDateString('en-US', dateOptions)
    );
  }
}

export const customTimeFormatter = ({
  rowData,
  field,
}: {
  rowData: any;
  field: string;
}) => {
  const timeString = rowData.data[field];

  if (!timeString) {
    return null;
  }
};

export const timeFormatter = (timeString: string) => {
  if (typeof timeString !== 'string' || !timeString.includes(':')) {
    // Handle the case when timeString is not a valid time string
    return 'Invalid Time';
  }

  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours > 12 ? hours - 12 : hours;
  const formattedTime = `${formattedHours}:${String(minutes).padStart(
    2,
    '0'
  )} ${period}`;

  return formattedTime;
};

export const formatAmount = (value: number) => {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

export function convertDateTo24Hour(date: Date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}:00`;
}

export const parseTimeStringToDate = (timeString: string) => {
  const [time, meridiem] = timeString.split(' ');
  const [hours, minutes, seconds] = time.split(':');
  const date = new Date();
  date.setHours(meridiem === 'PM' ? parseInt(hours) + 12 : parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date;
};

export const dateToTimeString = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours < 12 ? 'AM' : 'PM';

  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedHours}:${formattedMinutes} ${meridiem}`;
};

export const timeStringToDate = (timeString: string) => {
  const [timePart, meridiem] = timeString.split(' ');

  const [hours, minutes] = timePart.split(':');

  const parsedHours = parseInt(hours, 10);
  const parsedMinutes = parseInt(minutes, 10);

  let hours24 = parsedHours;

  if (meridiem === 'PM' && parsedHours < 12) {
    hours24 += 12;
  } else if (meridiem === 'AM' && parsedHours === 12) {
    hours24 = 0;
  }

  const date = new Date();
  date.setHours(hours24, parsedMinutes, 0, 0);

  return date;
};

export const parseDateStringToDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const handleTimeChange = (e: any) => {
  const inputValue = e.value;
  const parts = inputValue.split(' ');

  if (parts.length === 2) {
    const timePart = parts[0];
    const amPmPart = parts[1].toUpperCase(); // Convert to uppercase for consistency
    const timeValue = `${timePart} ${amPmPart}`;
    return timeValue;
  } else {
    return null;
  }
};
