const { Sequelize } = require('sequelize');

require('dotenv').config();

module.exports = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX),
    min: parseInt(process.env.DB_POOL_MIN),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE),
    idle: parseInt(process.env.DB_POOL_IDLE),
  },
  retry: {
    max: 3,
    match: ['ETIMEDOUT', Sequelize.ConnectionError],
  },
  dialectModule: require('mysql2'),
  dialectOptions: {
    socketPath: process.env.DB_SOCKET_PATH, // Cloud SQL proxy socket path
    // useUTC: false, //for reading from database
    decimalNumbers: true,
    dateStrings: true,
    typeCast: function (field, next) {
      // for reading from database
      if (field.type === 'DATETIME') {
        return field.string();
      }
      return next();
    },
    maxPreparedStatements: parseInt(process.env.MAX_PREPARED_STATEMENTS),
  },
  timezone: '+08:00',
  // test: {
  //   username: 'root',
  //   password: null,
  //   database: 'database_test',
  //   host: '127.0.0.1',
  //   dialect: 'mysql',
  // },
  // production: {
  //   username: 'root',
  //   password: null,
  //   database: 'database_production',
  //   host: '127.0.0.1',
  //   dialect: 'mysql',
  // },
  // development: {
  // username: 'root',
  // password: null,
  // database: 'ml_jewellers_sequelize',
  // host: '127.0.0.1',
  // },
};
