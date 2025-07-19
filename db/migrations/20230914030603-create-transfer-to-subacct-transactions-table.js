'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("transfer_to_subacct_transactions", {
      transferId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { 
            tableName:"companies"
          },
          key: "companyId",
        },
      },
      businessMonth: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cycle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transferCode: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      transferDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
      },
      transferAmount: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("transfer_to_subacct_transactions");
  }
};
