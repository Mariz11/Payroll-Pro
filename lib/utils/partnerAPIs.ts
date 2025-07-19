import { removeExtraSpaces } from "./helper";
import axios from "axios";
import crypto from "crypto";
import moment from "@constant/momentTZ";
import {
  BATCH_REQUEST_APPROVAL_API,
  BATCH_UPLOAD_REQUEST_TOKEN_API,
  BRANCH_CASH_IN,
  CHECK_COMPANY_BALANCE_API,
  DISBURSE_SALARY,
  GENERATE_TOKEN_API,
  GET_CASH_IN_TRANSACTION,
  GET_EMPLOYEE_LOANS,
  GET_NATIONALITY,
  GET_SALARY_LOANS_FUNDS,
  ML_ANTI_TAMPERING_SECRET,
  ML_BATCH_UPLOAD_API_KEY,
  ML_BATCH_UPLOAD_CLIENT_ID,
  ML_BATCH_UPLOAD_SECRET_KEY,
  ML_BATCH_UPLOAD_USERNAME,
  ML_CKCYC_API_DOMAIN,
  ML_LOAN_SCHED_PRIV_KEY,
  ML_LOAN_SCHED_PUB_KEY,
  ML_PAYROLL_API_DOMAIN,
  ML_PAYROLL_API_KEY,
  ML_PAYROLL_SECRET_KEY,
  ML_SMS_PASSWORD,
  ML_SMS_USERNAME,
  PAY_SALARY_LOAN,
  QRPH_CASH_IN,
  REGISTER_COMPANY_API,
  REGISTER_EMPLOYEE_API,
  SEND_EMAIL_API,
  SERVICE_NAME,
  SMS_API,
  TRANSFER_MONEY_TO_SUBACCT_API,
  UPDATE_LOAN_SCHEDULE
} from "lib/constant/partnerAPIDetails";
// import { logger } from "./logger";

function xHashGenerator(payload: any) {
  const passPhrase = `${JSON.stringify(payload)}|${ML_ANTI_TAMPERING_SECRET}`;
  return crypto.createHash('sha512').update(passPhrase).digest('hex');
}

function generateTokenDebugLogs() {
  try {
    const censorMiddle = (str: string | undefined) => {
      if (!str) return "undefined";

      const firstFour = str.slice(0, 2);
      const lastFour = str.slice(-2);
      const middle = "*".repeat(str.length - 4);
      return firstFour + middle + lastFour;
    };

    // logger.info({
    //   label: "Generate Token Logs",
    //   apiKey: censorMiddle(ML_PAYROLL_API_KEY),
    //   secretKey: censorMiddle(ML_PAYROLL_SECRET_KEY),
    //   currentDate: moment().format(
    //     'YYYY-MM-DD'
    //   )
    // });
  } catch (error) {
    console.log('error in generateTokenDebugLogs', error);
  }
}

export async function generateToken() {
  generateTokenDebugLogs();
  const passPhrase = `${ML_PAYROLL_API_KEY}|${ML_PAYROLL_SECRET_KEY}|${moment().format(
    'YYYY-MM-DD'
  )}`;
  const signature = crypto
    .createHash('sha512')
    .update(passPhrase)
    .digest('hex');

  try {
    const getToken = await axios.post(
      GENERATE_TOKEN_API,
      {
        apiKey: ML_PAYROLL_API_KEY,
        signature: signature,
      },
      {
        timeout: 300000,
      }
    );
    return getToken.data.data.token;
  } catch (error: any) {
    // logger.error({
    //   label: 'Generate Token API',
    //   message: JSON.stringify(error.response?.data),
    // });
    return error.response?.data;
  }
}

export async function registerCompanyToKYC(companyName: string) {
  const token = await generateToken();

  const payLoad = {
    name: companyName,
  };

  try {
    const registerCompany = await axios.post(REGISTER_COMPANY_API, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Register Company API',
    //   message: JSON.stringify(registerCompany?.data),
    // });
    return {
      success: true,
      responseData: registerCompany?.data,
    };
  } catch (error: any) {
    console.log(error);
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Register Company API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function deactivateCompany({
  companyAccountId,
  status,
}: DeactivateCompanyPayload) {
  const token = await generateToken();
  const payLoad = {
    status: status,
  };

  try {
    const response = await axios.put(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/${companyAccountId}/activation`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-hash': xHashGenerator(payLoad),
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Deactivate Company API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Register Company API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function registerEmployeeToKYC({
  mobileNumber,
  firstName,
  lastName,
  middleName,
  suffix,
  email,
  addressL0Id,
  addressL1Id,
  addressL2Id,
  otherAddress,
  zipCode,
  tierLabel,
  birthDate,
  placeOfBirth,
  nationality,
  gender,
  civilStatus,
}: RegisterEmployeePayload) {
  const token = await generateToken();

  const payLoad = {
    mobileNumber: mobileNumber,
    firstName: firstName,
    lastName: lastName,
    middleName: middleName,
    suffix: suffix,
    email: email,
    address: {
      addressL0Id: addressL0Id,
      addressL1Id: addressL1Id,
      addressL2Id: addressL2Id,
      otherAddress: otherAddress,
      zipCode: zipCode,
    },
    tierLabel: tierLabel,
    birthDate: birthDate,
    placeOfBirth: placeOfBirth,
    nationality: nationality,
    gender: gender,
    civilStatus: civilStatus,
  };

  try {
    const registerEmployee = await axios.post(REGISTER_EMPLOYEE_API, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Register Employee API',
    //   message: JSON.stringify(registerEmployee?.data),
    // });
    return {
      success: true,
      responseData: registerEmployee?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    let mismatchedInfos = null;
    if (response && response.hasOwnProperty('data')) {
      errorData = response?.data;
      if (errorData.code == 'CANNOT_LINK_ACCOUNT_TO_EMPLOYEE_ERROR') {
        const mismatched = errorData.message.split('.');
        mismatchedInfos = mismatched[1].split(':');
        mismatchedInfos = mismatchedInfos[1]
          .split(',')
          .map((i: any) => removeExtraSpaces(i));
      } else if (errorData.code == 'CKYC_KYC_EXISTS') {
        mismatchedInfos = ['contactNumber'];
      }
    } else errorData = error;
    // logger.error({
    //   label: 'Register Employee API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      mismatchedInfos: mismatchedInfos,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function updateEmployeeKYCInfo({
  addresses,
  ids,
  userDetails,
  birthDate,
  branchRemarks,
  cellphoneNumber,
  civilStatus,
  ckycId,
  createdAtBranchId,
  createdByService,
  createdByUserId,
  dateCreated,
  dateModified,
  modifiedByUserId,
  modifiedByService,
  modifiedAtBranchId,
  customerId,
  email,
  gender,
  occupation,
  pictures,
  placeOfBirth,
  name,
  nationality,
  seccomRemarks,
  telephoneNumber,
}: UpdateEmployeePayload) {
  const token = await generateToken();

  const payLoad = {
    addresses,
    ids,
    userDetails,
    birthDate,
    branchRemarks,
    cellphoneNumber,
    civilStatus,
    ckycId,
    createdAtBranchId,
    createdByService,
    createdByUserId,
    dateCreated,
    dateModified,
    modifiedByUserId,
    modifiedByService,
    modifiedAtBranchId,
    customerId,
    email,
    gender,
    occupation,
    pictures,
    placeOfBirth,
    name,
    nationality,
    seccomRemarks,
    telephoneNumber,
  };

  try {
    const response = await axios.put(
      `${ML_CKCYC_API_DOMAIN}/customers/${ckycId}`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-hash': xHashGenerator(payLoad),
        },
        timeout: 300000,
      }
    );

    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Update Employee KYC API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function requestPreSignedImageURLS({
  ckycId,
  images,
}: RequestPreSignedImageURLS) {
  const token = await generateToken();
  const payLoad = {
    images,
  };

  try {
    const response = await axios.post(
      `${ML_CKCYC_API_DOMAIN}/customers/${ckycId}/pre-signed-image-urls`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-hash': xHashGenerator(payLoad),
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Request Presigned URL API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Request Presigned URL API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function resetEmployeeVerification({
  ckycId,
}: ResetEmployeeVerificationPayload) {
  const token = await generateToken();
  const payLoad = {};

  try {
    const response = await axios.patch(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/employees/${ckycId}/reset-verification`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-hash': xHashGenerator(payLoad),
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Reset Employee Verification API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Reset Employee Verification API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function deactivateEmployee({
  ckycId,
  tierLabel,
}: DeactivateEmployeePayload) {
  const token = await generateToken();
  const payLoad = {
    companyTierLabel: tierLabel,
  };

  try {
    const response = await axios.put(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/employees/${ckycId}/remove-company-tier`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-hash': xHashGenerator(payLoad),
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Deactivate Employee API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Deactivate Employee API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function getCompanyBalance({
  companyAccountId,
}: {
  companyAccountId: string;
}) {
  const token = await generateToken();

  try {
    const response = await axios.get(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/${companyAccountId}/balance`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Get Company Wallet Balance API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    console.log(error);
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get Company Wallet Balance API',
    //   message: JSON.stringify({
    //     ...errorData,
    //     payload: { companyAccountId: companyAccountId },
    //   }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function checkCompanyWalletBalance({
  companyAccountId,
  balanceToCheck,
}: {
  companyAccountId: string;
  balanceToCheck: number;
}) {
  const token = await generateToken();

  try {
    const response = await axios.get(
      `${CHECK_COMPANY_BALANCE_API}?accountId=${companyAccountId}&minimumBalance=${balanceToCheck}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Check Company Wallet Balance API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Check Company Wallet Balance API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function transferMoneyToSubAccount({
  nonce,
  timestamp,
  type,
  companyAccountId,
  employeeAccountId,
  amount,
  operator,
}: TransferAmountToMainPayload) {
  const token = await generateToken();

  const payLoad = {
    nonce: nonce,
    type: type,
    timestamp: timestamp,
    companyAccountId: companyAccountId,
    employeeAccountId: employeeAccountId,
    amount: amount,
    operator: operator,
  };

  try {
    const response = await axios.post(TRANSFER_MONEY_TO_SUBACCT_API, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Transfer Money to Subacct API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Transfer Money to Subacct API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function disburseSalary({
  nonce,
  transactionSubtype,
  timestamp,
  companyAccountId,
  ckycId,
  netSalary,
  batchNumber,
  operator,
  modeOfPayroll,
  payrollType,
  cycle,
}: DisburseSalary) {
  const token = await generateToken();

  const payLoad = {
    nonce: nonce,
    transactionSubtype: transactionSubtype,
    timestamp: timestamp,
    companyAccountId: companyAccountId,
    employeeAccountId: ckycId,
    batchNumber: batchNumber,
    netSalary: netSalary,
    operator: operator,
  };

  try {
    const url =
      modeOfPayroll == 'KWARTA PADALA'
        ? `${DISBURSE_SALARY}?type=BRANCH`
        : `${DISBURSE_SALARY}?payrollType=${payrollType}&cycle=${cycle}`;
    const response = await axios.post(url, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Disburse Salary API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;

    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Disburse Salary API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function getBranchCashInTransaction({
  transactionCode,
  transactionType,
}: {
  transactionCode: string;
  transactionType: string;
}) {
  const token = await generateToken();

  try {
    const response = await axios.get(
      `${GET_CASH_IN_TRANSACTION}/${transactionCode}?transactionType=${transactionType}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Get Branch Cash In Transaction API',
    //   message: JSON.stringify(response?.data),
    // });
    console.log('response?.dataaa', response.data);
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get Branch Cash In Transaction API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function branchCashInTransaction({
  principalAmount,
  sender,
  clientName,
}: BranchCashInTransactionPayload) {
  const token = await generateToken();

  const payLoad = {
    principalAmount,
    sender: { ...sender },
    clientName,
  };

  try {
    const response = await axios.post(BRANCH_CASH_IN, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Cashin Transaction API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Cashin Transaction API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function cancelBranchCashIn({
  transactionCode,
  companyAccountId,
}: {
  transactionCode: string;
  companyAccountId: string;
}) {
  const token = await generateToken();

  const payLoad = {
    companyAccountId: companyAccountId,
  };

  try {
    const response = await axios.put(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/top-up/${transactionCode}/cancel`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'x-hash': xHashGenerator(payLoad),
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Cancel Cashin Transaction API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Cancel Cashin Transaction API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function QRPHcashInTransaction({
  nonce,
  timestamp,
  principalAmount,
  companyAccountId,
  mobileNumber,
  address,
}: QRPHcashInTrannsactionPayload) {
  const token = await generateToken();

  const payLoad = {
    nonce,
    timestamp,
    principalAmount,
    accountId: companyAccountId,
    mobileNumber,
    address,
  };

  try {
    const response = await axios.post(QRPH_CASH_IN, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'QRPH Cashin Transaction API',
    //   message: JSON.stringify(response?.data),
    // });

    console.log('response?.data', response);
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'QRPH Cashin Transaction API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function getSalaryLoanFunds() {
  const token = await generateToken();

  try {
    const response = await axios.get(`${GET_SALARY_LOANS_FUNDS}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Get Salary Loan Funds API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    console.log(error);
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get Salary Loan Funds API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function paySalaryLoans({
  nonce,
  timestamp,
  companyAccountId,
  employeeCKYCId,
  principalAmount,
  operator,
}: PaySalaryLoansPayload) {
  const token = await generateToken();

  const payLoad = {
    nonce,
    timestamp,
    principalAmount,
    senderAccountId: companyAccountId,
    employeeAccountId: employeeCKYCId,
    operator,
  };

  try {
    const response = await axios.post(PAY_SALARY_LOAN, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Pay Salary Loans API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Pay Salary Loans API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function transferMoneyToEmployee({
  nonce,
  timestamp,
  companyAccountId,
  employeeAccountId,
  netSalary,
  batchNumber,
  operator,
}: TransferAmountEmployee) {
  const token = await generateToken();

  const payLoad = {
    nonce: nonce,
    timestamp: timestamp,
    companyAccountId: companyAccountId,
    employeeAccountId: employeeAccountId,
    netSalary: netSalary,
    batchNumber: batchNumber,
    operator: operator,
  };

  try {
    const response = await axios.post(TRANSFER_MONEY_TO_SUBACCT_API, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Transfer Money to Employee API',
    //   message: JSON.stringify(response?.data),
    // });
    return response?.data.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Transfer Money to Employee API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function getEmployeeWalletBalance({
  ckycId,
  tierLabel,
}: GetEmployeeWalletBalancePayload) {
  const token = await generateToken();

  try {
    const response = await axios.get(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/employees/${ckycId}/balance?companyTierLabel=${encodeURIComponent(
        tierLabel
      )}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Get Emplyoee Wallet Balance API',
    //   message: JSON.stringify(response?.data),
    // });
    return response?.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get Emplyoee Wallet Balance API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function getTotalWalletBalanceFromAllCompanies() {
  const token = await generateToken();

  try {
    const response = await axios.get(
      `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/total-balance?status=ACTIVE`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Get All Company Wallet Balance API',
    //   message: JSON.stringify(response?.data),
    // });
    return response?.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get All Company Wallet Balance API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function updateLoanSchedule({
  loanRefNum,
  data,
}: UpdateLoanSchedulePayload) {
  const payLoad = {
    transaction_ref_num: loanRefNum,
    data: {
      amount_paid: data.amountPaid,
      senderAccountId: data.companyId,
      employeeAccountId: data.ckycId,
      operator: {
        id: data.operator.id,
        name: data.operator.name,
      },
      paid_branch_name: SERVICE_NAME,
    },
  };

  const passPhrase = `${ML_LOAN_SCHED_PUB_KEY}|${ML_LOAN_SCHED_PRIV_KEY}`;
  const digest = crypto.createHash('sha512').update(passPhrase).digest('hex');

  try {
    const response = await axios.put(
      `${UPDATE_LOAN_SCHEDULE}?digest=${digest}`,
      payLoad,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Update Loan Schedule API',
    //   message: JSON.stringify(response?.data),
    // });
    return response?.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Update Loan Schedule API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function getEmployeeLoans({ ckycId }: { ckycId: string }) {
  const passPhrase = `{"ckyc_id":"${ckycId}"}|${ML_LOAN_SCHED_PUB_KEY}`;
  const digest = crypto.createHash('sha512').update(passPhrase).digest('hex');

  try {
    const response = await axios.get(
      `${GET_EMPLOYEE_LOANS}?ckyc_id=${ckycId}&digest=${digest}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    return response?.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Get Employee Loans API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

async function generateBatchUploadToken() {
  const passPhrase = `${ML_BATCH_UPLOAD_SECRET_KEY}|${ML_BATCH_UPLOAD_API_KEY}|${ML_BATCH_UPLOAD_CLIENT_ID}`;
  const hashString = crypto
    .createHash('sha512')
    .update(passPhrase)
    .digest('hex');
  const payLoad = {
    Username: ML_BATCH_UPLOAD_USERNAME,
    ClientId: ML_BATCH_UPLOAD_CLIENT_ID,
  };

  try {
    const response = await axios.post(BATCH_UPLOAD_REQUEST_TOKEN_API, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        xApiHashString: hashString,
      },
      timeout: 300000,
    });
    // logger.info({
    //   label: 'Generate Batch Upload Token API',
    //   message: JSON.stringify(response?.data),
    // });
    return response?.data.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Generate Batch Upload Token API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function sendBatchUploadRequest({
  batchNumber,
  accountNo,
  companyName,
  requestBy,
  totalAmount,
  isDirectUpload,
  dateProcess,
  batchRequestDetails,
  isReprocess,
}: BatchUploadPayload) {
  const token = await generateBatchUploadToken();

  const payLoad = {
    AccountNo: accountNo,
    CompanyName: companyName,
    RequestBy: requestBy,
    TotalAmount: totalAmount,
    IsDirectUpload: isDirectUpload,
    DateProcess: dateProcess,
    BatchRequestDetails: batchRequestDetails,
    batchNumber: batchNumber,
    isReprocess: isReprocess,
  };

  try {
    const response = await axios.post(
      BATCH_REQUEST_APPROVAL_API,
      JSON.stringify(payLoad),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Send Batch Upload Request API',
    //   message: JSON.stringify(response?.data),
    // });
    return {
      success: true,
      responseData: response?.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Send Batch Upload Request API',
    //   message: JSON.stringify({ errorData, payLoad }),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export async function sendEmail({
  to,
  subject,
  content,
  cc,
}: SendEmailPayload) {
  try {
    const token = await generateToken();
    const payLoad = {
      cc,
      email: to,
      subject: subject,
      html: content,
    };

    const emailResponse = await axios.post(SEND_EMAIL_API, payLoad, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-hash': xHashGenerator(payLoad),
      },
      timeout: 300000,
    });

    // logger.info({
    //   label: 'Email API',
    //   message: JSON.stringify(emailResponse.data ?? emailResponse),
    // });
    return {
      success: true,
      message: `Email sent to ${to}`,
    };
  } catch (error) {
    // logger.error({
    //   label: 'Email API',
    //   message: JSON.stringify(error),
    // });
    return {
      success: false,
      responseData: error,
    };
  }
}

export async function sendSMS({
  recepientNo,
  sender,
  content,
}: SendSMSPayload) {
  try {
    const sendSMS = await axios.post(
      SMS_API,
      {
        username: ML_SMS_USERNAME,
        password: ML_SMS_PASSWORD,
        sender: sender,
        mobileno: recepientNo,
        msg: content,
        service_type: 'ML Payroll',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'SMS API',
    //   message: JSON.stringify(sendSMS?.data ?? sendSMS),
    // });
    return {
      success: true,
      responseData: sendSMS.data,
    };
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'SMS API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}

export function generatePassword() {
  let pass = '';
  let str =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';

  for (let i = 1; i <= 8; i++) {
    let char = Math.floor(Math.random() * str.length + 1);

    pass += str.charAt(char);
  }

  return pass;
}

export function generateVerificationCode() {
  const numbers = '1357902468';
  let ver_code = '';
  for (let i = 1; i <= 6; i++) {
    let pos = Math.floor(Math.random() * numbers.length);
    ver_code += numbers[pos];
  }

  return ver_code;
}

export async function getNationality() {
  const token = await generateToken();

  try {
    const response = await axios.get(`${GET_NATIONALITY}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        timeout: 300000,
      },
    });
    return response?.data?.data || [];
  } catch (error) {
    const message = 'Error fetching nationalities';
    // logger.error({
    //   label: message,
    //   error
    // });
    throw new Error(message);
  }
}

export async function verifyReCaptcha({
  reCaptchaToken,
}: {
  reCaptchaToken: string;
}) {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY}&response=${reCaptchaToken}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000,
      }
    );
    // logger.info({
    //   label: 'Verify ReCaptcha API',
    //   message: JSON.stringify(response?.data),
    // });
    return response?.data;
  } catch (error: any) {
    const response = error.response;
    let statusCode = response?.status;
    let errorData = null;
    if (response && response.hasOwnProperty('data')) errorData = response?.data;
    else errorData = error;
    // logger.error({
    //   label: 'Verify ReCaptcha API',
    //   message: JSON.stringify(errorData),
    // });
    return {
      success: false,
      message: errorData.message,
      responseData: errorData,
      statusCode: statusCode,
    };
  }
}
