import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initAnnouncementModel = (sequelize) => {
  class Announcement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Announcement.init(
    {
      announcementId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'userId',
        },
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(15),
        allowNull: false,
        defaultValue: 'ADMIN',
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPosted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      usersSeen: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        defaultValue: null,
        // get() {
        //   // Get raw text value from the DB
        //   const rawValue = this.getDataValue('usersSeen');

        //   // Return an array, split by ',' (handle empty string case)
        //   return rawValue ? rawValue : '';
        // },
        // set(value) {
        //   this.setDataValue(
        //     'usersSeen',
        //     value ? value : null
        //   );
        // },
      },
    },
    {
      sequelize,
      modelName: 'announcements',
      paranoid: true,
      timestamps: true,
    }
  );

  return Announcement;
};

export default initAnnouncementModel(connection, DataTypes);
