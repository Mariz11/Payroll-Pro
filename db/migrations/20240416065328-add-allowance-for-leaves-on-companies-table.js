'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'allowanceForLeaves',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            after: 'dueDate',
            defaultValue: false,
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
        queryInterface.removeColumn('companies', 'allowanceForLeaves', {
          transaction: t,
        }),
      ]);
    });
  },
};
