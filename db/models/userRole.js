import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initUserRoleModel = (sequelize) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  UserRole.init(
    {
      userRoleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
      },
      roleName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      moduleAccess: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'user_roles',
      paranoid: true,
    }
  );

  return UserRole;
};

export default initUserRoleModel(connection, DataTypes);
