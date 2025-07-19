'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'enableSearchEmployee', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'useFixedGovtContributionsRate',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'enableSearchEmployee');
  },
};
