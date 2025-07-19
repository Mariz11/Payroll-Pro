interface Label {
  mainHeader?: string;
  header?: string;
  subHeader?: string;
  buttonText?: string;
  title?: string;
}

interface Configuration {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Forms {
  forms: {
    value?: string;
    setValue?: (value: string) => void;
    label: string;
    type: FormType;
    options: { name: string; code: string }[];
    name: string;
    placeholder: string;
    isVisible: boolean;
    isRequired: boolean;
    isDisabled: boolean;
    dropDownValues?: (fieldName: string, selectedValue: any) => void;
    startDate?: Date;
    endDate?: Date;
  }[];
  buttons: {
    label: string;
    type: ButtonLabel;
    isDisabled?: boolean;
    handler?: () => void;
    child?: React.ReactNode;
  }[];
}

// Shifts Form
interface ShiftsForm {
  shiftId: null;
  shiftName: string;
  timeIn: string;
  timeOut: string;
  lunchStart: Date | string;
  lunchEnd: string | Date;
  workingHours: number;
}

interface DepartmentForm {
  departmentName: string;
  departmentId: null;
}

interface HolidaysForm {
  holidayId: null;
  holidayName: string;
  holidayDate: string;
  holidayType: string;
}
// Updated Dwine (2/20/24): added announcement form interface START
interface AnnouncementForm {
  title: string;
  content: string;
  order: number;
  departments: (AnyPresentValue | null | undefined)[];
}

// Updated Dwine (2/20/24): added announcement form interface END
interface ShiftsSideBarConfig {
  title: string;
  submitBtnText?: string;
  action: string;
  rowData?: any;
  isOpen: boolean;
  shiftId?: string;
}

interface HolidaysSideBarConfig {
  title: string;
  submitBtnText?: string;
  action: string;
  rowData?: any;
  isOpen: boolean;
  holidayId?: string;
}

interface DepartmentsSideBarConfig {
  title: string;
  submitBtnText?: string;
  action: string;
  rowData?: any;
  isOpen: boolean;
  departmentId?: string;
}
interface CompanyForm {
  companyId: string | null;
  companyName: string;
  accountId?: string | null;
  subAccountId?: string | null;
  emailAddress: string;
  companyAddress: string;
  contactNumber: string;
  urlLogo: null;
  chargePerEmployee?: number;
  maxEmployee: number;
  isActive: boolean;
  // payrollType: string | null;
  applyWithHoldingTax: boolean;
  companyStatus: boolean;
  userId: string | null;
  // firstName: string;
  // middleName: string | null;
  // lastName: string;
  // suffix: string | null;
  // adminEmailAddress: string;
  // adminContactNumber: string;
  // birthDate: string;
}

interface CompanyPayCycleGrid {
  payCycleId?: number | null;
  companyId: number;
  gridId: string | null;
  cycle: string;
  payDate: number;
  cutOffStartDate: number;
  cutOffEndDate: number;
  preferredMonth: string | object;
  isApplyGovtBenefits: boolean | null;
}

interface SideBarConfig {
  title: string;
  subTitle?: string;
  submitBtnText?: string;
  action: string;
  rowData?: any;
  isOpen: boolean;
  bulk?: boolean;
  tableFor?: string;
}

interface DeleteSidebarConfig {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData: any;
  isOpen: boolean;
  bulk?: boolean;
}

interface PostSidebarConfig {
  header: string;
  subHeader: string;
  submitText: string;
  cancelText: string;
  rowData: any;
  isOpen: boolean;
  bulk?: boolean;
}

interface EmployeeMgmtForm {
  employeeId: null;
  // role: null;
  employeeCode: string;
  mlWalletStatus: number | null;
  employeeStatus: number | null;
  companyId: number | null;
  tierLabel: string;
  ckycId?: string | null;
  mlWalletId?: string | null;
  departmentId: number | null;
  shiftId: number | null;
  hiringDate: string | Date;
  startDate: any;
  employmentStatus: any;
  referenceFiles: string | null;
  dayOff: any;
  dailyRate: number;
  monthlyAllowance: number;
  allowance: number;
  tinNumber: string | null;
  overtimeRateRegDays: number;
  overtimeRateHolidays: number;
  overtimeRateRestDays: number;
  positionTitle: string;
  dateOfSeparation: string;
  modeOfSeparation: string;
  modeOfPayroll: string;
  applyWithholdingTax: boolean;
  sssId: string | null;
  sssContributionRate: number;
  sssERShareRate: number;
  sssECShareRate: number;
  philHealthId: string | null;
  philHealthContributionRate: number;
  philHealthERShareRate: number;
  pagIbigId: string | null;
  pagIbigContributionRate: number;
  pagIbigERShareRate: number;
  vacationLeaveCredits: number | null;
  vacationLeaveUsed: number;
  sickLeaveCredits: number | null;
  sickLeaveUsed: number;
  soloParentLeaveCredits: number | null;
  soloParentLeavesUsed: number;
  paternityLeaveCredits: number | null;
  paternityLeavesUsed: number;
  maternityLeaveCredits: number | null;
  maternityLeavesUsed: number;
  serviceIncentiveLeaveCredits: number | null;
  serviceIncentiveLeaveUsed: number;
  otherLeaveCredits: number | null;
  otherLeavesUsed: number;
  emergencyLeaveCredits: number | null;
  emergencyLeavesUsed: number;
  birthdayLeaveCredits: number | null;
  birthdayLeavesUsed: number;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  contactNumber: string;
  profilePicture: string | null;
  emergencyContactNumber1: string | null;
  emergencyContactNumber2: string | null;
  birthDate: string;
  emailAddress: string;
  streetAddress: string;
  cityId: number | null;
  provinceId: number | null;
  countryId: number | null;
  zipCode: number | null;
  educationalAttainment: string | null;
  schoolGraduated: string | null;
  degree: string | null;
  gender: any;
  placeOfBirth: string;
  nationality: string;
  civilStatus: any;
  address: string;
  requestChangeContactNum?: boolean;
  allowanceBreakdown: boolean;
  allowanceType: string | null;
  monthlyAmounts: string | null;
  dailyAmounts: string | null;
  isMonthlyRated: boolean;
}
