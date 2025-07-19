'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('companies', 'withholdingTaxType', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'sssAcctNo',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('companies', 'withholdingTaxType');
  },
};
