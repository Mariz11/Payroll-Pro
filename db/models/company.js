import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { capitalizeWord, properCasing, removeExtraSpaces } from '@utils/helper';

const initCompanyModel = (sequelize) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Company.init(
    {
      companyId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          console.log('nem!');
          console.log(this.getDataValue('companyName'));
          return this.getDataValue('companyName');
        },
        set(value) {
          this.setDataValue('companyName', removeExtraSpaces(value));
        },
      },
      accountId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subAccountId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tierLabel: {
        type: DataTypes.STRING,
        allowNull: false,
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
      companyAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('companyAddress');
        },
        set(value) {
          this.setDataValue('companyAddress', value && properCasing(value));
        },
      },
      contactPerson: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('contactPerson');
        },
        set(value) {
          this.setDataValue('contactPerson', value && properCasing(value));
        },
      },
      contactNumber: {
        type: DataTypes.STRING(11),
        allowNull: false,
      },
      urlLogo: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      billDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      chargePerEmployee: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      maxEmployee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      bankAccountNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('bankAccountNumber');
        },
        set(value) {
          this.setDataValue(
            'bankAccountNumber',
            value && removeExtraSpaces(value)
          );
        },
      },
      philHealthAcctNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('philHealthAcctNo');
        },
        set(value) {
          this.setDataValue(
            'philHealthAcctNo',
            value && removeExtraSpaces(value)
          );
        },
      },
      pagIbigAcctNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        get() {
          return this.getDataValue('pagIbigAcctNo');
        },
        set(value) {
          this.setDataValue('pagIbigAcctNo', value && removeExtraSpaces(value));
        },
      },
      sssAcctNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('sssAcctNo');
        },
        set(value) {
          this.setDataValue('sssAcctNo', value && removeExtraSpaces(value));
        },
      },
      tcAccepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,

        defaultValue: false,
      },
      applyWithHoldingTax: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // added by Dwine 1/3/24 for working days of the year
      workingDays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 242,
      },
      allowanceForLeaves: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      leavesOnHolidays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      allowanceOnHolidays: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      nightDifferential: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      nightDifferentialRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      nightDifferentialStartHour: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: '22:00',
      },
      nightDifferentialEndHour: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: '06:00',
      },
      regularHoliday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      regularHolidayRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 200,
      },
      regularHolidayRestDayRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 260,
      },
      specialHoliday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      specialHolidayRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 130,
      },
      specialHolidayRestDayRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 150,
      },
      restDay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      restDayRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 130,
      },
      defaultColor: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      applyCharge: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isHolidayDayoffPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isProcessing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      halfdayAllowancePay: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'FULL',
      },
      useFixedGovtContributionsRate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      enableSearchEmployee: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'companies',
      paranoid: true,
    }
  );

  return Company;
};

export default initCompanyModel(connection, DataTypes);
