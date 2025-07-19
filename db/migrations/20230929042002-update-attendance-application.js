'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'attendance_applications',
          'contactNumber',
          {
            type: Sequelize.STRING(11),
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'attendance_applications',
          'contactPerson',
          {
            type: Sequelize.STRING(11),
            allowNull: true,
            defaultValue: null,
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
          'attendance_applications',
          'contactNumber',
          {
            type: Sequelize.STRING(11),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'attendance_applications',
          'contactPerson',
          {
            type: Sequelize.STRING(11),
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
