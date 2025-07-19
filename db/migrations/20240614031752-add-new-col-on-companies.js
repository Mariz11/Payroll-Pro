'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'allowanceOnHolidays',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'allowanceForLeaves'
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
        queryInterface.removeColumn('companies', 'allowanceOnHolidays', {
          transaction: t,
        }),
      ]);
    });
  },
};
