const { Sequelize } = require('sequelize');

const config = require('./config/log-db-config');
let sequelize;

let dev_config = config;
sequelize = new Sequelize(
  dev_config.database,
  dev_config.username,
  dev_config.password,
  {
    host: dev_config.host,
    timezone: dev_config.timezone,
    dialect: dev_config.dialect,
    dialectModule: dev_config.dialectModule,
    dialectOptions: dev_config.dialectOptions,
  }
);

const connection = sequelize;
module.exports = {
  connection,
};
