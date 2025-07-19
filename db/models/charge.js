import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initChargeModel = (sequelize) => {
  class Charge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Charge.init(
    {
      chargeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      configurationId: {
        type: DataTypes.BIGINT,
        references: {
          model: 'configurations',
          key: 'configurationId',
        },
        allowNull: false,
      },
      tierNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tierStart: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      tierEnd: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      chargeLessThreshold: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      chargeMoreThreshold: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: 'charges',
      paranoid: false,
      timestamps: false,
    }
  );

  return Charge;
};

export default initChargeModel(connection, DataTypes);
