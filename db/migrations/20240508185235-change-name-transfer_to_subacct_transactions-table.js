'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameTable(
          'transfer_to_subacct_transactions',
          'transactions',
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
        queryInterface.renameTable(
          'transactions',
          'transfer_to_subacct_transactions'
        ),
      ]);
    });
  },
};
