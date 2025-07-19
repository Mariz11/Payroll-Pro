import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initDepartmentModel = (sequelize) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Department.init(
    {
      departmentId: {
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
      payrollTypeId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'payroll_types',
          },
          key: 'payrollTypeId',
        },
        defaultValue: null,
      },
      departmentName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      applyNightDiff: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'departments',
      paranoid: true,
    }
  );

  return Department;
};

export default initDepartmentModel(connection, DataTypes);
