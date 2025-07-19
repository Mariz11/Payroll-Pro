import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initDepartmentAnnouncementModel = (sequelize) => {
  class DepartmentAnnouncement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  DepartmentAnnouncement.init(
    {
      departmentAnnouncementId: {
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
      announcementId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'announcement',
          },
          key: 'announcementId',
        },
      },
      departmentId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'departments',
          },
          key: 'departmentId',
        },
      },
    },
    {
      sequelize,
      modelName: 'department_announcements',
      paranoid: false,
      timestamps: false,
    }
  );

  return DepartmentAnnouncement;
};

export default initDepartmentAnnouncementModel(connection, DataTypes);
