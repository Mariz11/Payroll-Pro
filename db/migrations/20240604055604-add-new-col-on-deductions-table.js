/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'deductions',
          'noOfIterations',
          {
            type: Sequelize.INTEGER,

            allowNull: true,
            after: 'amountPaid',
            defaultValue: 0,
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
        queryInterface.removeColumn('deductions', 'noOfIterations', {
          transaction: t,
        }),
      ]);
    });
  },
};
