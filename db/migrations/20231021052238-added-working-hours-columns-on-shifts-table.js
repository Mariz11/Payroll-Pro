'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('shifts', 'workingHours', {
      type: Sequelize.FLOAT(8, 2),
      allowNull: false,
      after: 'snackEnd',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('shifts', 'workingHours');
  },
};
