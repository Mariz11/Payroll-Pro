'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'employees',
          'basicPay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            after: 'dailyRate',
          },
          {
            transaction: t,
          }
        ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isSSSContributionRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'sssContributionRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isSSSERShareRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'sssERShareRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isSSSECShareRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'sssECShareRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isPhilHealthContributionRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'philHealthContributionRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isPhilHealthERShareRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'philHealthERShareRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isPagIbigContributionRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'pagIbigContributionRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'isPagIbigERShareRatePrecentage',
        //   {
        //     type: Sequelize.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: true,
        //     after: 'pagIbigERShareRate',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'prescribedSSSContribAmount',
        //   {
        //     type: Sequelize.FLOAT(8, 3),
        //     allowNull: true,
        //     after: 'sssId',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'prescribedPhilHealthContribAmount',
        //   {
        //     type: Sequelize.FLOAT(8, 3),
        //     allowNull: true,
        //     after: 'philHealthId',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.addColumn(
        //   'employee_benefits',
        //   'prescribedPagIbigContribAmount',
        //   {
        //     type: Sequelize.FLOAT(8, 3),
        //     allowNull: true,
        //     after: 'pagIbigId',
        //   },
        //   {
        //     transaction: t,
        //   }
        // ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn(
          'employees',
          'basicPay',
          {},
          {
            transaction: t,
          }
        ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isSSSContributionRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isSSSERShareRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isSSSECShareRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isPhilHealthContributionRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isPhilHealthERShareRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isPagIbigContributionRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'isPagIbigERShareRatePrecentage',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'prescribedSSSContribAmount',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'prescribedPhilHealthContribAmount',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
        // queryInterface.removeColumn(
        //   'employee_benefits',
        //   'prescribedPagIbigContribAmount',
        //   {},
        //   {
        //     transaction: t,
        //   }
        // ),
      ]);
    });
  },
};
