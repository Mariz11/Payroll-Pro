'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'attendance_applications',
          'lateHrs',
          {
            type: Sequelize.FLOAT(8, 2),

            allowNull: true,
            after: 'numberOfHours',
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'attendance_applications',
          'undertimeHrs',
          {
            type: Sequelize.FLOAT(8, 2),

            allowNull: true,
            after: 'numberOfHours',
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'attendance_applications',
          'isHalfDayLeave',
          {
            type: Sequelize.BOOLEAN,

            allowNull: true,
            after: 'numberOfHours',
            defaultValue: false,
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn(
          'attendance_applications',
          'lateHrs',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'attendance_applications',
          'undertimeHrs',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'attendance_applications',
          'isHalfDayLeave',
          {
            transaction: t,
          }
        ),
      ]);
    });
  }
};
