import { DataTypes, Model } from 'sequelize';
import connection from '../connection';
import { removeExtraSpaces } from '@utils/helper';

const initEmployeeBenefitModel = (sequelize) => {
  class EmployeeBenefit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }

  EmployeeBenefit.init(
    {
      employeeBenefitsId: {
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
      sssId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('sssId');
        },
        set(value) {
          this.setDataValue(
            'sssId',
            (value && removeExtraSpaces(value)) || null
          );
        },
      },
      sssContributionRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('sssContributionRate');
        },
        set(value) {
          let sssContributionRate = value;
          if (typeof sssContributionRate == 'string') {
            sssContributionRate = parseFloat(
              sssContributionRate.replace(/,/g, '')
            );
          }
          this.setDataValue('sssContributionRate', sssContributionRate);
        },
      },
      sssERShareRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('sssERShareRate');
        },
        set(value) {
          let sssERShareRate = value;
          if (typeof sssERShareRate == 'string') {
            sssERShareRate = parseFloat(sssERShareRate.replace(/,/g, ''));
          }
          this.setDataValue('sssERShareRate', sssERShareRate);
        },
      },
      sssECShareRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('sssECShareRate');
        },
        set(value) {
          let sssECShareRate = value;
          if (typeof sssECShareRate == 'string') {
            sssECShareRate = parseFloat(sssECShareRate.replace(/,/g, ''));
          }
          this.setDataValue('sssECShareRate', sssECShareRate);
        },
      },
      philHealthId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('philHealthId');
        },
        set(value) {
          this.setDataValue(
            'philHealthId',
            (value && removeExtraSpaces(value)) || null
          );
        },
      },
      philHealthContributionRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('philHealthContributionRate');
        },
        set(value) {
          let philHealthContributionRate = value;
          if (typeof philHealthContributionRate == 'string') {
            philHealthContributionRate = parseFloat(
              philHealthContributionRate.replace(/,/g, '')
            );
          }
          this.setDataValue(
            'philHealthContributionRate',
            philHealthContributionRate
          );
        },
      },
      philHealthERShareRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('philHealthERShareRate');
        },
        set(value) {
          let philHealthERShareRate = value;
          if (typeof philHealthERShareRate == 'string') {
            philHealthERShareRate = parseFloat(
              philHealthERShareRate.replace(/,/g, '')
            );
          }
          this.setDataValue('philHealthERShareRate', philHealthERShareRate);
        },
      },
      pagIbigId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('pagIbigId');
        },
        set(value) {
          this.setDataValue(
            'pagIbigId',
            (value && removeExtraSpaces(value)) || null
          );
        },
      },
      pagIbigContributionRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('pagIbigContributionRate');
        },
        set(value) {
          let pagIbigContributionRate = value;
          if (typeof pagIbigContributionRate == 'string') {
            pagIbigContributionRate = parseFloat(
              pagIbigContributionRate.replace(/,/g, '')
            );
          }
          this.setDataValue('pagIbigContributionRate', pagIbigContributionRate);
        },
      },
      pagIbigERShareRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: null,
        get() {
          return this.getDataValue('pagIbigERShareRate');
        },
        set(value) {
          let pagIbigERShareRate = value;
          if (typeof pagIbigERShareRate == 'string') {
            pagIbigERShareRate = parseFloat(
              pagIbigERShareRate.replace(/,/g, '')
            );
          }
          this.setDataValue('pagIbigERShareRate', pagIbigERShareRate);
        },
      },
    },
    {
      sequelize,
      modelName: 'employee_benefits',
    }
  );

  return EmployeeBenefit;
};

export default initEmployeeBenefitModel(connection, DataTypes);
