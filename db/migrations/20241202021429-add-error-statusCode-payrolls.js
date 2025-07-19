'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payrolls', 'statusCode', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'isPosted',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payrolls', 'statusCode');
  },
};
