'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'deductions',
          'referenceNumber',
          {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'employeeId',
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
        queryInterface.removeColumn('deductions', 'referenceNumber', {
          transaction: t,
        }),
      ]);
    });
  },
};
