'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('payrolls', 'withholdingTax', {
      type: Sequelize.FLOAT(8, 3),
      allowNull: false,
      after: 'pagIbigERShare',
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('payrolls', 'withholdingTax');
  },
};
