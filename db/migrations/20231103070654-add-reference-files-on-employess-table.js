'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('employees', 'referenceFiles', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'mismatchedInfos',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('employees', 'referenceFiles');
  },
};
