export type EmployeeId = number;

export interface EmployeeDataProps {
  employeeId: number;
  role: number | string;
  employeeCode: string;
  mlWalletStatus: number | null;
  employeeStatus: number | null;
  companyId: number;
  tierLabel: string;
  ckycId: string | null;
  mlWalletId: string | null;
  departmentId: number;
  shiftId: number;
  hiringDate: string;
  startDate: string;
  employmentStatus: string;
  referenceFiles: any | null;
  dayOff: string[] | string;
  basicPay: number;
  dailyRate: number;
  monthlyAllowance: number;
  allowance: number;
  tinNumber: string | null;
  overtimeRateRegDays: number;
  overtimeRateHolidays: number;
  overtimeRateRestDays: number;
  positionTitle: string;
  dateOfSeparation: string | null;
  modeOfSeparation: string | null;
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
  vacationLeaveCredits: number;
  vacationLeaveUsed: number;
  sickLeaveCredits: number;
  sickLeaveUsed: number;
  soloParentLeaveCredits: number;
  soloParentLeavesUsed: number;
  paternityLeaveCredits: number;
  paternityLeavesUsed: number;
  maternityLeaveCredits: number;
  maternityLeavesUsed: number;
  serviceIncentiveLeaveCredits: number;
  serviceIncentiveLeaveUsed: number;
  otherLeaveCredits: number;
  otherLeavesUsed: number;
  emergencyLeaveCredits: number;
  emergencyLeavesUsed: number;
  birthdayLeaveCredits: number;
  birthdayLeavesUsed: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string;
  contactNumber: string;
  profilePicture: string | null;
  emergencyContactNumber1: string;
  emergencyContactNumber2: string;
  birthDate: string;
  emailAddress: string;
  streetAddress: string;
  zipCode: number;
  cityId: number | string;
  provinceId: number | string;
  countryId: number | string;
  educationalAttainment: string;
  schoolGraduated: string;
  degree: string;
  gender: string;
  placeOfBirth: string;
  nationality: string;
  civilStatus: string;
  address: string;
  allowanceBreakdown: boolean;
  allowanceBreakdownId?: number;
  allowanceType: string;
  monthlyAmounts: string;
  dailyAmounts: string;
  isMonthlyRated: boolean;
  userId: number;
  mismatchedInfos?: string | null;
}

export interface EmployeeImportHistoryListProps {
  documentId: string;
  uploadDate: string;
  fileName: string;
  totalRows: number;
  progress: number;
  actions?: () => void;
}

export interface EmployeeImportHistoryDetailsSummaryProps {
  read: number;
  success: number;
  failed: number;
  total: number;
  csv_download_status: number;
  csv_download_file: string;
  csv_signed_url: string;
  csv_signed_expiry: 0 | 1 | 2; // 0 = Empty, 1 = Generating, 2 = Download link available
}

export interface EmployeeImportHistoryDetailsLogsProps {
  row: number;
  employeeId: string;
  errorMessage: string;
}

export interface EmployeeImportHistoryDetailsLogsFirestoreProps {
  row: number;
  employee_id: string;
  error_message: string;
}

export interface OTRatesProps {
  applyWithHoldingTax: boolean;
  workingDays: number;
  overtimeRegRate: number;
  overtimeRestDayRate: number;
  overtimeSHRate: number;
}

export interface ShiftProps {
  workingHours: number;
}

export interface KYCDataProps {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  email: string;
  addressL0Id: number;
  addressL1Id: number;
  addressL2Id: number;
  otherAddress: string;
  zipCode: string;
  tierLabel: string;
  birthDate: string;
  placeOfBirth: string;
  nationality?: string;
  gender: string;
  civilStatus: string;
}
