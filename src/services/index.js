// Export all services from a central location
export { default as authService } from './authService';
export { default as mechanicService } from './mechanicService';
export { default as bookingService } from './bookingService';
export { default as chatService } from './chatService';
export { default as walletService } from './walletService';
export { default as feedbackService } from './feedbackService';
export { apiClient, handleApiResponse, handleApiError } from './api';

// Service status constants
export const SERVICE_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Common API response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Booking status constants
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

// User types
export const USER_TYPES = {
  CUSTOMER: 'customer',
  MECHANIC: 'mechanic',
  DEALER: 'dealer',
  ADMIN: 'admin',
};

// Service types
export const SERVICE_TYPES = {
  REPAIR: 'repair',
  MAINTENANCE: 'maintenance',
  DIAGNOSTIC: 'diagnostic',
  EMERGENCY: 'emergency',
  INSPECTION: 'inspection',
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};