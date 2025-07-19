'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'isProcessing', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'companyId',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'isProcessing');
  },
};
