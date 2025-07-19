'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('employee_profiles', 'profilePicture', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'suffix',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('employee_profiles', 'profilePicture');
  },
};
