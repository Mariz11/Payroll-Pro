interface attendanceApplication {
  requestedDate: Date | string;
  fromDate?: string | Date;
  toDate?: string | Date;
  type: {
    name: string;
  };
  reason: string;
  assignEmployee: {
    name?: string;
    id?: number;
    companyId?: number;
    userId?: number;
  };
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
