'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks_processes', 'processCount', {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0,
      after: 'successCount',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks_processes', 'processCount');
  },
};
