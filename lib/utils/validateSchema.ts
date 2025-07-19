import { z } from 'zod';
import { toTitleCase, uniqueArray } from "./helper";

type ValidationResult<T> = {
  mergedData: Partial<T>;
  mergedErrors: string[];
};

type SchemaMap<T> = {
  [K in keyof T]?: {
    set: (value: any, data: T) => Promise<{ success: boolean; data?: T[K]; error?: z.ZodError<T[K]> }>;
  };
};

export const validateSchema = async <T>(data: T, schema: SchemaMap<T>): Promise<ValidationResult<T>> => {
  const mergedData: Partial<T> = {};
  const mergedErrors: string[] = [];

  await Promise.all(
    Object.entries(data as Record<string, any>).map(async ([key, value]) => {
      const field = schema[key as keyof T];
      if (!field?.set) return;

      const result = await field.set(value, data);
      if (result.success) {
        mergedData[key as keyof T] = result.data as T[keyof T];
      } else if (result.error) {
        const [message] = uniqueArray(result.error.format()._errors);
        mergedErrors.push(`${toTitleCase(key.replace(/([A-Z])/g, ' $1').trim())} ${message}`);
      }
    })
  );

  return { mergedData, mergedErrors };
};


export default validateSchema;