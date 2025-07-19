import { QueryTypes, Sequelize } from 'sequelize';
import config from './config/config';
import { QueryReturnTypeEnum } from '@enums/query-return-type';

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
    pool: dev_config.pool,
    retry: dev_config.retry,
  }
);

const connection = sequelize;

export default connection;

const storedProcArgs = (inputParams, outputKeys) => {
  const hasInParams = Object.keys(inputParams).length > 0;
  const hasOutKeys = outputKeys.length > 0;

  const args = [
    hasInParams ? ':inParams' : null,
    hasOutKeys ? ':outKeys' : null
  ].filter(Boolean).join(', ');

  const replacements = {
    ...(hasInParams && {inParams: JSON.stringify(inputParams)}),
    ...(hasOutKeys && {outKeys: JSON.stringify(outputKeys)}),
  };

  return {
    args,
    replacements,
  }
}

const insertOrUpdateStoredProcArgs = (inputParams, outputKeys) => {
  const inPlaceholders = Object.keys(inputParams)
    .map((key) => `:${key}`)
    .join(', ');

  const outPlaceholders = outputKeys.join(', ');
  const args = [inPlaceholders, outPlaceholders].filter(Boolean).join(', ');

  return {
    args,
    replacements: inputParams,
  };
};

export const executeQuery = async (
  storedProcName,
  inputParams = {},
  outputKeys = [],
  type = QueryTypes.SELECT,
  transaction = null,
  returnType = QueryReturnTypeEnum.DEFAULT,
) => {
  const isInsertOrUpdate = [QueryTypes.INSERT, QueryTypes.UPDATE].includes(type);
  const argsHandler = isInsertOrUpdate ? insertOrUpdateStoredProcArgs : storedProcArgs;
  const {args, replacements} = argsHandler(inputParams, outputKeys);
  const query = `CALL ${storedProcName}(${args})`;

  const results = await connection.query(query, {
    replacements,
    type,
    transaction,
  });

  const [defaultData] = results;

  return returnType === QueryReturnTypeEnum.RAW ? results : (defaultData ? Object.values(defaultData) : []);
};

export const executeRawQuery = async (query, transaction = null) => {
  try {

    await connection.query(query, { type: QueryTypes.RAW, transaction });

  } catch (error) {
    console.error('Error query execution:', error);
  }
};