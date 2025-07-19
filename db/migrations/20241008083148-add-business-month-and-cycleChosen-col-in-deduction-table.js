'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('deductions', 'businessMonth', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'noOfCycles',
    });
    await queryInterface.addColumn('deductions', 'cycleChosen', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'businessMonth',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('deductions', 'businessMonth');
    await queryInterface.removeColumn('deductions', 'cycleChosen');
  },
};
