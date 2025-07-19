import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initTransferToEmployeeModel = (sequelize) => {
  class TransferToEmployee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  TransferToEmployee.init(
    {
      id: {
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
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'deductions',
          },
          key: 'deductionId',
        },
      },
      batchNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      transactionName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('type');
        },
        set(value) {
          this.setDataValue('type', value.toUpperCase());
        },
      },
      disbursedAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      disbursementCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      disbursementStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'transfer_to_employee_acct_transactions',
    }
  );

  return TransferToEmployee;
};

export default initTransferToEmployeeModel(connection, DataTypes);
