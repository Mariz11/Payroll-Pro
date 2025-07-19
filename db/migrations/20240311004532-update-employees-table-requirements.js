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
            type: Sequelize.STRING,
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
