'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'nightDifferential',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'leavesOnHolidays'
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
        queryInterface.removeColumn('companies', 'nightDifferential', {
          transaction: t,
        }),
      ]);
    });
  },
};
