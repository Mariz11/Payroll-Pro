interface PostPayrollData {
  departmentId: number;
  businessMonth: string;
  cycle: string;
  departmentName: string;
  isDirect: boolean;
  isReposting: boolean;
}

interface ProcessingPayroll {
  taskId: number | string;
  percentage: number;
  taskName: string;
  departmentName: string;
  businessMonth: string;
  cycle: string;
  createdAt: string;
  successCount: number;
  totalProcess: number;
  status: 1 | 0;
  isAborted?: boolean;
  failedRemarks: any[];
}

type EmployeePayrollDetails = {
  employeeId: number;
  ckycId: string;
  departmentId: number;
  department: {
    departmentId: number;
    payrollTypeId: number;
    payroll_type: {
      type: string;
    };
  };
  employee_profile: {
    employeeProfileId: number;
    firstName: string;
    lastName: string;
    middleName: string | null;
    suffix: string | null;
    employeeFullName: string;
  };
};

type PayrollDetails = {
  payroll_id: number;
  employeeId: number;
  employee: EmployeePayrollDetails;
  batchUploadId: number | null;
  batchNumber: string;
  transferTransactionId: number | null;
  departmentId: number;
  batch_upload: any | null;
  businessMonth: string;
  cycle: string;
  modeOfPayroll: string;
  netPay: number;
  chargePerEmployee: number;
  payrollType: string;
  isDirect: boolean;
};

type PayrollBatchDetails = {
  payroll_id: number;
  employeeId: number;
  departmentId: number;
  employeeFullName: string;
  ckycId: string;
  batchUploadId: number | null;
  batchNumber: string;
  businessMonth: string;
  cycle: string;
  netSalary: number;
  modeOfPayroll: string;
  chargePerEmployee: number;
  payrollType: string;
  isDirect: boolean;
};
