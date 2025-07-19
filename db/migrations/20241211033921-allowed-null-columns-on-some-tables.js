'use strict';

/** @type {import('sequelize-cli').Migration} */
const toModify = [
  {
    table: 'company_withholding_tax_shields',
    columnToChange: 'to',
  },
  {
    table: 'company_withholding_tax_shields',
    columnToChange: 'fixTaxAmount',
  },
  {
    table: 'attendance_applications',
    columnToChange: 'numberOfHours',
  },
  {
    table: 'attendance_applications',
    columnToChange: 'undertimeHrs',
  },
  {
    table: 'attendance_applications',
    columnToChange: 'lateHrs',
  },
  {
    table: 'employees',
    columnToChange: 'allowance',
  },
  {
    table: 'employees',
    columnToChange: 'overtimeRateRegDays',
  },
  {
    table: 'employees',
    columnToChange: 'overtimeRateHolidays',
  },
  {
    table: 'employees',
    columnToChange: 'overtimeRateRestDays',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'sssContributionRate',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'sssERShareRate',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'sssECShareRate',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'philHealthContributionRate',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'philHealthERShareRate',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'pagIbigContributionRate',
  },
  {
    table: 'employee_benefits',
    columnToChange: 'pagIbigERShareRate',
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
              type: Sequelize.DECIMAL(8, 2),
              allowNull: false,
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
