'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'latePay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            after: 'lateHrs',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'soloParentLeaveDays',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: 'vacationLeavePay',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'soloParentLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: null,
            after: 'soloParentLeaveDays',
          },
          {
            transaction: t,
          }
        ),

        queryInterface.addColumn(
          'payrolls',
          'paternityLeaveDays',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: 'soloParentLeavePay',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'paternityLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: null,
            after: 'paternityLeaveDays',
          },
          {
            transaction: t,
          }
        ),

        queryInterface.addColumn(
          'payrolls',
          'maternityLeaveDays',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: 'paternityLeavePay',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'maternityLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: null,
            after: 'maternityLeaveDays',
          },
          {
            transaction: t,
          }
        ),

        queryInterface.addColumn(
          'payrolls',
          'serviceIncentiveLeaveDays',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: 'maternityLeavePay',
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'payrolls',
          'serviceIncentiveLeavePay',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: true,
            defaultValue: null,
            after: 'serviceIncentiveLeaveDays',
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
          'payrolls',
          'latePay',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'soloParentLeaveDays',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'soloParentLeavePay',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'paternityLeaveDays',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'paternityLeavePay',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'maternityLeaveDays',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'maternityLeavePay',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'serviceIncentiveLeaveDays',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'payrolls',
          'serviceIncentiveLeavePay',
          {},
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
