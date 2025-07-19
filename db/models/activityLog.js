import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initActivityLogModel = (sequelize) => {
  class ActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  ActivityLog.init(
    {
      activityLogId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'activity_logs',
    }
  );

  return ActivityLog;
};

export default initActivityLogModel(connection, DataTypes);
