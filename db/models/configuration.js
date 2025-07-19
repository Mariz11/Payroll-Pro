import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initConfigurationModel = (sequelize) => {
  class Configuration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Configuration.init(
    {
      configurationId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      emailContacts: {
        type: DataTypes.TEXT,
        defaultValue: '',
        allowNull: false,
      },
      phoneContacts: {
        type: DataTypes.TEXT,
        defaultValue: '',
        allowNull: false,
      },
      threshold: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 100.0,
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: 'configurations',
      paranoid: false,
      timestamps: false,
    }
  );

  return Configuration;
};
export default initConfigurationModel(connection, DataTypes);
