'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // run this seeder only once
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const defaultAdmins = await queryInterface.sequelize.query(
        "SELECT u.* FROM `users` u INNER JOIN companies c ON c.companyId = u.companyId WHERE c.emailAddress = u.emailAddress AND u.deletedAt IS NULL AND (role = 'SUPER_ADMIN' OR role = 'ADMIN')",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      if (defaultAdmins.length > 0) {
        for (let i = 0; i < defaultAdmins.length; i++) {
          const defaultAdmin = defaultAdmins[i];
          await queryInterface.sequelize.query(
            `UPDATE users SET isDefault = 1 WHERE userId = :userId`,
            {
              replacements: {
                userId: defaultAdmin.userId,
              },
              type: Sequelize.QueryTypes.UPDATE,
              transaction: t,
            }
          );
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const defaultAdmins = await queryInterface.sequelize.query(
        "SELECT u.* FROM `users` u INNER JOIN companies c ON c.companyId = u.companyId WHERE c.emailAddress = u.emailAddress AND u.deletedAt IS NULL AND (role = 'SUPER_ADMIN' OR role = 'ADMIN')",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );
      if (defaultAdmins.length > 0) {
        for (let i = 0; i < defaultAdmins.length; i++) {
          const defaultAdmin = defaultAdmin[i];
          await queryInterface.sequelize.query(
            `UPDATE users SET isDefault = 0 WHERE userId = :userId`,
            {
              replacements: {
                userId: defaultAdmin.userId,
              },
              type: Sequelize.QueryTypes.UPDATE,
              transaction: t,
            }
          );
        }
      }
    });
  },
};
