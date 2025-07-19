'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'payrolls',
          'overtimeHrs',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'undertimeHrs',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'lateHrs',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'nightDiffHrs',
          {
            type: Sequelize.FLOAT(8, 2),
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
          'payrolls',
          'overtimeHrs',
          {
            type: Sequelize.FLOAT(8, 1),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'undertimeHrs',
          {
            type: Sequelize.FLOAT(8, 1),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'lateHrs',
          {
            type: Sequelize.FLOAT(8, 1),
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'payrolls',
          'nightDiffHrs',
          {
            type: Sequelize.FLOAT(8, 1),
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
