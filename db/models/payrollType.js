import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initPayrollTypeModel = (sequelize) => {
  class PayrollType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  PayrollType.init(
    {
      payrollTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'payroll_types',
      timestamps: false,
    }
  );

  return PayrollType;
};

export default initPayrollTypeModel(connection, DataTypes);
