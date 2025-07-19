'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'shortDescription',
          {
            type: Sequelize.STRING(40),
            allowNull: true,
            after: 'deductAdjustment',
            defaultValue: '',
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
        queryInterface.removeColumn('payrolls', 'shortDescription', {
          transaction: t,
        }),
      ]);
    });
  },
};
