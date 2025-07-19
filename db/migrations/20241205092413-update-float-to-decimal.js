'use strict';

/** @type {import('sequelize-cli').Migration} */

const toModify = [
  {
    table: 'cash_in_transactions',
    columnToChange: 'principalAmount',
  },
  {
    table: 'attendances',
    columnToChange: 'overtimeHours',
  },
  {
    table: 'attendances',
    columnToChange: 'creditableOvertime',
  },
  {
    table: 'attendances',
    columnToChange: 'undertimeHours',
  },
  {
    table: 'attendances',
    columnToChange: 'lateHours',
  },
  {
    table: 'attendances',
    columnToChange: 'nightDiffHours',
  },
  {
    table: 'changed_schedules',
    columnToChange: 'workingHours',
  },
  {
    table: 'charges',
    columnToChange: 'tierStart',
  },
  {
    table: 'charges',
    columnToChange: 'tierEnd',
  },
  {
    table: 'charges',
    columnToChange: 'chargeLessThreshold',
  },
  {
    table: 'charges',
    columnToChange: 'chargeMoreThreshold',
  },
  {
    table: 'companies',
    columnToChange: 'chargePerEmployee',
  },
  {
    table: 'company_charges',
    columnToChange: 'tierStart',
  },
  {
    table: 'company_charges',
    columnToChange: 'tierEnd',
  },
  {
    table: 'company_charges',
    columnToChange: 'charge',
  },
  {
    table: 'company_withholding_tax_shields',
    columnToChange: 'from',
  },
  {
    table: 'company_withholding_tax_shields',
    columnToChange: 'taxRateExcess',
  },
  {
    table: 'configurations',
    columnToChange: 'threshold',
  },
  {
    table: 'deductions',
    columnToChange: 'perCycleDeduction',
  },
  {
    table: 'deductions',
    columnToChange: 'totalAmount',
  },
  {
    table: 'deductions',
    columnToChange: 'amountPaid',
  },
  {
    table: 'employees',
    columnToChange: 'basicPay',
  },
  {
    table: 'employees',
    columnToChange: 'dailyRate',
  },
  {
    table: 'employees',
    columnToChange: 'monthlyAllowance',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'sssContributionRate',
  },
  {
    table: 'payrolls',
    columnToChange: 'grossPay',
  },
  {
    table: 'payrolls',
    columnToChange: 'totalDeduction',
  },
  {
    table: 'payrolls',
    columnToChange: 'netPay',
  },
  {
    table: 'payrolls',
    columnToChange: 'monthlyBasicPay',
  },
  {
    table: 'payrolls',
    columnToChange: 'dailyRate',
  },
  {
    table: 'payrolls',
    columnToChange: 'hourlyRate',
  },
  {
    table: 'payrolls',
    columnToChange: 'overtimeRateRegDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'overtimeRateHolidays',
  },
  {
    table: 'payrolls',
    columnToChange: 'overtimeRateRestDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'workingDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'daysWorked',
  },
  {
    table: 'payrolls',
    columnToChange: 'daysAbsent',
  },
  {
    table: 'payrolls',
    columnToChange: 'regularHolidaysPay',
  },
  {
    table: 'payrolls',
    columnToChange: 'specialHolidaysPay',
  },
  {
    table: 'payrolls',
    columnToChange: 'sickLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'sickLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'vacationLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'vacationLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'soloParentLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'soloParentLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'paternityLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'paternityLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'maternityLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'maternityLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'serviceIncentiveLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'serviceIncentiveLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'otherLeaveDays',
  },
  {
    table: 'payrolls',
    columnToChange: 'otherLeavePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'overtimeHrs',
  },
  {
    table: 'payrolls',
    columnToChange: 'overtimePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'undertimeHrs',
  },
  {
    table: 'payrolls',
    columnToChange: 'undertimePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'lateHrs',
  },
  {
    table: 'payrolls',
    columnToChange: 'latePay',
  },
  {
    table: 'payrolls',
    columnToChange: 'nightDiffHrs',
  },
  {
    table: 'payrolls',
    columnToChange: 'nightDiffPay',
  },
  {
    table: 'payrolls',
    columnToChange: 'allowance',
  },
  {
    table: 'payrolls',
    columnToChange: 'sssContribution',
  },
  {
    table: 'payrolls',
    columnToChange: 'pagIbigContribution',
  },
  {
    table: 'payrolls',
    columnToChange: 'philhealthContribution',
  },
  {
    table: 'payrolls',
    columnToChange: 'sssERShare',
  },
  {
    table: 'payrolls',
    columnToChange: 'sssECShare',
  },
  {
    table: 'payrolls',
    columnToChange: 'philHealthERShare',
  },
  {
    table: 'payrolls',
    columnToChange: 'pagIbigERShare',
  },
  {
    table: 'payrolls',
    columnToChange: 'withholdingTax',
  },
  {
    table: 'payrolls',
    columnToChange: 'addAdjustment',
  },
  {
    table: 'payrolls',
    columnToChange: 'deductAdjustment',
  },
  {
    table: 'payrolls',
    columnToChange: 'chargePerEmployee',
  },
  {
    table: 'payroll_adjustments',
    columnToChange: 'addAdjustment',
  },
  {
    table: 'payroll_adjustments',
    columnToChange: 'deductAdjustment',
  },
  {
    table: 'payroll_deductions',
    columnToChange: 'amountPaid',
  },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRegDays',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRegDaysPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRDPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRHD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRHDPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRHDWhileRD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnRHDWhileRDPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnSPHD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnSPHDPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnSPHDWhileRD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'workedOnSPHDWhileRDPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'halfdayPresentonRHD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'halfdayPresentonRHDPay',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'halfdayPresentonSPHD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'absenceOnRHD',
  // },
  // {
  //   table: 'payroll_premium_rates',
  //   columnToChange: 'absenceOnRHDPay',
  // },
  {
    table: 'shifts',
    columnToChange: 'workingHours',
  },
  {
    table: 'transactions',
    columnToChange: 'transactionAmount',
  },
  {
    table: 'transfer_to_employee_acct_transactions',
    columnToChange: 'disbursedAmount',
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all(
        toModify.map((i) =>
          queryInterface.changeColumn(
            i.table,
            i.columnToChange,
            {
              type: Sequelize.DECIMAL(8, 2),
              allowNull: true,
              defaultValue: 0,
            },
            {
              transaction: t,
            }
          )
        )
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all(
        toModify.map((i) =>
          queryInterface.changeColumn(
            i.table,
            i.columnToChange,
            {
              type: Sequelize.FLOAT(15, 2),
              allowNull: true,
              defaultValue: 0,
            },
            {
              transaction: t,
            }
          )
        )
      );
    });
  },
};
