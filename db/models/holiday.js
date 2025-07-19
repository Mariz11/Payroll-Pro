import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initHolidayModel = (sequelize) => {
  class Holiday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Holiday.init(
    {
      holidayId: {
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
      holidayDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      holidayType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Regular', 'Special'],
      },
      holidayName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'holidays',
      paranoid: true,
    }
  );

  return Holiday;
};

export default initHolidayModel(connection, DataTypes);
