'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("payrolls", {
      payroll_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { 
            tableName:"companies"
          },
          key: "companyId",
        },
      },
      employeeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { 
            tableName:"employees"
          },
          key: "employeeId",
        },
      },
      businessMonth: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cycle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      batchUploadId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: { 
            tableName:"batch_uploads"
          },
          key: "batchUploadId",
        },
      },
      transferTransactionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: { 
            tableName:"transfer_to_subacct_transactions"
          },
          key: "transferId",
        },
      },
      grossPay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      totalDeduction: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      netPay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      dailyRate: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      hourlyRate: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      workingDays: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      daysWorked: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      daysAbsent: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      regularHolidays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      regularHolidaysAbsent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      regularHolidaysPay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      specialHolidays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      specialHolidaysAbsent: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      specialHolidaysPay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      sickLeaveDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sickLeavePay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      vacationLeaveDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      vacationLeavePay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      overtimeHrs: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      overtimePay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      undertimeHrs: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      undertimePay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      lateHrs: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      nightDiffHrs: {
        type: Sequelize.FLOAT(8,1),
        allowNull: false,
      },
      nightDiffPay: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      allowance: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      sssContribution: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      pagIbigContribution: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      philhealthContribution: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      sssERShare: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      sssECShare: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      philHealthERShare: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      pagIbigERShare: {
        type: Sequelize.FLOAT(8,3),
        allowNull: false,
      },
      addAdjustment: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      deductAdjustment: {
        type: Sequelize.FLOAT(8,2),
        allowNull: false,
      },
      isPosted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("payrolls");
  }
};
