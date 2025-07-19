'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('employees', 'tierLabel', {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          after: 'companyId'
        },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn('employee_profiles', 'zipCode', {
          type: Sequelize.INTEGER(11),
          allowNull: true,
          defaultValue: null,
          after: 'countryId'
        },
          {
            transaction: t
          }
        ),
      ])
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('employees', 'tierLabel', {},
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn('employee_profiles', 'zipCode', {},
          {
            transaction: t
          }
        ),
      ])
    })
  }
};
