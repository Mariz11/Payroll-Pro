'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('attendances', 'changeScheduleId', {
          transaction: t,
        }),
        queryInterface.removeColumn('attendances', 'attendanceAppId', {
          transaction: t,
        }),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'attendances',
          'attendanceAppId',
          {
            allowNull: true,
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'attendance_applications',
              },
              key: 'attendanceAppId',
            },
            after: 'departmentId',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'attendances',
          'changeScheduleId',
          {
            allowNull: true,
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'changed_schedules',
              },
              key: 'changeScheduleId',
            },
            after: 'attendanceAppId',
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
