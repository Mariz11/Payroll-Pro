'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'users',
          'roleId',
          {
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'user_roles',
              },
              key: 'userRoleId',
            },
            after: 'role'
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
        queryInterface.removeColumn(
          'users',
          'roleId',
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
