import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initShiftModel = (sequelize) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Shift.init(
    {
      shiftId: {
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
      shiftName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timeIn: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      timeOut: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      lunchStart: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      lunchEnd: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      snackStart: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: null,
      },
      snackEnd: {
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
      modelName: 'shifts',
      paranoid: true,
    }
  );

  return Shift;
};

export default initShiftModel(connection, DataTypes);
