'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('attendances', 'manualLoginAction', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'isPosted',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('attendances', 'manualLoginAction');
  },
};
