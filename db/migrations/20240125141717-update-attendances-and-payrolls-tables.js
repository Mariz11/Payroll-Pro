'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'attendances',
          'departmentId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'departments',
              },
              key: 'departmentId',
            },
            after: 'employeeId',
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'departmentId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'departments',
              },
              key: 'departmentId',
            },
            after: 'employeeId',
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
        queryInterface.removeColumn('attendances', 'departmentId', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'departmentId', {
          transaction: t,
        }),
      ]);
    });
  },
};
