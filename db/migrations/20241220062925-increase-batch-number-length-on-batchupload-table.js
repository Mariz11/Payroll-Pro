'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'batch_uploads',
          'batchNumber',
          {
            type: Sequelize.TEXT('long'),
            allowNull: false,
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
        queryInterface.changeColumn(
          'batch_uploads',
          'batchNumber',
          {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
