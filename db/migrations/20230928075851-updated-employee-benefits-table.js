'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn('employee_benefits', 'sssContribution',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'sssERShare',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'sssECShare',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'philHealthContribution',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'philHealthERShare',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'pagIbigContribution',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'pagIbigERShare',
          { type: Sequelize.FLOAT(8, 3) },
          { transaction: t }
        ),

        queryInterface.renameColumn('employee_benefits', 'sssContribution', 'sssContributionRate', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'sssERShare', 'sssERShareRate', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'sssECShare', 'sssECShareRate', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'philHealthContribution', 'philHealthContributionRate', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'philHealthERShare', 'philHealthERShareRate', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'pagIbigContribution', 'pagIbigContributionRate', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'pagIbigERShare', 'pagIbigERShareRate', { transaction: t })
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn('employee_benefits', 'sssContributionRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'sssERShareRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'sssECShareRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'philHealthContributionRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'philHealthERShareRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'pagIbigContributionRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),
        queryInterface.changeColumn('employee_benefits', 'pagIbigERShareRate',
          { type: Sequelize.STRING },
          { transaction: t }
        ),

        queryInterface.renameColumn('employee_benefits', 'sssContributionRate', 'sssContribution', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'sssERShareRate', 'sssERShare', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'sssECShareRate', 'sssECShare', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'philHealthContributionRate', 'philHealthContribution', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'philHealthERShareRate', 'philHealthERShare', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'pagIbigContributionRate', 'pagIbigContribution', { transaction: t }),
        queryInterface.renameColumn('employee_benefits', 'pagIbigERShareRate', 'pagIbigERShare', { transaction: t }),
      ]);
    });
  }
};
