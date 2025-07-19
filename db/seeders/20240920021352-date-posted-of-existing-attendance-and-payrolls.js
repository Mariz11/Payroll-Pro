'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const attendances = await queryInterface.sequelize.query(
        `SELECT attendanceId, updatedAt FROM attendances WHERE isPosted = 1 AND datePosted IS NULL`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      for (const attendance of attendances) {
        await queryInterface.sequelize.query(
          `UPDATE attendances SET datePosted = :datePosted WHERE attendanceId = :attendanceId`,
          {
            replacements: {
              datePosted: attendance.updatedAt,
              attendanceId: attendance.attendanceId,
            },
            type: Sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }

      const payrolls = await queryInterface.sequelize.query(
        `SELECT payroll_id, updatedAt FROM payrolls WHERE isPosted = 1 AND datePosted IS NULL`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      for (const payroll of payrolls) {
        await queryInterface.sequelize.query(
          `UPDATE payrolls SET datePosted = :datePosted WHERE payroll_id = :payroll_id`,
          {
            replacements: {
              datePosted: payroll.updatedAt,
              payroll_id: payroll.payroll_id,
            },
            type: Sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {},
};
