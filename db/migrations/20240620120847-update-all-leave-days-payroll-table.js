'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.changeColumn(
        'payrolls',
        'sickLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
      queryInterface.changeColumn(
        'payrolls',
        'vacationLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
      queryInterface.changeColumn(
        'payrolls',
        'soloParentLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
      queryInterface.changeColumn(
        'payrolls',
        'maternityLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
      queryInterface.changeColumn(
        'payrolls',
        'paternityLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
      queryInterface.changeColumn(
        'payrolls',
        'serviceIncentiveLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
      queryInterface.changeColumn(
        'payrolls',
        'otherLeaveDays',
        {
          type: Sequelize.FLOAT(8, 2),
          allowNull: true,
          defaultValue: 0,
        },

      ),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('payrolls', 'sickLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('payrolls', 'vacationLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('payrolls', 'soloParentLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('payrolls', 'maternityLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('payrolls', 'paternityLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('payrolls', 'serviceIncentiveLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('payrolls', 'otherLeaveDays', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }),
    ])
  }
};
