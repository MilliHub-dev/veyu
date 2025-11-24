import { 
  CloudUpload, 
  Building,
  Phone,
  Mail,
  Camera,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Plus,
  X,
  LogOut
} from "lucide-react";
import {
  Avatar,
  Box,
  Button,
  Container,
  InputGroup,
  VStack,
  Textarea,
  Tag,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  ButtonGroup,
  SimpleGrid,
  useColorModeValue,
  Text,
  Flex,
  Badge,
  Progress,
  InputLeftElement,
  Wrap,
  WrapItem,
  IconButton,
  useToast,
  PinInput,
  PinInputField
} from "@chakra-ui/react";
import { useContext, useRef, useState, useEffect } from "react";
import { GlobalStore } from "../../App";
import { SignupContext } from "./Signup";
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from "react-router-dom";

import authService from "../../services/authService";
import dealershipService from "../../services/dealershipService";
import { TokenManager } from "../../services/api";
import { formatErrorForUser, createErrorNotification, handleValidationErrors, logError } from '../../utils/errorHandling';
import { getUserDisplayName, getBusinessDisplayName, getUserEmail, getUserPhone } from "../../utils/userDataUtils";

const MotionBox = motion(Box);
const MotionCard = motion(Box);

function BusinessProfile({ onSubmit, ...props }) {
  const { payload } = useContext(SignupContext);
  const { onAuthenticated, axios, logout, notify } = useContext(GlobalStore);
  const [logoPreview, setLogoPreview] = useState('');
  const [params] = useSearchParams();
  const user_type = params.get('user_type') || 'dealer';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Handle logout with confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      'Are you sure you want to logout? Any unsaved changes to your business profile will be lost.'
    );
    
    if (confirmLogout) {
      logout();
    }
  };
  
  const [businessProfile, setBusinessProfile] = useState({
    logo: null,
    business_name: '',
    services: [],
    business_type: 'business',
    about: '',
    headline: '',
    contact_phone: '',
    contact_email: '',
  });

  const mechServices = [
    'Oil Change',
    'Paint Job',
    'Body Work',
    'Engine Repair',
    'Brake Service',
    'Tire Service',
    'AC Repair',
    'Electrical Work',
    'Transmission Repair',
    'Suspension Work',
    'Exhaust System',
    'Battery Service'
  ];

  const dealerServices = [
    'Car Leasing',
    'Car Sale',
    'Car Rental',
    'Drivers',
    'Vehicle Financing',
    'Trade-In Services',
    'Vehicle Inspection',
    'Extended Warranty',
    'Vehicle Insurance',
    'Vehicle Maintenance',
    'Parts & Accessories',
    'Vehicle Delivery',
    'Test Drive Services',
    'Vehicle Registration',
    'Export Services',
    'Aircraft Sales & Leasing',
    'Boat Sales & Leasing',
    'UAV/Drone Sales',
    'Motorbike Sales & Leasing',
  ];

  const servicesOffered = user_type === 'mechanic' ? mechServices : dealerServices;
  const imageRef = useRef();
  const redirect = useNavigate();

  const bgGradient = useColorModeValue(
    'linear(to-br, orange.50, yellow.50, red.50)',
    'linear(to-br, gray.900, orange.900, yellow.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Helper function to get business name from user data with graceful handling
  const getBusinessName = () => {
    try {
      const user = authService.getCurrentUser();
      return getBusinessDisplayName(user);
    } catch (error) {
      console.error('❌ Error getting business name:', error);
      return 'Your Business Name';
    }
  };

  // Helper function to fetch business profile data from API
  const fetchBusinessProfileData = async () => {
    try {
      console.log('🔄 Fetching business profile data from API...');
      const profileData = await dealershipService.getSettings();
      
      if (profileData) {
        console.log('✅ Business profile data fetched:', {
          hasBusinessName: !!profileData.business_name,
          businessName: profileData.business_name,
          hasServices: !!profileData.services?.length
        });
        
        // Update the business profile state with fetched data
        setBusinessProfile(prev => ({
          ...prev,
          business_name: profileData.business_name || prev.business_name,
          headline: profileData.headline || prev.headline,
          about: profileData.about || prev.about,
          contact_phone: profileData.contact_phone || prev.contact_phone,
          contact_email: profileData.contact_email || prev.contact_email,
          services: profileData.services || prev.services,
          business_type: profileData.business_type || prev.business_type
        }));
        
        // Update user data in localStorage with the business name from API
        if (profileData.business_name) {
          const user = authService.getCurrentUser();
          if (user && !user.business_name) {
            const updatedUser = { ...user, business_name: profileData.business_name };
            localStorage.setItem('veyu_user_data', JSON.stringify(updatedUser));
            localStorage.setItem('veyu-auth-user', JSON.stringify(updatedUser));
            console.log('✅ Updated localStorage with business name from API');
          }
        }
        
        return profileData;
      }
    } catch (error) {
      console.error('❌ Error fetching business profile data:', error);
      // Don't throw error - component can still work with user data from localStorage
      return null;
    }
  };

  // Helper function to check if business name is missing and prompt user
  const checkAndPromptForBusinessName = () => {
    try {
      const user = authService.getCurrentUser();
      const businessName = authService.getBusinessName();
      
      if (!businessName) {
        const userType = user?.user_type || 'business';
        const nameType = userType === 'mechanic' ? 'auto shop name' : 'business name';
        
        toast({
          title: 'Business Name Required',
          description: `Please enter your ${nameType} to complete your profile setup.`,
          status: 'warning',
          duration: 6000,
          isClosable: true,
          position: 'top',
        });
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error checking business name:', error);
      return false;
    }
  };

  // Helper function to ensure authentication and handle token refresh
  const ensureAuthentication = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // For initial component load, just check if token exists
      // Only make API call to verify token during actual form submission
      console.log('✅ Authentication token found, proceeding...');
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      toast({
        title: 'Authentication Error',
        description: 'Session expired. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login', { 
        state: { 
          message: 'Session expired during profile setup. Please log in again.',
          returnTo: '/business-profile'
        }
      });
      return false;
    }
  };

  // Helper function to verify authentication before form submission
  // Note: We don't need to make an API call here since the actual profile submission
  // will handle token refresh automatically via the API interceptor
  const verifyAuthenticationWithAPI = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        console.error('No authentication token found');
        toast({
          title: 'Authentication Required',
          description: 'Please log in to continue.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login', { 
          state: { 
            message: 'Please log in to set up your business profile.',
            returnTo: '/business-profile'
          }
        });
        return false;
      }

      // Token exists, proceed with submission
      // If the token is expired, the API interceptor will automatically refresh it
      // during the actual profile submission API call
      console.log('✅ Authentication token verified, proceeding with submission');
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      toast({
        title: 'Authentication Error',
        description: 'Unable to verify authentication. Please try logging in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login', { 
        state: { 
          message: 'Authentication error. Please log in again.',
          returnTo: '/business-profile'
        }
      });
      return false;
    }
  };

  // Initialize business profile with existing user data and verify authentication
  useEffect(() => {
    const initializeBusinessProfile = async () => {
      try {
        // Basic authentication check - just verify token exists
        const isAuthenticated = await ensureAuthentication();
        if (!isAuthenticated) {
          return; // Authentication failed, user will be redirected
        }

        // Get current user data using authService for consistency with graceful handling
        const user = authService.getCurrentUser();
        
        if (user) {
          console.log('Initializing business profile with user data:', {
            userId: user.id,
            userType: user.user_type,
            hasEmail: !!user.email,
            hasPhone: !!user.phone_number,
            hasBusinessName: !!user.business_name
          });
          
          // Pre-populate with user data from localStorage
          setBusinessProfile(prev => ({
            ...prev,
            business_name: user.business_name || prev.business_name,
            contact_email: getUserEmail(user) !== 'No email' ? getUserEmail(user) : prev.contact_email,
            contact_phone: getUserPhone(user) || prev.contact_phone,
          }));

          // Fetch complete business profile data from API (includes business name from DB)
          const profileData = await fetchBusinessProfileData();
          
          // Check for missing business name after fetching from API
          setTimeout(() => {
            checkAndPromptForBusinessName();
          }, 1000); // Delay to allow component to render first
        } else {
          // Handle missing user data gracefully
          console.warn('⚠️ No user data found during business profile initialization');
          toast({
            title: 'Authentication Required',
            description: 'Please log in to set up your business profile.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/login', { 
            state: { 
              message: 'Please log in to set up your business profile.',
              returnTo: '/business-profile'
            }
          });
        }
      } catch (error) {
        console.error('Error initializing business profile:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize profile setup. Please try logging in again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login', { 
          state: { 
            message: 'Failed to initialize profile setup. Please try logging in again.',
            returnTo: '/business-profile'
          }
        });
      }
    };
    
    initializeBusinessProfile();
  }, []); // Run only once on component mount

  // Update completion progress when businessProfile changes
  useEffect(() => {
    setCompletionProgress(calculateCompletion(businessProfile));
  }, [businessProfile]);

  // Note: Auto-submit removed since email verification is now optional
  // Users can manually submit the form regardless of email verification status

  // Calculate form completion percentage
  const calculateCompletion = (profile) => {
    let completedFields = 0;
    const requiredFields = [
      // Removed 'business_name' since it's collected during signup
      // Removed 'location' since it will be set from settings page later
      'business_type',
      'contact_phone',
      'contact_email',
      'services',
      'headline'
    ];

    requiredFields.forEach(field => {
      if (field === 'services' && profile[field]?.length > 0) {
        completedFields++;
      } else if (profile[field]) {
        completedFields++;
      }
    });

    // Add logo as optional but recommended
    if (profile.logo) completedFields += 0.5;
    if (profile.about) completedFields += 0.5;

    return Math.min(100, Math.round((completedFields / requiredFields.length) * 100));
  };

  // Send verification email with enhanced authentication handling
  const sendVerificationEmail = async (email) => {
    try {
      // Use authService for consistent authentication handling with automatic token refresh
      const response = await authService.resendEmailVerification(email);
      toast({
        title: 'Verification Email Sent',
        description: `We've sent a verification code to ${email}. Please check your inbox.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      // Note: 401 errors are automatically handled by the API interceptor
      // Enhanced email verification error handling
      console.error('🚨 Email Verification Error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        email: email
      });

      let errorMessage = 'Failed to send verification email';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data?.email) {
            errorMessage = Array.isArray(data.email) 
              ? `Email error: ${data.email.join(', ')}`
              : `Email error: ${data.email}`;
          } else if (data?.message) {
            errorMessage = data.message;
          } else {
            errorMessage = 'Invalid email address. Please check and try again.';
          }
        } else if (status === 429) {
          errorMessage = 'Too many verification requests. Please wait a few minutes before trying again.';
        } else if (status >= 500) {
          errorMessage = 'Server error while sending verification email. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout while sending verification email. Please try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error while sending verification email. Please check your connection.';
      }
      
      // Check if the error is because email is already verified
      if (errorMessage.includes('already verified') || error.response?.data?.error_code === 'already_verified') {
        console.log('Email already verified, no need to send verification email');
        // Don't show error toast for already verified emails
        throw new Error('already verified');
      }
      
      // For other errors, show user-friendly error message with retry option
      toast({
        title: 'Email Verification Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top',
        action: (
          <Button
            size="sm"
            colorScheme="orange"
            onClick={() => sendVerificationEmail(email)}
          >
            Retry
          </Button>
        ),
      });
      throw new Error(errorMessage);
    }
  };

  // Verify email with code with enhanced authentication handling
  const verifyEmailCode = async (email, code) => {
    try {
      // Use authService for consistent authentication handling with automatic token refresh
      const response = await authService.verifyEmail(email, code);
      return response.verified === true || response.success === true;
    } catch (error) {
      // Note: 401 errors are automatically handled by the API interceptor
      // Enhanced email code verification error handling
      console.error('🚨 Email Code Verification Error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        email: email,
        code: code ? '***' + code.slice(-2) : 'not provided'
      });

      let errorMessage = 'Invalid verification code';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data?.code) {
            errorMessage = Array.isArray(data.code) 
              ? `Code error: ${data.code.join(', ')}`
              : `Code error: ${data.code}`;
          } else if (data?.email) {
            errorMessage = 'Email address is invalid or not found.';
          } else if (data?.message) {
            errorMessage = data.message;
          } else if (data?.detail) {
            errorMessage = data.detail;
          } else {
            errorMessage = 'Invalid verification code. Please check and try again.';
          }
        } else if (status === 404) {
          errorMessage = 'Verification code not found or expired. Please request a new code.';
        } else if (status === 429) {
          errorMessage = 'Too many verification attempts. Please wait before trying again.';
        } else if (status >= 500) {
          errorMessage = 'Server error during verification. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout during verification. Please try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error during verification. Please check your connection.';
      }

      // Show user-friendly error message
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        status: 'error',
        duration: 6000,
        isClosable: true,
        position: 'top',
        action: (
          <Button
            size="sm"
            colorScheme="orange"
            onClick={() => {
              // Clear the verification code and allow retry
              setVerificationCode('');
              const firstInput = document.querySelector('[data-index="0"]');
              if (firstInput) firstInput.focus();
            }}
          >
            Try Again
          </Button>
        ),
      });

      return false;
    }
  };

  // Helper function to update business profile values
  const changeValue = (field, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to add a service
  const addService = (service) => {
    if (!businessProfile.services.includes(service)) {
      setBusinessProfile(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
  };

  // Helper function to remove a service
  const removeService = (service) => {
    setBusinessProfile(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  // Business profile setup function
  const setupBusinessProfile = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Verify authentication with API call before form submission
      const isAuthenticated = await verifyAuthenticationWithAPI();
      if (!isAuthenticated) {
        return; // Authentication failed, user will be redirected
      }
      
      // Check if email needs verification - skip if already verified
      const user = authService.getCurrentUser();
      const isEmailAlreadyVerified = user?.email_verified || user?.is_verified;
      
      console.log('Email verification status check:', {
        user_email: user?.email,
        email_verified: user?.email_verified,
        is_verified: user?.is_verified,
        isEmailAlreadyVerified,
        contact_email: businessProfile.contact_email,
        emailVerificationSent
      });
      
      // Skip email verification entirely if email is already verified during signup
      if (isEmailAlreadyVerified) {
        console.log('✅ Email already verified during signup, skipping verification step');
      } else {
        console.log('⚠️ Email not verified, but continuing with profile submission (verification is optional)');
        // Note: Email verification is now optional and won't block profile submission
        // Users can verify their email later if needed
      }
      
      // Optional email verification with code - if code is provided, attempt verification
      // but don't block submission if verification fails
      if (verificationCode) {
        setIsVerifying(true);
        try {
          const verified = await verifyEmailCode(businessProfile.contact_email, verificationCode);
          if (verified) {
            console.log('Email verification successful');
          } else {
            console.log('Email verification failed, but continuing with profile submission');
          }
        } catch (error) {
          console.log('Email verification error, but continuing with profile submission:', error.message);
        } finally {
          setIsVerifying(false);
        }
      }
      
      // Get current user data - authentication already verified above
      const authUser = JSON.parse(localStorage.getItem('veyu-auth-user'));
      if (!authUser) {
        console.error('No user data found during profile setup');
        // Re-check authentication if user data is missing
        const isAuthenticated = await verifyAuthenticationWithAPI();
        if (!isAuthenticated) {
          return; // Authentication failed, user will be redirected
        }
        
        // Try to get user data again after authentication check
        const refreshedAuthUser = JSON.parse(localStorage.getItem('veyu-auth-user'));
        if (!refreshedAuthUser) {
          toast({
            title: 'Authentication Error',
            description: 'Unable to retrieve user data. Please log in again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/login', { 
            state: { 
              message: 'Unable to retrieve user data. Please log in again.',
              returnTo: '/business-profile'
            }
          });
          return;
        }
      }
      
      // Prepare business profile data
      // Use FormData if logo is included, otherwise use JSON
      let profileData;
      let headers = {};
      
      // Always use JSON format for now to avoid FormData issues with arrays
      // Get business name from user data or fetched profile data
      const currentUser = authService.getCurrentUser();
      const businessName = currentUser?.business_name || businessProfile.business_name;
      
      // Determine core service flags based on selected services
      // This matches the API's expected format with boolean flags
      const coreServices = {
        offers_purchase: businessProfile.services.some(s => 
          ['Car Sale', 'Car Sales', 'Vehicle Sales'].includes(s)
        ),
        offers_rental: businessProfile.services.some(s => 
          ['Car Rental', 'Car Leasing', 'Vehicle Rental', 'Vehicle Leasing'].includes(s)
        ),
        offers_drivers: businessProfile.services.some(s => 
          ['Drivers', 'Driver Services', 'Chauffeur Services'].includes(s)
        ),
        offers_trade_in: businessProfile.services.some(s => 
          ['Trade-In Services', 'Trade In', 'Vehicle Trade-In'].includes(s)
        )
      };
      
      profileData = {
        business_name: businessName,
        headline: businessProfile.headline,
        about: businessProfile.about || '',
        contact_phone: businessProfile.contact_phone,
        contact_email: businessProfile.contact_email,
        services: businessProfile.services,
        // Add core service boolean flags required by API
        offers_purchase: coreServices.offers_purchase,
        offers_rental: coreServices.offers_rental,
        offers_drivers: coreServices.offers_drivers,
        offers_trade_in: coreServices.offers_trade_in,
        // Location will be set from settings page later
      };
      
      // TODO: Handle logo upload separately if needed
      if (businessProfile.logo) {
        console.log('Logo upload will be handled separately - using JSON for now');
      }
      
      // Debug current form state
      console.log('Current businessProfile state:', {
        business_name: businessName, // Using business name from user data
        contact_phone: businessProfile.contact_phone,
        contact_email: businessProfile.contact_email,
        services: businessProfile.services,
        headline: businessProfile.headline,
        servicesLength: businessProfile.services?.length,
        coreServices: {
          offers_purchase: businessProfile.services.some(s => 
            ['Car Sale', 'Car Sales', 'Vehicle Sales'].includes(s)
          ),
          offers_rental: businessProfile.services.some(s => 
            ['Car Rental', 'Car Leasing', 'Vehicle Rental', 'Vehicle Leasing'].includes(s)
          ),
          offers_drivers: businessProfile.services.some(s => 
            ['Drivers', 'Driver Services', 'Chauffeur Services'].includes(s)
          ),
          offers_trade_in: businessProfile.services.some(s => 
            ['Trade-In Services', 'Trade In', 'Vehicle Trade-In'].includes(s)
          )
        }
      });
      
      // Validate required fields before submission
      const validationErrors = [];
      
      // Validate business name is present (should be from signup, but check anyway)
      if (!businessName || !businessName.trim()) {
        const userType = currentUser?.user_type || 'business';
        const nameType = userType === 'mechanic' ? 'Auto shop name' : 'Business name';
        validationErrors.push(`${nameType} is required. Please complete your signup process.`);
      }
      
      if (!businessProfile.contact_phone?.trim()) {
        validationErrors.push('Contact phone is required');
      } else {
        // Validate phone number format - must start with + and country code
        const phoneRegex = /^\+\d{1,4}\d{7,15}$/;
        if (!phoneRegex.test(businessProfile.contact_phone.replace(/[\s\-\(\)]/g, ''))) {
          validationErrors.push('Phone number must include country code (e.g., +234 for Nigeria, +1 for US)');
        }
      }
      
      if (!businessProfile.contact_email?.trim()) {
        validationErrors.push('Contact email is required');
      }
      
      if (!businessProfile.services || businessProfile.services.length === 0) {
        validationErrors.push('At least one service is required');
      }
      
      if (validationErrors.length > 0) {
        // Use the enhanced validation error handling utility
        const validationConfig = handleValidationErrors(validationErrors, {
          'business name': 'input[placeholder*="business"]',
          'headline': 'input[placeholder*="headline"]'
        });

        toast({
          ...validationConfig,
          action: (
            <Button
              size="sm"
              colorScheme="orange"
              onClick={validationConfig.action.onClick}
            >
              {validationConfig.action.label}
            </Button>
          ),
        });
        return;
      }
      
      console.log('Creating business profile...');
      console.log('Profile data being sent:', {
        hasLogo: !!businessProfile.logo,
        business_name: businessName, // Using business name from user data
        contact_phone: businessProfile.contact_phone,
        contact_email: businessProfile.contact_email,
        services: businessProfile.services,
        servicesCount: businessProfile.services?.length || 0,
        offers_purchase: profileData.offers_purchase,
        offers_rental: profileData.offers_rental,
        offers_drivers: profileData.offers_drivers,
        offers_trade_in: profileData.offers_trade_in,
        headers: headers
      });
      
      // Debug FormData contents if using FormData
      if (businessProfile.logo && profileData instanceof FormData) {
        console.log('FormData contents:');
        for (let [key, value] of profileData.entries()) {
          console.log(`${key}:`, value);
        }
      }
      
      // Submit to the correct endpoint for creating dealership/mechanic profile
      // Use dealershipService for consistent authentication handling with automatic token refresh
      // This ensures all API requests include valid authentication headers and proper error handling
      console.log('🔄 Submitting business profile using dealershipService...');
      const data = await dealershipService.updateSettings(profileData);
      
      console.log('✅ Business profile submission successful:', data);

      if (data) {
        toast({
          title: 'Success!',
          description: 'Business profile created successfully! Welcome to Veyu!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Get current user from authService to ensure we have the latest data
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          throw new Error('Unable to retrieve current user data');
        }
        
        // Create updated user data with business profile completion and email verification
        const verifiedUser = {
          ...currentUser,
          business_name: businessName, // Using business name from user data
          headline: businessProfile.headline,
          business_profile_completed: true, // Mark business profile as completed
          email_verified: true, // Mark email as verified since profile is complete
          is_verified: true, // Alternative verification field
        };
        
        // Update both storage locations FIRST before calling onAuthenticated
        // veyu_user_data stores just the user object
        localStorage.setItem('veyu_user_data', JSON.stringify(verifiedUser));
        
        // veyu-auth-user stores the full auth structure with user nested inside
        const authData = {
          user: verifiedUser,
          tokens: {
            access: authService.getAccessToken(),
            refresh: TokenManager.getRefreshToken()
          }
        };
        localStorage.setItem('veyu-auth-user', JSON.stringify(authData));
        console.log('✅ Updated user data in localStorage with email verification status');
        
        // Update business profile completion status using authService
        authService.updateBusinessProfileCompletionStatus(true);
        
        // Update the GlobalStore's authUser state to reflect the changes
        // This ensures the routing logic uses the updated user data
        // IMPORTANT: Call onAuthenticated AFTER updating localStorage
        // Flatten user properties to top level for backward compatibility with routing
        onAuthenticated({
          ...verifiedUser, // Spread user properties at top level for authUser.user_type access
          user: verifiedUser, // Also keep nested for consistency
          tokens: {
            access: authService.getAccessToken(),
            refresh: TokenManager.getRefreshToken()
          }
        });
        console.log('✅ Updated GlobalStore authUser state');
        
        // Use the correct redirect logic based on user type
        const userType = verifiedUser.user_type;
        let redirectUrl = '/dashboard'; // Default for business users
        
        if (userType === 'dealer' || userType === 'mechanic') {
          // Business users with verified email go to dashboard
          redirectUrl = '/dashboard';
        } else {
          // Customer users go to home
          redirectUrl = `/home?user=${verifiedUser.email}`;
        }
        
        console.log('🔄 Redirecting after profile completion:', {
          userType,
          emailVerified: true,
          businessProfileCompleted: true,
          redirectUrl,
          verifiedUser
        });
        
        // Debug: Check what's in localStorage before redirect
        console.log('📦 LocalStorage before redirect:', {
          veyu_user_data: localStorage.getItem('veyu_user_data'),
          'veyu-auth-user': localStorage.getItem('veyu-auth-user')
        });
        
        // Force a page reload to ensure App.jsx re-evaluates routing with updated state
        // This prevents the BusinessProfileGuard from using stale state
        setTimeout(() => {
          console.log('🚀 Executing redirect to:', redirectUrl);
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to set up business profile');
      }
    } catch (error) {
      // Note: 401 errors are automatically handled by the API interceptor
      // which will refresh the token and retry the request
      // Only handle other error types here

      // Enhanced error handling with detailed logging and user-friendly messages
      console.error('🚨 Business Profile Setup Error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        formData: {
          business_name: businessName,
          contact_phone: businessProfile.contact_phone,
          contact_email: businessProfile.contact_email,
          services_count: businessProfile.services?.length || 0
        },
        timestamp: new Date().toISOString()
      });

      let errorTitle = 'Profile Setup Failed';
      let errorMessage = 'Something went wrong while setting up your profile. Please try again.';
      let isRetryable = true;

      // Handle specific error types with user-friendly messages
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorTitle = 'Connection Timeout';
        errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
        isRetryable = true;
      } else if (error.message.includes('Network Error')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to our servers. Please check your internet connection and try again.';
        isRetryable = true;
      } else if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          errorTitle = 'Invalid Information';
          
          // Handle specific field validation errors
          if (data?.contact_phone) {
            errorMessage = Array.isArray(data.contact_phone) 
              ? `Phone number error: ${data.contact_phone.join(', ')}`
              : `Phone number error: ${data.contact_phone}`;
          } else if (data?.contact_email) {
            errorMessage = Array.isArray(data.contact_email)
              ? `Email error: ${data.contact_email.join(', ')}`
              : `Email error: ${data.contact_email}`;
          } else if (data?.services) {
            errorMessage = 'Please select at least one service that you offer.';
          } else if (data?.business_name) {
            errorMessage = Array.isArray(data.business_name)
              ? `Business name error: ${data.business_name.join(', ')}`
              : `Business name error: ${data.business_name}`;
          } else if (data?.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors)
              ? data.non_field_errors.join(' ')
              : data.non_field_errors;
          } else if (data?.message) {
            errorMessage = data.message;
          } else if (data?.detail) {
            errorMessage = data.detail;
          } else {
            errorMessage = 'Please check your information and try again.';
          }
          isRetryable = true;
        } else if (status === 409) {
          errorTitle = 'Duplicate Information';
          errorMessage = 'A business with this information already exists. Please check your details.';
          isRetryable = true;
        } else if (status === 413) {
          errorTitle = 'File Too Large';
          errorMessage = 'Your business logo is too large. Please choose a smaller image (max 2MB).';
          isRetryable = true;
        } else if (status === 422) {
          errorTitle = 'Invalid Data';
          errorMessage = 'Some of your information is invalid. Please review and correct it.';
          isRetryable = true;
        } else if (status >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Our servers are experiencing issues. Please try again in a few minutes.';
          isRetryable = true;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      }

      // Show error toast with retry option for retryable errors
      const toastConfig = {
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: isRetryable ? 8000 : 6000,
        isClosable: true,
        position: 'top'
      };

      if (isRetryable) {
        toastConfig.action = (
          <Button
            size="sm"
            colorScheme="orange"
            onClick={() => {
              // Clear error state and allow retry
              setIsSubmitting(false);
              setEmailVerificationSent(false);
              setVerificationCode('');
              // Retry the submission
              handleSubmit(new Event('submit'));
            }}
          >
            Try Again
          </Button>
        );
      }

      toast(toastConfig);
    } finally {
      setIsSubmitting(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Render email verification form if verification is in progress
  if (emailVerificationSent) {
    return (
      <Box bg={bgGradient} minH="100vh" display="flex" alignItems="center" py={8}>
        <Container maxW="md">
          <MotionCard
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            shadow="2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} textAlign="center">
              <Box p={4} bg="green.100" borderRadius="full">
                <Mail size={40} color="#38A169" />
              </Box>
              
              <Heading size="lg">Verify Your Email (Optional)</Heading>
              
              <Text color={textColor}>
                We've sent a verification code to <strong>{businessProfile.contact_email}</strong>.
                You can verify your email now or skip this step and complete your profile setup.
              </Text>
              
              <VStack spacing={4} w="full">
                <PinInput
                  otp
                  size="lg"
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
                  autoFocus
                  isDisabled={isVerifying}
                >
                  {[...Array(6)].map((_, i) => (
                    <PinInputField 
                      key={i} 
                      borderColor={borderColor}
                      _focus={{
                        borderColor: '#F4A950',
                        boxShadow: '0 0 0 1px #F4A950'
                      }}
                      _hover={{ borderColor: 'orange.300' }}
                    />
                  ))}
                </PinInput>
                
                <HStack spacing={4} w="full">
                  {isVerifying ? (
                    <Button
                      isLoading
                      loadingText="Verifying..."
                      colorScheme="orange"
                      size="lg"
                      flex={1}
                    />
                  ) : (
                    <>
                      <Button
                        colorScheme="orange"
                        size="lg"
                        flex={1}
                        onClick={() => handleSubmit(new Event('submit'))}
                        isDisabled={verificationCode.length !== 6}
                        _disabled={{
                          opacity: 0.7,
                          cursor: 'not-allowed',
                          _hover: { bg: 'orange.500' }
                        }}
                      >
                        Verify & Continue
                      </Button>
                      <Button
                        variant="outline"
                        colorScheme="gray"
                        size="lg"
                        flex={1}
                        onClick={() => {
                          // Skip verification and continue with profile submission
                          setEmailVerificationSent(false);
                          setVerificationCode('');
                          handleSubmit(new Event('submit'));
                        }}
                      >
                        Skip & Continue
                      </Button>
                    </>
                  )}
                </HStack>
                
                <HStack justify="center" mt={4}>
                  <Text color={textColor}>Didn't receive a code?</Text>
                  <Button 
                    variant="link" 
                    color="#F4A950"
                    onClick={() => sendVerificationEmail(businessProfile.contact_email)}
                    isDisabled={isVerifying}
                  >
                    Resend Code
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </MotionCard>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgGradient} minH="100vh" py={8}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <MotionBox variants={itemVariants} textAlign="center" mb={8} position="relative">
            {/* Logout Button */}
            <Box position="absolute" top={0} right={0}>
              <Button
                variant="ghost"
                colorScheme="gray"
                size="sm"
                leftIcon={<LogOut size={16} />}
                onClick={handleLogout}
                _hover={{ 
                  bg: 'gray.100',
                  transform: 'translateY(-1px)'
                }}
                transition="all 0.2s"
              >
                Logout
              </Button>
            </Box>

            <Image 
              src="/assets/images/logo-main.png" 
              alt="Veyu Logo" 
              mx="auto" 
              width="150px" 
              mb={4}
            />
            <Heading size="xl" color="gray.800" mb={2}>
              Set Up Your Business Profile
            </Heading>
            <Text fontSize="lg" color={textColor}>
              Tell us about your {user_type === 'dealer' ? 'dealership' : 'mechanic shop'} to get started
            </Text>
          </MotionBox>

          {/* Progress Bar */}
          <MotionBox variants={itemVariants} mb={8}>
            <Box maxW="2xl" mx="auto">
              <VStack spacing={2}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color={textColor}>Profile Completion</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="#F4A950">
                    {Math.round(completionProgress)}%
                  </Text>
                </HStack>
                <Progress 
                  value={completionProgress} 
                  colorScheme="orange" 
                  size="lg" 
                  borderRadius="full"
                  w="full"
                  bg="gray.200"
                  sx={{
                    '& > div': {
                      bg: '#F4A950'
                    }
                  }}
                />
              </VStack>
            </Box>
          </MotionBox>

          <form id="profileForm" method="post" onSubmit={setupBusinessProfile} encType="multipart/form-data">
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} alignItems="start">
              {/* Main Form Content */}
              <VStack spacing={8} align="stretch" gridColumn={{ base: 1, lg: 'span 2' }}>
                
                {/* Business Logo & Basic Info */}
                <MotionBox variants={itemVariants}>
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="2xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack spacing={6} align="stretch">
                      <HStack spacing={3} mb={4}>
                        <Icon as={Building} boxSize={6} color="#F4A950" />
                        <Heading size="md" color="gray.800">Business Information</Heading>
                      </HStack>

                      {/* Logo Upload */}
                      <VStack spacing={4}>
                        <Box position="relative">
                          <Avatar
                            size="2xl"
                            src={logoPreview}
                            name={getBusinessName()}
                            bg="orange.100"
                            color="#F4A950"
                            border="4px solid"
                            borderColor="orange.200"
                          />
                          <Box
                            position="absolute"
                            bottom={0}
                            right={0}
                            bg="#F4A950"
                            borderRadius="full"
                            p={2}
                            cursor="pointer"
                            onClick={() => imageRef.current.click()}
                            _hover={{ bg: 'orange.600' }}
                            transition="all 0.2s"
                          >
                            <Camera size={16} color="white" />
                          </Box>
                        </Box>

                        <Button
                          onClick={() => imageRef.current.click()}
                          variant="outline"
                          colorScheme="orange"
                          leftIcon={<CloudUpload size={20} />}
                          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                          transition="all 0.2s"
                          borderColor="#F4A950"
                          color="#F4A950"
                          _active={{ bg: '#F4A950', color: 'white' }}
                        >
                          Upload Business Logo
                        </Button>
                        
                        <Input
                          hidden
                          ref={imageRef}
                          type="file"
                          accept="image/*"
                          name="logo"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            changeValue('logo', file);
                            if (file) setLogoPreview(URL.createObjectURL(file));
                          }}
                        />
                        
                        <Text fontSize="xs" color={textColor} textAlign="center">
                          Recommended: Square image, max 2MB (JPG, PNG)
                        </Text>
                      </VStack>

                      {/* Business Name - Display from signup */}
                      <FormControl>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          {user_type === 'mechanic' ? 'Auto Shop Name' : 'Business Name'}
                        </FormLabel>
                        <Input
                          value={businessProfile.business_name || getBusinessName()}
                          isReadOnly
                          size="lg"
                          bg="gray.100"
                          border="2px solid"
                          borderColor={borderColor}
                          color="gray.600"
                          cursor="not-allowed"
                          _hover={{ borderColor: 'gray.300' }}
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Business name was set during signup. Contact support to change it.
                        </Text>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Business Headline
                        </FormLabel>
                        <Input
                          value={businessProfile.headline}
                          onChange={(e) => changeValue('headline', e.target.value)}
                          placeholder="Your business motto or tagline"
                          size="lg"
                          bg="gray.50"
                          border="2px solid"
                          borderColor={borderColor}
                          _hover={{ borderColor: 'orange.300' }}
                          _focus={{ 
                            borderColor: '#F4A950', 
                            bg: 'white',
                            shadow: '0 0 0 1px #F4A950'
                          }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Business Type
                        </FormLabel>
                        <ButtonGroup isAttached w="full">
                          <Button
                            flex={1}
                            size="lg"
                            variant={businessProfile.business_type === 'business' ? 'solid' : 'outline'}
                            colorScheme="orange"
                            onClick={() => changeValue('business_type', 'business')}
                            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                            transition="all 0.2s"
                            bg={businessProfile.business_type === 'business' ? '#F4A950' : 'transparent'}
                            borderColor="#F4A950"
                            color={businessProfile.business_type === 'business' ? 'white' : '#F4A950'}
                          >
                            Registered Business
                          </Button>
                          <Button
                            flex={1}
                            size="lg"
                            variant={businessProfile.business_type === 'individual' ? 'solid' : 'outline'}
                            colorScheme="orange"
                            onClick={() => changeValue('business_type', 'individual')}
                            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                            transition="all 0.2s"
                            bg={businessProfile.business_type === 'individual' ? '#F4A950' : 'transparent'}
                            borderColor="#F4A950"
                            color={businessProfile.business_type === 'individual' ? 'white' : '#F4A950'}
                          >
                            Individual
                          </Button>
                        </ButtonGroup>
                      </FormControl>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Contact Information */}
                <MotionBox variants={itemVariants}>
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="2xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack spacing={6} align="stretch">
                      <HStack spacing={3} mb={4}>
                        <Icon as={Phone} boxSize={6} color="#F4A950" />
                        <Heading size="md" color="gray.800">Contact Information</Heading>
                      </HStack>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="semibold">
                            Contact Email
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Mail size={20} color="gray" />
                            </InputLeftElement>
                            <Input
                              type="email"
                              value={businessProfile.contact_email}
                              onChange={(e) => changeValue('contact_email', e.target.value)}
                              placeholder="business@example.com"
                              size="lg"
                              bg="gray.50"
                              border="2px solid"
                              borderColor={borderColor}
                              _hover={{ borderColor: 'orange.300' }}
                              _focus={{ 
                                borderColor: '#F4A950', 
                                bg: 'white',
                                shadow: '0 0 0 1px #F4A950'
                              }}
                              pl={12}
                            />
                          </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="semibold">
                            Contact Phone
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Phone size={20} color="gray" />
                            </InputLeftElement>
                            <Input
                              type="tel"
                              value={businessProfile.contact_phone}
                              onChange={(e) => changeValue('contact_phone', e.target.value)}
                              placeholder="+234 801 234 5678"
                              size="lg"
                              bg="gray.50"
                              border="2px solid"
                              borderColor={borderColor}
                              _hover={{ borderColor: 'orange.300' }}
                              _focus={{ 
                                borderColor: '#F4A950', 
                                bg: 'white',
                                shadow: '0 0 0 1px #F4A950'
                              }}
                              pl={12}
                            />
                          </InputGroup>
                          <Text fontSize="xs" color={textColor} mt={1}>
                            Include country code (e.g., +234 for Nigeria, +1 for US/Canada)
                          </Text>
                        </FormControl>
                      </SimpleGrid>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Services */}
                <MotionBox variants={itemVariants}>
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="2xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    data-testid="services-section"
                  >
                    <VStack spacing={6} align="stretch">
                      <HStack spacing={3} mb={4}>
                        <Icon as={Star} boxSize={6} color="#F4A950" />
                        <Heading size="md" color="gray.800">Services Offered</Heading>
                      </HStack>

                      <Text color={textColor} fontSize="sm">
                        Select the services you offer to help customers find you
                      </Text>

                      {/* Selected Services */}
                      {businessProfile.services.length > 0 && (
                        <Box>
                          <Text fontWeight="semibold" color="gray.700" mb={3}>
                            Selected Services ({businessProfile.services.length})
                          </Text>
                          <Wrap spacing={2}>
                            {businessProfile.services.map((service, index) => (
                              <WrapItem key={index}>
                                <Tag
                                  size="lg"
                                  bg="#F4A950"
                                  color="white"
                                  borderRadius="full"
                                  px={4}
                                  py={2}
                                >
                                  {service}
                                  <IconButton
                                    size="xs"
                                    ml={2}
                                    bg="transparent"
                                    color="white"
                                    _hover={{ bg: 'whiteAlpha.200' }}
                                    icon={<X size={12} />}
                                    onClick={() => removeService(service)}
                                  />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Box>
                      )}

                      {/* Available Services */}
                      <Box>
                        <Text fontWeight="semibold" color="gray.700" mb={3}>
                          Available Services
                        </Text>
                        <Wrap spacing={2}>
                          {servicesOffered
                            .filter(service => !businessProfile.services.includes(service))
                            .map((service, index) => (
                            <WrapItem key={index}>
                              <Tag
                                size="lg"
                                variant="outline"
                                borderColor="#F4A950"
                                color="#F4A950"
                                borderRadius="full"
                                px={4}
                                py={2}
                                cursor="pointer"
                                _hover={{ 
                                  bg: '#F4A950', 
                                  color: 'white',
                                  transform: 'translateY(-2px)',
                                  shadow: 'md'
                                }}
                                transition="all 0.2s"
                                onClick={() => addService(service)}
                              >
                                <Plus size={12} style={{ marginRight: '8px' }} />
                                {service}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* About Business */}
                <MotionBox variants={itemVariants}>
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="2xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <VStack spacing={6} align="stretch">
                      <HStack spacing={3} mb={4}>
                        <Icon as={Shield} boxSize={6} color="#F4A950" />
                        <Heading size="md" color="gray.800">About Your Business</Heading>
                      </HStack>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Business Description
                        </FormLabel>
                        <Textarea
                          value={businessProfile.about}
                          onChange={(e) => changeValue('about', e.target.value)}
                          placeholder="Tell customers about your business, experience, and what makes you special..."
                          rows={6}
                          size="lg"
                          bg="gray.50"
                          border="2px solid"
                          borderColor={borderColor}
                          _hover={{ borderColor: 'orange.300' }}
                          _focus={{ 
                            borderColor: '#F4A950', 
                            bg: 'white',
                            shadow: '0 0 0 1px #F4A950'
                          }}
                          resize="vertical"
                        />
                        <Text fontSize="xs" color={textColor} mt={2}>
                          {businessProfile.about.length}/500 characters
                        </Text>
                      </FormControl>
                    </VStack>
                  </Box>
                </MotionBox>
              </VStack>

              {/* Sidebar */}
              <MotionBox variants={itemVariants}>
                <VStack spacing={6} position="sticky" top={8}>
                  {/* Profile Preview */}
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    w="full"
                  >
                    <VStack spacing={4}>
                      <Text fontWeight="bold" color="gray.800" fontSize="lg">
                        Profile Preview
                      </Text>
                      
                      <Avatar
                        size="xl"
                        src={logoPreview}
                        name={getBusinessName()}
                        bg="orange.100"
                        color="#F4A950"
                      />
                      
                      <VStack spacing={2} textAlign="center">
                        <Text fontWeight="bold" color="gray.800">
                          {getBusinessName()}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {businessProfile.headline || 'Your business headline'}
                        </Text>
                        <Badge colorScheme="orange" variant="subtle">
                          {businessProfile.business_type === 'business' ? 'Registered Business' : 'Individual'}
                        </Badge>
                      </VStack>

                      {businessProfile.services.length > 0 && (
                        <Box w="full">
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                            Services ({businessProfile.services.length})
                          </Text>
                          <Wrap spacing={1} justify="center">
                            {businessProfile.services.slice(0, 3).map((service, index) => (
                              <WrapItem key={index}>
                                <Badge size="sm" colorScheme="orange">
                                  {service}
                                </Badge>
                              </WrapItem>
                            ))}
                            {businessProfile.services.length > 3 && (
                              <WrapItem>
                                <Badge size="sm" variant="outline" colorScheme="orange">
                                  +{businessProfile.services.length - 3} more
                                </Badge>
                              </WrapItem>
                            )}
                          </Wrap>
                        </Box>
                      )}
                    </VStack>
                  </Box>

                  {/* Trust Indicators */}
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="2xl"
                    shadow="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    w="full"
                  >
                    <VStack spacing={4}>
                      <Text fontWeight="bold" color="gray.800" fontSize="lg">
                        Why Complete Your Profile?
                      </Text>
                      
                      <VStack spacing={3} align="start" w="full">
                        <HStack spacing={3}>
                          <Icon as={CheckCircle} color="green.500" boxSize={5} />
                          <Text fontSize="sm" color={textColor}>
                            Get more customer inquiries
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Icon as={Star} color="#F4A950" boxSize={5} />
                          <Text fontSize="sm" color={textColor}>
                            Build trust with customers
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Icon as={Zap} color="blue.500" boxSize={5} />
                          <Text fontSize="sm" color={textColor}>
                            Appear in relevant searches
                          </Text>
                        </HStack>
                        <HStack spacing={3}>
                          <Icon as={Shield} color="purple.500" boxSize={5} />
                          <Text fontSize="sm" color={textColor}>
                            Verified business badge
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    form="profileForm"
                    size="lg"
                    bg="#F4A950"
                    color="white"
                    _hover={{ 
                      bg: 'orange.600',
                      transform: 'translateY(-2px)',
                      shadow: 'lg'
                    }}
                    _active={{ bg: 'orange.700' }}
                    isLoading={isSubmitting}
                    loadingText="Setting up profile..."
                    w="full"
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                    transition="all 0.2s"
                    isDisabled={completionProgress < 80}
                  >
                    Complete Setup
                  </Button>
                  
                  {completionProgress < 80 && (
                    <Text fontSize="xs" color="red.500" textAlign="center">
                      Please complete at least 80% of your profile to continue
                    </Text>
                  )}
                </VStack>
              </MotionBox>
            </SimpleGrid>
          </form>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default BusinessProfile;