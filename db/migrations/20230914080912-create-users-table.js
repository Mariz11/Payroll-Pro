'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      userId: {
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
        allowNull: true,
        defaultValue: null,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      middleName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      suffix: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
      contactNumber: {
        type: Sequelize.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
