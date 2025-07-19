'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'isHolidayDayoffPaid', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'applyCharge',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'isHolidayDayoffPaid');
  },
};
