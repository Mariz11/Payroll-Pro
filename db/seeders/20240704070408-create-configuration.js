'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('configurations', [
      {
        configurationId: 1,
        emailContacts: '',
        phoneContacts: '',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([queryInterface.bulkDelete('configurations', null, {})]);
  },
};
