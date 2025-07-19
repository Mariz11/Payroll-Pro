import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initModuleActionModel = (sequelize) => {
  class ModuleAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  ModuleAction.init(
    {
      moduleActionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'modules',
          },
          key: 'moduleId',
        },
      },
      action: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'module_actions',
      timestamps: false,
    }
  );

  return ModuleAction;
};

export default initModuleActionModel(connection, DataTypes);
