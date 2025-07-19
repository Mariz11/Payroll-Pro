import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initRoleActionModel = (sequelize) => {
  class RoleAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  RoleAction.init(
    {
      roleActionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'user_roles',
          },
          key: 'userRoleId',
        },
      },
      moduleActionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'module_actions',
          },
          key: 'moduleActionId',
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'role_actions',
    }
  );

  return RoleAction;
};

export default initRoleActionModel(connection, DataTypes);
