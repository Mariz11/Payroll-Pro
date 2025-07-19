import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { capitalizeWord, properCasing, removeExtraSpaces } from '@utils/helper';

const initCompanyWithholdingTaxShieldModel = (sequelize) => {
  class CompanyWithholdingTaxShieldModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  CompanyWithholdingTaxShieldModel.init(
    {
      withholdingTaxShieldId: {
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
      bracket: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      from: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      to: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      fixTaxAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      taxRateExcess: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'company_withholding_tax_shields',
      paranoid: true,
    }
  );

  return CompanyWithholdingTaxShieldModel;
};

export default initCompanyWithholdingTaxShieldModel(connection, DataTypes);
