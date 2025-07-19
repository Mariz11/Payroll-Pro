'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeColumn('employees', 'isActive');
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn('employees', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: 'applyWithholdingTax'
    })
  }
};
