'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('shifts', ['companyId', 'deletedAt', 'shiftName'], {
      name: 'idx_company_deleted_name',
      using: 'BTREE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('shifts', 'idx_company_deleted_name');
  }
};
