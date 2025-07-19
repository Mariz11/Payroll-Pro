'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payrolls', 'failedRemarks', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null,
      after: 'disbursementSchedule',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payrolls', 'failedRemarks');
  },
};
