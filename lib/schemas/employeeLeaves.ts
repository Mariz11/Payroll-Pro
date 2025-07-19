import { z } from 'zod';
import { EmployeeDataProps} from "lib/interfaces";

export const SCHEMA_EMPLOYEES_LEAVES = {
  employeeLeavesId: {
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
  vacationLeaveCredits: {
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
  vacationLeaveUsed: {
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
  sickLeaveCredits: {
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
  sickLeaveUsed: {
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
  soloParentLeaveCredits: {
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
  soloParentLeavesUsed: {
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
  paternityLeaveCredits: {
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
  paternityLeavesUsed: {
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
  maternityLeaveCredits: {
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
  maternityLeavesUsed: {
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
  serviceIncentiveLeaveCredits: {
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
  serviceIncentiveLeaveUsed: {
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
  otherLeaveCredits: {
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
  otherLeavesUsed: {
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
  emergencyLeaveCredits: {
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
  emergencyLeavesUsed: {
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
  birthdayLeaveCredits: {
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
  birthdayLeavesUsed: {
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