import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initAttendanceApplicationModel = (sequelize) => {
  class AttendanceApplication extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  AttendanceApplication.init(
    {
      attendanceAppId: {
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
      employeeId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
      },
      approverId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fromDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      toDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      dateOvertime: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      timeFrom: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      timeTo: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      numberOfDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      numberOfHours: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      undertimeHrs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      lateHrs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      contactNumber: {
        type: DataTypes.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      requestedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isApproved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false,
      },
      approvedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
      },
      approvedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      isHalfDayLeave: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'attendance_applications',
      paranoid: true,
    }
  );

  return AttendanceApplication;
};

export default initAttendanceApplicationModel(connection, DataTypes);
