'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'emergencyLeaveDays',
          {
            type: Sequelize.FLOAT(8, 2),
            defaultValue: 0,
            after: 'otherLeavePay',
          },
          {
            transaction: t,
          }
        ),
        ,
        queryInterface.addColumn(
          'payrolls',
          'emergencyLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            defaultValue: 0,
            after: 'emergencyLeaveDays',
          },
          {
            transaction: t,
          }
        ),
        // ========================
        queryInterface.addColumn(
          'payrolls',
          'birthdayLeaveDays',
          {
            type: Sequelize.FLOAT(8, 2),
            defaultValue: 0,
            after: 'emergencyLeavePay',
          },
          {
            transaction: t,
          }
        ),
        ,
        queryInterface.addColumn(
          'payrolls',
          'birthdayLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            defaultValue: 0,
            after: 'birthdayLeaveDays',
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
        queryInterface.removeColumn('payrolls', 'emergencyLeaveDays', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'emergencyLeavePay', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'birthdayLeaveDays', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'birthdayLeavePay', {
          transaction: t,
        }),
      ]);
    });
  },
};
