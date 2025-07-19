'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'company_pay_cycles',
          'deductibleContributions',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'isApplyGovtBenefits',
            defaultValue: null,
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
        queryInterface.removeColumn(
          'company_pay_cycles',
          'deductibleContributions',
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
