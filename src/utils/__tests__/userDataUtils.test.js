import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserDisplayName,
  getBusinessDisplayName,
  getUserEmail,
  getUserType,
  isBusinessUser,
  getUserPhone,
  getUserId,
  validateUserData,
  safeUserDataOperation
} from '../userDataUtils';

describe('User Data Utils - Graceful Handling', () => {
  beforeEach(() => {
    // Clear console warnings for clean test output
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  describe('getUserDisplayName', () => {
    it('should return full name when both first and last name exist', () => {
      const user = { first_name: 'John', last_name: 'Doe' };
      expect(getUserDisplayName(user)).toBe('John Doe');
    });

    it('should return first name only when last name is missing', () => {
      const user = { first_name: 'John' };
      expect(getUserDisplayName(user)).toBe('John');
    });

    it('should return email-based name when names are missing', () => {
      const user = { email: 'john.doe@example.com' };
      expect(getUserDisplayName(user)).toBe('John');
    });

    it('should return "User" when all data is missing', () => {
      expect(getUserDisplayName(null)).toBe('User');
      expect(getUserDisplayName({})).toBe('User');
      expect(getUserDisplayName(undefined)).toBe('User');
    });

    it('should handle invalid user data gracefully', () => {
      expect(getUserDisplayName('invalid')).toBe('User');
      expect(getUserDisplayName(123)).toBe('User');
    });
  });

  describe('getBusinessDisplayName', () => {
    it('should return business name when available', () => {
      const user = { business_name: 'Acme Corp' };
      expect(getBusinessDisplayName(user)).toBe('Acme Corp');
    });

    it('should trim business name when available', () => {
      const user = { business_name: '  Acme Corp  ' };
      expect(getBusinessDisplayName(user)).toBe('Acme Corp');
    });

    it('should return "Auto Shop Name Required" for mechanic without business name', () => {
      const user = { 
        first_name: 'John', 
        last_name: 'Doe', 
        user_type: 'mechanic' 
      };
      expect(getBusinessDisplayName(user)).toBe('Auto Shop Name Required');
    });

    it('should return "Business Name Required" for dealer without business name', () => {
      const user = { 
        first_name: 'John', 
        last_name: 'Doe', 
        user_type: 'dealer' 
      };
      expect(getBusinessDisplayName(user)).toBe('Business Name Required');
    });

    it('should return "Business Name Required" for missing data', () => {
      expect(getBusinessDisplayName(null)).toBe('Business Name Required');
      expect(getBusinessDisplayName({})).toBe('Business Name Required');
      expect(getBusinessDisplayName(undefined)).toBe('Business Name Required');
    });

    it('should return "Business Name Required" for empty business name', () => {
      const user = { business_name: '', user_type: 'dealer' };
      expect(getBusinessDisplayName(user)).toBe('Business Name Required');
    });

    it('should return "Business Name Required" for whitespace-only business name', () => {
      const user = { business_name: '   ', user_type: 'dealer' };
      expect(getBusinessDisplayName(user)).toBe('Business Name Required');
    });

    it('should handle invalid user data gracefully', () => {
      expect(getBusinessDisplayName('invalid')).toBe('Business Name Required');
      expect(getBusinessDisplayName(123)).toBe('Business Name Required');
    });
  });

  describe('getUserEmail', () => {
    it('should return email when available', () => {
      const user = { email: 'test@example.com' };
      expect(getUserEmail(user)).toBe('test@example.com');
    });

    it('should return "No email" when email is missing', () => {
      expect(getUserEmail({})).toBe('No email');
      expect(getUserEmail(null)).toBe('No email');
    });
  });

  describe('getUserType', () => {
    it('should return user type when available', () => {
      const user = { user_type: 'dealer' };
      expect(getUserType(user)).toBe('dealer');
    });

    it('should return "customer" as default', () => {
      expect(getUserType({})).toBe('customer');
      expect(getUserType(null)).toBe('customer');
    });
  });

  describe('isBusinessUser', () => {
    it('should return true for dealer', () => {
      const user = { user_type: 'dealer' };
      expect(isBusinessUser(user)).toBe(true);
    });

    it('should return true for mechanic', () => {
      const user = { user_type: 'mechanic' };
      expect(isBusinessUser(user)).toBe(true);
    });

    it('should return false for customer', () => {
      const user = { user_type: 'customer' };
      expect(isBusinessUser(user)).toBe(false);
    });

    it('should return false for missing data', () => {
      expect(isBusinessUser(null)).toBe(false);
      expect(isBusinessUser({})).toBe(false);
    });
  });

  describe('validateUserData', () => {
    it('should provide sensible defaults for missing data', () => {
      const result = validateUserData(null);
      expect(result).toEqual({
        id: null,
        email: '',
        first_name: '',
        last_name: '',
        user_type: 'customer',
        phone_number: '',
        business_name: '',
        email_verified: false,
        is_verified: false,
        business_profile_completed: false
      });
    });

    it('should preserve existing data and add defaults', () => {
      const user = { 
        id: 123, 
        email: 'test@example.com',
        custom_field: 'custom_value'
      };
      const result = validateUserData(user);
      
      expect(result.id).toBe(123);
      expect(result.email).toBe('test@example.com');
      expect(result.custom_field).toBe('custom_value');
      expect(result.user_type).toBe('customer'); // default
    });
  });

  describe('safeUserDataOperation', () => {
    it('should execute operation safely', () => {
      const user = { first_name: 'John' };
      const operation = (u) => u.first_name.toUpperCase();
      
      const result = safeUserDataOperation(operation, user, 'fallback');
      expect(result).toBe('JOHN');
    });

    it('should return fallback on error', () => {
      const user = { first_name: 'John' };
      const operation = (u) => { throw new Error('Test error'); }; // Will throw error
      
      const result = safeUserDataOperation(operation, user, 'fallback');
      expect(result).toBe('fallback');
    });

    it('should handle invalid operation gracefully', () => {
      const user = { first_name: 'John' };
      const result = safeUserDataOperation('not a function', user, 'fallback');
      expect(result).toBe('fallback');
    });
  });
});