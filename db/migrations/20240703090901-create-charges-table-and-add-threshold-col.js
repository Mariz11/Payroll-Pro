'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('configurations', 'threshold', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
    });
    await queryInterface.createTable('charges', {
      chargeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      configurationId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'configurations',
          key: 'configurationId',
        },
        allowNull: false,
      },
      tierNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tierStart: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      tierEnd: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      chargeLessThreshold: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
      chargeMoreThreshold: {
        type: Sequelize.FLOAT(8, 2),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('charges');
    await queryInterface.removeColumn('configurations', 'threshold');
  },
};
