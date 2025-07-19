import { executeQuery } from 'db/connection';
import { QueryTypes } from 'sequelize';

export async function createActivityLog(
  companyId: number,
  userId: number,
  message: string,
  transaction?: any
) {
  try {
    await executeQuery(
      `activity_logs_insert`,
      { userId, companyId, message },
      [],
      QueryTypes.INSERT,
      transaction as any
    );
  } catch (error) {
    console.log(error);
  }
}
