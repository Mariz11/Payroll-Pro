'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'attendance_applications',
          'approverId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            after: 'employeeId',
            references: {
              model: {
                tableName: 'users',
              },
              key: 'userId',
            },
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
        queryInterface.removeColumn('attendance_applications', 'approverId', {
          transaction: t,
        }),
      ]);
    });
  },
};
