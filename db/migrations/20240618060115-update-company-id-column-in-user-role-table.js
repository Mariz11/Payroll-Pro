'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'user_roles',
          'companyId',
          {
            allowNull: true,
            type: Sequelize.INTEGER,
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
          'user_roles',
          'companyId',
          {
            allowNull: false,
            type: Sequelize.INTEGER,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};