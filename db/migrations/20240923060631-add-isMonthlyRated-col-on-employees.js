'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'isMonthlyRated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'applyWithholdingTax',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'isMonthlyRated');
  },
};
