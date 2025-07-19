'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('company_pay_cycles', {
      payCycleId: {
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
      cycle: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      payDate: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cutOffStartDate: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      cutOffEndDate: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      preferredMonth: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['PREVIOUS', 'CURRENT'],
      },
      isPreferred: {
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
    await queryInterface.dropTable("company_pay_cycles");
  }
};
