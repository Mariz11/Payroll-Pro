'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("employee_leaves", {
      employeeLeavesId: {
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
      vacationLeaveCredits: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      vacationLeaveUsed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      sickLeaveCredits: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      sickLeaveUsed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      soloParentLeaveCredits: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      soloParentLeavesUsed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      paternityLeaveCredits: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      paternityLeavesUsed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      maternityLeaveCredits: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      maternityLeavesUsed: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      serviceIncentiveLeaveCredits: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      serviceIncentiveLeaveUsed: {
        type: Sequelize.INTEGER,
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
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("employee_leaves");
  }
};
