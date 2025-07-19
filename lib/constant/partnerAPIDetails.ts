export const SERVICE_NAME = process.env.SERVICE_NAME;

// API DOMAINS
export const ML_AUTH_SERVICE_API_DOMAIN =
  process.env.ML_AUTH_SERVICE_API_DOMAIN;
export const ML_PAYROLL_API_DOMAIN = process.env.ML_PAYROLL_API_DOMAIN;
export const ML_CKCYC_API_DOMAIN = `${process.env.ML_CKCYC_API_DOMAIN}/api/v1`;
export const ML_BATCH_UPLOAD_DOMAIN = process.env.ML_BATCH_UPLOAD_DOMAIN;
export const ML_SMS_API_DOMAIN = process.env.ML_SMS_API_DOMAIN;
export const ML_LOANS_DOMAIN = process.env.ML_LOANS_DOMAIN;
export const ML_KPX_DOMAIN = process.env.ML_KPX_DOMAIN;
export const ML_NOTIFICATION_API_DOMAIN = process.env.ML_NOTIFICATION_API_DOMAIN;
// API URLS
export const GENERATE_TOKEN_API = `${ML_AUTH_SERVICE_API_DOMAIN}/api/v1/external-user`;
export const REGISTER_EMPLOYEE_API = `${ML_PAYROLL_API_DOMAIN}/api/v1/employees`;
export const REGISTER_COMPANY_API = `${ML_PAYROLL_API_DOMAIN}/api/v1/companies`;
export const TRANSFER_MONEY_TO_EMPLOYEE_API = `${ML_PAYROLL_API_DOMAIN}/api/v1/disbursements/net-salary`;
export const TRANSFER_MONEY_TO_SUBACCT_API = `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/transfer-money`;
export const DISBURSE_SALARY = `${ML_PAYROLL_API_DOMAIN}/api/v1/disbursements/net-salary`;
export const BRANCH_CASH_IN = `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/top-up`;
export const GET_CASH_IN_TRANSACTION = `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/inquire`;
export const QRPH_CASH_IN = `${ML_PAYROLL_API_DOMAIN}/api/v1/qr-ph/company-qr`;
export const GET_SALARY_LOANS_FUNDS = `${ML_PAYROLL_API_DOMAIN}/api/v1/salary-loans/balance`;
export const PAY_SALARY_LOAN = `${ML_PAYROLL_API_DOMAIN}/api/v1/salary-loans/pay`;
export const UPDATE_LOAN_SCHEDULE = `${ML_LOANS_DOMAIN}/loans_api/v1/loan_schedules/pay/loans/schedule`;
export const GET_EMPLOYEE_LOANS = `${ML_LOANS_DOMAIN}/loans_api/v1/transactions/get/customer/loans`;
export const SEND_EMAIL_API = `${ML_NOTIFICATION_API_DOMAIN}/api/v1/email/send-html`;

export const CHECK_COMPANY_BALANCE_API = `${ML_PAYROLL_API_DOMAIN}/api/v1/companies/check-wallet-balance`;
export const BATCH_UPLOAD_REQUEST_TOKEN_API = `${ML_BATCH_UPLOAD_DOMAIN}/api/GetToken`;
export const BATCH_REQUEST_APPROVAL_API = `${ML_BATCH_UPLOAD_DOMAIN}/api/BatchRequest`;
export const GET_NATIONALITY = `${ML_KPX_DOMAIN}/api/1.0/external/nationalities`;

export const SMS_API = `${ML_SMS_API_DOMAIN}/MLSMSProvider/Service.svc/sendSMS`;

// API CREDENTIALS
export const API_KEY = process.env.API_KEY;
export const SECRET_KEY = process.env.SECRET_KEY;

export const ML_ANTI_TAMPERING_SECRET = process.env.ML_ANTI_TAMPERING_SECRET;
export const ML_PAYROLL_API_KEY = process.env.ML_PAYROLL_API_KEY;
export const ML_PAYROLL_SECRET_KEY = process.env.ML_PAYROLL_SECRET_KEY;
export const ML_BATCH_UPLOAD_API_KEY = process.env.ML_BATCH_UPLOAD_API_KEY;
export const ML_BATCH_UPLOAD_SECRET_KEY =
  process.env.ML_BATCH_UPLOAD_SECRET_KEY;
export const ML_BATCH_UPLOAD_CLIENT_ID = process.env.ML_BATCH_UPLOAD_CLIENT_ID;
export const ML_BATCH_UPLOAD_USERNAME = process.env.ML_BATCH_UPLOAD_USERNAME;
export const ML_SMS_USERNAME = process.env.ML_SMS_USERNAME;
export const ML_SMS_PASSWORD = process.env.ML_SMS_PASSWORD;
export const ML_SMS_SENDER = process.env.ML_SMS_SENDER;

export const EMAIL_SENDER = process.env.EMAIL_SENDER;
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_SERVICE = process.env.SMTP_SERVICE;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

export const ML_LOAN_SCHED_PUB_KEY = process.env.ML_LOAN_SCHED_PUB_KEY;
export const ML_LOAN_SCHED_PRIV_KEY = process.env.ML_LOAN_SCHED_PRIV_KEY;

// FRONTEND ENV
export const FRONTEND_URL = process.env.FRONTEND_URL;

// FILE UPLOAD TO ML REPO
export const ML_FILE_UPLOAD_URL = process.env.NEXT_PUBLIC_ML_FILE_UPLOAD_URL;
