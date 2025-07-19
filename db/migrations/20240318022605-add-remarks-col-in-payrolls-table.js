'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'remarks',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
            after: 'disbursementCode',
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
      return Promise.all([queryInterface.removeColumn('payrolls', 'remarks')]);
    });
  },
};
