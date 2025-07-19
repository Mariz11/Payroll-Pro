'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'employee_leaves',
          'otherLeaveCredits',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'serviceIncentiveLeaveUsed',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'employee_leaves',
          'otherLeavesUsed',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'otherLeaveCredits',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'otherLeaveDays',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'serviceIncentiveLeavePay',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'otherLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: null,
            after: 'otherLeaveDays',
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
        queryInterface.removeColumn('employee_leaves', 'otherLeaveCredits', { transaction: t }),
        queryInterface.removeColumn('employee_leaves', 'otherLeavesUsed', { transaction: t }),
        queryInterface.removeColumn('payrolls', 'otherLeaveDays', { transaction: t }),
        queryInterface.removeColumn('payrolls', 'otherLeavePay', { transaction: t }),
      ]);
    });
  },
};
