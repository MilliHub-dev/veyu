import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../../../services/authService';

describe('Business Profile Validation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Business Name Validation', () => {
    it('should validate business name is required for dealers', () => {
      const dealerUser = {
        id: '123',
        user_type: 'dealer',
        business_name: '',
        email: 'dealer@test.com'
      };
      
      // Set in storage location that authService checks
      localStorage.setItem('veyu_user_data', JSON.stringify(dealerUser));
      
      const isValid = authService.validateBusinessNameRequired();
      expect(isValid).toBe(false);
    });

    it('should validate business name is required for mechanics', () => {
      const mechanicUser = {
        id: '123',
        user_type: 'mechanic',
        business_name: '   ',
        email: 'mechanic@test.com'
      };
      
      // Set in storage location that authService checks
      localStorage.setItem('veyu_user_data', JSON.stringify(mechanicUser));
      
      const isValid = authService.validateBusinessNameRequired();
      expect(isValid).toBe(false);
    });

    it('should pass validation when business name is provided', () => {
      const businessUser = {
        id: '123',
        user_type: 'dealer',
        business_name: 'Test Business',
        email: 'business@test.com'
      };
      
      // Set in storage location that authService checks
      localStorage.setItem('veyu_user_data', JSON.stringify(businessUser));
      
      const isValid = authService.validateBusinessNameRequired();
      expect(isValid).toBe(true);
    });
  });
});