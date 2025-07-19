'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("verification_codes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { 
            tableName:"employees"
          },
          key: "employeeId",
        },
      },
      generatedCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isExpired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable("verification_codes");
  }
};
