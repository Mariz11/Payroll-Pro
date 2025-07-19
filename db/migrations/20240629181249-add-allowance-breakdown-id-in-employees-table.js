'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'employees',
          'allowanceBreakdown',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'basicPay'
          },
          {
            transaction: t,
          }
        ),,
        queryInterface.addColumn(
          'employees',
          'allowanceBreakdownId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'allowance_breakdowns',
              },
              key: 'allowanceBreakdownId',
            },
            after: 'allowanceBreakdown'
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
        queryInterface.removeColumn(
          'employees',
          'allowanceBreakdown',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'employees',
          'allowanceBreakdownId',
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};