'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // run this seeder only once
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const attendanceModule = await queryInterface.sequelize.query(
        'SELECT * FROM modules WHERE moduleName = :moduleName LIMIT 1',
        {
          replacements: { moduleName: 'Attendances' },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      const payrollModule = await queryInterface.sequelize.query(
        'SELECT * FROM modules WHERE moduleName = :moduleName LIMIT 1',
        {
          replacements: { moduleName: 'Payrolls' },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      const attendanceModuleId = attendanceModule[0].moduleId;
      const payrollModuleId = payrollModule[0].moduleId;

      // create actions for attendances
      await queryInterface.bulkInsert('module_actions', [
        {
          moduleId: attendanceModuleId,
          action: 'POST ATTENDANCE',
        },
        {
          moduleId: attendanceModuleId,
          action: 'DOWNLOAD AND IMPORT ATTENDANCE',
        },
        {
          moduleId: attendanceModuleId,
          action: 'DELETE ATTENDANCE',
        },
      ]);
      // create actions for payrolls
      await queryInterface.bulkInsert('module_actions', [
        {
          moduleId: payrollModuleId,
          action: 'POST PAYROLL',
        },
        {
          moduleId: payrollModuleId,
          action: 'DOWNLOAD AND IMPORT DIRECT PAYROLL',
        },
        {
          moduleId: payrollModuleId,
          action: 'GENERATE REPORT',
        },
        {
          moduleId: payrollModuleId,
          action: 'EDIT PAYROLL',
        },
        {
          moduleId: payrollModuleId,
          action: 'DELETE PAYROLL',
        },
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const attendanceModule = await queryInterface.sequelize.query(
        'SELECT * FROM modules WHERE moduleName = :moduleName LIMIT 1',
        {
          replacements: { moduleName: 'Attendances' },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      const payrollModule = await queryInterface.sequelize.query(
        'SELECT * FROM modules WHERE moduleName = :moduleName LIMIT 1',
        {
          replacements: { moduleName: 'Payrolls' },
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      const attendanceModuleId = attendanceModule[0].moduleId;
      const payrollModuleId = payrollModule[0].moduleId;

      await queryInterface.bulkDelete('module_actions', {
        moduleId: attendanceModuleId,
      });

      await queryInterface.bulkDelete('module_actions', {
        moduleId: payrollModuleId,
      });
    });
  },
};
