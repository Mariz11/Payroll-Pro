'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.bulkInsert('modules', [
        {
          moduleId: 1,
          moduleName: 'Dashboard',
        },
        {
          moduleId: 2,
          moduleName: 'Attendances',
        },
        {
          moduleId: 3,
          moduleName: 'Attendance Applications',
        },
        {
          moduleId: 4,
          moduleName: 'Payrolls',
        },
        {
          moduleId: 5,
          moduleName: 'Deductions',
        },
        {
          moduleId: 6,
          moduleName: 'Configurations',
        },
        {
          moduleId: 7,
          moduleName: 'Announcements',
        },
        {
          moduleId: 8,
          moduleName: 'Employees',
        },
        {
          moduleId: 9,
          moduleName: 'Shifts',
        },
        {
          moduleId: 10,
          moduleName: 'Departments',
        },
        {
          moduleId: 11,
          moduleName: 'Holidays',
        },
        {
          moduleId: 12,
          moduleName: 'Reports',
        },
        {
          moduleId: 13,
          moduleName: 'Cash In',
        },
        {
          moduleId: 14,
          moduleName: 'Users',
        },
        {
          moduleId: 15,
          moduleName: 'Account',
        },
        {
          moduleId:16, 
          moduleName:'Employee Dashboard'
        },
        {
          moduleId:17, 
          moduleName:'Employee Attendances'
        },
        {
          moduleId:18,
          moduleName:'Employee Attendance Applications'
        },
        {
          moduleId:19, 
          moduleName:'Employee Payrolls'
        },
      ]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.bulkDelete('modules', null, {}),
    ]);
  }
};

