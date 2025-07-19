interface DeductionForms {
  deductionData?: any;
  deductionType: {
    name: string;
  };
  deductionId: number | null;
  assignEmployee: {
    name: string;
    id: number;
    companyId: number;
    departmentId?: number;
    userId: number;
    payrollType?: string;
  };
  totalAmmount: number;
  timePeriodDeduction: {
    name: string;
  };
  paymentCycles?: number | null;
  accountNumberEmployee?: string | null;
  accountNumberEmployer?: string | null;
  remarks?: string | null;
  // payrollDeductions: any | null;
  totalAmountPaid?: number;
  cycleChosen?: string;
}
