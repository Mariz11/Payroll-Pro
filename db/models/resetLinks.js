import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initResetLinksModel = (sequelize) => {
  class ResetLinks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  ResetLinks.init(
    {
      resetLinkId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'resetLinks',
      paranoid: true,
      timestamps: false,
    }
  );

  return ResetLinks;
};

export default initResetLinksModel(connection, DataTypes);
