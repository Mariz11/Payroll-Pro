'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('deductions', {
      deductionId: {
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
      employeeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
      },
      acctNoEmployee: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      acctNoEmployer: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      deductionType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      deductionPeriod: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      noOfCycles: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      perCycleDeduction: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      amountPaid: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isPosted: {
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("deductions");
  }
};
