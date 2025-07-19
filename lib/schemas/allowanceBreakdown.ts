import {z} from 'zod';
import { EmployeeDataProps} from "lib/interfaces";

export const SCHEMA_ALLOWANCE_BREAKDOWN = {
  allowanceBreakdownId: {
    set(
      value: number | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<number | null, number | null> {
      return z.number().nullable().safeParse(value);  
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
  allowanceType: {
    set(
      value: string | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().nullable().safeParse(value);
    }
  },
  monthlyAmounts: {
    set(
      value: string | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().nullable().safeParse(value);
    }
  },
  dailyAmounts: {
    set(
      value: string | null, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string | null, string | null> {
      return z.string().trim().nullable().safeParse(value);
    }
  }
}