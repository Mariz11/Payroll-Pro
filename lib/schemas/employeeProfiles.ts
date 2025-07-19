import { toTitleCase } from "@utils/helper";
import { EmployeeDataProps } from "lib/interfaces";
import { executeQuery } from "db/connection";
import moment from '@constant/momentTZ';;
import { GENDER, SUFFIXES, STATUSES } from '@constant/variables';
import { getNationality } from '@utils/partnerAPIs';
import {
  CITIES_GET_ONE,
  COUNTRIES_GET_ONE,
  PROVINCES_GET_ONE,
} from '@constant/storedProcedures';
import { z } from 'zod';

export const SCHEMA_EMPLOYEES_PROFILES = {
  employeeProfileId: {
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
  profilePicture: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().nullable().safeParse(value);
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
  emergencyContactNumber1: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, | string | null> {
      const contactNumberRegex = /^09\d{9}$/;
      return z
        .string()
        .trim()
        .refine(val => !val || contactNumberRegex.test(val), {
          message: 'must be 11 digits and start with 09',
        })
        .transform(val => val === '' ? null : val)
        .nullable()
        .safeParse(value);
    }
  },
  emergencyContactNumber2: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, | string | null> {
      const contactNumberRegex = /^09\d{9}$/;
      return z
        .string()
        .trim()
        .refine(val => !val || contactNumberRegex.test(val), {
          message: 'must be 11 digits and start with 09',
        })
        .transform(val => val === '' ? null : val)
        .nullable()
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
  streetAddress: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(1).max(225).safeParse(value);
    }
  },
  cityId: {
    async set(
      value: string | number,
      data: EmployeeDataProps,
    ): Promise<z.SafeParseReturnType<number | string, number | string>> {
      return await z
        .union([z.number(), z.string().trim().toUpperCase().min(1)])
        .transform(async (val, ctx) => {
          if (typeof val === "number") return val;

          const [city]: any = await executeQuery(CITIES_GET_ONE, {name: val});
          return city ? city.cityId : ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "invalid input value",
          });
        }).safeParseAsync(value);
    }
  },
  provinceId: {
    async set(
      value: string | number,
      data: EmployeeDataProps,
    ): Promise<z.SafeParseReturnType<number | string, number | string>> {
      return await z
        .union([z.number(), z.string().trim().toUpperCase().min(1)])
        .transform(async (val, ctx) => {
          if (typeof val === "number") return val;

          const [province]: any = await executeQuery(PROVINCES_GET_ONE, {name: val});
          return province ? province.provinceId : ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "invalid input value",
          });
        }).safeParseAsync(value);
    }
  },
  countryId: {
    async set(
      value: string | number,
      data: EmployeeDataProps,
    ): Promise<z.SafeParseReturnType<number | string, number | string>> {
      return await z
        .union([z.number(), z.string().trim().toUpperCase().min(1)])
        .transform(async (val, ctx) => {
          if (typeof val === "number") return val;

          const [country]: any = await executeQuery(COUNTRIES_GET_ONE, {name: val});
          return country ? country.countryId : ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "invalid input value",
          });
        }).safeParseAsync(value);
    }
  },
  zipCode: {
    set(
      value: number | string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | string | null, number | string | null> {
      return z
        .union([
          z
            .number()
            .int()
            .min(1000, { message: 'must be exactly 4 digits' })
            .max(9999, { message: 'must be exactly 4 digits' }),
          z
            .string()
            .trim()
            .transform(val => (val === "" ? null : val))
            .refine(val => val === null || /^\d+$/.test(val), {
              message: 'must be a numeric string',
            })
            .refine(val => val === null || val.length === 4, {
              message: 'must be exactly 4 digits',
            })
            .transform(val => (val === null ? null : Number(val)))
        ])
        .nullable()
        .safeParse(value);
    }
  },
  educationalAttainment: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(0).max(100).nullable().safeParse(value);
    }
  },
  schoolGraduated: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(0).max(255).nullable().safeParse(value);
    }
  },
  degree: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(0).max(255).nullable().safeParse(value);
    }
  },
  gender: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z
        .string()
        .trim()
        .toLowerCase()
        .refine(val => GENDER.map((v) => v.toLowerCase()).includes(val), {
          message: `must be ${GENDER.join(', ')}`,
        })
        .transform(toTitleCase)
        .safeParse(value);
    }
  },
  placeOfBirth: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(2).max(255).safeParse(value);
    }
  },
  nationality: {
    async set(
      value: string,
      data: EmployeeDataProps,
    ): Promise<z.SafeParseReturnType<string, string>> {
      return await z
        .string()
        .trim()
        .toUpperCase()
        .min(1)
        .max(100)
        .transform(async (val, ctx) => {
          try {
            const nationalities = await getNationality();
            return nationalities.includes(val) ? toTitleCase(val) : ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "invalid input value"
            });
          } catch (error: any) {
            return ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }).safeParseAsync(value);
    }
  },
  civilStatus: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .trim()
        .toLowerCase()
        .refine(val => STATUSES.map((v) => v.toLowerCase()).includes(val), {
          message: `must be ${STATUSES.join(', ')}`,
        })
        .transform(toTitleCase)
        .safeParse(value);
    }
  }
};