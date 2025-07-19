import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initNotificationModel = (sequelize) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Notification.init(
    {
      notificationId: {
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
      serviceFor: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      serviceType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      //   createdAt: {
      //     type: DataTypes.DATE,
      //     allowNull: false,
      //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      //   },
      //   updatedAt: {
      //     type: DataTypes.DATE,
      //     allowNull: false,
      //     defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      //   },
    },
    {
      sequelize,
      modelName: 'notifications',
    }
  );

  return Notification;
};

export default initNotificationModel(connection, DataTypes);
