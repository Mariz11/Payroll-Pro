import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initTransactionsModel = (sequelize) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Transactions.init(
    {
      transferId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
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
      businessMonth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cycle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      transactionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      transactionAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'transactions',
    }
  );

  return Transactions;
};

export default initTransactionsModel(connection, DataTypes);
