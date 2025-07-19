'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payrolls', 'isMonthlyRated', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'isDirect',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payrolls', 'isMonthlyRated');
  },
};
