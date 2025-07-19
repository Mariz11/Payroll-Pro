import { LOCATION_CHECK_DUPLICATE } from '@constant/storedProcedures';
import { QueryReturnTypeEnum } from '@enums/query-return-type';
import { executeQuery } from 'db/connection';
import moment from 'moment';
import { QueryTypes } from 'sequelize';

export async function checkDuplicateLocation({
  locationId,
  address,
  companyId,
  startDate,
  endDate,
}: {
  locationId: number | null;
  address: string | null;
  companyId: number | null;
  startDate: Date | null;
  endDate: Date | null;
}) {
  try {
    const formattedStartDate =
      startDate === null || startDate === undefined
        ? moment().format('YYYY-MM-DD HH:mm:ss')
        : null;
    const formattedEndDate =
      endDate === null || endDate === undefined
        ? moment().format('YYYY-MM-DD HH:mm:ss')
        : null;
    // Build the payload and exclude null values
    const payload = Object.fromEntries(
      Object.entries({
        location_id: locationId,
        company_id: companyId,
        address: address,
        startDate: formattedStartDate,
        end_date: formattedEndDate,
      }).filter(([_, value]) => value !== null)
    );

    const duplicateEntry = await executeQuery(
      LOCATION_CHECK_DUPLICATE,
      {
        ...payload,
      },
      [],
      QueryTypes.SELECT,
      null,
      QueryReturnTypeEnum.DEFAULT
    );

    if (!duplicateEntry || duplicateEntry.length === 0) {
      throw new Error('MySQL Error: Query returned no results or failed.');
    }
    console.log('duplicateEntry', duplicateEntry);
    return (duplicateEntry as { has_duplicate_schedule: number }[])[0]
      .has_duplicate_schedule === 1
      ? true
      : false;
  } catch (error) {
    if (error instanceof Error) {
      console.log('Check Duplicate Function Error: ', error.message);
    }
  }
  return null;
}
