import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initChangedScheduleModel = (sequelize) => {
  class ChangedSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  ChangedSchedule.init(
    {
      changeScheduleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      attendanceAppId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'attendance_applications',
          },
          key: 'attendanceAppId',
        },
      },
      typeOfChange: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      timeIn: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      lunchStart: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      lunchEnd: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      timeOut: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      workingHours: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'changed_schedules',
      paranoid: true,
    }
  );

  return ChangedSchedule;
};

export default initChangedScheduleModel(connection, DataTypes);
