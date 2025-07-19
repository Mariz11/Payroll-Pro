import { DataTypes, Model } from 'sequelize';
import { connection } from '../log-connection';

const initSystemLogModel = (sequelize) => {
  class SystemLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {}
  }

  SystemLog.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      origin: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      message: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        defaultValue: '',
      },
      status: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      payload: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
    },
    {
      sequelize,
      modelName: 'system_logs',
      paranoid: true,
      timestamps: false,
    }
  );

  return SystemLog;
};

export default initSystemLogModel(connection, DataTypes);