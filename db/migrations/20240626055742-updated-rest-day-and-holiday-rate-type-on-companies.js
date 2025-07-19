'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'companies',
          'regularHolidayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 200,
            after: 'regularHoliday',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'companies',
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
        queryInterface.changeColumn(
          'companies',
          'specialHolidayRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 130,
            after: 'specialHoliday',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'companies',
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
        queryInterface.changeColumn(
          'companies',
          'restDayRate',
          {
            type: Sequelize.INTEGER,
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
        queryInterface.changeColumn(
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
        queryInterface.changeColumn(
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
        queryInterface.changeColumn(
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
        queryInterface.changeColumn(
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
        queryInterface.changeColumn(
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
};