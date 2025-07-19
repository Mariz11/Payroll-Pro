'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'employees',
          'dailyRate',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employees',
          'allowance',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          'employees',
          'overtimeRateHolidays',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateRestDays',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateRegDays',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          'employee_benefits',
          'sssContributionRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'sssERShareRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'sssECShareRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'philHealthContributionRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'philHealthERShareRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'pagIbigContributionRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'pagIbigERShareRate',
          { type: Sequelize.FLOAT(8, 2) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'withholdingTax',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          'payrolls',
          'sssContribution',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'pagIbigContribution',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'philhealthContribution',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'sssERShare',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'sssECShare',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'philHealthERShare',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'pagIbigERShare',
          { type: Sequelize.FLOAT(8, 2), allowNull: false },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'employees',
          'dailyRate',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employees',
          'allowance',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          'employees',
          'overtimeRateHolidays',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateRestDays',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employees',
          'overtimeRateRegDays',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          'employee_benefits',
          'sssContributionRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'sssERShareRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'sssECShareRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'philHealthContributionRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'philHealthERShareRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'pagIbigContributionRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_benefits',
          'pagIbigERShareRate',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'withholdingTax',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),

        queryInterface.changeColumn(
          'payrolls',
          'sssContribution',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'pagIbigContribution',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'philhealthContribution',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'sssERShare',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'sssECShare',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'philHealthERShare',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'pagIbigERShare',
          { type: Sequelize.FLOAT(8, 3), allowNull: false },
          { transaction: t }
        ),
      ]);
    });
  },
};
