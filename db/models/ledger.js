import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initLedgerModel = (sequelize) => {
  class Ledger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Ledger.init(
    {
      ledgerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      deductionId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'deductions',
          },
          key: 'deductionId',
        },
      },
      desc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'ledgers',
      paranoid: true,
      timestamps: true,
    }
  );

  return Ledger;
};

export default initLedgerModel(connection, DataTypes);
