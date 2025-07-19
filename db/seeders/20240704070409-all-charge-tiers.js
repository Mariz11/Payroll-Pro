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
    const configuration = await queryInterface.sequelize.query(
      'SELECT * FROM configurations'
    );

    const configurationId = configuration[0][0].configurationId;

    await queryInterface.bulkInsert('charges', [
      {
        chargeId: 1,
        configurationId: configurationId,
        tierNumber: 1,
        tierStart: 0.01,
        tierEnd: 25000.0,
        chargeLessThreshold: 25.0,
        chargeMoreThreshold: 20.0,
      },
      {
        chargeId: 2,
        configurationId: configurationId,
        tierNumber: 2,
        tierStart: 25000.01,
        tierEnd: 50000.0,
        chargeLessThreshold: 50.0,
        chargeMoreThreshold: 40.0,
      },
      {
        chargeId: 3,
        configurationId: configurationId,
        tierNumber: 3,
        tierStart: 50000.01,
        tierEnd: 75000.0,
        chargeLessThreshold: 75.0,
        chargeMoreThreshold: 60.0,
      },
      {
        chargeId: 4,
        configurationId: configurationId,
        tierNumber: 4,
        tierStart: 75000.01,
        tierEnd: 100000.0,
        chargeLessThreshold: 100.0,
        chargeMoreThreshold: 80.0,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.sequelize.query(
      'DELETE FROM charges WHERE configurationId = ' + configurationId
    );
  },
};
