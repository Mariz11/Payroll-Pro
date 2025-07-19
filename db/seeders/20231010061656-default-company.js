'use strict';
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.bulkInsert('companies', [
        {
          companyId: 1,
          companyName: 'SUPER ADMIN COMPANY',
          accountId: '0',
          subAccountId: '0',
          tierLabel: 'SUPER ADMIN COMPANY',
          emailAddress: 'hatchitwebflow@gmail.com',
        },
      ]),
      queryInterface.bulkInsert('users', [
        {
          userId: 1,
          companyId: 1,
          emailAddress: 'hatchitwebflow@gmail.com',
          username: 'hatchitwebflow@gmail.com',
          password: await bcrypt.hash('123456', 10),
          role: 'SUPER_ADMIN',
          isActive: 1,
        },
      ]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.bulkDelete('companies', null, {}),
      queryInterface.bulkDelete('users', null, {})
    ]);
  }
};
