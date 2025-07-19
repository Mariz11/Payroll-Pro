import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initEmployeeLeaveModel = (sequelize) => {
  class EmployeeLeave extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  EmployeeLeave.init(
    {
      employeeLeavesId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      vacationLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('vacationLeaveCredits');
        },
        set(value) {
          this.setDataValue('vacationLeaveCredits', !value ? 0 : value);
        },
      },
      vacationLeaveUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      sickLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('sickLeaveCredits');
        },
        set(value) {
          this.setDataValue('sickLeaveCredits', !value ? 0 : value);
        },
      },
      sickLeaveUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      soloParentLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('soloParentLeaveCredits');
        },
        set(value) {
          this.setDataValue('soloParentLeaveCredits', !value ? 0 : value);
        },
      },
      soloParentLeavesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      paternityLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('paternityLeaveCredits');
        },
        set(value) {
          this.setDataValue('paternityLeaveCredits', !value ? 0 : value);
        },
      },
      paternityLeavesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      maternityLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('maternityLeaveCredits');
        },
        set(value) {
          this.setDataValue('maternityLeaveCredits', !value ? 0 : value);
        },
      },
      maternityLeavesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      serviceIncentiveLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('serviceIncentiveLeaveCredits');
        },
        set(value) {
          this.setDataValue('serviceIncentiveLeaveCredits', !value ? 0 : value);
        },
      },
      serviceIncentiveLeaveUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      otherLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('otherLeaveCredits');
        },
        set(value) {
          this.setDataValue('otherLeaveCredits', !value ? 0 : value);
        },
      },
      otherLeavesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      emergencyLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('emergencyLeaveCredits');
        },
        set(value) {
          this.setDataValue('emergencyLeaveCredits', !value ? 0 : value);
        },
      },
      emergencyLeavesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      birthdayLeaveCredits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('birthdayLeaveCredits');
        },
        set(value) {
          this.setDataValue('birthdayLeaveCredits', !value ? 0 : value);
        },
      },
      birthdayLeavesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'employee_leaves',
    }
  );

  return EmployeeLeave;
};

export default initEmployeeLeaveModel(connection, DataTypes);
