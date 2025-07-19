'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('view_details', {
      viewDetailsId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      departmentId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'departments',
          },
          key: 'departmentId',
        },
      },
      announcementId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'announcements',
          },
          key: 'announcementId',
        },
      },
      userId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      isViewed: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('view_details');
  },
};
