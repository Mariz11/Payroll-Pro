'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'employee_leaves',
          'vacationLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'vacationLeaveUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'sickLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'sickLeaveUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'soloParentLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'soloParentLeavesUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'paternityLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'paternityLeavesUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'maternityLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'maternityLeavesUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'serviceIncentiveLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'serviceIncentiveLeaveUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'otherLeaveCredits',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'otherLeavesUsed',
          { type: Sequelize.FLOAT(8, 2), defaultValue: 0 },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'attendance_applications',
          'numberOfDays',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: null,
            after: 'timeTo',
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
          'employee_leaves',
          'vacationLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'vacationLeaveUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'sickLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'sickLeaveUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'soloParentLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'soloParentLeavesUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'paternityLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'paternityLeavesUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'maternityLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'maternityLeavesUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'serviceIncentiveLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'serviceIncentiveLeaveUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'otherLeaveCredits',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'employee_leaves',
          'otherLeavesUsed',
          { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
          { transaction: t }
        ),
        queryInterface.removeColumn('attendance_applications', 'numberOfDays', {
          transaction: t,
        }),
      ]);
    });
  },
};
