'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'announcements',
          'type',
          {
            type: Sequelize.STRING(15),
            allowNull: false,
            after: 'content',
            defaultValue: 'ADMIN',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'view_details',
          'companyId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'departmentId',
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
        queryInterface.removeColumn('view_details', 'companyId', {
          transaction: t,
        }),
        queryInterface.removeColumn('announcements', 'type', {
          transaction: t,
        }),
      ]);
    });
  },
};
