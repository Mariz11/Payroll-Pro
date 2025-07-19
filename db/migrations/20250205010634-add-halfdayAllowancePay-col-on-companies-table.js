'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'halfdayAllowancePay', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'FULL',
      after: 'isHolidayDayoffPaid',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'halfdayAllowancePay');
  },
};
