'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'payrolls',
          'disbursementCode',
          {
            type: Sequelize.STRING,
            after: 'disbursementStatus',
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'batch_uploads',
          'modeOfPayroll',
          {
            type: Sequelize.INTEGER,
            after: 'transactionDate',
            allowNull: false,
            defaultValue: 0,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn('batch_uploads', 'transactionCode', {
          transaction: t,
        }),
        queryInterface.removeColumn('batch_uploads', 'transactionDate', {
          transaction: t,
        }),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('payrolls', 'disbursementCode', {
          transaction: t,
        }),
        queryInterface.removeColumn('batch_uploads', 'modeOfPayroll', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'batch_uploads',
          'transactionCode',
          {
            type: Sequelize.STRING,
            after: 'batchNumber',
            allowNull: true,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'batch_uploads',
          'transactionDate',
          {
            type: Sequelize.STRING,
            after: 'transactionCode',
            allowNull: true,
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
