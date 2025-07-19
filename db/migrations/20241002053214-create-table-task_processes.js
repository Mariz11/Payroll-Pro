'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks_processes', {
      taskId: {
        type: Sequelize.BIGINT,
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
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      taskCode: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      taskName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      percentage: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
        defaultValue: 0,
      },
      successCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalProcess: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      failedRemarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isAcknowledged: {
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
    await queryInterface.dropTable('tasks_processes');
  },
};
