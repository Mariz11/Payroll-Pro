'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('employee_profiles', {
      employeeProfileId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      middleName: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      suffix: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
      contactNumber: {
        type: Sequelize.STRING(11),
        allowNull: false,
      },
      emergencyContactNumber1: {
        type: Sequelize.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      emergencyContactNumber2: {
        type: Sequelize.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      birthDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      streetAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cityId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'cities',
          key: 'cityId',
        },
      },
      provinceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'provinces',
          key: 'provinceId',
        },
      },
      countryId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'countries',
          key: 'countryId',
        },
      },
      educationalAttainment: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      schoolGraduated: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      degree: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ['MALE', 'FEMALE'],
      },
      placeOfBirth: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      civilStatus: {
        type: Sequelize.STRING(50),
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
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("employee_profiles");
  }
};
