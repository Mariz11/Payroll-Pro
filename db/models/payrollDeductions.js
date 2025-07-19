import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initPayrollDeductionsModel = (sequelize) => {
  class PayrollDeductions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  PayrollDeductions.init(
    {
      payrollDeductionId: {
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
      employeeId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
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
      transferId: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'transactions',
          },
          key: 'transferId',
        },
      },
      amountPaid: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      isDeferred: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isCollected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'payroll_deductions',
      paranoid: true,
      timestamps: true,
    }
  );

  return PayrollDeductions;
};

export default initPayrollDeductionsModel(connection, DataTypes);
