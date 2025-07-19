'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blacklists', {
      blacklistId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      token: {
        type: Sequelize.STRING(10000),
        allowNull: false,

      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: false,

      }

    });


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("blacklists");
  }
};
