import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initVerificationCodeModel = (sequelize) => {
  class VerificationCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  VerificationCode.init(
    {
      id: {
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
      generatedCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isExpired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'verification_codes',
    }
  );

  return VerificationCode;
};

export default initVerificationCodeModel(connection, DataTypes);
