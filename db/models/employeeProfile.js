import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { capitalizeWord, properCasing, removeExtraSpaces } from '@utils/helper';
import moment from '@constant/momentTZ';
const romanNumeralRe =
  /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;
const initEmployeeProfileModel = (sequelize) => {
  class EmployeeProfile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  EmployeeProfile.init(
    {
      employeeProfileId: {
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
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        get() {
          return this.getDataValue('firstName');
        },
        set(value) {
          this.setDataValue('firstName', properCasing(value));
        },
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
        set(value) {
          this.setDataValue(
            'middleName',
            (value && properCasing(value)) || null
          );
        },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        get() {
          return this.getDataValue('lastName');
        },
        set(value) {
          this.setDataValue('lastName', properCasing(value));
        },
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
        set(value) {
          this.setDataValue('suffix', value || null);
        },
      },
      profilePicture: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      contactNumber: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      emergencyContactNumber1: {
        type: DataTypes.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      emergencyContactNumber2: {
        type: DataTypes.STRING(11),
        allowNull: true,
        defaultValue: null,
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
          return this.getDataValue('birthDate');
        },
        set(value) {
          this.setDataValue('birthDate', moment(value).format('YYYY-MM-DD'));
        },
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
      streetAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('streetAddress');
        },
        set(value) {
          this.setDataValue('streetAddress', properCasing(value));
        },
      },
      cityId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'cities',
          key: 'cityId',
        },
      },
      provinceId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'provinces',
          key: 'provinceId',
        },
      },
      countryId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'countries',
          key: 'countryId',
        },
      },
      zipCode: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: null,
        get() {
          return this.getDataValue('zipCode');
        },
        set(value) {
          this.setDataValue('zipCode', !value ? null : value);
        },
      },
      educationalAttainment: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('educationalAttainment');
        },
        set(value) {
          this.setDataValue('educationalAttainment', properCasing(value));
        },
      },
      schoolGraduated: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('schoolGraduated');
        },
        set(value) {
          this.setDataValue('schoolGraduated', capitalizeWord(value));
        },
      },
      degree: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('degree');
        },
        set(value) {
          this.setDataValue('degree', capitalizeWord(value));
        },
      },
      gender: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Male', 'Female'],
      },
      placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('placeOfBirth');
        },
        set(value) {
          this.setDataValue('placeOfBirth', properCasing(value));
        },
      },
      nationality: {
        type: DataTypes.STRING(100),
        allowNull: false,
        get() {
          return this.getDataValue('nationality');
        },
        set(value) {
          this.setDataValue('nationality', properCasing(value));
        },
      },
      civilStatus: {
        type: DataTypes.STRING(50),
        allowNull: false,
        get() {
          return this.getDataValue('civilStatus');
        },
        set(value) {
          this.setDataValue('civilStatus', properCasing(value));
        },
      },
      // Virtual Columns
      employeeFullName: {
        type: DataTypes.VIRTUAL,
        get() {
          // const suffix =
          //   this.suffix && this.suffix.toUpperCase() == 'N/A'
          //     ? ''
          //     : this.suffix;
          // const middleName =
          //   this.middleName && this.middleName.toUpperCase() == 'N/A'
          //     ? ''
          //     : this.middleName;
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
              : ', ' + removeExtraSpaces(this.suffix) + '.'
          }`;
        },
        set(_value) {
          throw new Error('Do not try to set the `fullName` value!');
        },
      },
    },
    {
      sequelize,
      modelName: 'employee_profiles',
    }
  );

  return EmployeeProfile;
};

export default initEmployeeProfileModel(connection, DataTypes);
