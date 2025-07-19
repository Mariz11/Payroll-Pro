import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initTasksProcessesModel = (sequelize) => {
  class TasksProcesses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  TasksProcesses.init(
    {
      taskId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: false,
        type: DataTypes.BIGINT,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
      },
      userId: {
        allowNull: false,
        type: DataTypes.BIGINT,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      taskCode: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      taskName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departmentName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      businessMonth: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      cycle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'tasks_processes',
    }
  );

  return TasksProcesses;
};

export default initTasksProcessesModel(connection, DataTypes);
