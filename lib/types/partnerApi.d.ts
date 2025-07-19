interface RegisterEmployeePayload {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  email: string;
  addressL0Id: number;
  addressL1Id: number;
  addressL2Id: number;
  otherAddress: string;
  zipCode?: number | null;
  tierLabel: string;
  birthDate: string;
  placeOfBirth: string;
  nationality: string;
  gender: string;
  civilStatus: string;
}

interface UpdateEmployeePayload {
  addresses: {
    current: {
      addressL0Id: number;
      addressL1Id?: number;
      addressL2Id?: number;
      addressL3Id?: number;
      addressL4Id?: number;
      addressL5Id?: number;
      intlProvinceCity?: string;
      otherAddress?: string;
      zipCode?: string;
      addressId: number;
    };
    permanent: {
      addressL0Id: number;
      addressL1Id?: number;
      addressL2Id?: number;
      addressL3Id?: number;
      addressL4Id?: number;
      addressL5Id?: number;
      intlProvinceCity?: string;
      otherAddress?: string;
      zipCode?: string;
      addressId: number;
    };
  };
  ids: [
    {
      customerId: number;
      expirationDate: string;
      idCardId?: number;
      idNumber: string;
      isRequired: number;
      validIdCardId: number;
    }
  ];
  userDetails: {
    branchId?: number;
    branchName?: string;
    mlUserId: number;
    mlUserFirstName?: string;
    mlUserLastName?: string;
    mlUserResourceIdNumber?: string;
  };
  birthDate: string;
  branchRemarks?: string;
  cellphoneNumber: string;
  civilStatus: string;
  ckycId: string;
  createdAtBranchId?: number;
  createdByService: string;
  createdByUserId?: number;
  dateCreated: string;
  dateModified?: string;
  modifiedByUserId?: number;
  modifiedByService: string;
  modifiedAtBranchId: number;
  customerId: number;
  email?: string;
  gender: string;
  occupation?: {
    organizationName?: string;
    pensionSource?: string;
    workAddress?: string;
    workRemarks?: string;
    yearRetired?: number;
    offering?: string;
    workPosition?: string;
    natureOfWork?: string;
    sourceOfIncome?: string;
  };
  pictures: {
    customerPhoto: string;
    idPhoto1: string;
    idPhoto2: string;
    idPhoto3: string;
    kycBottom: string;
    kycTop: string;
  };
  placeOfBirth?: string;
  name: {
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
  };
  nationality: string;
  seccomRemarks?: string;
  telephoneNumber?: string;
}

interface RequestPreSignedImageURLS {
  ckycId: string;
  images: [
    {
      mimeType: string;
      fileName: string;
      extension: string;
    }
  ];
}

interface DeactivateCompanyPayload {
  companyAccountId: string;
  status: string;
}

interface ResetEmployeeVerificationPayload {
  ckycId: string;
}

interface DeactivateEmployeePayload {
  ckycId: string;
  tierLabel: string;
}

interface SendEmailPayload {
  to: string;
  subject: string;
  content: string;
  cc?: string;
}

interface SendSMSPayload {
  recepientNo: string;
  content: string;
  sender: 'MLHUILLIER' | 'MLWALLET';
}

type BatchRequestDetails = {
  EmployeeFirstName: string;
  EmployeeMiddleName: string;
  EmployeeLastName: string;
  EmployeeKYCId: string;
  EmployeeNetIncome: Decimal;
  PayrollType?: string;
  Cycle?: string;
};
interface BatchUploadPayload {
  batchNumber: string | null;
  accountNo: string;
  companyName: string;
  requestBy: string;
  totalAmount: number;
  isDirectUpload?: number;
  dateProcess?: string | Date;
  batchRequestDetails: BatchRequestDetails[];
  isReprocess: number;
}

type Operator = {
  id: string;
  name: string;
};

interface TransferAmountEmployee {
  nonce: string;
  timestamp: number;
  companyAccountId: string;
  employeeAccountId: string;
  netSalary: number;
  batchNumber: string;
  operator: Operator;
}

interface TransferAmountToMainPayload {
  nonce: string;
  type: string;
  timestamp: number;
  companyAccountId: string;
  employeeAccountId: string;
  amount: number;
  operator: Operator;
}

interface DisburseSalary {
  nonce: string;
  transactionSubtype:
    | null
    | 'PETTY_CASH'
    | 'CASH_ADVANCE'
    | 'ALLOWANCE'
    | 'INCENTIVES'
    | 'ML_FUND'
    | 'REFUND'
    | 'SPECIAL_PAYROLL';
  timestamp: number;
  companyAccountId: string;
  ckycId: string;
  netSalary: number;
  batchNumber: string;
  operator: Operator;
  modeOfPayroll: string;
  payrollType?: string;
  cycle?: string;
}

interface GetEmployeeWalletBalancePayload {
  ckycId: string;
  tierLabel: string;
}

interface BranchCashInTransactionPayload {
  principalAmount: number;
  sender: BranchCashInSender;
  clientName: string;
}

interface QRPHcashInTrannsactionPayload {
  nonce: string | uuid;
  timestamp: number | millis;
  principalAmount: number;
  companyAccountId: string;
  mobileNumber: string;
  address: string;
}

interface BranchCashInSender {
  accountId: string;
  name: string;
  mobileNumber: string;
  address: string;
}

interface PaySalaryLoansPayload {
  nonce: string | uuid;
  timestamp: number | millis;
  principalAmount: number;
  companyAccountId: string;
  employeeCKYCId: string;
  operator: PaySalaryLoansOperator;
}

interface PaySalaryLoansOperator {
  id: any;
  name: string;
}

interface UpdateLoanSchedulePayload {
  loanRefNum: string;
  data: {
    amountPaid: number;
    companyId: string;
    ckycId: string;
    operator: Operator;
  };
}
