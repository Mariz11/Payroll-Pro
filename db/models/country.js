import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initCountryModel = (sequelize) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Country.init(
    {
      countryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      modelName: 'countries',
      timestamps: false,
    }
  );

  return Country;
};

export default initCountryModel(connection, DataTypes);
