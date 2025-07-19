import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initCityModel = (sequelize) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  City.init(
    {
      cityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      provinceId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'provinces',
          },
          key: 'provinceId',
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
      modelName: 'cities',
      timestamps: false,
    }
  );

  return City;
};

export default initCityModel(connection, DataTypes);
