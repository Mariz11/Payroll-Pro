'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transfer_to_employee_acct_transactions', {
      id: {
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
      deductionId: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'deductions',
          },
          key: 'deductionId',
        },
      },
      batchNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      transactionName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      disbursedAmount: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      disbursementCode: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      disbursementStatus: {
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
    await queryInterface.dropTable('transfer_to_employee_acct_transactions');
  },
};
