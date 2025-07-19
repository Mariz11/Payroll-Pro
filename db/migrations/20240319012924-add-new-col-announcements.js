'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'announcements',
          'userId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            after: 'announcementId',
            defaultValue: null,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'userId',
            },
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
        queryInterface.removeColumn('announcements', 'userId', {
          transaction: t,
        }),
      ]);
    });
  },
};
