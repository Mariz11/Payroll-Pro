import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initModuleModel = (sequelize) => {
  class Module extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Module.init(
    {
      moduleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      moduleName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'modules',
      paranoid: false,
      timestamps: false,
    }
  );

  return Module;
};

export default initModuleModel(connection, DataTypes);
