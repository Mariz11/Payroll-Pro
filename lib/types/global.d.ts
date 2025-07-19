// USE CONTEXT HOOK
interface GlobalContext {
  authRole: string;
  userData: any;
  selectedCompany: any;
  userToken: any;
  refetchFunction?: () => void;
}

// DASHBOARD NAV | REPORTS DASHBOARD MENU
interface Buttons {
  label: string;
  type: ButtonType;
  isDropdown: boolean;
  isIcon: boolean;
  icon?: string;
  dropDownButtons?: {
    label: string;
    dropDownHandler?: () => void;
    tooltip?: string;
  }[];
  handler?: () => void;
}

// SIDEBAR
interface Label {
  mainHeader?: string;
  header?: string;
  subHeader?: string;
  buttonText?: string;
}
interface Configuration {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit?: boolean;
  isBulk?: boolean;
}

interface Forms {
  forms: {
    value?: any;
    setValue?: (value: string) => void;
    label: string;
    type: FormType;
    options?: { name: string; code: string }[];
    name: string;
    placeholder: string;
    isVisible: boolean;
    isRequired: boolean;
    isDisabled: boolean;
    dropDownValues?: (fieldName: string, selectedValue: any) => void;
    startDate?: Date;
    endDate?: Date;
    minDate?: Date;
    maxDate?: Date;
  }[];
  buttons: {
    label: string;
    type: ButtonLabel;
    isDisabled?: boolean;
    handler?: () => void;
    child?: React.ReactNode;
  }[];
}

// OTHERS
interface WalletAsset {
  title: string;
  company: string;
  amount: string;
  number: string;
  bgColor: string;
}

interface Logs {
  logsData: Array<{
    name: string;
    action: string;
    timeDate: Date;
  }>;
}

interface TopLogs {
  logsData: Array<{
    name: string;
    col2: string;
  }>;
}

interface DoughnutData {
  labels: string[];
  datasets: Array<{
    data: string[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
  }>;
}

interface PieData {
  labels: string[];
  datasets: Array<{
    data: string[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
  }>;
}

interface TableHeaders {
  title: string;
  header1: string;
  header2: string;
}

interface ShiftsSidebarProps {
  visibleRight: boolean;
  setVisibleRight: React.Dispatch<React.SetStateAction<boolean>>;
  buttonText: string;
}

interface DeductionsSidebarProps {
  visibleRight: boolean;
  setVisibleRight: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserType {
  userId: number;
  companyId: number;
  employeeId: number | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  contactNumber: string;
  emailAddress: string;
  birthDate: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

interface ShiftDataState {
  shiftName?: string;
  department?: {
    name: string;
    code: string;
  };
  timeIn?: Date;
  timeOut?: Date;
  lunchStart?: Date;
  lunchEnd?: Date;
}

interface HolidayDataState {
  holidayName?: string;
  holidayDate?: Date;
  holidayType?: string;
}

interface Pagination {
  offset: number;
  limit: number;
}

interface SelectedHoliday {
  message: {
    holidayName: string;
    holidayDate: Date;
    holidayType: string;
  };
}

// SHIFTS
interface SelectedShift {
  message: {
    shiftName: string;
    timeIn: Date;
    timeOut: Date;
    lunchStart: Date;
    lunchEnd: Date;
  };
}

// DEPARTMENT DATA
interface EmployeeData {
  data: {
    employeeName: string;
    employeeId: string;
    department?: string;
  };
}

// LINE CHART
interface MLDeposited {
  businessMonth: string;
  totalNetPay: number;
}

interface Attendance {
  date?: string;
  holiday?: {
    holidayType?: string;
  };
  attendanceId: number;
  timeIn: null;
  timeOut: null;
  lunchTimeIn: null;
  lunchTimeOut: null;
  undertimeHours: number;
  lateHours: number;
  status: string;
  isDayOff: boolean;
  isPresent: boolean;
  isLeave: boolean;
  isHalfDay: boolean;
}

//Announcements
interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  image: string;
  isPosted: boolean;
  order: number;
  createdAt: string;
  department_announcements: DepartmentAnnouncement[];
}

interface DepartmentAnnouncement {
  departmentAnnouncementId: number;
  companyId: number;
  announcementId: number;
  departmentId: number;
}

interface EmployeeLogDetails {
  date: Date;
  timeIn: Date | null;
  lunchTimeOut: Date | null;
  lunchTimeIn: Date | null;
  timeOut: Date | null;
}

interface Shift {
  shiftId?: number;
  shiftName: string;
  timeIn: string;
  timeOut: string;
  lunchStart: string;
  lunchEnd: string;
  workingHours: number;
}

interface AttendanceApplication {
  attendanceAppId?: number;
  requestedDate: Date | string;
  fromDate?: string | Date;
  toDate?: string | Date;
  timeFrom?: string | null;
  timeTo?: string | null;
  numberOfHours?: number;
  numberOfDays?: number;
  type: string;
  reason: string;
  employeeId: number;
  approverId: number;
  changed_schedules: ChangeSchedule[];
}

interface ApplicationLeaveSecondary {
  employeeName?: string | undefined;
  ApplyLeavesValidator: {
    type: {
      name: string;
    };
    requestedDate: string | Date;
    fromDate?: string | Date;
    toDate?: string | Date;
    reason: string;
    assignEmployee: {
      name?: string;
      id?: number;
      companyId?: number;
      userId?: number;
    };
  };
}

interface ChangeSchedule {
  gridId: string | null;
  changeScheduleId: number | null;
  date: Date | null;
  timeIn: string | null;
  timeOut: string | null;
  lunchStart: string | null;
  lunchEnd: string | null;
  typeOfChange: string | null;
  workingHours: number;
}

type EmployeeImportDetails = {
  taskCode: string;
  companyId: number;
  userId: number;
  shiftId: number;
  departmentId: number;
  employeeCode: string;
  role: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  suffix: string | null;
  hiringDate: string;
  startDate: string;
  contactNumber: string;
  emergencyContactNumber1: string | null;
  emergencyContactNumber2: string | null;
  emailAddress: string;
  streetAddress: string;
  city: string;
  province: string;
  country: string;
  zipCode?: number | null;
  placeOfBirth: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  educationalAttainment: string | null;
  schoolGraduated: string | null;
  degree: string | null;
  positionTitle: string;
  dayOff: string | null;
  employmentStatus: string;
  modeOfPayroll: string;
  basicPay: number;
  tinNumber: string | null;
  allowance: number;
  vacationLeaveCredits: number;
  sickLeaveCredits: number;
  serviceIncentiveLeaveCredits: number;
  soloParentLeaveCredits: number;
  paternityLeaveCredits: number;
  maternityLeaveCredits: number;
  otherLeaveCredits: number;
  emergencyLeaveCredits: number;
  birthdayLeaveCredits: number;
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
};
