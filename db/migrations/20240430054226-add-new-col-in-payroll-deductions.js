'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payroll_deductions',
          'employeeId',
          {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'employees',
              },
              key: 'employeeId',
            },
            allowNull: true,
            after: 'payroll_id',
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payroll_deductions',
          'deletedAt',
          {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'updatedAt',
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payroll_deductions',
          'isCollected',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'isDeferred',
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
        queryInterface.removeColumn('payroll_deductions', 'employeeId', {
          transaction: t,
        }),
        queryInterface.removeColumn('payroll_deductions', 'deletedAt', {
          transaction: t,
        }),
        queryInterface.removeColumn('payroll_deductions', 'isCollected', {
          transaction: t,
        }),
      ]);
    });
  },
};
