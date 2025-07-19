'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('company_withholding_tax_shields', {
      withholdingTaxShieldId: {
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
      payrollTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'payroll_types',
          },
          key: 'payrollTypeId',
        },
      },
      bracket: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      from: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      to: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: true,
      },
      fixTaxAmount: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: true,
      },
      taxRateExcess: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
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
    await queryInterface.dropTable("company_withholding_tax_shields");
  }
};
