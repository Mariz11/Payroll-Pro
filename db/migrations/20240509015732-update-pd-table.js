'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payroll_deductions',
          'transferId',
          {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'transactions',
              },
              key: 'transferId',
            },
            allowNull: true,
            after: 'deductionId',
            defaultValue: null,
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
        queryInterface.removeColumn('payroll_deductions', 'transferId', {
          transaction: t,
        }),
      ]);
    });
  },
};
