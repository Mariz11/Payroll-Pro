'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("shifts", {
      shiftId: {
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
      shiftName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeIn: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      timeOut: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      lunchStart: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      lunchEnd: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      snackStart: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null
      },
      snackEnd: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("shifts");
  }
};
