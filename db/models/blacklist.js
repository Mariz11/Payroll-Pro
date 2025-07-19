import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initBlacklistModel = (sequelize) => {
  class Blacklist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Blacklist.init(
    {
      blacklistId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      token: {
        type: DataTypes.STRING(10000),
        allowNull: false,
        defaultValue: null,
      },
      expiration: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'blacklists',
      timestamps: false,
    }
  );
  Blacklist.removeAttribute('id');
  return Blacklist;
};

export default initBlacklistModel(connection, DataTypes);
