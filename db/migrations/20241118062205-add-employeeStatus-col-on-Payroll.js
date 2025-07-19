'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payrolls', 'employmentStatus', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      after: 'isMonthlyRated',
    });
    await queryInterface.sequelize.query(
      `UPDATE payrolls 
INNER JOIN employees 
  ON employees.employeeId = payrolls.employeeId 
SET payrolls.employmentStatus = employees.employmentStatus 
WHERE payrolls.employmentStatus IS NULL;`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payrolls', 'employmentStatus');
  },
};
