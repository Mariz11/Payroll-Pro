/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'leavesOnHolidays',
          {
            type: Sequelize.BOOLEAN,

            allowNull: false,
            after: 'allowanceForLeaves',
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
        queryInterface.removeColumn('companies', 'leavesOnHolidays', {
          transaction: t,
        }),
      ]);
    });
  },
};
