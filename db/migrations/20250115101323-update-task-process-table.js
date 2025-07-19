'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('tasks_processes', 'percentage', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'processCount', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'successCount', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'totalProcess', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'failedRemarks', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'isAcknowledged', {
          transaction: t,
        }),
        queryInterface.changeColumn(
          'tasks_processes',
          'status',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'departmentName',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            after: 'taskName'
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'businessMonth',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            after: 'departmentName'
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'cycle',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
            after: 'businessMonth'
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
        queryInterface.addColumn(
          'tasks_processes',
          'percentage',
          {
            type: Sequelize.FLOAT(8, 2),
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'successCount',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'processCount',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'totalProcess',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'failedRemarks',
          {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'tasks_processes',
          'isAcknowledged',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'tasks_processes',
          'status',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn('tasks_processes', 'departmentName', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'businessMonth', {
          transaction: t,
        }),
        queryInterface.removeColumn('tasks_processes', 'cycle', {
          transaction: t,
        }),
      ]);
    });
  },
};
