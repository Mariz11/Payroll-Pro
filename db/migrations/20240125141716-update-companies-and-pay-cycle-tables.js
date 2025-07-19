'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('companies', 'payrollType', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'company_pay_cycles',
          'payrollTypeId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'payroll_types',
              },
              key: 'payrollTypeId',
            },
            after: 'companyId',
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'departments',
          'payrollTypeId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: {
                tableName: 'payroll_types',
              },
              key: 'payrollTypeId',
            },
            after: 'companyId',
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.renameColumn(
          'company_pay_cycles',
          'isPreferred',
          'isApplyGovtBenefits',
          { transaction: t }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'companies',
          'payrollType',
          {
            type: Sequelize.STRING,
            after: 'sssAcctNo',
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn('company_pay_cycles', 'payrollTypeId', {
          transaction: t,
        }),
        queryInterface.removeColumn('departments', 'payrollTypeId', {
          transaction: t,
        }),
        queryInterface.renameColumn(
          'company_pay_cycles',
          'isApplyGovtBenefits',
          'isPreferred',
          { transaction: t }
        ),
      ]);
    });
  },
};
