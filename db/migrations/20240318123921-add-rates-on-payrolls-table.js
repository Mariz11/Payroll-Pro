'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'monthlyBasicPay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
            after: 'netPay',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'overtimeRateRegDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
            after: 'hourlyRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'overtimeRateHolidays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
            after: 'overtimeRateRegDays',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'overtimeRateRestDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
            after: 'overtimeRateHolidays',
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('payrolls', 'monthlyBasicPay'),
        queryInterface.removeColumn('payrolls', 'overtimeRateRegDays'),
        queryInterface.removeColumn('payrolls', 'overtimeRateHolidays'),
        queryInterface.removeColumn('payrolls', 'overtimeRateRestDays'),
      ]);
    });
  },
};
