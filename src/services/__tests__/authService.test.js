import { describe, it, expect, beforeEach, vi } from 'vitest';
import authService from '../authService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('AuthService - Business Profile Completion Status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('_enhanceUserWithCompletionStatus', () => {
    it('should set business_profile_completed to false for business users without the field', () => {
      const businessUser = {
        user_id: '123',
        email: 'test@example.com',
        user_type: 'dealer',
        first_name: 'John',
        last_name: 'Doe'
      };

      const enhanced = authService._enhanceUserWithCompletionStatus(businessUser);
      
      expect(enhanced.business_profile_completed).toBe(false);
      expect(enhanced.user_type).toBe('dealer');
    });

    it('should set business_profile_completed to true for customer users', () => {
      const customerUser = {
        user_id: '123',
        email: 'test@example.com',
        user_type: 'customer',
        first_name: 'John',
        last_name: 'Doe'
      };

      const enhanced = authService._enhanceUserWithCompletionStatus(customerUser);
      
      expect(enhanced.business_profile_completed).toBe(true);
      expect(enhanced.user_type).toBe('customer');
    });

    it('should not modify user data if business_profile_completed already exists', () => {
      const userWithStatus = {
        user_id: '123',
        email: 'test@example.com',
        user_type: 'mechanic',
        business_profile_completed: true
      };

      const enhanced = authService._enhanceUserWithCompletionStatus(userWithStatus);
      
      expect(enhanced.business_profile_completed).toBe(true);
      expect(enhanced).toEqual(userWithStatus);
    });
  });

  describe('isBusinessProfileComplete', () => {
    it('should return true for customer users', () => {
      const customerUser = {
        user_type: 'customer',
        business_profile_completed: true
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customerUser));
      
      expect(authService.isBusinessProfileComplete()).toBe(true);
    });

    it('should return false for business users with incomplete profile', () => {
      const businessUser = {
        user_type: 'dealer',
        business_profile_completed: false
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
      
      expect(authService.isBusinessProfileComplete()).toBe(false);
    });

    it('should return true for business users with complete profile', () => {
      const businessUser = {
        user_type: 'mechanic',
        business_profile_completed: true,
        email_verified: true  // Now uses email verification
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
      
      expect(authService.isBusinessProfileComplete()).toBe(true);
    });

    it('should return false when no user data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      expect(authService.isBusinessProfileComplete()).toBe(false);
    });
  });

  describe('needsBusinessProfileCompletion', () => {
    it('should return false for customer users', () => {
      const customerUser = {
        user_type: 'customer',
        business_profile_completed: true
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customerUser));
      
      expect(authService.needsBusinessProfileCompletion()).toBe(false);
    });

    it('should return true for business users with incomplete profile', () => {
      const businessUser = {
        user_type: 'dealer',
        business_profile_completed: false
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
      
      expect(authService.needsBusinessProfileCompletion()).toBe(true);
    });

    it('should return false for business users with complete profile', () => {
      const businessUser = {
        user_type: 'mechanic',
        business_profile_completed: true,
        email_verified: true  // Now uses email verification
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
      
      expect(authService.needsBusinessProfileCompletion()).toBe(false);
    });
  });

  describe('updateBusinessProfileCompletionStatus', () => {
    it('should update completion status and save to localStorage', () => {
      const user = {
        user_id: '123',
        user_type: 'dealer',
        business_profile_completed: false
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
      
      const updatedUser = authService.updateBusinessProfileCompletionStatus(true);
      
      expect(updatedUser.business_profile_completed).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'veyu_user_data',
        JSON.stringify({ ...user, business_profile_completed: true })
      );
    });

    it('should throw error when no user data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      expect(() => {
        authService.updateBusinessProfileCompletionStatus(true);
      }).toThrow('No user data found');
    });
  });

  describe('getBusinessProfileCompletionStatus', () => {
    it('should return correct status for business user with incomplete profile', () => {
      const businessUser = {
        user_type: 'dealer',
        business_profile_completed: false
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
      
      const status = authService.getBusinessProfileCompletionStatus();
      
      expect(status).toEqual({
        isBusinessUser: true,
        isComplete: false,
        needsCompletion: true,
        userType: 'dealer'
      });
    });

    it('should return correct status for customer user', () => {
      const customerUser = {
        user_type: 'customer',
        business_profile_completed: true
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customerUser));
      
      const status = authService.getBusinessProfileCompletionStatus();
      
      expect(status).toEqual({
        isBusinessUser: false,
        isComplete: true,
        needsCompletion: false,
        userType: 'customer'
      });
    });

    it('should return default status when no user data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const status = authService.getBusinessProfileCompletionStatus();
      
      expect(status).toEqual({
        isBusinessUser: false,
        isComplete: false,
        needsCompletion: false
      });
    });
  });

  // Email Verification Helper Methods Tests
  describe('Email Verification Helper Methods', () => {
    describe('isEmailVerified', () => {
      it('should return true when email_verified is true', () => {
        const user = {
          user_type: 'dealer',
          email_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(true);
      });

      it('should return true when is_verified is true', () => {
        const user = {
          user_type: 'mechanic',
          is_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(true);
      });

      it('should return true when both email_verified and is_verified are true', () => {
        const user = {
          user_type: 'dealer',
          email_verified: true,
          is_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(true);
      });

      it('should return false when email_verified is false', () => {
        const user = {
          user_type: 'dealer',
          email_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(false);
      });

      it('should return false when is_verified is false', () => {
        const user = {
          user_type: 'mechanic',
          is_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(false);
      });

      it('should return false when email verification fields are missing', () => {
        const user = {
          user_type: 'dealer'
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(false);
      });

      it('should return false when email verification fields are null', () => {
        const user = {
          user_type: 'dealer',
          email_verified: null,
          is_verified: null
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.isEmailVerified()).toBe(false);
      });

      it('should return false when no user data exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        expect(authService.isEmailVerified()).toBe(false);
      });
    });

    describe('needsBusinessProfileSetup', () => {
      it('should return true for dealer with unverified email', () => {
        const user = {
          user_type: 'dealer',
          email_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.needsBusinessProfileSetup()).toBe(true);
      });

      it('should return true for mechanic with unverified email', () => {
        const user = {
          user_type: 'mechanic',
          is_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.needsBusinessProfileSetup()).toBe(true);
      });

      it('should return false for dealer with verified email', () => {
        const user = {
          user_type: 'dealer',
          email_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.needsBusinessProfileSetup()).toBe(false);
      });

      it('should return false for mechanic with verified email', () => {
        const user = {
          user_type: 'mechanic',
          is_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.needsBusinessProfileSetup()).toBe(false);
      });

      it('should return false for customer users regardless of email verification', () => {
        const user = {
          user_type: 'customer',
          email_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.needsBusinessProfileSetup()).toBe(false);
      });

      it('should return false when no user data exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        expect(authService.needsBusinessProfileSetup()).toBe(false);
      });
    });

    describe('getPostLoginRedirectUrl', () => {
      it('should return /dashboard for dealer with verified email', () => {
        const user = {
          user_type: 'dealer',
          email: 'dealer@example.com',
          email_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getPostLoginRedirectUrl()).toBe('/dashboard');
      });

      it('should return /business-profile for dealer with unverified email', () => {
        const user = {
          user_type: 'dealer',
          email: 'dealer@example.com',
          email_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getPostLoginRedirectUrl()).toBe('/business-profile');
      });

      it('should return /dashboard for mechanic with verified email', () => {
        const user = {
          user_type: 'mechanic',
          email: 'mechanic@example.com',
          is_verified: true
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getPostLoginRedirectUrl()).toBe('/dashboard');
      });

      it('should return /business-profile for mechanic with unverified email', () => {
        const user = {
          user_type: 'mechanic',
          email: 'mechanic@example.com',
          is_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getPostLoginRedirectUrl()).toBe('/business-profile');
      });

      it('should return /home?user=email for customer users', () => {
        const user = {
          user_type: 'customer',
          email: 'customer@example.com',
          email_verified: false
        };
        
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getPostLoginRedirectUrl()).toBe('/home?user=customer@example.com');
      });

      it('should return /login when no user data exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        expect(authService.getPostLoginRedirectUrl()).toBe('/login');
      });
    });
  });

  // Business Name Validation Methods Tests
  describe('Business Name Validation Methods', () => {
    describe('validateBusinessNameRequired', () => {
      it('should return true for customer users', () => {
        const customerUser = { user_type: 'customer', email: 'customer@example.com' };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(customerUser));
        
        expect(authService.validateBusinessNameRequired()).toBe(true);
      });

      it('should return true for business users with business name', () => {
        const businessUser = { 
          user_type: 'dealer', 
          business_name: 'Test Business',
          email: 'dealer@example.com' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
        
        expect(authService.validateBusinessNameRequired()).toBe(true);
      });

      it('should return false for business users without business name', () => {
        const businessUser = { 
          user_type: 'dealer', 
          email: 'dealer@example.com' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
        
        expect(authService.validateBusinessNameRequired()).toBe(false);
      });

      it('should return false for business users with empty business name', () => {
        const businessUser = { 
          user_type: 'mechanic', 
          business_name: '   ',
          email: 'mechanic@example.com' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(businessUser));
        
        expect(authService.validateBusinessNameRequired()).toBe(false);
      });

      it('should return false when no user data exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        expect(authService.validateBusinessNameRequired()).toBe(false);
      });
    });

    describe('getBusinessName', () => {
      it('should return business name when it exists', () => {
        const user = { 
          business_name: '  Test Business  ',
          user_type: 'dealer' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getBusinessName()).toBe('Test Business');
      });

      it('should return null when business name is missing', () => {
        const user = { user_type: 'dealer' };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getBusinessName()).toBe(null);
      });

      it('should return null when business name is empty', () => {
        const user = { 
          business_name: '   ',
          user_type: 'dealer' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.getBusinessName()).toBe(null);
      });

      it('should return null when no user data exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        expect(authService.getBusinessName()).toBe(null);
      });
    });

    describe('updateBusinessName', () => {
      it('should update business name successfully', () => {
        const user = { 
          id: '123',
          user_type: 'dealer',
          business_name: 'Old Business' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        const result = authService.updateBusinessName('New Business');
        
        expect(result).toBe(true);
        // Verify that setItem was called twice (for both storage keys)
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'veyu-auth-user',
          expect.stringContaining('"business_name":"New Business"')
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'veyu_user_data',
          expect.stringContaining('"business_name":"New Business"')
        );
      });

      it('should trim whitespace from business name', () => {
        const user = { 
          id: '123',
          user_type: 'dealer',
          business_name: 'Old Business' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        const result = authService.updateBusinessName('  New Business  ');
        
        expect(result).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'veyu-auth-user',
          expect.stringContaining('"business_name":"New Business"')
        );
      });

      it('should return false for empty business name', () => {
        const user = { 
          id: '123',
          user_type: 'dealer',
          business_name: 'Old Business' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        const result = authService.updateBusinessName('   ');
        
        expect(result).toBe(false);
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      });

      it('should return false when no user data exists', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        const result = authService.updateBusinessName('New Business');
        
        expect(result).toBe(false);
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      });

      it('should return false for invalid business name types', () => {
        const user = { 
          id: '123',
          user_type: 'dealer',
          business_name: 'Old Business' 
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
        
        expect(authService.updateBusinessName(null)).toBe(false);
        expect(authService.updateBusinessName(undefined)).toBe(false);
        expect(authService.updateBusinessName(123)).toBe(false);
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      });
    });
  });
});