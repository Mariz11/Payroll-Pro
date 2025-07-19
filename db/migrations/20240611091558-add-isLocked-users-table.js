'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'users',
          'isLocked',
          {
            type: Sequelize.BOOLEAN,

            allowNull: false,
            after: 'emailAddress',
            defaultValue: false,
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
        queryInterface.removeColumn('users', 'isLocked', {
          transaction: t,
        }),
      ]);
    });
  }
};
