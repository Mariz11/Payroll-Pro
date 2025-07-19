'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'employees',
          'modeOfPayroll',
          {
            type: Sequelize.STRING,
            after: 'modeOfSeparation',
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'modeOfPayroll',
          {
            type: Sequelize.STRING,
            after: 'deductAdjustment',
            allowNull: false,
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
        queryInterface.removeColumn('employees', 'modeOfPayroll', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'modeOfPayroll', {
          transaction: t,
        }),
      ]);
    });
  },
};
