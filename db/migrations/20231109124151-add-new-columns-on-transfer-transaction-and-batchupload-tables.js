'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'batch_uploads',
          'businessMonth',
          {
            type: Sequelize.STRING,
            after: 'companyId',
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'batch_uploads',
          'cycle',
          {
            type: Sequelize.STRING,
            after: 'businessMonth',
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'transfer_to_subacct_transactions',
          'type',
          {
            type: Sequelize.STRING,
            after: 'transferId',
            allowNull: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'transfer_to_subacct_transactions',
          'status',
          {
            type: Sequelize.BOOLEAN,
            after: 'transferAmount',
            allowNull: false,
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
        queryInterface.removeColumn('batch_uploads', 'businessMonth', {
          transaction: t,
        }),
        queryInterface.removeColumn('batch_uploads', 'cycle', {
          transaction: t,
        }),
        queryInterface.removeColumn(
          'transfer_to_subacct_transactions',
          'type',
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'transfer_to_subacct_transactions',
          'status',
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
