import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initProvinceModel = (sequelize) => {
  class Province extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Province.init(
    {
      provinceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      countryId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'countries',
          },
          key: 'countryId',
        },
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'provinces',
      timestamps: false,
    }
  );

  return Province;
};

export default initProvinceModel(connection, DataTypes);
