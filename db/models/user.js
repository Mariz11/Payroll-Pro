import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { properCasing, removeExtraSpaces } from '@utils/helper';
const romanNumeralRe =
  /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const initUserModel = (sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  User.init(
    {
      userId: {
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
      employeeId: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      middleName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          let middleName =
            this.getDataValue('middleName') &&
            this.getDataValue('middleName').toUpperCase() == 'N/A'
              ? ''
              : this.getDataValue('middleName');
          return middleName;
        },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      suffix: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
        get() {
          let suffix =
            this.getDataValue('suffix') &&
            this.getDataValue('suffix').toUpperCase() == 'N/A'
              ? ''
              : this.getDataValue('suffix');
          if (romanNumeralRe.test(suffix)) {
            return suffix;
          } else {
            return properCasing(suffix);
          }
        },
      },
      contactNumber: {
        type: DataTypes.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('emailAddress');
        },
        set(value) {
          this.setDataValue(
            'emailAddress',
            removeExtraSpaces(value.toLowerCase())
          );
        },
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('username');
        },
        set(value) {
          this.setDataValue('username', removeExtraSpaces(value.toLowerCase()));
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:
          '$2b$10$RkdoyponzIk5GauSB6pvw.uqUs1bMKNB268RmlkraL3kfksLeGLOa',
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'EMPLOYEE',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      roleId: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'user_roles',
          },
          key: 'userRoleId',
        },
      },
      // Virtual Columns
      userFullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${removeExtraSpaces(this.lastName)}, ${removeExtraSpaces(
            this.firstName
          )}${
            removeExtraSpaces(this.middleName)
              ? ' ' + removeExtraSpaces(this.middleName)
              : ''
          }${
            !removeExtraSpaces(this.suffix) ||
            removeExtraSpaces(this.suffix) == ''
              ? ''
              : romanNumeralRe.test(removeExtraSpaces(this.suffix))
              ? ', ' + removeExtraSpaces(this.suffix)
              : ', ' + removeExtraSpaces(properCasing(this.suffix)) + '.'
          }`;
        },
        set(value) {
          throw new Error('Do not try to set the `fullName` value!');
        },
      },
    },
    {
      sequelize,
      modelName: 'users',
      paranoid: true,
    }
  );

  return User;
};

export default initUserModel(connection, DataTypes);
