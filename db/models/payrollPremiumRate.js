import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initPremiumRateModel = (sequelize) => {
  class PayrollPremiumRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  PayrollPremiumRate.init(
    {
      payrollPremiumRateId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payroll_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'payrolls',
          },
          key: 'payroll_id',
        },
      },
      workedOnRegDays: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRegDaysPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRHD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRHDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRHDWhileRD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnRHDWhileRDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnSPHD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnSPHDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnSPHDWhileRD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      workedOnSPHDWhileRDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      halfdayPresentonRHD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      halfdayPresentonRHDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      halfdayPresentonSPHD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      absenceOnRHD: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
      absenceOnRHDPay: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'payroll_premium_rates',
      paranoid: true,
      timestamps: false,
    }
  );
  return PayrollPremiumRate;
};

export default initPremiumRateModel(connection, DataTypes);
