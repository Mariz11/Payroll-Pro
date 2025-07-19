'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      const companies = await queryInterface.sequelize.query(
        `SELECT * FROM companies`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      for (const company of companies) {
        const chargePerEmployee = company.chargePerEmployee;
        console.log(chargePerEmployee);
        await queryInterface.sequelize.query(
          `INSERT INTO company_charges (companyId, tierNumber, tierStart, tierEnd, charge) VALUES (:companyId, 1, 0.01, 25000.00, :charge)`,
          {
            replacements: {
              companyId: company.companyId,
              charge: chargePerEmployee * 1,
            },
            type: Sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );
        await queryInterface.sequelize.query(
          `INSERT INTO company_charges (companyId, tierNumber, tierStart, tierEnd, charge) VALUES (:companyId, 2, 25000.01, 50000.00, :charge)`,
          {
            replacements: {
              companyId: company.companyId,
              charge: chargePerEmployee * 2,
            },
            type: Sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );
        await queryInterface.sequelize.query(
          `INSERT INTO company_charges (companyId, tierNumber, tierStart, tierEnd, charge) VALUES (:companyId, 3, 50000.01, 100000.00, :charge)`,
          {
            replacements: {
              companyId: company.companyId,
              charge: chargePerEmployee * 3,
            },
            type: Sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );
        await queryInterface.sequelize.query(
          `INSERT INTO company_charges (companyId, tierNumber, tierStart, tierEnd, charge) VALUES (:companyId, 4, 100000.01, 250000.00, :charge)`,
          {
            replacements: {
              companyId: company.companyId,
              charge: chargePerEmployee * 4,
            },
            type: Sequelize.QueryTypes.INSERT,
            transaction: t,
          }
        );
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'company_charges',
      null,
      {
        truncate: true,
        cascade: true,
      },
      { primaryKeys: [], primaryKeyAttributes: [] }
    );
  },
};
