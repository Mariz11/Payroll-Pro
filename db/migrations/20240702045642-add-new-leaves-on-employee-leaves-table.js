'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'employee_leaves',
          'emergencyLeaveCredits',
          {
            type: Sequelize.FLOAT(8, 2), 
            defaultValue: 0,
            after: 'otherLeavesUsed'
          },
          {
            transaction: t,
          }
        ),,
        queryInterface.addColumn(
          'employee_leaves',
          'emergencyLeavesUsed',
          {
            type: Sequelize.FLOAT(8, 2), 
            defaultValue: 0,
            after: 'emergencyLeaveCredits'
          },
          {
            transaction: t,
          }
        ),
        // ========================
        queryInterface.addColumn(
          'employee_leaves',
          'birthdayLeaveCredits',
          {
            type: Sequelize.FLOAT(8, 2), 
            defaultValue: 0,
            after: 'emergencyLeavesUsed'
          },
          {
            transaction: t,
          }
        ),,
        queryInterface.addColumn(
          'employee_leaves',
          'birthdayLeavesUsed',
          {
            type: Sequelize.FLOAT(8, 2), 
            defaultValue: 0,
            after: 'birthdayLeaveCredits'
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
        queryInterface.removeColumn(
          'employee_leaves',
          'emergencyLeaveCredits',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'employee_leaves',
          'emergencyLeavesUsed',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'employee_leaves',
          'birthdayLeaveCredits',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'employee_leaves',
          'birthdayLeavesUsed',
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};