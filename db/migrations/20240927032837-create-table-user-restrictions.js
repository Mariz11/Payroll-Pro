'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_restrictions', {
      userRestrictionId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
      },
      moduleAccess: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      actions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_restrictions');
  },
};
