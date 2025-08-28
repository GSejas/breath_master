import { ValidationResult, ValidationError } from './types';

export class Validator {
  static string(options: { minLength?: number; maxLength?: number; pattern?: RegExp; enum?: string[] } = {}): (value: unknown) => ValidationResult<string> {
    return (value: unknown) => {
      if (typeof value !== 'string') {
        return { success: false, errors: [{ path: '', message: 'Expected string', code: 'TYPE_ERROR' }] };
      }

      const errors: ValidationError[] = [];

      if (options.minLength && value.length < options.minLength) {
        errors.push({ path: '', message: `Minimum length is ${options.minLength}`, code: 'MIN_LENGTH' });
      }

      if (options.maxLength && value.length > options.maxLength) {
        errors.push({ path: '', message: `Maximum length is ${options.maxLength}`, code: 'MAX_LENGTH' });
      }

      if (options.pattern && !options.pattern.test(value)) {
        errors.push({ path: '', message: 'Invalid format', code: 'PATTERN_MISMATCH' });
      }

      if (options.enum && !options.enum.includes(value)) {
        errors.push({ path: '', message: `Must be one of: ${options.enum.join(', ')}`, code: 'ENUM_ERROR' });
      }

      return errors.length ? { success: false, errors } : { success: true, data: value };
    };
  }

  static number(options: { min?: number; max?: number; integer?: boolean } = {}): (value: unknown) => ValidationResult<number> {
    return (value: unknown) => {
      if (typeof value !== 'number' || isNaN(value)) {
        return { success: false, errors: [{ path: '', message: 'Expected number', code: 'TYPE_ERROR' }] };
      }

      const errors: ValidationError[] = [];

      if (options.integer && !Number.isInteger(value)) {
        errors.push({ path: '', message: 'Must be an integer', code: 'INTEGER_REQUIRED' });
      }

      if (options.min !== undefined && value < options.min) {
        errors.push({ path: '', message: `Minimum value is ${options.min}`, code: 'MIN_VALUE' });
      }

      if (options.max !== undefined && value > options.max) {
        errors.push({ path: '', message: `Maximum value is ${options.max}`, code: 'MAX_VALUE' });
      }

      return errors.length ? { success: false, errors } : { success: true, data: value };
    };
  }

  static boolean(): (value: unknown) => ValidationResult<boolean> {
    return (value: unknown) => {
      if (typeof value !== 'boolean') {
        return { success: false, errors: [{ path: '', message: 'Expected boolean', code: 'TYPE_ERROR' }] };
      }
      return { success: true, data: value };
    };
  }

  static object<T extends Record<string, any>>(schema: { [K in keyof T]: (value: unknown) => ValidationResult<T[K]> }): (value: unknown) => ValidationResult<T> {
    return (value: unknown) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { success: false, errors: [{ path: '', message: 'Expected object', code: 'TYPE_ERROR' }] };
      }

      const obj = value as Record<string, unknown>;
      const result = {} as T;
      const errors: ValidationError[] = [];

      for (const [key, validator] of Object.entries(schema)) {
        const validation = validator(obj[key]);
        if (validation.success) {
          result[key as keyof T] = validation.data!;
        } else {
          for (const error of validation.errors || []) {
            errors.push({
              path: key + (error.path ? `.${error.path}` : ''),
              message: error.message,
              code: error.code
            });
          }
        }
      }

      return errors.length ? { success: false, errors } : { success: true, data: result };
    };
  }

  static array<T>(itemValidator: (value: unknown) => ValidationResult<T>): (value: unknown) => ValidationResult<T[]> {
    return (value: unknown) => {
      if (!Array.isArray(value)) {
        return { success: false, errors: [{ path: '', message: 'Expected array', code: 'TYPE_ERROR' }] };
      }

      const result: T[] = [];
      const errors: ValidationError[] = [];

      for (let i = 0; i < value.length; i++) {
        const validation = itemValidator(value[i]);
        if (validation.success) {
          result.push(validation.data!);
        } else {
          for (const error of validation.errors || []) {
            errors.push({
              path: `[${i}]` + (error.path ? `.${error.path}` : ''),
              message: error.message,
              code: error.code
            });
          }
        }
      }

      return errors.length ? { success: false, errors } : { success: true, data: result };
    };
  }

  static optional<T>(validator: (value: unknown) => ValidationResult<T>): (value: unknown) => ValidationResult<T | undefined> {
    return (value: unknown) => {
      if (value === undefined) {
        return { success: true, data: undefined };
      }
      return validator(value);
    };
  }

  static oneOf<T>(...validators: ((value: unknown) => ValidationResult<T>)[]): (value: unknown) => ValidationResult<T> {
    return (value: unknown) => {
      for (const validator of validators) {
        const result = validator(value);
        if (result.success) {
          return result;
        }
      }
      
      return { 
        success: false, 
        errors: [{ path: '', message: 'Value does not match any allowed type', code: 'UNION_ERROR' }] 
      };
    };
  }
}