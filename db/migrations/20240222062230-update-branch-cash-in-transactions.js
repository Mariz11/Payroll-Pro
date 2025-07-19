'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'senderCKYCID',
          'companyAccountId',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'senderLastName',
          'companyName',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'senderMobileNumber',
          'companyContactNumber',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'senderAddress',
          'companyAddress',
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'branch_cash_in_transactions',
          'transactionType',
          {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: false,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'branch_cash_in_transactions',
          'transactionType',
          {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: false,
          },
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'companyAccountId',
          'senderCKYCID',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'companyName',
          'senderLastName',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'companyContactNumber',
          'senderMobileNumber',
          { transaction: t }
        ),
        queryInterface.renameColumn(
          'branch_cash_in_transactions',
          'companyAddress',
          'senderAddress',
          { transaction: t }
        ),
      ])
    });
  },
};
