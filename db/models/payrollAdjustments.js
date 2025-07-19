import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initPayrollAdjustmentsModel = (sequelize) => {
  class PayrollAdjustments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  PayrollAdjustments.init(
    {
      payrollAdjustmentsId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payroll_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'payrolls',
          },
          key: 'payroll_id',
        },
      },
      desc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      addAdjustment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deductAdjustment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'payroll_adjustments',
      paranoid: true,
      timestamps: true,
    }
  );

  return PayrollAdjustments;
};

export default initPayrollAdjustmentsModel(connection, DataTypes);
