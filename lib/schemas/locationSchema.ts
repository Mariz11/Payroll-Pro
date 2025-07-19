import { message } from 'antd';
import moment from 'moment';
import { z } from 'zod';

export const LocationSchema = z
  .object({
    id: z.number().optional(),
    company_id: z
      .number()
      .nonnegative({ message: 'company_id must be a non-negative number' }),
    department_id: z
      .number()
      .nonnegative({ message: 'department_id must be a non-negative number' })
      .optional(),
    name: z
      .string()
      .min(1, { message: 'location_name is required' })
      .optional(),
    address: z.string().min(1, { message: 'address is required' }),
    signature: z.string().optional(),
    validity: z.string().min(1, { message: 'validity is required' }),
    longitude: z
      .number()
      .min(-180, { message: 'Longitude must be greater than or equal to -180' })
      .max(180, { message: 'Longitude must be less than or equal to 180' }),
    latitude: z.number(),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'start_date must be a valid date',
    }),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'end_date must be a valid date',
    }),
    radius: z
      .number()
      .positive({ message: 'radius must be a positive number' }),
    time_from: z.string(),
    time_to: z.string(),
    employee_ids: z
      .array(z.number({ message: 'employee_ids must be number' }))
      .nonempty({
        message: 'employee_ids is required',
      }),
  })
  .superRefine((data, ctx) => {
    const startDate = moment(data.start_date);
    const endDate = moment(data.end_date);
    if (startDate.isAfter(endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Time From' must be before 'Time To (diff: ${startDate.diff(
          endDate,
          'days'
        )} days)`,
      });
    }
  });

export const EditLocationSchema = z
  .object({
    location_id: z
      .number()
      .int()
      .positive({ message: 'Location ID must be a positive integer' })
      .optional(),
    company_id: z
      .number()
      .int()
      .positive({ message: 'Company ID must be a positive integer' }),
    name: z
      .string()
      .min(1, { message: 'Name must not be empty' })
      .max(255, { message: 'Name must not exceed 255 characters' })
      .optional(),
    address: z
      .string()
      .min(1, { message: 'Address must not be empty' })
      .max(500, { message: 'Address must not exceed 500 characters' })
      .optional(),
    validity: z
      .string({
        message: 'Validity must be either "active" or "inactive"',
      })
      .optional(),
    longitude: z
      .number()
      .min(-180, { message: 'Longitude must be between -180 and 180' })
      .max(180, { message: 'Longitude must be between -180 and 180' })
      .optional(),
    latitude: z
      .number()
      .min(-90, { message: 'Latitude must be between -90 and 90' })
      .max(90, { message: 'Latitude must be between -90 and 90' })
      .optional(),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'start_date must be a valid date',
    }),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'start_date must be a valid date',
    }),
    time_from: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'Time from must be in HH:mm:ss format',
      })
      .optional(),
    time_to: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'Time to must be in HH:mm:ss format',
      })
      .optional(),
    radius: z
      .number()
      .positive({ message: 'Radius must be a positive number' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const startDate = moment(data.start_date);
    const endDate = moment(data.end_date);

    if (startDate.isAfter(endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Time From' must be before 'Time To (diff: ${startDate.diff(
          endDate,
          'days'
        )} days)`,
      });
    }
  });

export const LocationCheckBody = z.object({
  locationId: z.number().min(1, { message: 'locationId must be a number' }),
  employeeIds: z.array(
    z.number({
      invalid_type_error: 'Employee ID must be a number',
    })
  ),
});
