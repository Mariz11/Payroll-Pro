'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
  
        queryInterface.addColumn(
          'companies',
          'nightDifferentialRate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 10,
            after: 'nightDifferential',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'nightDifferentialStartHour',
          {
            type: Sequelize.TIME,
            allowNull: false,
            defaultValue: '22:00',
            after: 'nightDifferentialRate',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'companies',
          'nightDifferentialEndHour',
          {
            type: Sequelize.TIME,
            allowNull: false,
            defaultValue: '06:00',
            after: 'nightDifferentialStartHour',
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
        queryInterface.removeColumn('companies', 'nightDifferentialRate', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'nightDifferentialStartHour', {
          transaction: t,
        }),
        queryInterface.removeColumn('companies', 'nightDifferentialEndHour', {
          transaction: t,
        }),
      ]);
    });
  },
};