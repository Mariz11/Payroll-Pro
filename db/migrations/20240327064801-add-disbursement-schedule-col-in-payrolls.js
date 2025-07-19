'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'isDirect',
          {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            after: 'disbursementCode',
            defaultValue: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'disbursementSchedule',
          {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'isDirect',
            defaultValue: null,
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
        queryInterface.removeColumn('payrolls', 'isDirect', {
          transaction: t,
        }),
        queryInterface.removeColumn('payrolls', 'disbursementSchedule', {
          transaction: t,
        }),
      ]);
    });
  },
};
