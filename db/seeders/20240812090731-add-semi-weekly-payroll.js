'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.sequelize.query(
        `INSERT INTO payroll_types (\`type\`) VALUES (:type)`,
        {
          replacements: {
            type: 'SEMI-WEEKLY',
          },
          transaction: t,
        }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.delete('payroll_types', {
        type: 'SEMI-WEEKLY',
      });
    });
  },
};
