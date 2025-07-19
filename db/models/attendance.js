import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initAttendanceModel = (sequelize) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Attendance.init(
    {
      attendanceId: {
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
      departmentId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'departments',
          },
          key: 'departmentId',
        },
      },
      businessMonth: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      cycle: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      timeIn: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      timeOut: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      breakTimeIn: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      breakTimeOut: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      lunchTimeIn: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      lunchTimeOut: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      holidayId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'holidays',
          },
          key: 'holidayId',
        },
      },
      overtimeHours: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      creditableOvertime: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      undertimeHours: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      lateHours: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      nightDiffHours: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      isPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDayOff: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isLeave: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isHalfDay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isPosted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      datePosted: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      manualLoginAction: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      // Virtual Columns
      businessMonthCycle: {
        type: DataTypes.VIRTUAL,
        get() {
          const cycle = this.cycle;
          const businessMonth = this.businessMonth;
          return `${businessMonth} - ${
            cycle && cycle.toLowerCase().includes('cycle')
              ? cycle
              : cycle + ' Cycle'
          }`;
        },
        set(_value) {
          throw new Error('Do not try to set the `businessMonthCycle` value!');
        },
      },
      fullCycleName: {
        type: DataTypes.VIRTUAL,
        get() {
          const cycle = this.cycle;
          return cycle && cycle.toLowerCase().includes('cycle')
            ? cycle
            : cycle + ' Cycle';
        },
        set(value) {
          throw new Error('Do not try to set the `fullCycleName` value!');
        },
      },
    },
    {
      sequelize,
      modelName: 'attendances',
      paranoid: true,
    }
  );

  return Attendance;
};

export default initAttendanceModel(connection, DataTypes);
