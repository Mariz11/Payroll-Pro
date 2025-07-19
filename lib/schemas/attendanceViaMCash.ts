import moment from 'moment';
import { z } from 'zod';
import { hasHtmlTags, hasSQLKeywords, removeExtraSpaces } from '@utils/helper';

const attendanceDateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/;

const statusEnum = z.enum([
  'CLOCK_IN',
  'CLOCK_OUT',
  'LUNCH_IN',
  'LUNCH_OUT',
  'BREAK_IN',
  'BREAK_OUT',
  'OFF',
]);

export const AttendanceViaMCashSchema = z.object({
  locationId: z.number().min(1, { message: 'locationId must be a number' }),
  ckycId: z
    .string()
    .min(1, { message: 'ckycId must be a non-empty string' })
    .refine((val) => !hasHtmlTags(val) && !hasSQLKeywords(val), {
      message: 'ckycId must not contain HTML tags or SQL keywords',
    })
    .transform((val) => removeExtraSpaces(val)),
  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be greater than or equal to -90' })
    .max(90, { message: 'Latitude must be less than or equal to 90' })
    .optional(),
  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be greater than or equal to -180' })
    .max(180, { message: 'Longitude must be less than or equal to 180' })
    .optional(),
  dateTime: z
    .string()
    .regex(attendanceDateTimeRegex, {
      message: 'Invalid Override Date Format',
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'start_date must be a valid date',
    }),
  status: statusEnum,
});
