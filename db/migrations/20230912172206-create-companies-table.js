'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      companyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      accountId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subAccountId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tierLabel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      companyAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      contactPerson: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      contactNumber: {
        type: Sequelize.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      urlLogo: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      billDate: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      chargePerEmployee: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: true,
        defaultValue: null,
      },
      maxEmployee: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      bankAccountNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      philHealthAcctNo: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      pagIbigAcctNo: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      sssAcctNo: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("companies");
  }
};
