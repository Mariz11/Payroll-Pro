'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'applyCharge', {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: 'tcAccepted',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'applyCharge');
  },
};
