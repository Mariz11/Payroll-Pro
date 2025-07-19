'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('branch_cash_in_transactions', {
      cashInTransId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
      },
      cashTransferId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      transactionCode: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      transactionType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      principalAmount: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      senderCKYCID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      senderLastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      senderMobileNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      senderAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      isNotified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('branch_cash_in_transactions');
  },
};
