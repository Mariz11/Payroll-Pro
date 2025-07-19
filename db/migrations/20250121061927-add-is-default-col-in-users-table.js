'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isDefault', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'isActive',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'isDefault');
  },
};
