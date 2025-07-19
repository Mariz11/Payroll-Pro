'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('employees', 'employeeStatus', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'referenceFiles',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('employees', 'employeeStatus');
  },
};
