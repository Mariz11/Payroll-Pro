'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'companies',
      'useFixedGovtContributionsRate',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        after: 'applyWithholdingTax',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'companies',
      'useFixedGovtContributionsRate'
    );
  },
};
