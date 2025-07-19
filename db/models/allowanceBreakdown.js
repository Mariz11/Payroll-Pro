import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initAllowanceBreakdownModel = (sequelize) => {
  class AllowanceBreakdown extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  AllowanceBreakdown.init(
    {
      allowanceBreakdownId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
      },
      employeeId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
      },
      allowanceType: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      monthlyAmounts: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      dailyAmounts: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'allowance_breakdowns',
      paranoid: true,
    }
  );

  return AllowanceBreakdown;
};

export default initAllowanceBreakdownModel(connection, DataTypes);
