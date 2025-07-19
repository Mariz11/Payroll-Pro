import { z } from 'zod';
import { EmployeeDataProps} from "lib/interfaces";

export const SCHEMA_EMPLOYEES_BENEFITS = {
  employeeBenefitsId: {
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
  sssId: {
    set(
      value: string | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().max(255).nullable().safeParse(value);
    }
  },
  sssContributionRate: {
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
  sssERShareRate: {
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
  sssECShareRate: {
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
  philHealthId: {
    set(
      value: string | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().max(255).nullable().safeParse(value);
    }
  },
  philHealthContributionRate: {
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
  philHealthERShareRate: {
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
  pagIbigId: {
    set(
      value: string | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().max(255).nullable().safeParse(value);
    }
  },
  pagIbigContributionRate: {
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
  pagIbigERShareRate: {
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
  }
};