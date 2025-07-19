import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initDeductionModel = (sequelize) => {
  class Deduction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Deduction.init(
    {
      deductionId: {
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
      referenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      acctNoEmployee: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      acctNoEmployer: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      deductionType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      deductionPeriod: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      noOfCycles: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      businessMonth: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      cycleChosen: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      perCycleDeduction: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      amountPaid: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      noOfIterations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPosted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'deductions',
      paranoid: true,
    }
  );

  return Deduction;
};

export default initDeductionModel(connection, DataTypes);
