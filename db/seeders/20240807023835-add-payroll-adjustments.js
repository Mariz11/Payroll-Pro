'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const payrolls = await queryInterface.sequelize.query(
        'SELECT * FROM payrolls WHERE isPosted = true',
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction: t }
      );

      if (payrolls && payrolls.length > 0) {
        for (let i = 0; i < payrolls.length; i++) {
          const payroll = payrolls[i];

          // TO BE REMOVED NEXT DEPLOYMENT (purpose:retain old data that still have adjustments and not using adjustments table)

          if (payroll.addAdjustment > 0 || payroll.deductAdjustment > 0) {
            // console.log(payroll);
            await queryInterface.sequelize.query(
              `INSERT INTO payroll_adjustments (payroll_id, addAdjustment, deductAdjustment, \`desc\`) VALUES (:payroll_id, :addAdjustment, :deductAdjustment, :desc)`,
              {
                replacements: {
                  payroll_id: payroll.payroll_id,
                  addAdjustment: payroll.addAdjustment,
                  deductAdjustment: payroll.deductAdjustment,
                  desc: payroll.shortDescription,
                },
                transaction: t,
              }
            );
            // console.log('inserted!');
            await queryInterface.sequelize.query(
              `UPDATE payrolls SET addAdjustment = 0, deductAdjustment = 0, shortDescription = '' WHERE payroll_id = :payroll_id`,
              {
                replacements: {
                  payroll_id: payroll.payroll_id,
                },
                transaction: t,
              }
            );
            // console.log('updated!');
          }
        }
      }
    });
  },

  async down(queryInterface, Sequelize) { },
};
