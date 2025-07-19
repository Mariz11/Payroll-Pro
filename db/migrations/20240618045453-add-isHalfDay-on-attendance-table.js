'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'attendances',
          'isHalfDay',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: 'isLeave',
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
        queryInterface.removeColumn('attendances', 'isHalfDay', {
          transaction: t,
        }),
      ]);
    });
  },
};
