'use strict';

const { NUMBER } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const companies = await queryInterface.sequelize.query(
        'SELECT companyId, companyName FROM companies',
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      for(const company of companies) {
        if(company.companyId !== 1) {
          console.log(company.companyName)
          const companyPayCycles = await queryInterface.sequelize.query(
            `SELECT CASE WHEN cycle IN ('first cycle', 'second cycle') THEN 'SEMI-MONTHLY' ELSE cycle END AS cycle FROM company_pay_cycles WHERE companyId = :companyId and deletedAt IS NULL`,
            {
              replacements: {
                companyId: company.companyId
              },
              type: queryInterface.sequelize.QueryTypes.SELECT,
            }
          )
          
          const uniqueCycles = Array.from(new Set(companyPayCycles.map(item => item.cycle)));

          const uniqueCyclesArray = uniqueCycles.map(cycle => cycle);
          
          const weekly = [
            {
              bracket: 1,
              from: 0,
              to: 4808,
              tax: 0,
              excessRate: 0,
            },
            {
              bracket: 2,
              from: 4808,
              to: 7691,
              tax: 0,
              excessRate: 15,
            },
            {
              bracket: 3,
              from: 7692,
              to: 15384,
              tax: 432.60,
              excessRate: 20,
            },
            {
              bracket: 4,
              from: 15385,
              to: 38461,
              tax: 1971.20,
              excessRate: 25,
            },
            {
              bracket: 5,
              from: 38462,
              to: 153845,
              tax: 7740.45,
              excessRate: 30,
            },
            {
              bracket: 6,
              from: 153846,
              to: null,
              tax: 42355.65,
              excessRate: 35,
            },
          ]
          const semiMonthly = [
            {
              bracket: 1,
              from: 0,
              to: 10417,
              tax: 0,
              excessRate: 0,
            },
            {
              bracket: 2,
              from: 10417,
              to: 16666,
              tax: 0,
              excessRate: 15,
            },
            {
              bracket: 3,
              from: 16667,
              to: 33332,
              tax: 937.50,
              excessRate: 20,
            },
            {
              bracket: 4,
              from: 33333,
              to: 83332,
              tax: 4270.70,
              excessRate: 25,
            },
            {
              bracket: 5,
              from: 83333,
              to: 333332,
              tax: 16770.70,
              excessRate: 30,
            },
            {
              bracket: 6,
              from: 333333,
              to: null,
              tax: 91770.70,
              excessRate: 35,
            },
          ]
          const monthly = [
            {
              bracket: 1,
              from: 0,
              to: 10417,
              tax: 0,
              excessRate: 0,
            },
            {
              bracket: 2,
              from: 10417,
              to: 16666,
              tax: 0,
              excessRate: 15,
            },
            {
              bracket: 3,
              from: 16667,
              to: 33332,
              tax: 937.50,
              excessRate: 20,
            },
            {
              bracket: 4,
              from: 33333,
              to: 83332,
              tax: 4270.70,
              excessRate: 25,
            },
            {
              bracket: 5,
              from: 83333,
              to: 333332,
              tax: 16770.70,
              excessRate: 30,
            },
            {
              bracket: 6,
              from: 333333,
              to: null,
              tax: 91770.70,
              excessRate: 35,
            },
          ]
          if(uniqueCyclesArray.includes('WEEKLY')) {
            await Promise.all(
              weekly.map(async (week) => {
                await queryInterface.sequelize.query(
                  `INSERT INTO company_withholding_tax_shields (companyId, payrollTypeId, bracket, \`from\`, \`to\`, fixTaxAmount, taxRateExcess) VALUES (:company, :payrollTypeId, :bracket, :from, :to, :fixTaxAmount, :taxRateExcess)`,
                  {
                    replacements: {
                      company: company.companyId,
                      payrollTypeId: 1,
                      bracket: week.bracket,
                      from: week.from,
                      to: week.to,
                      fixTaxAmount: week.tax,
                      taxRateExcess: week.excessRate
                    }
                  }
                )
              })
            )
          }
          
          if(uniqueCyclesArray.includes('SEMI-MONTHLY')) {
            await Promise.all(
              semiMonthly.map(async (semi) => {
                await queryInterface.sequelize.query(
                  `INSERT INTO company_withholding_tax_shields (companyId, payrollTypeId, bracket, \`from\`, \`to\`, fixTaxAmount, taxRateExcess) VALUES (:company, :payrollTypeId, :bracket, :from, :to, :fixTaxAmount, :taxRateExcess)`,
                  {
                    replacements: {
                      company: company.companyId,
                      payrollTypeId: 2,
                      bracket: semi.bracket,
                      from: semi.from,
                      to: semi.to,
                      fixTaxAmount: semi.tax,
                      taxRateExcess: semi.excessRate
                    }
                  }
                )
              })
            )
          }


          
          if(uniqueCyclesArray.includes('MONTHLY')) {
            await Promise.all(
              monthly.map(async (month) => {
                await queryInterface.sequelize.query(
                  `INSERT INTO company_withholding_tax_shields (companyId, payrollTypeId, bracket, \`from\`, \`to\`, fixTaxAmount, taxRateExcess) VALUES (:company, :payrollTypeId, :bracket, :from, :to, :fixTaxAmount, :taxRateExcess)`,
                  {
                    replacements: {
                      company: company.companyId,
                      payrollTypeId: 3,
                      bracket: month.bracket,
                      from: month.from,
                      to: month.to,
                      fixTaxAmount: month.tax,
                      taxRateExcess: month.excessRate
                    }
                  }
                )
              })
            )
          }
        }
      }
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const companies = await queryInterface.sequelize.query(
        'SELECT companyId FROM companies',
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      for (const company of companies) {
        if (company.companyId !== 1) {
          await queryInterface.sequelize.query(
            `DELETE FROM company_withholding_tax_shields WHERE companyId = :company AND payrollTypeId = :payrollTypeId`,
            {
              replacements: {
                company: company.companyId,
                payrollTypeId: 1
              },
              transaction: t
            }
          );
        }
      }
    });
  }
};
