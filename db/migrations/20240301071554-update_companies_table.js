'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'workingDays',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 242,
            after: 'sssAcctNo',
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
        queryInterface.removeColumn('companies', 'workingDays', {
          transaction: t,
        }),
      ]);
    });
  },
};
