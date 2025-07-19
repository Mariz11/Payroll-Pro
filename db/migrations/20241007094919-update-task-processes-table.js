'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'tasks_processes',
          'taskName',
          {
            type: Sequelize.TEXT('long'),
            allowNull: true,
            defaultValue: null,
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'tasks_processes',
          'failedRemarks',
          {
            type: Sequelize.TEXT('long'),
            allowNull: true,
            defaultValue: null,
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'tasks_processes',
          'taskName',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
          },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'tasks_processes',
          'failedRemarks',
          {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
