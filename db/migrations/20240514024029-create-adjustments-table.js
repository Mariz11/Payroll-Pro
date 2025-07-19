'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payroll_adjustments', {
      payrollAdjustmentsId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payroll_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'payrolls',
          },
          key: 'payroll_id',
        },
      },
      desc: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      addAdjustment: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deductAdjustment: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
        defaultValue: 0,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payroll_adjustments');
  },
};
