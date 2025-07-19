'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'employees',
          'overtimeRateHolidays',
          {
            type: Sequelize.FLOAT(8, 3),
            allowNull: false,
            after: 'overtimeRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'employees',
          'overtimeRateRestDays',
          {
            type: Sequelize.FLOAT(8, 3),
            allowNull: false,
            after: 'overtimeRateHolidays',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.renameColumn(
          'employees',
          'overtimeRate',
          'overtimeRateRegDays',
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('employees', 'overtimeRateHolidays', {
          transaction: t,
        }),
        queryInterface.removeColumn('employees', 'overtimeRateRestDays', {
          transaction: t,
        }),
        queryInterface.renameColumn(
          'employees',
          'overtimeRateRegDays',
          'overtimeRate',
          { transaction: t }
        ),
      ]);
    });
  },
};
