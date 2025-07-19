import { toTitleCase, uniqueArray } from "@utils/helper";
import { EmployeeDataProps } from "lib/interfaces";
import moment from '@constant/momentTZ';;
import { EMPLOYMENT_STATUSES, MODES_OF_PAYROL } from '@constant/variables';
import { z } from 'zod';

export const SCHEMA_EMPLOYEES = {
  employeeId: {
    set(
      value: number,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number, number> {
      return z.number().safeParse(value);
    }
  },
  employeeCode: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(1).max(255).safeParse(value);
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
  tierLabel: {
    /* 
      PayPro is linked to KPX, where Kwarta Padala or MCash users
      have a default Buyer tier after KYC. When registered as a PayPro
      employee, their tier updates to the company name. Deactivation or
      deletion resets it to Buyer, and reactivation restores the company name.
    */
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(0).max(255).nullable().safeParse(value);
    }
  },
  mlWalletStatus: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      /*
      0: Pending 
      1: Activated
      2: Inactive/Deactivated
      3: Failed
      */
      return z
        .union([
          z.literal(0),
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.null()]
        )
        .transform((val) => val === null ? 0 : val)
        .default(0)
        .safeParse(value);
    }
  },
  ckycId: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(1).max(255).nullable().safeParse(value);
    }
  },
  mlWalletId: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().min(1).max(255).nullable().safeParse(value);
    }
  },
  departmentId: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z.number().nullable().safeParse(value);
    }
  },
  shiftId: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z.number().nullable().safeParse(value);
    }
  },
  hiringDate: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .trim()
        .refine(val => moment(val).isValid(), { message: "invalid date format" })
        .transform(val => moment(val).format('YYYY-MM-DD'))
        .safeParse(value);
    }
  },
  startDate: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .trim()
        .refine(val => moment(val).isValid(), { message: "invalid date format" })
        .transform(val => moment(val).format('YYYY-MM-DD'))
        .safeParse(value);
    }
  },
  employmentStatus: {
    set(
      value: string | string[],
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | string[], string | string[]> {
      return z
        .union([
          z.string().trim().toLowerCase().min(1).max(255),
          z.array(z.string().trim().toLowerCase().min(1).max(255))
        ])
        .transform((val, ctx) => {
          const isArray = Array.isArray(val);
          const result = (isArray ? val : val.split(',').map((v) => v.trim())).filter(Boolean);
          if (result.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "must not be empty",
            });
          }

          return uniqueArray(result);
        })
        .refine((val) => !val || val.every((v) => EMPLOYMENT_STATUSES.map((v) => v.toLowerCase()).includes(v)), {
          message: "invalid input value",
        })
        .transform((val) => val.map((v) => toTitleCase(v)).join(','))
        .safeParse(value);
    }
  },
  dayOff: {
    set(
      value: string | string[] | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | string[] | null, string | string[] | null> {
      return z
        .union([
          z.string().trim().toLowerCase().max(255),
          z.array(z.string().trim().toLowerCase().max(255)),
          z.null(),
        ])
        .transform((val) => {
          if (val === null || val === '') return '';

          const isArray = Array.isArray(val);
          const result = (isArray ? val : val.split(',').map((v) => v.trim())).filter(Boolean);

          return result.length === 0 ? '' : uniqueArray(result);
        })
        .refine((val) => !val || val.every((v) => moment.weekdays().map((d) => d.toLowerCase()).includes(v)), {
          message: "invalid input value",
        })
        .transform((val) => (Array.isArray(val) ? val.map((v) => toTitleCase(v)).join(',') : val))
        .safeParse(value);
    }
  },
  dailyRate: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  basicPay: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  allowanceBreakdown: {
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
  allowanceBreakdownId: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z.number().nullable().safeParse(value);
    }
  },
  monthlyAllowance: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  allowance: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  tinNumber: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().max(255).trim().nullable().safeParse(value);
    }
  },
  overtimeRateRegDays: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  overtimeRateHolidays: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  overtimeRateRestDays: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      return z
        .union([z.number(), z.null()])
        .transform((val) => (val === null ? 0 : val))
        .default(0)
        .safeParse(value);
    }
  },
  positionTitle: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(2).max(100).safeParse(value);
    }
  },
  dateOfSeparation: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z
        .string()
        .trim()
        .nullable()
        .refine(val => !val || moment(val).isValid(), {
          message: "invalid date format"
        })
        .transform(val => (val ? moment(val).format('YYYY-MM-DD') : val))
        .safeParse(value);
    }
  },
  modeOfSeparation: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().max(100).nullable().safeParse(value);
    }
  },
  modeOfPayroll: {
    set(
      value: string,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string, string> {
      return z
        .string()
        .trim()
        .min(1)
        .max(255)
        .toUpperCase()
        .refine((val) => MODES_OF_PAYROL.includes(val), {
          message: "invalid input value",
        })
        .safeParse(value);
    }
  },
  applyWithholdingTax: {
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
  isMonthlyRated: {
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
  mismatchedInfos: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().nullable().safeParse(value);
    }
  },
  failedRegistrationRemarks: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().nullable().safeParse(value);
    }
  },
  referenceFiles: {
    set(
      value: string | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().nullable().safeParse(value);
    }
  },
  employeeStatus: {
    set(
      value: number | null,
      data: EmployeeDataProps,
    ): z.SafeParseReturnType<number | null, number | null> {
      /*
      0: Pending 
      1: Activated
      2: Inactive/Deactivated
      3: Failed
      */
      return z
        .union([
          z.literal(0),
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.null()]
        )
        .transform((val) => val === null ? 0 : val)
        .default(0)
        .safeParse(value);
    }
  }
};