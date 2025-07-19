'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'failedRegistrationRemarks', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null,
      after: 'mismatchedInfos',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'failedRegistrationRemarks');
  },
};
