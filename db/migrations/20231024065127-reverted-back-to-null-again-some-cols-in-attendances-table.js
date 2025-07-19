'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn('attendances', 'timeIn', {
          type: Sequelize.TIME,
          allowNull: true,
          defaultValue: null,
        },
        {
          transaction: t,
        }
        ),
        queryInterface.changeColumn('attendances', 'timeOut', {
          type: Sequelize.TIME,
          allowNull: true,
          defaultValue: null,
        },
        {
          transaction: t,
        }
        ),
        queryInterface.changeColumn('attendances', 'lunchTimeIn', {
          type: Sequelize.TIME,
          allowNull: true,
          defaultValue: null,
        },
        {
          transaction: t,
        }
        ),
        queryInterface.changeColumn('attendances', 'lunchTimeOut', {
          type: Sequelize.TIME,
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
        queryInterface.changeColumn('attendances', 'timeIn', {
          type: Sequelize.TIME,
          allowNull: false,
        },
        {
          transaction: t,
        }
        ),
        queryInterface.changeColumn('attendances', 'timeOut', {
          type: Sequelize.TIME,
          allowNull: false,
        },
        {
          transaction: t,
        }
        ),
        queryInterface.changeColumn('attendances', 'lunchTimeIn', {
          type: Sequelize.TIME,
          allowNull: false,
        },
        {
          transaction: t,
        }
        ),
        queryInterface.changeColumn('attendances', 'lunchTimeOut', {
          type: Sequelize.TIME,
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
