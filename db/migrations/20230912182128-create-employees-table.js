'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('employees', {
      employeeId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeCode: {
        type: Sequelize.STRING,
        allowNull: false,
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
      mlWalletStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ckycId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      mlWalletId: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      departmentId: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'departments',
          },
          key: 'departmentId',
        },
      },
      shiftId: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'shifts',
          },
          key: 'shiftId',
        },
      },
      hiringDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      employmentStatus: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['REGULAR', 'PROBATIONARY', 'CASUAL', 'PROJECT', 'SEASONAL'],
      },
      dayOff: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dailyRate: {
        type: Sequelize.FLOAT(8, 3),
        allowNull: false,
      },
      allowance: {
        type: Sequelize.FLOAT(8, 3),
        allowNull: false,
      },
      tinNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      overtimeRate: {
        type: Sequelize.FLOAT(8, 3),
        allowNull: false,
      },
      positionTitle: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      dateOfSeparation: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      modeOfSeparation: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      applyWithholdingTax: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
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
    await queryInterface.dropTable("employees");
  }
};
