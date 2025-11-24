// Export all services from a central location
export { default as authService } from './authService';
export { default as listingsService } from './listingsService';
export { default as dealershipService } from './dealershipService';
export { default as mechanicService } from './mechanicService';
export { default as inspectionService } from './inspectionService';
export { default as bookingService } from './bookingService';
export { default as chatService } from './chatService';
export { default as walletService } from './walletService';
export { default as feedbackService } from './feedbackService';
export { default as boostService } from './boostService';
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

// Listing types
export const LISTING_TYPES = {
  BUY: 'buy',
  RENT: 'rent',
  LEASE: 'lease',
};

// Vehicle conditions
export const VEHICLE_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
  CERTIFIED: 'certified',
  REFURBISHED: 'refurbished',
};

// Transmission types
export const TRANSMISSION_TYPES = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
};

// Fuel types
export const FUEL_TYPES = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
};

// Inspection types
export const INSPECTION_TYPES = {
  PRE_PURCHASE: 'pre_purchase',
  PRE_RENTAL: 'pre_rental',
  MAINTENANCE: 'maintenance',
  INSURANCE: 'insurance',
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Service categories
export const SERVICE_CATEGORIES = {
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  DIAGNOSTIC: 'diagnostic',
  EMERGENCY: 'emergency',
};

// Inspection status
export const INSPECTION_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SIGNED: 'signed',
  ARCHIVED: 'archived',
};

// Inspection condition ratings
export const CONDITION_RATINGS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
};

// Signature methods
export const SIGNATURE_METHODS = {
  DRAWN: 'drawn',
  TYPED: 'typed',
  UPLOADED: 'uploaded',
};

// Document template types
export const DOCUMENT_TEMPLATES = {
  STANDARD: 'standard',
  DETAILED: 'detailed',
  LEGAL: 'legal',
};

// Photo categories
export const PHOTO_CATEGORIES = {
  EXTERIOR_FRONT: 'exterior_front',
  EXTERIOR_REAR: 'exterior_rear',
  EXTERIOR_LEFT: 'exterior_left',
  EXTERIOR_RIGHT: 'exterior_right',
  INTERIOR_DASHBOARD: 'interior_dashboard',
  INTERIOR_SEATS: 'interior_seats',
  ENGINE_BAY: 'engine_bay',
  TRUNK: 'trunk',
  WHEELS: 'wheels',
  UNDERCARRIAGE: 'undercarriage',
  DAMAGE: 'damage',
  OTHER: 'other',
};