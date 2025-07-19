'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'employee_profiles',
          'educationalAttainment',
          {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'schoolGraduated',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'degree',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),

        queryInterface.changeColumn(
          'employee_profiles',
          'placeofBirth',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'birthDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'gender',
          {
            type: Sequelize.ENUM,
            allowNull: true,
            defaultValue: null,
            values: ['Male', 'Female'],
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'civilStatus',
          {
            type: Sequelize.STRING(50),
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'nationality',
          {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'hiringDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'startDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'dailyRate',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),

        queryInterface.changeColumn(
          'employees',
          'overtimeRateRegDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateHolidays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateRestDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'allowance',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'monthlyAllowance',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'employee_profiles',
          'educationalAttainment',
          {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'schoolGraduated',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'degree',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'placeofBirth',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'birthDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'gender',
          {
            type: Sequelize.ENUM,
            allowNull: false,

            values: ['Male', 'Female'],
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'civilStatus',
          {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employee_profiles',
          'nationality',
          {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'hiringDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'startDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'dailyRate',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'dailyRate',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),

        queryInterface.changeColumn(
          'employees',
          'overtimeRateRegDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateHolidays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateRestDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'allowance',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'employees',
          'monthlyAllowance',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
