'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('changed_schedules', {
      changeScheduleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      attendanceAppId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'attendance_applications',
          },
          key: 'attendanceAppId',
        },
      },
      typeOfChange: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      timeIn: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      lunchStart: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      lunchEnd: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      timeOut: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      workingHours: {
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('changed_schedules');
  },
};
