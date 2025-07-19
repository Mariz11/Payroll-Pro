'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('company_charges', {
        companyChargeId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
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
        tierNumber: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        tierStart: {
          allowNull: false,
          type: Sequelize.FLOAT(8, 2),
        },
        tierEnd: {
          allowNull: false,
          type: Sequelize.FLOAT(8, 2),
        },
        charge: {
          allowNull: false,
          type: Sequelize.FLOAT(8, 2),
        },
      });
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('company_charges');
    });
  },
};
