'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('employees', 'mismatchedInfos', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'applyWithholdingTax'
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('employees', 'mismatchedInfos');
  }
};
