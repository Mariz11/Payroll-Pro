'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (t) => {
      const employees = await queryInterface.sequelize.query(
        `SELECT e.employeeId, e.companyId, ep.firstName, ep.middleName, ep.lastName, ep.suffix, ep.birthDate, ep.contactNumber, ep.emailAddress FROM employees e INNER JOIN employee_profiles ep ON e.employeeId = ep.employeeId WHERE e.deletedAt IS NULL`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction: t,
        }
      );

      for (const employee of employees) {
        const checkIfAccountExists = await queryInterface.sequelize.query(
          'SELECT * FROM users WHERE employeeId = :employeeId AND deletedAt IS NULL',
          {
            replacements: { employeeId: employee.employeeId },
            type: Sequelize.QueryTypes.SELECT,
            transaction: t,
          }
        );

        if (checkIfAccountExists && checkIfAccountExists.length == 0) {
          const firstName = employee.firstName;
          const middleName = employee.middleName;
          const lastName = employee.lastName;
          const suffix = employee.suffix;
          const birthDate = employee.birthDate;
          const contactNumber = employee.contactNumber;
          const employeeId = employee.employeeId;
          const companyId = employee.companyId;
          const emailAddress = employee.emailAddress;
          const username = emailAddress;
          const password = '123456';
          const hashedPass = await bcrypt.hash(password, 10);

          const role = await queryInterface.sequelize.query(
            'SELECT * FROM user_roles WHERE companyId = :companyId AND roleName = :roleName LIMIT 1',
            {
              replacements: { companyId: companyId, roleName: 'EMPLOYEE' },
              type: Sequelize.QueryTypes.SELECT,
              transaction: t,
            }
          );

          await queryInterface.sequelize.query(
            `INSERT INTO users (employeeId, companyId, role, roleId, firstName, middleName, lastName, suffix, birthDate, emailAddress, contactNumber, username, isActive, password) VALUES (:employeeId, :companyId, :role, :roleId, :firstName, :middleName, :lastName, :suffix, :birthDate, :emailAddress, :contactNumber, :username, :isActive, :password)`,
            {
              replacements: {
                employeeId: employeeId,
                companyId: companyId,
                role: role[0].roleName,
                roleId: role[0].userRoleId,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                suffix: suffix,
                birthDate: birthDate,
                emailAddress: emailAddress,
                contactNumber: contactNumber,
                username: username,
                isActive: 1,
                password: hashedPass,
              },
              type: Sequelize.QueryTypes.INSERT,
              transaction: t,
            }
          );
        }
      }
    });
  },

  async down(queryInterface, Sequelize) {},
};
