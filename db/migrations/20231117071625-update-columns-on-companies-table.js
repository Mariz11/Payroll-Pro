'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'applyWithHoldingTax',
          {
            type: Sequelize.BOOLEAN,
            after: 'withholdingTaxType',
            allowNull: false,
            defaultValue: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'companies',
          'withholdingTaxType',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.renameColumn(
          'companies',
          'withholdingTaxType',
          'payrollType',
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'payDate',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'cutOffStartDate',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'cutOffEndDate',
          {
            type: Sequelize.STRING,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'preferredMonth',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
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
        queryInterface.removeColumn('companies', 'applyWithHoldingTax', {
          transaction: t,
        }),
        queryInterface.changeColumn(
          'companies',
          'payrollType',
          {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.renameColumn(
          'companies',
          'payrollType',
          'withholdingTaxType',
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'payDate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'cutOffStartDate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'cutOffEndDate',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.changeColumn(
          'company_pay_cycles',
          'preferredMonth',
          {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['PREVIOUS', 'CURRENT'],
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
