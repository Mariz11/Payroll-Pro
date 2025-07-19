'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      attendanceId: {
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
      businessMonth: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      cycle: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      timeIn: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      timeOut: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      breakTimeIn: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      breakTimeOut: {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
      },
      lunchTimeIn: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      lunchTimeOut: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      holidayId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'holidays',
          },
          key: 'holidayId',
        },
      },
      overtimeHours: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      undertimeHours: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      lateHours: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      nightDiffHours: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      isPresent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDayOff: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isLeave: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isPosted: {
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("attendances");
  }
};
