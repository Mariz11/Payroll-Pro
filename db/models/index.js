import ActivityLog from './activityLog';
import Attendance from './attendance';
import AttendanceApplication from './attendanceApplication';
import Batch_uploads from './batchUpload';
import BatchUploadAgent from './batchUploadAgent';
import City from './city';
import Company from './company';
import CompanyPayCycle from './companyPayCycle';
import Country from './country';
import Deduction from './deduction';
import Department from './department';
import Employee from './employee';
import EmployeeBenefit from './employeeBenefit';
import EmployeeLeave from './employeeLeave';
import EmployeeProfile from './employeeProfile';
import Holiday from './holiday';
import Payroll from './payroll';
import Province from './province';
import Shift from './shift';
import Transactions from './transactions';
import User from './user';
import VerificationCode from './verificationCode';
import PayrollDeductions from './payrollDeductions';
import TransferToEmployee from './transferToEmployeeAcctTransactions';
import PayrollType from './payrollType';
import CashInTransactions from './cashInTransactions';
// Updated Dwine (2/19/24): added import for announcement START
import Announcement from './announcement';
import DepartmentAnnouncement from './departmentAnnouncement';
import Notification from './notifications';
import ViewDetails from './viewDetails';
import ChangedSchedule from './changedSchedules';
import Ledger from './ledger';
// Updated Dwine (2/19/24): added import for announcement START

// Updated Jethro (6/18/24): added import for announcement START
import Module from './module';
import UserRole from './userRole';
import CompanyWithholdingTaxShield from './companyWithholdingTaxShield';
// Updated Jethro (6/18/24): added import for announcement START

import PayrollPremiumRate from './payrollPremiumRate';
import PayrollAdjustments from './payrollAdjustments';
import Charge from './charge';
import Configuration from './configuration';

// Updated Dwine (2/19/24): added import for announcement END

// Updated Jethro (06/27/24): added import for allowance breakdown START
import AllowanceBreakdown from './allowanceBreakdown';
import ResetLink from './resetLinks';
// Updated Jethro (06/27/24): added import for allowance breakdown END
import ModuleAction from './moduleAction';
import RoleAction from './roleAction';
import moduleAction from './moduleAction';

import TaskProcesses from './taskProcesses';

import CompanyCharge from './companyCharge';

// Updated Trisha (04/10/25): added import for system log START
import SystemLog from './systemLog';
// Updated Trisha (04/10/25): added import for system log END

Company.hasMany(CashInTransactions, { foreignKey: 'companyId' });
CashInTransactions.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(CompanyPayCycle, { foreignKey: 'companyId' });
CompanyPayCycle.belongsTo(Company, { foreignKey: 'companyId' });

PayrollType.hasMany(CompanyPayCycle, { foreignKey: 'payrollTypeId' });
CompanyPayCycle.belongsTo(PayrollType, { foreignKey: 'payrollTypeId' });

Company.hasMany(User, { foreignKey: 'companyId' });
User.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Employee, { foreignKey: 'companyId' });
Employee.belongsTo(Company, { foreignKey: 'companyId' });

Employee.hasOne(User, { foreignKey: 'employeeId' });
User.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(Attendance, { foreignKey: 'employeeId' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

Company.hasMany(Attendance, { foreignKey: 'companyId' });
Attendance.belongsTo(Company, { foreignKey: 'companyId' });

Employee.hasMany(AttendanceApplication, { foreignKey: 'employeeId' });
AttendanceApplication.belongsTo(Employee, { foreignKey: 'employeeId' });

Company.hasMany(AttendanceApplication, { foreignKey: 'companyId' });
AttendanceApplication.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(AttendanceApplication, { foreignKey: 'approverId' });
AttendanceApplication.belongsTo(User, { foreignKey: 'approverId' });

AttendanceApplication.hasMany(ChangedSchedule, {
  foreignKey: 'attendanceAppId',
});
ChangedSchedule.belongsTo(AttendanceApplication, {
  foreignKey: 'attendanceAppId',
});

Company.hasMany(TaskProcesses, { foreignKey: 'companyId' });
TaskProcesses.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(TaskProcesses, { foreignKey: 'userId' });
TaskProcesses.belongsTo(User, { foreignKey: 'userId' });

Company.hasMany(ActivityLog, { foreignKey: 'companyId' });
ActivityLog.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Batch_uploads, { foreignKey: 'companyId' });
Batch_uploads.belongsTo(Company, { foreignKey: 'companyId' });

City.hasMany(EmployeeProfile, { foreignKey: 'cityId' });
EmployeeProfile.belongsTo(City, { foreignKey: 'cityId' });

Country.hasMany(Province, { foreignKey: 'countryId' });
Province.belongsTo(Country, { foreignKey: 'countryId' });

Country.hasMany(EmployeeProfile, { foreignKey: 'countryId' });
EmployeeProfile.belongsTo(Country, { foreignKey: 'countryId' });

Company.hasMany(Deduction, { foreignKey: 'companyId' });
Deduction.belongsTo(Company, { foreignKey: 'companyId' });

Employee.hasMany(Deduction, { foreignKey: 'employeeId' });
Deduction.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(TransferToEmployee, { foreignKey: 'employeeId' });
TransferToEmployee.belongsTo(Employee, { foreignKey: 'employeeId' });

Deduction.hasOne(TransferToEmployee, { foreignKey: 'deductionId' });
TransferToEmployee.belongsTo(Deduction, { foreignKey: 'deductionId' });

Company.hasMany(Department, { foreignKey: 'companyId' });
Department.belongsTo(Company, { foreignKey: 'companyId' });

Department.hasMany(Employee, { foreignKey: 'departmentId' });
Employee.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Attendance, { foreignKey: 'departmentId' });
Attendance.belongsTo(Department, { foreignKey: 'departmentId' });

PayrollType.hasMany(Department, { foreignKey: 'payrollTypeId' });
Department.belongsTo(PayrollType, { foreignKey: 'payrollTypeId' });

Employee.hasOne(EmployeeBenefit, { foreignKey: 'employeeId' });
EmployeeBenefit.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasOne(EmployeeLeave, { foreignKey: 'employeeId' });
EmployeeLeave.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasOne(EmployeeProfile, { foreignKey: 'employeeId' });
EmployeeProfile.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasOne(User, { foreignKey: 'employeeId' });
User.belongsTo(Employee, { foreignKey: 'employeeId' });

Company.hasMany(Holiday, { foreignKey: 'companyId' });
Holiday.belongsTo(Company, { foreignKey: 'companyId' });

Holiday.hasMany(Attendance, { foreignKey: 'holidayId' });
Attendance.belongsTo(Holiday, { foreignKey: 'holidayId' });

Company.hasMany(Payroll, { foreignKey: 'companyId' });
Payroll.belongsTo(Company, { foreignKey: 'companyId' });

Employee.hasMany(Payroll, { foreignKey: 'employeeId' });
Payroll.belongsTo(Employee, { foreignKey: 'employeeId' });

Department.hasMany(Payroll, { foreignKey: 'departmentId' });
Payroll.belongsTo(Department, { foreignKey: 'departmentId' });

Payroll.hasMany(PayrollDeductions, {
  foreignKey: 'payroll_id',
});
PayrollDeductions.belongsTo(Payroll, { foreignKey: 'payroll_id' });

Employee.hasMany(PayrollDeductions, { foreignKey: 'employeeId' });
PayrollDeductions.belongsTo(Employee, { foreignKey: 'employeeId' });

Deduction.hasMany(PayrollDeductions, { foreignKey: 'deductionId' });
PayrollDeductions.belongsTo(Deduction, { foreignKey: 'deductionId' });

Transactions.hasOne(PayrollDeductions, { foreignKey: 'transferId' });
PayrollDeductions.belongsTo(Transactions, { foreignKey: 'transferId' });

Batch_uploads.hasMany(Payroll, { foreignKey: 'batchUploadId' });
Payroll.belongsTo(Batch_uploads, { foreignKey: 'batchUploadId' });

Transactions.hasMany(Payroll, {
  foreignKey: 'transferTransactionId',
});
Payroll.belongsTo(Transactions, {
  foreignKey: 'transferTransactionId',
});

Province.hasMany(City, { foreignKey: 'provinceId' });
City.belongsTo(Province, { foreignKey: 'provinceId' });

Province.hasMany(EmployeeProfile, { foreignKey: 'provinceId' });
EmployeeProfile.belongsTo(Province, { foreignKey: 'provinceId' });

Company.hasMany(Shift, { foreignKey: 'companyId' });
Shift.belongsTo(Company, { foreignKey: 'companyId' });

Shift.hasMany(Employee, { foreignKey: 'shiftId' });
Employee.belongsTo(Shift, { foreignKey: 'shiftId' });

Company.hasMany(Transactions, { foreignKey: 'companyId' });
Transactions.belongsTo(Company, { foreignKey: 'companyId' });

User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

Employee.hasMany(VerificationCode, { foreignKey: 'employeeId' });
VerificationCode.belongsTo(Employee, { foreignKey: 'employeeId' });

// Updated Dwine (2/19/24): added associations for announcement START
Company.hasMany(DepartmentAnnouncement, { foreignKey: 'companyId' });
DepartmentAnnouncement.belongsTo(Company, { foreignKey: 'companyId' });

Department.hasMany(DepartmentAnnouncement, { foreignKey: 'departmentId' });
DepartmentAnnouncement.belongsTo(Department, { foreignKey: 'departmentId' });

Announcement.hasMany(DepartmentAnnouncement, {
  foreignKey: 'announcementId',
  onDelete: 'CASCADE',
});
DepartmentAnnouncement.belongsTo(Announcement, {
  foreignKey: 'announcementId',
});

Department.hasMany(ViewDetails, {
  foreignKey: 'departmentId',
});
ViewDetails.belongsTo(Department, {
  foreignKey: 'departmentId',
});

Company.hasMany(ViewDetails, {
  foreignKey: 'companyId',
});
ViewDetails.belongsTo(Company, {
  foreignKey: 'companyId',
});
Announcement.hasMany(ViewDetails, {
  foreignKey: 'announcementId',
});
ViewDetails.belongsTo(Announcement, {
  foreignKey: 'announcementId',
});

User.hasMany(ViewDetails, {
  foreignKey: 'userId',
});
ViewDetails.belongsTo(User, {
  foreignKey: 'userId',
});

// notifications
Company.hasMany(Notification, {
  foreignKey: 'companyId',
});

Notification.belongsTo(Company, {
  foreignKey: 'companyId',
});

Payroll.hasOne(PayrollPremiumRate, {
  foreignKey: 'payroll_id',
});
PayrollPremiumRate.belongsTo(Payroll, {
  foreignKey: 'payroll_id',
});
// payroll adjustments

Payroll.hasMany(PayrollAdjustments, { foreignKey: 'payroll_id' });
PayrollAdjustments.belongsTo(Payroll, { foreignKey: 'payroll_id' });
//  Updated Dwine (2/19/24): added associations for announcement END

// Updated Jethro (6/18/24): added associations for announcement START
Company.hasMany(UserRole, {
  foreignKey: 'companyId',
});
UserRole.belongsTo(Company, {
  foreignKey: 'companyId',
});

User.belongsTo(UserRole, {
  foreignKey: 'roleId',
});
UserRole.hasMany(User, {
  foreignKey: 'roleId',
});
//  Updated Jethro (6/18/24): added associations for announcement END

// Updated Jethro (6/27/24): added associations for announcement START
Company.hasMany(AllowanceBreakdown, {
  foreignKey: 'companyId',
});

AllowanceBreakdown.belongsTo(Company, {
  foreignKey: 'companyId',
});

Employee.hasOne(AllowanceBreakdown, {
  foreignKey: 'employeeId',
});

AllowanceBreakdown.belongsTo(Employee, {
  foreignKey: 'employeeId',
});

Configuration.hasMany(Charge, {
  foreignKey: 'configurationId',
});

Charge.belongsTo(Configuration, {
  foreignKey: 'configurationId',
});

Company.hasMany(CompanyWithholdingTaxShield, { foreignKey: 'companyId' });
CompanyWithholdingTaxShield.belongsTo(Company, { foreignKey: 'companyId' });

PayrollType.hasMany(CompanyWithholdingTaxShield, {
  foreignKey: 'payrollTypeId',
});
CompanyWithholdingTaxShield.belongsTo(PayrollType, {
  foreignKey: 'payrollTypeId',
});

Deduction.hasMany(Ledger, {
  foreignKey: 'deductionId',
});
Ledger.belongsTo(Deduction, {
  foreignKey: 'deductionId',
});
//  Updated Jethro (6/27/24): added associations for announcement END

Module.hasMany(ModuleAction, { foreignKey: 'moduleId' });
ModuleAction.belongsTo(Module, { foreignKey: 'moduleId' });

UserRole.hasMany(RoleAction, { foreignKey: 'roleId' });
RoleAction.belongsTo(UserRole, { foreignKey: 'roleId' });

moduleAction.hasMany(RoleAction, { foreignKey: 'moduleActionId' });
RoleAction.belongsTo(moduleAction, { foreignKey: 'moduleActionId' });
User.hasMany(ResetLink, {
  foreignKey: 'userId',
});
ResetLink.belongsTo(User, {
  foreignKey: 'userId',
});

Company.hasMany(CompanyCharge, { foreignKey: 'companyId' });
CompanyCharge.belongsTo(Company, { foreignKey: 'companyId' });

export {
  ActivityLog,
  Attendance,
  AttendanceApplication,
  Batch_uploads,
  BatchUploadAgent,
  City,
  Company,
  CompanyPayCycle,
  Country,
  Configuration,
  Deduction,
  Department,
  Employee,
  EmployeeBenefit,
  EmployeeLeave,
  EmployeeProfile,
  Holiday,
  Payroll,
  PayrollDeductions,
  Province,
  Shift,
  Transactions,
  User,
  VerificationCode,
  TransferToEmployee,
  PayrollType,
  CashInTransactions,
  // Updated Dwine (2/19/24): added export for announcement START
  Announcement,
  DepartmentAnnouncement,
  ViewDetails,
  // Updated Dwine (2/19/24): added export for announcement END

  // Updated Dwine (6/18/24): added export for announcement START
  Module,
  UserRole,
  ChangedSchedule,
  PayrollPremiumRate,
  Charge,
  Ledger,
  // Updated Jethro (06/27/24): added export for announcement START
  AllowanceBreakdown,
  CompanyWithholdingTaxShield,
  ResetLink,
  CompanyCharge,
  // Updated Jethro (06/27/24): added export for announcement END
  ModuleAction,
  RoleAction,
  TaskProcesses,
  PayrollAdjustments,
  // Updated Trisha (04/10/25): added export for system log START
  SystemLog,
  // Updated Trisha (04/10/25): added export for system log END
};
