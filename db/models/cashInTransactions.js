import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initCashInTransactionsModel = (sequelize) => {
  class CashInTransactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  CashInTransactions.init(
    {
      cashInTransId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
      },
      cashTransferId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      transactionCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      quickResponseCode: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      transactionType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: false,
      },
      via: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      principalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      companyAccountId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyContactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      isNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'cash_in_transactions',
      timestamps: true,
    }
  );

  return CashInTransactions;
};

export default initCashInTransactionsModel(connection, DataTypes);
