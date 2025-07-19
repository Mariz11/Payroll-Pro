import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initBatchUploadModel = (sequelize) => {
  class Batch_upload extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Batch_upload.init(
    {
      batchUploadId: {
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
      businessMonth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cycle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      batchNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      modeOfPayroll: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('modeOfPayroll') == 'ML WALLET'
            ? 'MCASH'
            : this.getDataValue('modeOfPayroll');
        },
        set(value) {
          this.setDataValue(
            'modeOfPayroll',
            value.toUpperCase() == 'ML WALLET' ? 'MCASH' : value
          );
        },
      },
    },
    {
      sequelize,
      modelName: 'batch_uploads',
    }
  );

  return Batch_upload;
};

export default initBatchUploadModel(connection, DataTypes);
