import { DataTypes, Model } from 'sequelize';
import connection from '../connection';

const initPayrollModel = (sequelize) => {
  class Payroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  Payroll.init(
    {
      payroll_id: {
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
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'employeeId',
        },
      },
      departmentId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: {
            tableName: 'employees',
          },
          key: 'departmentId',
        },
      },
      businessMonth: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shortDescription: {
        type: DataTypes.STRING(40),
        allowNull: true,
        defaultValue: '',
      },
      cycle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      batchUploadId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: {
            tableName: 'batch_uploads',
          },
          key: 'batchUploadId',
        },
      },
      transferTransactionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: {
            tableName: 'transactions',
          },
          key: 'transferId',
        },
      },
      grossPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      totalDeduction: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      netPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      monthlyBasicPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      dailyRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      hourlyRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      overtimeRateRegDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      overtimeRateHolidays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      overtimeRateRestDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      workingDays: {
        type: DataTypes.DECIMAL(8, 1),
        allowNull: false,
      },
      daysWorked: {
        type: DataTypes.DECIMAL(8, 1),
        allowNull: false,
      },
      daysAbsent: {
        type: DataTypes.DECIMAL(8, 1),
        allowNull: false,
      },
      daysOff: {
        type: DataTypes.STRING,
        get() {
          const val = this.getDataValue('daysOff');
          return val ? val.split(',') : [];
        },
        set(value) {
          this.setDataValue('daysOff', value);
        },
      },
      regularHolidays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      regularHolidaysAbsent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      regularHolidaysPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      specialHolidays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      specialHolidaysAbsent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      specialHolidaysPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      sickLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      sickLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      vacationLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      vacationLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },

      soloParentLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      soloParentLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      paternityLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      paternityLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      maternityLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      maternityLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      serviceIncentiveLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      serviceIncentiveLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      otherLeaveDays: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      otherLeavePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },

      overtimeHrs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      overtimePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      undertimeHrs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      undertimePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      lateHrs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      latePay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      nightDiffHrs: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      nightDiffPay: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      allowance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      sssContribution: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      pagIbigContribution: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      philhealthContribution: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      sssERShare: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      sssECShare: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      philHealthERShare: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      pagIbigERShare: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      withholdingTax: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      addAdjustment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      deductAdjustment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      chargePerEmployee: {
        type: DataTypes.DECIMAL(15, 2),
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
      isPosted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      datePosted: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      disbursementStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      disbursementCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      isDirect: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      disbursementSchedule: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      failedRemarks: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        defaultValue: null,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      statusCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      // Virtual Columns
      businessMonthCycle: {
        type: DataTypes.VIRTUAL,
        get() {
          const cycle = this.cycle;
          const businessMonth = this.businessMonth;
          return `${businessMonth} - ${
            cycle && cycle.toLowerCase().includes('cycle')
              ? cycle
              : cycle + ' Cycle'
          }`;
        },
        set(_value) {
          throw new Error('Do not try to set the `businessMonthCycle` value!');
        },
      },
      fullCycleName: {
        type: DataTypes.VIRTUAL,
        get() {
          const cycle = this.cycle;
          return cycle && cycle.toLowerCase().includes('cycle')
            ? cycle
            : cycle + ' Cycle';
        },
        set(_value) {
          throw new Error('Do not try to set the `fullCycleName` value!');
        },
      },
      adjustments: {
        type: DataTypes.VIRTUAL,
        get() {
          const addAdjustment = this.addAdjustment;
          const deductAdjustment = this.deductAdjustment;
          return addAdjustment - deductAdjustment;
        },
        set(_value) {
          throw new Error('Do not try to set the `businessMonthCycle` value!');
        },
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
      restDayRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 130,
      },
      isMonthlyRated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      employmentStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'payrolls',
      paranoid: true,
    }
  );

  return Payroll;
};

export default initPayrollModel(connection, DataTypes);
