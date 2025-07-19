'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configurations', {
      configurationId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },

      emailContacts: {
        type: Sequelize.TEXT,
        defaultValue: '',
        allowNull: false,
      },
      phoneContacts: {
        type: Sequelize.TEXT,
        defaultValue: '',
        allowNull: false,
      },

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("configurations");
  }
};
