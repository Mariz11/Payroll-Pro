import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { properCasing, removeExtraSpaces } from '@utils/helper';
import moment from '@constant/momentTZ';

const initEmployeeModel = (sequelize) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Employee.init(
    {
      employeeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employeeCode: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('employeeCode');
        },
        set(value) {
          this.setDataValue(
            'employeeCode',
            removeExtraSpaces(value.toUpperCase())
          );
        },
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
      mlWalletStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tierLabel: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      ckycId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      mlWalletId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      departmentId: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: 'departments',
          key: 'departmentId',
        },
      },
      shiftId: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: 'shifts',
          key: 'shiftId',
        },
      },
      hiringDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
          return this.getDataValue('hiringDate');
        },
        set(value) {
          this.setDataValue('hiringDate', moment(value).format('YYYY-MM-DD'));
        },
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        get() {
          return this.getDataValue('startDate');
        },
        set(value) {
          this.setDataValue('startDate', moment(value).format('YYYY-MM-DD'));
        },
      },
      employmentStatus: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['Regular', 'Probationary', 'Casual', 'Project', 'Seasonal'],
      },
      dayOff: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          return this.getDataValue('dayOff');
        },
        set(value) {
          this.setDataValue('dayOff', value.toString());
        },
      },
      basicPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        get() {
          return this.getDataValue('basicPay');
        },
        set(value) {
          let basicPay = value;
          if (typeof basicPay == 'string') {
            basicPay = parseFloat(basicPay.replace(/,/g, ''));
          }
          this.setDataValue('basicPay', basicPay);
        },
      },
      dailyRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('dailyRate');
        },
        set(value) {
          let dailyRate = value;
          if (typeof dailyRate == 'string') {
            dailyRate = parseFloat(dailyRate.replace(/,/g, ''));
          }
          this.setDataValue('dailyRate', dailyRate);
        },
      },
      monthlyAllowance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('monthlyAllowance');
        },
        set(value) {
          let monthlyAllowance = value;
          if (typeof monthlyAllowance == 'string') {
            monthlyAllowance = parseFloat(monthlyAllowance.replace(/,/g, ''));
          }
          this.setDataValue('monthlyAllowance', monthlyAllowance);
        },
      },
      allowance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        get() {
          return this.getDataValue('allowance');
        },
        set(value) {
          let allowance = value;
          if (typeof allowance == 'string') {
            allowance = parseFloat(allowance.replace(/,/g, ''));
          }
          this.setDataValue('allowance', allowance);
        },
      },
      tinNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('tinNumber');
        },
        set(value) {
          this.setDataValue(
            'tinNumber',
            (value && removeExtraSpaces(value)) || null
          );
        },
      },
      overtimeRateRegDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      overtimeRateHolidays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      overtimeRateRestDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      positionTitle: {
        type: DataTypes.STRING(100),
        allowNull: false,
        get() {
          return this.getDataValue('positionTitle');
        },
        set(value) {
          this.setDataValue(
            'positionTitle',
            value.length > 5 ? properCasing(value) : value.toUpperCase()
          );
        },
      },
      dateOfSeparation: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('dateOfSeparation');
        },
        set(value) {
          this.setDataValue(
            'dateOfSeparation',
            value ? moment(value).format('YYYY-MM-DD') : null
          );
        },
      },
      modeOfSeparation: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('modeOfSeparation');
        },
        set(value) {
          this.setDataValue(
            'modeOfSeparation',
            removeExtraSpaces(value) || null
          );
        },
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
      applyWithholdingTax: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isMonthlyRated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      mismatchedInfos: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('mismatchedInfos');
        },
        set(value) {
          if (value) {
            value = value.map((i) => {
              if (i == 'birthDate') {
                return 'Birthdate';
              } else if (i == 'firstName') {
                return 'First Name';
              } else if (i == 'lastName') {
                return 'Last Name';
              } else if (i == 'contactNumber') {
                return 'Contact Number';
              }
            });
            this.setDataValue('mismatchedInfos', value.toString());
          } else {
            this.setDataValue('mismatchedInfos', null);
          }
        },
      },
      failedRegistrationRemarks: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        defaultValue: null,
        // get() {
        //   const val = this.getDataValue('failedRegistrationRemarks');
        //   return val ? JSON.parse(val) : null;
        // },
        // set(value) {
        //   this.setDataValue('failedRegistrationRemarks', value);
        // },
      },
      referenceFiles: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      employeeStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Virtual Columns
      daysOff: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.dayOff === '') {
            return [];
          } else {
            return this.dayOff && this.dayOff.split(',');
          }
        },
        set(value) {
          throw new Error('Do not try to set the `daysOff` value!');
        },
      },
      allowanceBreakdown: {
        allowNull: true,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
      },
      allowanceBreakdownId: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'allowance_breakdowns',
          },
          key: 'allowanceBreakdownId',
        },
      },
    },
    {
      sequelize,
      modelName: 'employees',
      paranoid: true,
    }
  );

  return Employee;
};

export default initEmployeeModel(connection, DataTypes);
