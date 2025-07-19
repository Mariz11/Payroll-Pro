'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('attendances', 'creditableOvertime', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      after: 'overtimeHours',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('attendances', 'creditableOvertime');
  },
};
