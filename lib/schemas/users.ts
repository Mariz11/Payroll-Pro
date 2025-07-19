import { EmployeeDataProps } from "lib/interfaces";
import moment from '@constant/momentTZ';;
import { SUFFIXES } from '@constant/variables';
import { executeQuery } from "db/connection";
import { USER_ROLES_GET_ONE } from '@constant/storedProcedures';
import { z } from 'zod';

export const SCHEMA_USERS = {
  userId: {
    set(
      value: number,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number, number> {
      return z.number().safeParse(value);
    }
  },
  companyId: {
    set(
      value: number,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number, number> {
      return z.number().safeParse(value);
    }
  },
  employeeId: {
    set(
      value: number,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number, number> {
      return z.number().safeParse(value);
    }
  },
  firstName: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(1).max(100).safeParse(value);
    }
  },
  middleName: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(0).max(100).nullable().safeParse(value);
    }
  },
  lastName: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(1).max(100).safeParse(value);
    }
  },
  suffix: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, | string | null> {
      return z
        .string()
        .trim()
        .toUpperCase()
        .nullable()
        .transform((val) => (val === null ? '' : val))
        .refine((val) => !val || SUFFIXES.includes(val), {
          message: "invalid input value",
        })
        .safeParse(value);
    }
  },
  contactNumber: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, | string> {
      return z
        .string()
        .trim()
        .min(11)
        .max(11)
        .regex(/^09\d{9}$/, {
          message: 'must be 11 digits and start with 09',
        })
        .safeParse(value);
    }
  },
  birthDate: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .trim()
        .refine(val => moment(val).isValid(), { message: "invalid date format" })
        .transform((val, ctx) => {
          const { modeOfPayroll } = data;

          if (modeOfPayroll) {
            const isMCashPayroll = modeOfPayroll.includes('MCASH');
            const isUnder18 = moment(val).isAfter(moment().subtract(18, 'years'));
            if (isMCashPayroll && isUnder18) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "must be 18 or older for MCash user",
              });
            }
          }

          return moment(val).format('YYYY-MM-DD')
        })
        .safeParse(value);
    }
  },
  emailAddress: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .max(225)
        .email({ message: 'invalid email address' })
        .safeParse(value);
    }
  },
  isLocked: {
    set(
      value: boolean | number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<boolean | number | null, boolean | number | null> {
      return z
        .union([z.boolean(), z.literal(0), z.literal(1), z.null()])
        .transform((val) => (val === null ? 0 : typeof val === 'boolean' ? Number(val) : val))
        .default(0)
        .safeParse(value);
    }
  },
  username: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .max(225)
        .email({ message: 'invalid email username' })
        .safeParse(value);
    }
  },
  password: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(6).max(255).safeParse(value);
    }
  },
  role: {
    async set(
      value: string,
      data: EmployeeDataProps,
    ): Promise<z.SafeParseReturnType<string, string>> {
      return await z
        .string()
        .transform(async (val, ctx) => {
          const { companyId } = data;
          if (!companyId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "cannot find role without company id",
            });

            return;
          }
          const [role]: any = await executeQuery(USER_ROLES_GET_ONE, {
            roleName: val
          });
          return role ? role.userRoleId : ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "invalid input value",
          });
        }).safeParseAsync(value);
    }
  },
  userRoleId: {
    async set(
      value: string | number,
      data: EmployeeDataProps,
    ): Promise<z.SafeParseReturnType<number | string, number | string>> {
      return await z
        .union([z.number(), z.string().min(1)])
        .transform(async (val, ctx) => {
          const { companyId } = data;
          if (!companyId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "cannot find role without company id",
            });

            return;
          }

          const isNumber = typeof val === "number";
          const isString = typeof val === "string";

          const params: { companyId: number; userRoleId?: number; roleName?: string } = {
            companyId
          };
          if (isNumber) params.userRoleId = val;
          if (isString) params.roleName = val;

          const [role]: any = await executeQuery(USER_ROLES_GET_ONE, params);
          return role ? role.userRoleId : ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "invalid input value",
          });
        }).safeParseAsync(value);
    }
  },
  isActive: {
    set(
      value: boolean | number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<boolean | number | null, boolean | number | null> {
      return z
        .union([z.boolean(), z.literal(0), z.literal(1), z.null()])
        .transform((val) => (val === null ? 1 : typeof val === 'boolean' ? Number(val) : val))
        .default(1)
        .safeParse(value);
    }
  },
  isDefault: {
    set(
      value: boolean | number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<boolean | number | null, boolean | number | null> {
      return z
        .union([z.boolean(), z.literal(0), z.literal(1), z.null()])
        .transform((val) => (val === null ? 0 : typeof val === 'boolean' ? Number(val) : val))
        .default(0)
        .safeParse(value);
    }
  },
};