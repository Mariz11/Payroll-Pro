'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'regularHolidayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 200,
            after: 'overtimeRateRestDays',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'regularHolidayRestDayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 260,
            after: 'regularHolidayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'specialHolidayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 130,
            after: 'regularHolidayRestDayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'specialHolidayRestDayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 150,
            after: 'specialHolidayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'restDayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 130,
            after: 'specialHolidayRestDayRate',
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
        queryInterface.removeColumn('payrolls', 'regularHolidayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'regularHolidayRestDayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'specialHolidayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'specialHolidayRestDayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'restDayRate', {
          transaction: t,
        }),
      ]);
    });
  },
};