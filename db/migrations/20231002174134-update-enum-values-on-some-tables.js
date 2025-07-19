'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn('employee_profiles', 'gender', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['Male', 'Female'],
        },
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn('employees', 'employmentStatus', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['Regular', 'Probationary', 'Casual', 'Project', 'Seasonal'],
        },
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn('holidays', 'holidayType', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['Regular', 'Special'],
        },
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn('company_pay_cycles', 'preferredMonth', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['Previous', 'Current'],
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
        queryInterface.changeColumn('employee_profiles', 'gender', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['MALE', 'FEMALE'],
        },
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn('employees', 'employmentStatus', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['REGULAR', 'PROBATIONARY', 'CASUAL', 'PROJECT', 'SEASONAL'],
        },
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn('holidays', 'holidayType', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['REGULAR', 'SPECIAL'],
        },
          {
            transaction: t
          }
        ),
        queryInterface.changeColumn('company_pay_cycles', 'preferredMonth', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ['PREVIOUS', 'CURRENT'],
        },
          {
            transaction: t
          }
        ),
      ])
    })
  }
};
