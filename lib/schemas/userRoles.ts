import { EmployeeDataProps} from "lib/interfaces";
import { executeQuery } from "db/connection";
import { USER_ROLES_GET_ONE } from '@constant/storedProcedures';
import { z } from 'zod';

export const SCHEMA_USER_ROLES = {
  userRoleId: {
    async set(
      value: string | number, 
      data: EmployeeDataProps, 
    ): Promise<z.SafeParseReturnType<number | string, number | string>> {
      return await z
        .union([z.number(), z.string().min(1)])
        .transform(async (val, ctx) => {    
          const {companyId} = data;
          if(!companyId) {
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
          if(isNumber) params.userRoleId = val;
          if(isString) params.roleName = val;
  
          const [role]: any = await executeQuery(USER_ROLES_GET_ONE, params);
          return role ? role.userRoleId : ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "invalid input value",
          });
        }).safeParseAsync(value);
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
  roleName: {
    async set(
      value: string, 
      data: EmployeeDataProps, 
    ): Promise<z.SafeParseReturnType<string, string>> {
      return await z
        .string()
        .transform(async (val, ctx) => {    
          const {companyId} = data;
          if(!companyId) {
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
  moduleAccess: {
    set(
      value: string, 
      data: EmployeeDataProps, 
    ): z.SafeParseReturnType<string, string> {
      return z.string().trim().min(1).safeParse(value);
    }
  }
};