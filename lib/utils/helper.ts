export function capitalizeWord(text: string) {
  if (!text) return '';
  const capitalizedString = text.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
  return removeExtraSpaces(capitalizedString);
}
export const monthArray = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];
export const cycleArray = [
  'FIRST',
  'SECOND',
  'THIRD',
  'FOURTH',
  'FIFTH',
  'SIXTH',
  'SEVENTH',
  // for monthly cycle
  'MONTHLY',
];
export const deductionTypeOptions = [
  'Cash Advance',
  'SSS Loan',
  'SSS Calamity Loan',
  'HDMF Loan',
  'Salary Loan',
  // 'Ledger',
  'Other',
];
export function properCasing(text: string) {
  if (!text) return '';
  text = text.toLowerCase();
  const words = text.split(' ');
  // let capitalizedString = text.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
  //   letter.toUpperCase()
  // );
  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 0) {
      if (words[i][0] == 'ñ') {
        // console.log(words[i]);
        words[i] = 'Ñ' + words[i].substring(1);
      } else {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
      }
    }
  }
  return removeExtraSpaces(words.join(' '));
}


export function removeNYe(text: string) {
  if (!text) return '';
  return text.replaceAll('Ã±', 'ñ').replaceAll('Ã‘', 'Ñ');
}

export function removeExtraSpaces(text: string) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

export function generateYears({ range }: { range: number }) {
  const now = new Date().getUTCFullYear();
  return Array(now - (now - range))
    .fill('')
    .map((v, idx) => now - idx);
}
export function isNumber(n: any) {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
}
export function amountFormatter(amount: number) {
  let enteredNumber = '' + amount;
  enteredNumber = enteredNumber.replace(/[^0-9\.]+/g, '');

  let outNumber = Number(enteredNumber).toLocaleString('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return amount < 0 ? `-${outNumber}` : outNumber;
}
export function addCommas(str: string) {
  var arr, int, dec;
  str += '';

  arr = str.split('.');
  int = arr[0] + '';
  dec = arr.length > 1 ? '.' + arr[1] : '';
  return (
    int.replace(/(\d)(?=(\d{3})+$)/g, '$1,') +
    '.' +
    parseFloat(dec).toFixed(2).split('.')[1]
  );
}

export function convertMinsToHours({
  minutes,
  withUnit,
}: {
  minutes: number;
  withUnit?: boolean;
}) {
  let h: any = Math.floor(minutes / 60);
  let m: any = (minutes % 60).toFixed(0);
  let hours = Math.abs(h) < 10 ? '0' + Math.abs(h) : Math.abs(h);
  let mins = Math.abs(m) < 10 ? '0' + Math.abs(m) : Math.abs(m);

  // for negative
  hours = h < 0 ? '-' + hours : hours;
  mins = m < 0 ? '-' + mins : mins;
  if (withUnit) return `${hours}h ${mins}m`;
  return minutes ? `${hours}:${mins}` : '00h 00m';
}

export function uuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export const formatObjectToString = (obj: any) => {
  if (obj && typeof obj === 'object') {
    return `Object: ${obj.property1}, ${obj.property2}`;
  } else {
    return String(obj);
  }
};

export const hasHtmlTags = (str: string | null) => {
  if (!str || str === undefined) return false;
  return /<[^>]+>/g.test(str);
};

export const addS = (num: number): string => {
  if (num > 1) {
    return 's';
  } else {
    return '';
  }
};
export function formatTimeToAMPM(loggedTime: string, withSeconds: boolean) {
  // Split the time string into hours, minutes, and seconds
  const [hoursStr, minutes, seconds] = loggedTime.split(':');

  // Convert hours string to number
  const hours = parseInt(hoursStr);

  // Convert hours to 12-hour format and determine AM/PM
  let ampm = hours >= 12 ? 'PM' : 'AM';
  let formattedHours = hours % 12 || 12; // Handle midnight (0 hours) as 12

  // Format the time string in "hh:mm:ss am/pm" format
  if (withSeconds) {
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  } else {
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  // const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

  // return formattedTime;
}

export function hasSQLKeywords(str: string | null) {
  // if (!str || str === undefined) return false;
  // // const specialCharsRegex = /[!@#$%^&*()_+\=\[\]{};':"\\|<>\/?~]/;
  // const specialWordsRegex = /(SELECT|INSERT|DELETE|UPDATE|DROP|SLEEP|CREATE|ALTER|EXECUTE)/i; // 'i' for case insensitive
  // // if(specialCharsRegex.test(str) || specialWordsRegex.test(str)) {
  // if(specialWordsRegex.test(str)) {
  //   console.log("HAS SQL")
  //   console.log(str)
  // } else {
  //   console.log("NO SQL")
  //   console.log(str)
  // }
  // // return specialCharsRegex.test(str) || specialWordsRegex.test(str);
  // return specialWordsRegex.test(str)
  return false;
}

export function normalizePassword(password: string) {
  const map: { [key: string]: string } = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    $: 's',
    '!': 'i',
    '€': 'e',
    '£': 'l',
    '¢': 'c',
    '∞': '8',
    '∂': 'd',
    ƒ: 'f',
    '©': 'c',
  };

  // Convert the password to lowercase
  return password
    .toLowerCase()
    .replace(/[013457@$!€£¢∞∂ƒ©]/g, function (match) {
      return map[match] || match;
    });
}

export const commonWords = [
  'password',
  'admin',
  'user',
  'pass',
  '123',
  'unknown',
  '123456',
  'admin',
  '12345678',
  '123456789',
  '1234',
  '12345',
  'password',
  '123',
  'Aa123456',
  '1234567890',
  '1234567',
  '123123',
  '111111',
  'Password',
  '12345678910',
  '000000',
  'admin123',
  '1111',
  'P@ssw0rd',
  'root',
  '654321',
  'qwerty',
  'Pass@123',
  '112233',
  '102030',
  'ubnt',
  'abc123',
  'Aa@123456',
  'abcd1234',
  '1q2w3e4r',
  '123321',
  'qwertyuiop',
  '87654321',
  '987654321',
  'Eliska81',
  '123123123',
  '11223344',
  '0987654321',
  'demo',
  '12341234',
  'qwerty123',
  'Admin@123',
  '1q2w3e4r5t',
  '11111111',
  'pass',
  'Demo@123',
  'azerty',
  'admintelecom',
  'Admin',
  '123meklozed',
  '666666',
  '0123456789',
  '121212',
  '1234qwer',
  'admin@123',
  '1qaz2wsx',
  '123456789a',
  'Aa112233',
  'asdfghjkl',
  'Password1',
  '888888',
  'admin1',
  'test',
  'Aa123456@',
  'asd123',
  'qwer1234',
  '123qwe',
  '202020',
  'asdf1234',
  'Abcd@1234',
  '12344321',
  'aa123456',
  '1122334455',
  'Abcd1234',
  'guest',
  '88888888',
  'Admin123',
  'secret',
  '1122',
  'admin1234',
  'administrator',
  'Password@123',
  'q1w2e3r4',
  '10203040',
  'a123456',
  '12345678a',
  '555555',
  'zxcvbnm',
  'welcome',
  'Abcd@123',
  'Welcome@123',
  'minecraft',
  '101010',
  'Pass@1234',
  '123654',
  '123456a',
  'India@123',
  'Ar123455',
  '159357',
  'qwe123',
  '54321',
  'password1',
  '1029384756',
  '1234567891',
  'vodafone',
  'jimjim30',
  'Cindylee1',
  '1111111111',
  'azertyuiop',
  '999999',
  'adminHW',
  '10203',
  'gvt12345',
  '12121212',
  '12345678901',
  '222222',
  '7777777',
  '12345678900',
  'Kumar@123',
  '147258',
  'qwerty12345',
  'asdasd',
  'abc12345',
  'bismillah',
  'Heslo1234',
  '1111111',
  'a123456789',
  'iloveyou',
  'Passw0rd',
  'aaaaaa',
  'Flores123',
  '12qwaszx',
  'Welcome1',
  'password123',
  '123mudar',
  '123456aA@',
  '123qweasd',
  '868689849',
  '1234554321',
  'motorola',
  'q1w2e3r4t5',
  '1234512345',
  'undefined',
  '1q2w3e',
  'a1b2c3d4',
  'admin123456',
  '2402301978',
  'Qwerty123',
  '1qazxsw2',
  'test123',
  'Adam2312',
  'Password123',
  '1234567899',
  'Aa195043',
  'Test@123',
  '111111111',
  'admin12345',
  'zaq12wsx',
  'adminadmin',
  'ADMIN',
  '1234abcd',
  'Menara',
  'qwerty1234',
  '123abc',
  'theworldinyourhand',
  '123456a@',
  'Aa102030',
  '987654',
  'Mm123456',
  'p@ssw0rd',
  'Abc@1234',
  '131313',
  '1a2b3c4d',
  '123654789',
  'changeme',
  '12345679',
  'student',
  'senha123',
  '1234567a',
  'user1234',
  'abc123456',
  'master',
  '12345qwert',
  '1234561',
  'adminisp',
  'azerty123',
  'pakistan',
  'aaaaaaaa',
  'a1234567',
  'P@55w0rd',
  'P@$$w0rd',
  'qwerty123456',
  '55555',
  'lol12345',
  'Aa123456789',
  '999999999',
  '786786',
  'asdasd123',
  'test1234',
  'samsung',
];

export function isPasswordCommon(password: string) {
  if (commonWords.some((word) => normalizePassword(password).includes(word))) {
    return true;
  }

  return false;
}

export function isPasswordCommonString(password: string) {
  if (commonWords.some((word) => normalizePassword(password).includes(word))) {
    return 'The password you entered is frequently used. Please create a stronger one.';
  }
}

export const formatAmount = (value: number) => {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const calcProgressPercentage = (total: number, success: number, failed: number) => {
  total = total || 1; // Avoid division by zero
  const processed = success + failed;

  return Math.round((processed / total) * 100);
}

export const isValidEmail = (email: string) => {
  const emailRE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRE.test(email);
};

export const formatName = (name: string) => {
  return name ? name.replaceAll('Ã±', 'ñ').replaceAll('Ã‘', 'Ñ') : '';
};

export const isStringNotNumber = (value: string) => {
  return typeof value === 'string' && isNaN(value);
}

export const toTitleCase = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const uniqueArray = (arr: string[]): string[] => {
  return arr.filter(
    (value, index, self) =>
      self.findIndex((v) => v.toLowerCase() === value.toLowerCase()) === index
  );
}

export const isNullOrEmpty = (value: any): boolean => value === null || value === '';