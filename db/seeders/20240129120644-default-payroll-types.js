'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('payroll_types', [
      {
        payrollTypeId: 1,
        type: 'WEEKLY',
      },
      {
        payrollTypeId: 2,
        type: 'SEMI-MONTHLY',
      },
      {
        payrollTypeId: 3,
        type: 'MONTHLY',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('payroll_types', null, {});
  },
};
