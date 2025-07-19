import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initViewDetailsModel = (sequelize) => {
  class ViewDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  ViewDetail.init(
    {
      viewDetailsId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      companyId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'companies',
          },
          key: 'companyId',
        },
        defaultValue: true,
      },
      announcementId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'announcements',
          },
          key: 'announcementId',
        },
      },
      userId: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },
      isViewed: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'view_details',
      timestamps: false,
    }
  );

  return ViewDetail;
};

export default initViewDetailsModel(connection, DataTypes);
