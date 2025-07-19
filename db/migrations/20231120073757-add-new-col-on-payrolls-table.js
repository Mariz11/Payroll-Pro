'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'disbursementStatus',
          {
            type: Sequelize.INTEGER,
            after: 'isPosted',
            allowNull: false,
            defaultValue: 0,
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
        queryInterface.removeColumn('payrolls', 'disbursementStatus', {
          transaction: t,
        }),
      ]);
    });
  },
};
