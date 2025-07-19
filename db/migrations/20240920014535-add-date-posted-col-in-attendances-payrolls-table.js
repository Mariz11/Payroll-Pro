'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('attendances', 'datePosted', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'isPosted',
    });
    await queryInterface.addColumn('payrolls', 'datePosted', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      after: 'isPosted',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('attendances', 'datePosted');
    await queryInterface.removeColumn('payrolls', 'datePosted');
  },
};
