'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'regularHoliday',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            after: 'leavesOnHolidays',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'regularHolidayRate',
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 200,
            after: 'regularHoliday',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'regularHolidayRestDayRate',
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 260,
            after: 'regularHolidayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'specialHoliday',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            after: 'regularHolidayRestDayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'specialHolidayRate',
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 130,
            after: 'specialHoliday',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'specialHolidayRestDayRate',
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 150,
            after: 'specialHolidayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'restDay',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            after: 'specialHolidayRestDayRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'restDayRate',
          {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 130,
            after: 'restDay',
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
        queryInterface.removeColumn('companies', 'regularHoliday', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'regularHolidayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'regularHolidayRestDayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'specialHoliday', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'specialHolidayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'specialHolidayRestDayRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'restDay', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'restDayRate', {
          transaction: t,
        }),
      ]);
    });
  },
};