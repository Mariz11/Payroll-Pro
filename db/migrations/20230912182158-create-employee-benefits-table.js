'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("employee_benefits", {
      employeeBenefitsId: {
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
      sssId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      sssContribution: {
        type: Sequelize.FLOAT(8,3),
        allowNull: true,
        defaultValue: null
      },
      sssERShare: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      sssECShare: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      philHealthId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      philHealthContribution: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      philHealthERShare: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      pagIbigId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      pagIbigContribution: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      pagIbigERShare: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("employee_benefits");
  }
};
