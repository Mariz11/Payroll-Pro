'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'attendance_applications',
          'numberOfHours',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
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
          'attendance_applications',
          'numberOfHours',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          { transaction: t }
        ),
      ]);
    });
  },
};
