interface UserObjectForm {
  middleName?: string | undefined;
  suffix?: string | undefined;
  firstName: string;
  lastName: string;
  birthDate: string;
  contactNumber: string;
  emailAddress: string;
  password?: string | undefined;
  role: number;
}

interface AdminObjectForm {
  middleName?: string | undefined;
  suffix?: string | undefined;
  firstName: string;
  lastName: string;
  birthDate: string;
  contactNumber: string;
  emailAddress: string;
  oldPassword?: string;
  password?: string | undefined;
  logo?: string | null;
  companyEmailAddress: string;
  companyContactNumber: string;
  companyAddress: string;
}
