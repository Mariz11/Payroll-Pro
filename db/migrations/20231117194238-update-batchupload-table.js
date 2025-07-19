'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          'batch_uploads',
          'batchUploadNumber',
          'batchNumber',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'batch_uploads',
          'isApproved',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn('batch_uploads', 'batchUploadRefNum', {
          transaction: t,
        }),
        queryInterface.addColumn(
          'batch_uploads',
          'transactionDate',
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
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.renameColumn(
          'batch_uploads',
          'batchNumber',
          'batchUploadNumber',
          {},
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'batch_uploads',
          'batchUploadRefNum',
          {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'batch_uploads',
          'isApproved',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn('batch_uploads', 'transactionDate', {
          transaction: t,
        }),
        queryInterface.removeColumn('batch_uploads', 'transactionCode', {
          transaction: t,
        }),
      ]);
    });
  },
};
