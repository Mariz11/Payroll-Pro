/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'department_announcements',
          'departmentId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          {
            transaction: t,
          }
        ),
        queryInterface.addColumn(
          'announcements',
          'image',
          {
            type: Sequelize.STRING,
            after: 'content',
            allowNull: true,
            defaultValue: null
          },
          {
            transaction: t,
          }
        ),
      ]);
    });
    
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'department_announcements',
          'departmentId',
          {
            allowNull: false,
            type: Sequelize.INTEGER,
            references: {
              model: {
                tableName: 'departments',
              },
              key: 'departmentId',
            },
          },
          {
            transaction: t,
          }
        ),
        queryInterface.removeColumn(
          'announcements',
          'image',
          {
            transaction: t,
          }
        ),
      ]);
    });
  },
};
