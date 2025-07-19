import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { capitalizeWord, properCasing, removeExtraSpaces } from '@utils/helper';

const initCompanyPayCycleModel = (sequelize) => {
  class CompanyPayCycle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  CompanyPayCycle.init(
    {
      payCycleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
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
      payrollTypeId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'payroll_types',
          },
          key: 'payrollTypeId',
        },
      },
      cycle: {
        type: DataTypes.STRING(100),
        allowNull: false,
        get() {
          return this.getDataValue('cycle');
        },
        set(value) {
          this.setDataValue('cycle', removeExtraSpaces(value.toUpperCase()));
        },
      },
      payDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cutOffStartDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cutOffEndDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      preferredMonth: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      isApplyGovtBenefits: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      deductibleContributions: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        get() {
          const val = this.getDataValue('deductibleContributions');
          return val ? JSON.parse(val) : null;
        },
        set(value) {
          this.setDataValue('deductibleContributions', value);
        },
      },
    },
    {
      sequelize,
      modelName: 'company_pay_cycles',
      paranoid: true,
    }
  );

  return CompanyPayCycle;
};

export default initCompanyPayCycleModel(connection, DataTypes);
