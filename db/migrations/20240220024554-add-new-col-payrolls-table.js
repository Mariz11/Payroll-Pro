'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'chargePerEmployee',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            after: 'deductAdjustment',
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('payrolls', 'chargePerEmployee', {
          transaction: t,
        }),
      ]);
    });
  },
};
