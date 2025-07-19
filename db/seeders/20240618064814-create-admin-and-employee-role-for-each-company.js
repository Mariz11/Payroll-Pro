'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const adminDefaultModules = JSON.stringify(
        await queryInterface.sequelize.query(`SELECT moduleId FROM modules WHERE moduleName NOT IN ('Employee Dashboard', 'Employee Attendances', 'Employee Attendance Applications', 'Employee Payrolls')`, {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        })
      );

      const employeeDefaultModules = JSON.stringify(
        await queryInterface.sequelize.query(
          `SELECT moduleId FROM modules WHERE moduleName IN ('Employee Dashboard', 'Employee Attendances', 'Employee Attendance Applications', 'Employee Payrolls', 'Account')`,
          { type: Sequelize.QueryTypes.SELECT, transaction: t }
        )
      );

      const companies = await queryInterface.sequelize.query(
        'SELECT companyId FROM companies',
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      for (const company of companies) {
        // Create Super Admin Role
        if (company.companyId === 1) {
          await queryInterface.sequelize.query(
            `INSERT INTO user_roles (companyId, roleName, moduleAccess) VALUES (:company,'SUPER ADMIN', :moduleAccess)`,
            {
              replacements: {
                company: company.companyId,
                moduleAccess: adminDefaultModules,
              },
              type: Sequelize.QueryTypes.INSERT,
              transaction: t,
            }
          );

          // Get Super Admin Role Id
          const superAdminRoleId = await queryInterface.sequelize.query(
            'SELECT userRoleId FROM user_roles WHERE companyId = :company',
            {
              replacements: { company: company.companyId },
              type: Sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );

          // Assign Super Admin Role Id to Existing User where role = 'SUPER_ADMIN'
          await queryInterface.sequelize.query(
            `UPDATE users SET roleId = :adminRoleId WHERE role = 'SUPER_ADMIN' AND companyId = :companyId`,
            {
              replacements: {
                adminRoleId: superAdminRoleId[0].userRoleId,
                companyId: company.companyId,
              },
              type: Sequelize.QueryTypes.UPDATE,
              transaction: t,
            }
          );
        } else {
          // Create Admin Role for existing Company
          await queryInterface.sequelize.query(
            `INSERT INTO user_roles (companyId, roleName, moduleAccess) VALUES (:companyId, 'ADMIN', :moduleAccess)`,
            {
              replacements: {
                companyId: company.companyId,
                moduleAccess: adminDefaultModules,
              },
              type: Sequelize.QueryTypes.INSERT,
              transaction: t,
            }
          );

          // Get Admin Role Id for existing Company
          const adminRoleId = await queryInterface.sequelize.query(
            `SELECT userRoleId FROM user_roles WHERE companyId = :company AND roleName = 'ADMIN'`,
            {
              replacements: { company: company.companyId },
              type: Sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );

          // Assign Admin Role Id to Existing Users where role = 'ADMIN'
          await queryInterface.sequelize.query(
            `UPDATE users SET roleId = :adminRoleId WHERE role = 'ADMIN' AND companyId = :companyId`,
            {
              replacements: {
                adminRoleId: adminRoleId[0].userRoleId,
                companyId: company.companyId,
              },
              type: Sequelize.QueryTypes.UPDATE,
              transaction: t,
            }
          );

          // Create Employee Role for existing Company
          await queryInterface.sequelize.query(
            `INSERT INTO user_roles (companyId, roleName, moduleAccess) VALUES (:companyId,'EMPLOYEE', :moduleAccess)`,
            {
              replacements: {
                companyId: company.companyId,
                moduleAccess: employeeDefaultModules,
              },
              type: Sequelize.QueryTypes.INSERT,
              transaction: t,
            }
          );

          // Get Employee Role Id for existing Company
          const employeeRoleId = await queryInterface.sequelize.query(
            `SELECT userRoleId FROM user_roles WHERE companyId = :company AND roleName = 'EMPLOYEE'`,
            {
              replacements: { company: company.companyId },
              type: Sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );

          // Assign Employee Role Id to Existing Users where role = 'EMPLOYEE'
          await queryInterface.sequelize.query(
            `UPDATE users SET roleId = :employeeRoleId WHERE role = 'EMPLOYEE' AND companyId = :companyId`,
            {
              replacements: {
                employeeRoleId: employeeRoleId[0].userRoleId,
                companyId: company.companyId,
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
      // Step 2: Revert the roleId values back to strings
      const adminRoles = await queryInterface.sequelize.query(
        `SELECT roleId, companyId FROM user_roles WHERE name = 'ADMIN'`,
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      for (const adminRole of adminRoles) {
        await queryInterface.sequelize.query(
          `UPDATE users SET roleId = 'ADMIN' WHERE roleId = :roleId AND companyId = :companyId`,
          {
            replacements: {
              roleId: adminRole.roleId,
              companyId: adminRole.companyId,
            },
            type: Sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }

      const employeeRoles = await queryInterface.sequelize.query(
        `SELECT roleId, companyId FROM user_roles WHERE name = 'EMPLOYEE'`,
        { type: Sequelize.QueryTypes.SELECT, transaction: t }
      );

      for (const employeeRole of employeeRoles) {
        await queryInterface.sequelize.query(
          `UPDATE users SET roleId = 'EMPLOYEE' WHERE roleId = :roleId AND companyId = :companyId`,
          {
            replacements: {
              roleId: employeeRole.roleId,
              companyId: employeeRole.companyId,
            },
            type: Sequelize.QueryTypes.UPDATE,
            transaction: t,
          }
        );
      }

      // Step 3: Rename the column back
      await queryInterface.renameColumn('users', 'roleId', 'role', {
        transaction: t,
      });

      // Step 4: Change the column type back to STRING
      await queryInterface.changeColumn(
        'users',
        'role',
        {
          allowNull: false,
          type: Sequelize.STRING,
        },
        { transaction: t }
      );
    });
  },
};
