import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initBatchUploadAgentModel = (sequelize) => {
  class BatchUploadAgent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  BatchUploadAgent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      batchUploadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'batch_uploads',
          },
          key: 'batchUploadId',
        },
      },
      payroll_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'payrolls',
          },
          key: 'payroll_id',
        },
      },
      agentRefNum: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      remarks: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'batch_upload_agents',
      paranoid: true,
    }
  );

  return BatchUploadAgent;
};

export default initBatchUploadAgentModel(connection, DataTypes);
