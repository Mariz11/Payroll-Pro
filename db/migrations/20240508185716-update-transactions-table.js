'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          'transactions',
          'transferCode',
          'transactionCode',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transactions',
          'transferDate',
          'transactionDate',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transactions',
          'transferAmount',
          'transactionAmount',
          { transaction: t }
        ),
        queryInterface.addColumn(
          'transactions',
          'remarks',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'status',
            defaultValue: null,
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
        queryInterface.renameColumn(
          'transactions',
          'transactionCode',
          'transferCode',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transactions',
          'transactionDate',
          'transferDate',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'transactions',
          'transactionAmount',
          'transferAmount',
          { transaction: t }
        ),
        queryInterface.removeColumn('transactions', 'remarks', {
          transaction: t,
        }),
        queryInterface.changeColumn(
          'transactions',
          'transferId',
          {
            type: Sequelize.INTEGER,
            autoIncrement: true,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
