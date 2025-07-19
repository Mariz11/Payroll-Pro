'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameTable(
          'branch_cash_in_transactions',
          'cash_in_transactions',
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'cash_in_transactions',
          'via',
          {
            type: Sequelize.STRING,
            allowNull: false,
            after: 'transactionType',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'cash_in_transactions',
          'quickResponseCode',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
            after: 'transactionCode',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'cash_in_transactions',
          'cashTransferId',
          { type: Sequelize.TEXT, allowNull: false },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameTable(
          'cash_in_transactions',
          'branch_cash_in_transactions'
        ),
        queryInterface.removeColumn('branch_cash_in_transactions', 'via'),
        queryInterface.removeColumn(
          'branch_cash_in_transactions',
          'quickResponseCode'
        ),
        queryInterface.changeColumn(
          'branch_cash_in_transactions',
          'cashTransferId',
          { type: Sequelize.INTEGER, allowNull: false }
        ),
      ]);
    });
  },
};
