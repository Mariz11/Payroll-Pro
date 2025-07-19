import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initCompanyChargeModel = (sequelize) => {
  class CompanyCharge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  CompanyCharge.init(
    {
      companyChargeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      companyId: {
        allowNull: false,
        type: DataTypes.BIGINT,
        references: {
          model: 'companies',
          key: 'companyId',
        },
      },
      tierNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tierStart: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      tierEnd: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      charge: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: 'company_charges',
      paranoid: false,
      timestamps: false,
    }
  );

  return CompanyCharge;
};

export default initCompanyChargeModel(connection, DataTypes);
