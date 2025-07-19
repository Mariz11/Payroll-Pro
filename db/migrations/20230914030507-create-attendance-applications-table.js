'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('attendance_applications', {
      attendanceAppId: {
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
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fromDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      toDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      dateOvertime: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      timeFrom: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      timeTo: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      numberOfHours: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      contactPerson: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      contactNumber: {
        type: Sequelize.STRING(11),
        allowNull: false,
      },
      requestedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approvedDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      approvedBy: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
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
    await queryInterface.dropTable("attendance_applications");
  }
};
