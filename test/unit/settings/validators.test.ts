import { describe, it, expect } from 'vitest';
import { Validator } from '../../../src/engine/settings/validators';

describe('Validator', () => {
  describe('string validator', () => {
    it('should validate string type', () => {
      const validator = Validator.string();
      
      expect(validator('hello')).toEqual({ success: true, data: 'hello' });
      expect(validator(123).success).toBe(false);
      expect(validator(null).success).toBe(false);
    });

    it('should validate minimum length', () => {
      const validator = Validator.string({ minLength: 3 });
      
      expect(validator('abc')).toEqual({ success: true, data: 'abc' });
      expect(validator('ab').success).toBe(false);
      expect(validator('ab').errors?.[0].code).toBe('MIN_LENGTH');
    });

    it('should validate maximum length', () => {
      const validator = Validator.string({ maxLength: 3 });
      
      expect(validator('abc')).toEqual({ success: true, data: 'abc' });
      expect(validator('abcd').success).toBe(false);
      expect(validator('abcd').errors?.[0].code).toBe('MAX_LENGTH');
    });

    it('should validate pattern', () => {
      const validator = Validator.string({ pattern: /^[a-z]+$/ });
      
      expect(validator('hello')).toEqual({ success: true, data: 'hello' });
      expect(validator('Hello').success).toBe(false);
      expect(validator('hello123').success).toBe(false);
    });

    it('should validate enum values', () => {
      const validator = Validator.string({ enum: ['red', 'green', 'blue'] });
      
      expect(validator('red')).toEqual({ success: true, data: 'red' });
      expect(validator('yellow').success).toBe(false);
      expect(validator('yellow').errors?.[0].code).toBe('ENUM_ERROR');
    });
  });

  describe('number validator', () => {
    it('should validate number type', () => {
      const validator = Validator.number();
      
      expect(validator(123)).toEqual({ success: true, data: 123 });
      expect(validator(12.5)).toEqual({ success: true, data: 12.5 });
      expect(validator('123').success).toBe(false);
      expect(validator(NaN).success).toBe(false);
    });

    it('should validate minimum value', () => {
      const validator = Validator.number({ min: 10 });
      
      expect(validator(15)).toEqual({ success: true, data: 15 });
      expect(validator(5).success).toBe(false);
      expect(validator(5).errors?.[0].code).toBe('MIN_VALUE');
    });

    it('should validate maximum value', () => {
      const validator = Validator.number({ max: 100 });
      
      expect(validator(50)).toEqual({ success: true, data: 50 });
      expect(validator(150).success).toBe(false);
      expect(validator(150).errors?.[0].code).toBe('MAX_VALUE');
    });

    it('should validate integer requirement', () => {
      const validator = Validator.number({ integer: true });
      
      expect(validator(123)).toEqual({ success: true, data: 123 });
      expect(validator(12.5).success).toBe(false);
      expect(validator(12.5).errors?.[0].code).toBe('INTEGER_REQUIRED');
    });
  });

  describe('boolean validator', () => {
    it('should validate boolean type', () => {
      const validator = Validator.boolean();
      
      expect(validator(true)).toEqual({ success: true, data: true });
      expect(validator(false)).toEqual({ success: true, data: false });
      expect(validator('true').success).toBe(false);
      expect(validator(1).success).toBe(false);
    });
  });

  describe('object validator', () => {
    it('should validate object structure', () => {
      const validator = Validator.object({
        name: Validator.string(),
        age: Validator.number({ min: 0 })
      });

      const valid = { name: 'John', age: 25 };
      expect(validator(valid)).toEqual({ success: true, data: valid });
    });

    it('should handle missing properties', () => {
      const validator = Validator.object({
        name: Validator.string(),
        age: Validator.number()
      });

      const result = validator({ name: 'John' });
      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.path === 'age')).toBe(true);
    });

    it('should handle nested validation errors', () => {
      const validator = Validator.object({
        name: Validator.string({ minLength: 3 }),
        age: Validator.number({ min: 0 })
      });

      const result = validator({ name: 'Jo', age: -5 });
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors?.find(e => e.path === 'name')?.code).toBe('MIN_LENGTH');
      expect(result.errors?.find(e => e.path === 'age')?.code).toBe('MIN_VALUE');
    });

    it('should reject non-objects', () => {
      const validator = Validator.object({ test: Validator.string() });
      
      expect(validator('not an object').success).toBe(false);
      expect(validator([]).success).toBe(false);
      expect(validator(null).success).toBe(false);
    });
  });

  describe('array validator', () => {
    it('should validate array of items', () => {
      const validator = Validator.array(Validator.string());
      
      expect(validator(['a', 'b', 'c'])).toEqual({ 
        success: true, 
        data: ['a', 'b', 'c'] 
      });
    });

    it('should validate each array item', () => {
      const validator = Validator.array(Validator.number({ min: 0 }));
      
      const result = validator([1, -2, 3]);
      expect(result.success).toBe(false);
      expect(result.errors?.find(e => e.path === '[1]')?.code).toBe('MIN_VALUE');
    });

    it('should reject non-arrays', () => {
      const validator = Validator.array(Validator.string());
      
      expect(validator('not array').success).toBe(false);
      expect(validator({}).success).toBe(false);
    });
  });

  describe('optional validator', () => {
    it('should allow undefined values', () => {
      const validator = Validator.optional(Validator.string());
      
      expect(validator(undefined)).toEqual({ success: true, data: undefined });
      expect(validator('hello')).toEqual({ success: true, data: 'hello' });
    });

    it('should still validate non-undefined values', () => {
      const validator = Validator.optional(Validator.string({ minLength: 3 }));
      
      expect(validator('ab').success).toBe(false);
      expect(validator('abc')).toEqual({ success: true, data: 'abc' });
    });
  });

  describe('oneOf validator', () => {
    it('should accept any matching validator', () => {
      const validator = Validator.oneOf(
        Validator.string(),
        Validator.number()
      );
      
      expect(validator('hello')).toEqual({ success: true, data: 'hello' });
      expect(validator(123)).toEqual({ success: true, data: 123 });
    });

    it('should reject values that match no validator', () => {
      const validator = Validator.oneOf(
        Validator.string(),
        Validator.number()
      );
      
      const result = validator(true);
      expect(result.success).toBe(false);
      expect(result.errors?.[0].code).toBe('UNION_ERROR');
    });

    it('should return first successful match', () => {
      const validator = Validator.oneOf(
        Validator.string({ minLength: 10 }),
        Validator.string({ minLength: 3 })
      );
      
      // Should match second validator (minLength: 3)
      expect(validator('hello')).toEqual({ success: true, data: 'hello' });
    });
  });

  describe('complex nested validation', () => {
    it('should handle deeply nested objects', () => {
      const validator = Validator.object({
        user: Validator.object({
          profile: Validator.object({
            name: Validator.string({ minLength: 1 }),
            settings: Validator.object({
              theme: Validator.string({ enum: ['light', 'dark'] }),
              notifications: Validator.boolean()
            })
          })
        }),
        tags: Validator.array(Validator.string())
      });

      const valid = {
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        tags: ['work', 'important']
      };

      expect(validator(valid)).toEqual({ success: true, data: valid });
    });

    it('should provide detailed error paths for nested failures', () => {
      const validator = Validator.object({
        items: Validator.array(
          Validator.object({
            name: Validator.string({ minLength: 3 })
          })
        )
      });

      const result = validator({
        items: [
          { name: 'valid name' },
          { name: 'no' } // Too short
        ]
      });

      expect(result.success).toBe(false);
      expect(result.errors?.[0].path).toBe('items.[1].name');
      expect(result.errors?.[0].code).toBe('MIN_LENGTH');
    });
  });
});