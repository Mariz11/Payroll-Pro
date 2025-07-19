import moment from '@constant/momentTZ';
import { addS, properCasing, amountFormatter } from './helper';
import { env } from 'process';
import { logger } from './logger';

export function verifyUserEmailContent({
  verificationCode,
  logo,
}: {
  verificationCode: string;
  logo: string;
}) {
  const logo_placeholder = `<p style="margin-bottom: 0; padding: 16px 0; color: #B22418; font-weight: bold; font-size: 30px;">${logo}</p>`;
  //   const logo_placeholder = logo
  //     ? `<img src="url(public/images/${logo})" height="36" width="126" style="height:36px;background:#ffffff" alt="logo" class="CToWUd" data-bit="iit">`
  //     : `<p style="margin-bottom: 0; padding: 16px 0; color: #B22418; font-weight: bold; font-size: 30px;">${logo}</p>`;

  return `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>ML Payroll Verification Code</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
            <div style="margin:0;padding:0;font-size:0">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                        <tr>
                            <td align="center" style="background-color:#f2f3f5">
                                <table style="max-width:604px;font-family:Helvetica Neue" cellpadding="0" cellspacing="0">
                                    <tbody>
                                        <tr>
                                            <td style="height:4px;line-height:4px;background-color:#B22418"></td>
                                        </tr>
                                        <tr>
                                            <td style="background-color:#ffffff;padding:32px 32px 60px">
                                                <font color="#888888"></font>
                                                <table cellpadding="0" cellspacing="0">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                ${logo_placeholder}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:16px;color:#1f2329;padding-top:32px">To activate your account, please login to the MCash App and enter it soon before it expires in 24 hours:</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="font-size:30px;color:#B22418;padding-top:56px;font-weight:bold">${verificationCode}</td>
                                                        </tr>
                                                        
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </body>
    </html>
    `;
}
export function resetPasswordEmailContent({ token }: { token: string }) {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>MCash</title>
        </head>
        <body style="color: black;">
            
              <p>Please click on the link below to reset your password:</p>
              <p><a href="${process.env.BASE_PATH}/reset/${token}">${process.env.BASE_PATH}/resetPassword/${token}</a></p>

           
        </body>
    </html>
    `;
}

export function failedDisbursementEmailContent({
  businessMonth,
  cycle,
  amount,
  employeeFullName,
}: {
  businessMonth: string;
  cycle: string;
  amount: number;
  employeeFullName: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>MCash</title>
        </head>
        <body style="color: black;">
            
              <p style="font-weight: bold;">Failed Disbursement Details:</p>
              <p>Employee: ${employeeFullName}</p>
              <p>Business Month and Cycle: ${businessMonth} ${cycle}</p>
              <p>Disbursement Amount: ${amount}</p>
           
        </body>
    </html>
    `;
}

export function failedTransferMoneyEmailContent({
  businessMonth,
  cycle,
  amount,
  departmentName,
}: {
  businessMonth: string;
  cycle: string;
  amount: number;
  departmentName: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>MCash</title>
        </head>
        <body style="color: black;">
            
              <p style="font-weight: bold;">Failed Transfer Money Details:</p>
              <p>Department: ${departmentName}</p>
              <p>Business Month and Cycle: ${businessMonth} ${cycle}</p>
              <p>Disbursement Amount: ${amount}</p>
           
        </body>
    </html>
    `;
}

export function cancelledDisbursementEmailContent({
  businessMonth,
  cycle,
  amount,
  employeeFullName,
  oldTransactionCode,
  newTransactionCode,
}: {
  businessMonth: string;
  cycle: string;
  amount: number;
  employeeFullName: string;
  oldTransactionCode: string;
  newTransactionCode: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>MCash</title>
        </head>
        <body style="color: black;">
            
              <p style="font-weight: bold;">Cancelled Disbursement Details:</p>
              <p>Employee: ${employeeFullName}</p>
              <p>Business Month and Cycle: ${businessMonth} ${cycle}</p>
              <p>Disbursement Amount: ${amount}</p>
              <p>Old Disbursement Code: ${oldTransactionCode}</p>
              <p>New Disbursement Code: ${newTransactionCode ? newTransactionCode : 'None Provided'
    }</p>
        </body>
    </html>
    `;
}

export function userCredentialEmailContent({
  username,
  password,
  logo,
}: {
  username: string;
  password: string;
  logo: string;
}) {
  //   const logo_placeholder = logo
  //     ? `<img src="url(public/images/${logo})" height="36" width="126" style="height:36px;background:#ffffff" alt="logo" class="CToWUd" data-bit="iit">`
  //     : `<p style="margin-bottom: 0; padding: 16px 0; color: #B22418; font-weight: bold; font-size: 30px;">${logo}</p>`;
  const logo_placeholder = `<p style="margin-bottom: 0; padding: 16px 0; color: #B22418; font-weight: bold; font-size: 30px;">${logo}</p>`;

  //   let split = username.split('.');
  //   username = split[0] + '&#173;.' + split[1];

  return `
      <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8" />
              <title>ML Payroll Verification Code</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <style>
            a{
                text-decoration: none!important;
                color: #fff!important
            }
          </style>
          <body>
              <div style="margin:0;padding:0;font-size:0">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tbody>
                          <tr>
                              <td align="center" style="background-color:#f2f3f5">
                                  <table style="max-width:604px;font-family:Helvetica Neue" cellpadding="0" cellspacing="0">
                                      <tbody>
                                          <tr>
                                              <td style="height:4px;line-height:4px;background-color:#B22418"></td>
                                          </tr>
                                          <tr>
                                              <td style="background-color:#ffffff;padding:32px 32px 60px">
                                                  <font color="#888888"></font>
                                                  <table cellpadding="0" cellspacing="0">
                                                      <tbody>
                                                          <tr>
                                                              <td>
                                                                  ${logo_placeholder}
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                            <td style="font-size:16px;color:#1f2329;padding-top:32px;padding-bottom:32px;">Good day! You may now login to the system using the credentials below:</td>
                                                          </tr>
                                                          <tr>
                                                            <td style="font-size:20px; color:#fff; padding-top:20px; background:#B22418; padding-bottom:20px; padding-left: 10px;">
                                                                Username: <strong class="username"><a href="#" style="color:#fff; cursor: default!important; text-decoration:none; font-weight: bold;">${username}</a></strong> <br>
                                                                Password: <strong>${password}</strong>
                                                            </td>
                                                          </tr>
                                                          
                                                      </tbody>
                                                  </table>
                                              </td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </body>
      </html>
      `;
}
export function payslipEmailContent({
  payroll,
  companyName,
}: {
  payroll: any;
  companyName: string;
}) {
  //   const logo_placeholder = logo
  //     ? `<img src="url(public/images/${logo})" height="36" width="126" style="height:36px;background:#ffffff" alt="logo" class="CToWUd" data-bit="iit">`
  //     : `<p style="margin-bottom: 0; padding: 16px 0; color: #B22418; font-weight: bold; font-size: 30px;">${logo}</p>`;
  //   const logo_placeholder = `<p style="margin-bottom: 0; padding: 16px 0; color: #B22418; font-weight: bold; font-size: 30px;">${logo}</p>`;

  //   let split = username.split('.');
  //   username = split[0] + '&#173;.' + split[1];

  const log = (message: string, data?: any) => {
    logger.info(`[Payslip] ${message}`, data || '');
  };

  const workedOnRD = payroll?.workedOnRestDays;
  const workedOnSPHD = payroll?.workedOnSpecialHoliday;
  const workedOnSPHDWhileRD = payroll?.workedOnSpecialHolidayWhileRestDay;
  const workedOnRHD = payroll?.workedOnRegularHoliday;
  const workedOnRHDWhileRD = payroll?.workedOnRegularHolidayWhileRestDay;
  const halfdayPresentonRHD = payroll?.halfDayPresentOnRegularHoliday;
  const halfdayPresentonSPHD = payroll?.halfDayPresentOnSpecialHoliday;
  const OTonRegDays = payroll?.overtimeOnRegularDays;
  const OTonHolidays = payroll?.overtimeOnHolidays;
  const OTonRestDays = payroll?.overtimeOnRestDays;
  const cashAdvanceSum = payroll.payroll_deductions
    .filter((deduc: any) => {
      // Add conditions for filtering
      return (
        deduc.deduction.deductionType === 'Cash Advance' &&
        !deduc.isDeferred &&
        deduc.deduction.isPosted === true &&
        deduc.deduction.transfer_to_employee_acct_transaction
          ?.disbursementStatus === true
      );
    })
    .reduce((sum: number, deduc: any) => {
      // Accumulate the sum of amountPaid
      return sum + deduc.amountPaid;
    }, 0);

  const sssLoanSum = payroll.payroll_deductions
    .filter((deduc: any) => {
      // Add conditions for filtering
      return (
        deduc.deduction.deductionType === 'SSS Loan' &&
        !deduc.isDeferred &&
        deduc.deduction.isPosted === true
      );
    })
    .reduce((sum: number, deduc: any) => {
      // Accumulate the sum of amountPaid
      return sum + deduc.amountPaid;
    }, 0);

  const sssCalamityLoanSum = payroll.payroll_deductions
    .filter((deduc: any) => {
      // Add conditions for filtering
      return (
        deduc.deduction.deductionType === 'SSS Calamity Loan' &&
        !deduc.isDeferred &&
        deduc.deduction.isPosted === true
      );
    })
    .reduce((sum: number, deduc: any) => {
      // Accumulate the sum of amountPaid
      return sum + deduc.amountPaid;
    }, 0);

  const pagIbigLoanSum = payroll.payroll_deductions
    .filter((deduc: any) => {
      // Add conditions for filtering
      return (
        deduc.deduction.deductionType === 'HDMF Loan' &&
        !deduc.isDeferred &&
        deduc.deduction.isPosted === true
      );
    })
    .reduce((sum: number, deduc: any) => {
      // Accumulate the sum of amountPaid
      return sum + deduc.amountPaid;
    }, 0);
  const otherDeductions = payroll.payroll_deductions.filter((deduc: any) => {
    // Add conditions for filtering
    return (
      deduc.deduction.deductionType === 'Other' &&
      !deduc.isDeferred &&
      deduc.deduction.isPosted === true
    );
  });
  const adjustmentSum = payroll.payroll_adjustments
    ? payroll?.payroll_adjustments.reduce((sum: number, adjustment: any) => {
      return (
        sum + adjustment.addAdjustment - adjustment.deductAdjustment || 0
      );
    }, 0)
    : 0;
  const otherSum = otherDeductions.reduce((sum: number, deduc: any) => {
    // Accumulate the sum of amountPaid
    return sum + deduc.amountPaid;
  }, 0);
  let otherBreakdownArr = [];
  for (let i = 0; i < otherDeductions.length; i++) {
    if (otherDeductions[i].deduction.ledgers) {
      for (let j = 0; j < otherDeductions[i].deduction.ledgers.length; j++) {
        otherBreakdownArr.push(otherDeductions[i].deduction.ledgers[j]);
      }
    }
  }

  const hasAllowanceBreakdown = !!payroll.employee?.allowance_breakdown?.allowanceBreakdownId && !payroll.isDirect;
  const payrollAllowance = payroll.isDirect ? 0.0 : payroll.allowance;

  let allowanceBreakdownsData = [];

  if (hasAllowanceBreakdown && payroll.employee?.allowance_breakdown != null) {

    const types =
      payroll.employee?.allowance_breakdown?.allowanceType.split(',');
    const monthlyAmounts =
      payroll.employee?.allowance_breakdown?.monthlyAmounts.split(',');
    const dailyAmounts =
      payroll.employee?.allowance_breakdown?.dailyAmounts.split(',');

    for (let i = 0; i < types.length; i++) {
      allowanceBreakdownsData.push({
        type: types[i],
        monthlyAmount: monthlyAmounts[i],
        dailyAmount: dailyAmounts[i],
      });
    }
  }

  log("allowanceBreakdownsData", { allowanceBreakdownsData });
  log("daysWorked", { daysWorked: payroll.daysWorked });

  // const salaryLoanSum = payroll.payroll_deductions // Disabled Salary Loans
  //   .filter((deduc: any) => {
  //     // Add conditions for filtering
  //     return (
  //       deduc.deduction.deductionType === 'Salary Loan' &&
  //       !deduc.isDeferred &&
  //       deduc.deduction.isPosted === true
  //     );
  //   })
  //   .reduce((sum: number, deduc: any) => {
  //     // Accumulate the sum of amountPaid
  //     return sum + deduc.amountPaid;
  //   }, 0);

  return `
      <!DOCTYPE html>
      <html>
      <head>
        
      </head>
      <body>
        <table border="1" style="width: 90%;
        border-collapse: collapse;
        border: 1px solid black; margin-bottom:0px">
          <tr height="100px" style="background-color:#d61117;color:#ffffff;text-align:center;font-size:24px; font-weight:600;">
            <td colspan='4' style="line-height: 25px;
            padding-left: 15px;
            color: #000000;color:#ffffff;">${properCasing(companyName)}</td>
          </tr>
          <tr>
            <th style="background-color: #dddddd;color: #000000;"><strong>Employee Code</strong></th>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;">${payroll.employee.employeeCode
    }</td>
            <th style="background-color: #dddddd;color: #000000;"><strong>Name</strong></th>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;">${payroll.employee.employee_profile.employeeFullName
    }</td>
          </tr>
          <!-- 2nd row -->
          <tr>
            <th style="background-color: #dddddd;color: #000000;"><strong>Payroll Month</strong></th>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;">${payroll.businessMonth
    }</td>
            <th style="background-color: #dddddd;color: #000000;"><strong>Cycle</strong></th>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;">${properCasing(
      payroll.cycle
    )}</td>
          </tr>
          <!-- 3rd row -->
          <tr>
            <th style="background-color: #dddddd;color: #000000;"><strong>Days Worked</strong></th>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;">${`${payroll.daysWorked
    } day${addS(payroll.daysWorked)}`}</td>
            <th style="background-color: #dddddd;color: #000000;"><strong>Absence</strong></th>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;">${`${payroll.daysAbsent
    } day${addS(payroll.daysAbsent)}`}</td>
          </tr>
         
        </table>
        <br/>
        <table border="1" style=" width: 90%;
        border-collapse: collapse;
        border: 1px solid black;">
          <tr>
            <th style="background-color: #000000;color: #ffffff;">PAY DESCRIPTION</th>
            <th style="background-color: #000000;color: #ffffff;">TOTAL</th>
            <th style="background-color: #000000;color: #ffffff;">DEDUCTION DESCRIPTION</th>
            <th style="background-color: #000000;color: #ffffff;">TOTAL</th>
          </tr>
          <tr>
            <td style=" padding-left: 15px;background-color: #dddddd;
            color: #000000;">${payroll.isDirect
      ? `Reg. Days: (0 day)`
      : `Reg. Days
                    (${` ${payroll.daysWorked -
      (workedOnRD +
        workedOnRHD +
        workedOnRHDWhileRD +
        workedOnSPHD +
        workedOnSPHDWhileRD)
      } day${addS(
        payroll.daysWorked -
        (workedOnRD +
          workedOnRHD +
          workedOnRHDWhileRD +
          workedOnSPHD +
          workedOnSPHDWhileRD)
      )})`}
                  
                `
    }</td>
            <td style=" line-height: 25px;padding-left: 15px;color: #000000;"> 
            ${`PHP ${payroll.isDirect
      ? 0.0
      : amountFormatter(
        (payroll.daysWorked -
          (workedOnRD +
            workedOnRHD +
            workedOnRHDWhileRD +
            workedOnSPHD +
            workedOnSPHDWhileRD)) *
        payroll.dailyRate
      ) || 0.0
    }`}
                              
            </td>
            <td style="padding-left: 15px; background-color: #dddddd;color: #000000;">Undertime  ${` (${payroll.undertimeHrs
    } hr${addS(payroll.undertimeHrs)})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP ${amountFormatter(
      payroll.undertimePay
    )}</td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;"> Rest Days (${workedOnRD} day${addS(
      workedOnRD
    )})</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP
            ${amountFormatter(
      workedOnRD * payroll.dailyRate * (payroll.restDayRate / 100)
    ) || 0.0
    }</td>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Late ${` (${payroll.lateHrs
    } hr${addS(payroll.lateHrs)})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(
      payroll.latePay
    )}</td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">OT  ${` (${payroll.overtimeHrs
    } hr${addS(payroll.overtimeHrs)})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(payroll.overtimePay) || 0.0
    }</td>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">SSS/PhilHealth/Pag-Ibig Contributions</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP
            ${amountFormatter(
      payroll.sssContribution +
      payroll.philhealthContribution +
      payroll.pagIbigContribution
    )}</td>
          </tr>
          <tr>
            <td style="padding-left: 15px; background-color: #dddddd;color: #000000;">Reg. Holidays ${` (${payroll.regularHolidays
    } day${addS(payroll.regularHolidays)})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP ${amountFormatter(
      workedOnRHD *
      payroll.dailyRate *
      (payroll.regularHolidayRate / 100) +
      +workedOnRHDWhileRD *
      payroll.dailyRate *
      (payroll.regularHolidayRestDayRate / 100) +
      +(payroll.regularHolidaysAbsent + halfdayPresentonRHD * 0.5) *
      payroll.dailyRate
    ) || 0.0
    }</td>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">CA/SSS/Pag-Ibig Loans</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP
            ${amountFormatter(
      cashAdvanceSum + sssLoanSum + sssCalamityLoanSum + pagIbigLoanSum
    )}</td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Spec. Holidays  ${` (${payroll.specialHolidays
    } day${addS(payroll.specialHolidays)})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(
      workedOnSPHD *
      payroll.dailyRate *
      (payroll.specialHolidayRate / 100) +
      workedOnSPHDWhileRD *
      payroll.dailyRate *
      (payroll.specialHolidayRestDayRate / 100) +
      (payroll.isMonthlyRated &&
        payroll.employmentStatus == 'Regular'
        ? (payroll.specialHolidaysAbsent +
          halfdayPresentonSPHD * 0.5) *
        payroll.dailyRate
        : 0)
    ) || 0.0
    }</td>
             
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Withholding Tax</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP ${amountFormatter(
      payroll.withholdingTax
    )}</td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Leaves  ${` (${payroll.sickLeaveDays +
    payroll.vacationLeaveDays +
    payroll.soloParentLeaveDays +
    payroll.paternityLeaveDays +
    payroll.maternityLeaveDays +
    payroll.serviceIncentiveLeaveDays +
    payroll.otherLeaveDays || 0
    } day${addS(
      payroll.sickLeaveDays +
      payroll.vacationLeaveDays +
      payroll.soloParentLeaveDays +
      payroll.paternityLeaveDays +
      payroll.maternityLeaveDays +
      payroll.serviceIncentiveLeaveDays +
      payroll.otherLeaveDays || 0
    )})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP
            ${amountFormatter(
      (payroll.sickLeaveDays +
        payroll.vacationLeaveDays +
        payroll.soloParentLeaveDays +
        payroll.paternityLeaveDays +
        payroll.maternityLeaveDays +
        payroll.serviceIncentiveLeaveDays +
        payroll.otherLeaveDays || 0) * payroll.dailyRate
    ) || 0.0
    }</td>
            <td style="line-height: 25px;padding-left: 15px ; background-color: #dddddd;color: #000000;">Other</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(
      otherSum
    )}</td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Allowance</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP ${amountFormatter(
      payrollAllowance)
    }</td>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">TOTAL DEDUCTION</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"> PHP
            ${amountFormatter(
      payroll.netPay == 0 ? 0 : payroll.totalDeduction
    )}</td>
          </tr>
          <tr>
          <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Night Differential ${`(${payroll.nightDiffHrs
    } hr${addS(payroll.nightDiffHrs)})`}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(
      payroll.nightDiffPay
    )}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Adjustments ${payroll.shortDescription !== ''
      ? `(${payroll.shortDescription})`
      : ''
    }</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP
            ${amountFormatter(adjustmentSum) || 0.0}</td>
           <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
          </tr>
          <tr>
            <td style="padding-left: 15px;background-color: #dddddd;color: #000000;">Gross Pay</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(
      payroll.grossPay
    )}</td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
          </tr>
          <tr>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td> 
            <td style="line-height: 25px;padding-left: 15px;color: #000000;"></td>
            <th style="background-color:#d61117;color:#ffffff"><strong>EARNINGS</strong></th>
            <td style="line-height: 25px;padding-left: 15px;color: #000000;">PHP ${amountFormatter(
      payroll.netPay
    )}</td>
           
          </tr>
       
        
        </table>
      </body>
      </html>
      `;
}

export function verifyUserSMSContent({
  verificationCode,
}: {
  verificationCode: string;
}) {
  return `${verificationCode} is your verification code. To activate your account, please login to the MCash App and enter it soon before it expires in 24 hours.`;
}

export function userCredentialSMSContent({
  username,
  password,
  companyName,
  contactNumber,
  emailAddress,
}: {
  username: string;
  password: string;
  companyName: string;
  contactNumber: string;
  emailAddress: string;
}) {
  return `Welcome to ${companyName}!\nYou may now login to your account using the credentials below:\nUsername: ${username}\nPassword: ${password}\nDo not share this to anyone. Thank you.\n (Please contact ${contactNumber} or ${emailAddress} for any issues)`;
}
