import {
  Box, Button, FormControl, FormLabel,
  Input, Textarea, VStack, Heading,
  Image, Flex, HStack, Text,
  Divider, Tag, SimpleGrid, Badge,
  Skeleton,
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useRef } from "react";
import { GlobalStore } from '../../../../App'
import { CloudUpload } from "lucide-react";
import { apiClient } from '../../../../services/api';
import VerificationStatusDisplay from '../../../../components/VerificationStatusDisplay';
import authService from '../../../../services/authService';
import { getBusinessDisplayName } from '../../../../utils/userDataUtils';



export const BusinessProfile = () => {
  const { axios, notify } = useContext(GlobalStore);
  const imageRef = useRef();
  const [dealership, setDealership] = useState({
    logo: "", // Placeholder for logo
    business_name: "",
    headline: "",
    about: "",
    owner: {},
    cac_number: "",
    tin_number: "",
    services: [], // Legacy services array for backward compatibility
    offers_rental: false,
    offers_purchase: true,
    offers_drivers: false,
    offers_trade_in: false,
    extended_services: [], // New extended services array
    contact_email: '',
    contact_phone: '',
    // Verification status fields
    verified_business: false,
    business_verification_status: 'not_submitted',
    rejection_reason: null,
  });

  // Loading and error state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Retry configuration constants
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s exponential backoff

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDealership({
      ...dealership,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Helper function to check if business name is missing and prompt user
  const checkAndPromptForBusinessName = () => {
    try {
      const businessName = authService.getBusinessName();
      
      if (!businessName) {
        notify({
          title: 'Business Name Required',
          description: 'Please enter your business name to complete your profile.',
          status: 'warning',
          duration: 6000,
          isClosable: true,
        });
        
        // Focus on business name field if available
        const businessNameInput = document.querySelector('input[name="business_name"]');
        if (businessNameInput) {
          businessNameInput.focus();
          businessNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error checking business name:', error);
      return false;
    }
  };

  const slugify = (text) => {
    if (text) {
      return text.toLocaleLowerCase().replace(/['#@*()!"$%&]*/g, '').replaceAll(' ', '-')
    } else {
      return ''
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file)
    setDealership({ ...dealership, logo: { file, preview } });
  }

  // Enhanced error handling function for categorizing different error types
  function handleDealershipError(error) {
    console.error('Error fetching dealership data:', error);

    if (error.response?.status === 404) {
      // Profile doesn't exist - treat as new profile scenario
      setError(null); // Not an error, just new profile
      setRetryCount(0); // Reset retry count for new profile scenario
      notify({
        title: 'New Profile',
        description: 'Setting up your dealership profile for the first time.',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } else if (error.response?.status === 500 && error.response?.data?.includes('DoesNotExist')) {
      // Server returns 500 with DoesNotExist - also treat as new profile scenario
      setError(null); // Not an error, just new profile
      setRetryCount(0); // Reset retry count for new profile scenario
      notify({
        title: 'New Profile',
        description: 'Setting up your dealership profile for the first time.',
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } else if (error.response?.status === 401) {
      // Authentication error - redirect to login
      setError({ 
        type: 'auth', 
        message: 'Please log in again',
        retryable: false 
      });
      setRetryCount(0); // Reset retry count for auth errors
      notify({
        title: 'Authentication Required',
        description: 'Please log in again to access your profile.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      // Could add redirect logic here if needed
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Network timeout error - retryable
      const canRetry = retryCount < MAX_RETRY_ATTEMPTS;
      setError({ 
        type: 'network', 
        message: canRetry 
          ? `Request timed out. Retrying... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`
          : 'Request timed out. Please check your connection and try again.',
        retryable: true,
        canAutoRetry: canRetry
      });
      
      if (canRetry) {
        // Auto-retry for network timeouts
        setTimeout(() => retryDealershipFetch(), 1000);
      } else {
        notify({
          title: 'Connection Timeout',
          description: 'Request timed out. Please check your connection and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    } else if (!navigator.onLine) {
      // Network connection error - retryable
      setError({ 
        type: 'network', 
        message: 'No internet connection. Please check your network and try again.',
        retryable: true,
        canAutoRetry: false
      });
      notify({
        title: 'No Internet Connection',
        description: 'Please check your network connection and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } else {
      // General server errors with retry options
      const canRetry = retryCount < MAX_RETRY_ATTEMPTS;
      setError({ 
        type: 'general', 
        message: canRetry 
          ? `Unable to load profile data. Retrying... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`
          : 'Unable to load profile data. You can still update your settings.',
        retryable: true,
        canAutoRetry: canRetry
      });
      
      if (canRetry) {
        // Auto-retry for general server errors
        setTimeout(() => retryDealershipFetch(), 2000);
      } else {
        notify({
          title: 'Loading Error',
          description: 'Unable to load profile data. You can still update your settings.',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      }
    }
  }

  // Retry function with exponential backoff
  async function retryDealershipFetch() {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setError(prev => ({
        ...prev,
        message: 'Maximum retry attempts reached. Please try again later.',
        retryable: false,
        canAutoRetry: false
      }));
      return;
    }

    const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    
    // Wait for the exponential backoff delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Increment retry count
    setRetryCount(prev => prev + 1);
    
    // Retry the fetch
    await getDealership();
  }

  // Manual retry handler for user-initiated retries
  const handleManualRetry = () => {
    // Reset error state when retrying
    setError(null);
    // Reset retry count for manual retries to give fresh attempts
    setRetryCount(0);
    // Trigger the fetch
    getDealership();
  };

  async function getDealership() {
    // Add loading state management (setLoading true)
    setLoading(true);
    // Add error state reset at start of function
    setError(null);
    
    try {
      // Try the dealership-specific endpoint first
      const response = await apiClient.get('/admin/dealership/');
      // API returns data wrapped in a data object: { error: false, data: {...} }
      const data = response.data.data || response.data;
      
      // Reset retry count on successful fetch
      setRetryCount(0);
      
      // Fetch verification status to get CAC and TIN numbers
      let verificationData = {};
      try {
        const verificationResponse = await apiClient.get('/accounts/verification-status/');
        verificationData = verificationResponse.data;
        console.log('Verification status data received:', verificationData);
      } catch (verificationError) {
        console.log('Could not fetch verification status:', verificationError);
        // Continue without verification data if it fails
      }
      
      // Log verification status data for debugging
      console.log('Verification status data received:', {
        verified_business: data.verified_business,
        business_verification_status: data.business_verification_status,
        rejection_reason: data.rejection_reason,
        cac_number: verificationData.cac_number,
        tin_number: verificationData.tin_number
      });
      
      // Log the business name received from API for debugging
      console.log('📥 Received dealership data from GET /admin/dealership/ with business_name:', {
        business_name: data.business_name,
        has_business_name: !!data.business_name,
        endpoint: '/admin/dealership/',
        method: 'GET'
      });

      setDealership(prev => ({
        ...prev,
        ...data,
        // Preserve any existing file preview
        logo: prev.logo?.preview ? prev.logo : data.logo,
        // Ensure business_name is properly set from API response
        business_name: data.business_name || prev.business_name || '',
        // Ensure verification fields have default values if missing
        verified_business: data.verified_business ?? false,
        business_verification_status: data.business_verification_status || 'not_submitted',
        rejection_reason: data.rejection_reason || null,
        // Add CAC and TIN from verification status
        cac_number: verificationData.cac_number || data.cac_number || '',
        tin_number: verificationData.tin_number || data.tin_number || ''
      }));

      // Check for missing business name after data is loaded
      setTimeout(() => {
        checkAndPromptForBusinessName();
      }, 500);
    } catch (error) {
      // Implement try-catch with handleDealershipError call
      handleDealershipError(error);
    } finally {
      // Ensure loading state is cleared in finally block
      setLoading(false);
    }
  }

  async function handleSubmit() {
    // Show saving notification for immediate feedback
    notify({
      title: 'Saving Profile',
      description: 'Please wait while we save your changes...',
      status: 'info',
      duration: 2000,
      isClosable: false
    });

    try {
      // Prepare services array for API (required field)
      const allServices = getAllSelectedServices();
      
      // Enhanced business name validation before submission
      if (!dealership.business_name || !dealership.business_name.trim()) {
        notify({
          title: 'Business Name Required',
          description: 'Please enter your business name before saving your profile. This is required for your dealership profile.',
          status: 'error',
          duration: 6000,
          isClosable: true
        });
        
        // Focus on business name field
        const businessNameInput = document.querySelector('input[name="business_name"]');
        if (businessNameInput) {
          businessNameInput.focus();
          businessNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
      }

      // Additional validation for business name length and content
      const trimmedBusinessName = dealership.business_name.trim();
      if (trimmedBusinessName.length < 2) {
        notify({
          title: 'Invalid Business Name',
          description: 'Business name must be at least 2 characters long.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        
        const businessNameInput = document.querySelector('input[name="business_name"]');
        if (businessNameInput) {
          businessNameInput.focus();
          businessNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
      }

      // Build the settings data object with required fields
      const settingsData = {
        // Required fields based on API documentation - business_name is always required
        business_name: trimmedBusinessName,
        services: allServices, // This is required by the API
        
        // Core service boolean flags
        offers_purchase: dealership.offers_purchase || false,
        offers_rental: dealership.offers_rental || false,
        offers_drivers: dealership.offers_drivers || false,
        offers_trade_in: dealership.offers_trade_in || false,
        
        // Optional fields - only include if they have values
        ...(dealership.about && { about: dealership.about }),
        ...(dealership.headline && { headline: dealership.headline }),
        ...(dealership.contact_email && { contact_email: dealership.contact_email }),
        ...(dealership.contact_phone && { contact_phone: dealership.contact_phone }),
        ...(dealership.cac_number && { cac_number: dealership.cac_number }),
        ...(dealership.tin_number && { tin_number: dealership.tin_number }),
      };

      // Log the business name being sent to API for debugging
      console.log('📤 Sending business profile update with business_name:', {
        business_name: settingsData.business_name,
        business_name_length: settingsData.business_name.length,
        endpoint: '/admin/dealership/settings/',
        method: 'PUT'
      });

      // Handle logo upload - use FormData if there's a new file to upload
      let requestData;
      let headers = {};

      if (dealership.logo && typeof dealership.logo === 'object' && dealership.logo.file) {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add the logo file
        formData.append('new-logo', dealership.logo.file);
        
        // Add all other fields to FormData
        Object.entries(settingsData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });
        
        requestData = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        // Regular JSON request
        requestData = settingsData;
        headers['Content-Type'] = 'application/json';
      }

      // Use PUT method for dealership settings
      const res = await axios.put('/admin/dealership/settings/', requestData, { headers });
      // API returns data wrapped in a data object: { error: false, data: {...} }
      const data = res.data.data || res.data;

      if (data) {
        notify({
          title: 'Profile Updated Successfully',
          description: 'Your dealership profile has been saved and is now live.',
          status: 'success',
          duration: 4000,
          isClosable: true
        });

        // Log the business name received from API for debugging
        console.log('📥 Received business profile update response with business_name:', {
          business_name: data.business_name,
          has_business_name: !!data.business_name,
          endpoint: '/admin/dealership/settings/',
          method: 'PUT'
        });

        // Update local state with the saved data including verification status
        setDealership(prev => ({
          ...prev,
          ...data,
          // Preserve the local file preview if it exists
          logo: prev.logo?.preview ? prev.logo : data.logo,
          // Ensure business_name is properly updated from response
          business_name: data.business_name || prev.business_name,
          // Ensure verification fields are updated from response
          verified_business: data.verified_business ?? prev.verified_business,
          business_verification_status: data.business_verification_status || prev.business_verification_status,
          rejection_reason: data.rejection_reason || prev.rejection_reason
        }));

        // Update business name in auth service storage for consistency
        if (data.business_name) {
          authService.updateBusinessName(data.business_name);
        }

        // Re-fetch dealership data to get the latest verification status
        await getDealership();

        return true;
      }
    } catch (error) {
      console.error('Error saving dealership settings:', error);

      let errorMessage = 'Unable to save your profile. Please check your information and try again.';
      let errorTitle = 'Save Failed';
      
      if (error.response?.status === 400) {
        const responseData = error.response.data;
        
        if (responseData?.message === 'Missing required fields') {
          // Handle missing required fields error with enhanced business name validation
          const missingFields = [];
          if (!dealership.business_name || !dealership.business_name.trim()) {
            missingFields.push('Business Name');
          }
          if (getAllSelectedServices().length === 0) missingFields.push('Services');
          
          if (missingFields.length > 0) {
            errorMessage = `Please fill in the following required fields: ${missingFields.join(', ')}`;
            errorTitle = 'Required Fields Missing';
            
            // Focus on business name field if it's missing
            if (missingFields.includes('Business Name')) {
              setTimeout(() => {
                const businessNameInput = document.querySelector('input[name="business_name"]');
                if (businessNameInput) {
                  businessNameInput.focus();
                  businessNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 100);
            }
          } else {
            errorMessage = 'Some required fields are missing. Please check your form and try again.';
            errorTitle = 'Required Fields Missing';
          }
        } else if (responseData?.details || responseData?.errors) {
          // Handle detailed validation errors
          const errors = [];
          const errorData = responseData.details || responseData.errors || responseData;
          
          Object.entries(errorData).forEach(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (Array.isArray(messages)) {
              errors.push(...messages.map(msg => `${fieldName}: ${msg}`));
            } else {
              errors.push(`${fieldName}: ${messages}`);
            }
          });
          
          if (errors.length > 0) {
            errorMessage = errors.join('\n');
            errorTitle = 'Validation Error';
          }
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
          errorTitle = 'Validation Error';
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again to save your changes.';
        errorTitle = 'Authentication Required';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again in a few moments.';
        errorTitle = 'Server Error';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
        errorTitle = 'Connection Error';
      }

      notify({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true
      });
    }
    return false;
  }

  // Service mapping configuration based on API documentation
  const coreServiceMapping = {
    'Car Sale': 'offers_purchase',
    'Car Sales': 'offers_purchase', 
    'Vehicle Sales': 'offers_purchase',
    'Car Rental': 'offers_rental',
    'Car Leasing': 'offers_rental',
    'Vehicle Rental': 'offers_rental',
    'Vehicle Leasing': 'offers_rental',
    'Drivers': 'offers_drivers',
    'Driver Services': 'offers_drivers',
    'Chauffeur Services': 'offers_drivers',
    'Trade-In Services': 'offers_trade_in',
    'Trade In': 'offers_trade_in',
    'Vehicle Trade-In': 'offers_trade_in'
  };

  const extendedServiceDefaults = {
    'Vehicle Financing': {
      name: 'Vehicle Financing',
      description: 'Flexible financing options for vehicle purchases',
      price_range: 'Varies based on loan amount'
    },
    'Vehicle Inspection': {
      name: 'Vehicle Inspection',
      description: 'Pre-purchase vehicle inspection services',
      price_range: '₦10,000 - ₦25,000'
    },
    'Car Detailing': {
      name: 'Car Detailing',
      description: 'Professional car cleaning and detailing services',
      price_range: '₦15,000 - ₦50,000'
    },
    'Vehicle Insurance': {
      name: 'Vehicle Insurance',
      description: 'Comprehensive vehicle insurance coverage',
      price_range: 'Varies based on vehicle value'
    },
    'Vehicle Maintenance': {
      name: 'Vehicle Maintenance',
      description: 'Regular maintenance and repair services',
      price_range: '₦5,000 - ₦100,000'
    },
    'Parts & Accessories': {
      name: 'Parts & Accessories',
      description: 'Genuine vehicle parts and accessories',
      price_range: 'Varies by part'
    },
    'Vehicle Delivery': {
      name: 'Vehicle Delivery',
      description: 'Door-to-door vehicle delivery service',
      price_range: '₦20,000 - ₦100,000'
    },
    'Test Drive Services': {
      name: 'Test Drive Services',
      description: 'Convenient test drive arrangements',
      price_range: 'Free with purchase intent'
    },
    'Vehicle Registration': {
      name: 'Vehicle Registration',
      description: 'Complete vehicle registration assistance',
      price_range: '₦50,000 - ₦150,000'
    },
    'Export Services': {
      name: 'Export Services',
      description: 'International vehicle export services',
      price_range: 'Varies by destination'
    }
  };

  // Helper function to get all selected services (core + extended)
  const getAllSelectedServices = () => {
    const services = [];
    
    // Add core services based on boolean flags
    if (dealership.offers_purchase) services.push('Car Sale');
    if (dealership.offers_rental) services.push('Car Leasing');
    if (dealership.offers_drivers) services.push('Drivers');
    if (dealership.offers_trade_in) services.push('Trade-In Services');
    
    // Add extended services
    dealership.extended_services?.forEach(service => {
      services.push(service.name);
    });
    
    return services;
  };

  // Helper function to add a service
  const addService = (serviceName) => {
    if (coreServiceMapping[serviceName]) {
      // It's a core service - update the boolean flag
      const booleanField = coreServiceMapping[serviceName];
      setDealership(prev => ({
        ...prev,
        [booleanField]: true
      }));
    } else {
      // It's an extended service - add to extended_services array
      const serviceData = extendedServiceDefaults[serviceName] || {
        name: serviceName,
        description: `${serviceName} services`,
        price_range: 'Contact for pricing'
      };
      
      setDealership(prev => ({
        ...prev,
        extended_services: [...(prev.extended_services || []), serviceData]
      }));
    }
  };

  // Helper function to remove a service
  const removeService = (serviceName) => {
    // Check if it's a core service
    const coreServiceField = Object.entries(coreServiceMapping).find(([key, value]) => key === serviceName)?.[1];
    if (coreServiceField) {
      setDealership(prev => ({
        ...prev,
        [coreServiceField]: false
      }));
    } else {
      // It's an extended service - remove from extended_services array
      setDealership(prev => ({
        ...prev,
        extended_services: prev.extended_services?.filter(service => service.name !== serviceName) || []
      }));
    }
  };

  let dealerServices = [
    'Car Leasing',
    'Car Sale',
    'Car Rental',
    'Drivers',
    'Vehicle Financing',
    'Trade-In Services',
    'Vehicle Inspection',
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
  ]

  useEffect(() => {
    getDealership();
  }, [])

  // Loading State Component
  const LoadingState = () => (
    <VStack spacing={6} align="stretch" py={6}>
      <Skeleton height="200px" borderRadius="xl" />
      <Skeleton height="300px" borderRadius="xl" />
      <Skeleton height="150px" borderRadius="xl" />
    </VStack>
  );

  // Error State Component
  const ErrorState = ({ error, onRetry }) => (
    <Box 
      bg="red.50" 
      border="1px solid" 
      borderColor="red.200" 
      borderRadius="xl" 
      p={6}
      mb={6}
    >
      <VStack spacing={4}>
        <Text color="red.600" textAlign="center">
          {error.message}
        </Text>
        {error.retryable && !error.canAutoRetry && (
          <Button 
            colorScheme="red" 
            variant="outline" 
            onClick={onRetry}
            size="sm"
          >
            Try Again
          </Button>
        )}
        {error.canAutoRetry && (
          <Text fontSize="sm" color="red.500" textAlign="center">
            Retrying automatically...
          </Text>
        )}
      </VStack>
    </Box>
  );

  // Show loading state when loading is true
  if (loading) {
    return <LoadingState />;
  }

  return (
    <VStack spacing={6} align="stretch" py={6} maxW="container.xl" w="100%">
      {/* Show error state if there's an error */}
      {error && (
        <ErrorState error={error} onRetry={handleManualRetry} />
      )}
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="start">
        <VStack spacing={6} align="stretch" gridColumn={{ md: 'span 2' }}>
          {/* Logo Upload Card */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <VStack>
              {
                dealership?.logo?.file ? (
                  <Image src={dealership?.logo?.preview} w="80px" />
                ) : (
                  <Image src={dealership?.logo} w="80px" />
                )
              }
              <Button onClick={e => imageRef.current.click()} variant="link" color="#0460cc" fontSize="sm" fontWeight="medium" leftIcon={<CloudUpload size={16} />}>
                Upload image
              </Button>
              <Input type="file" hidden ref={imageRef} accept="image/*" onInput={handleImageUpload} />
            </VStack>
          </Box>

          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={{ base: 4, md: 6 }}>
            <Heading size={{ base: "sm", md: "md" }} mb={4}>Business Info</Heading>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>Business Name</FormLabel>
                <Input 
                  name="business_name" 
                  value={dealership?.business_name || ''} 
                  onChange={handleChange} 
                  bg="white" 
                  color="#101828" 
                  borderColor={!dealership?.business_name ? "red.300" : "#d0d5dd"}
                  size={{ base: "md", md: "lg" }}
                  placeholder="Enter your business name"
                />
                {!dealership?.business_name && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Business name is required for your profile
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" mt={2}> @{slugify(dealership?.business_name || '')} </Text>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>Headline</FormLabel>
                <Input 
                  name="headline" 
                  value={dealership?.headline} 
                  onChange={handleChange} 
                  bg="white" 
                  color="#101828" 
                  borderColor="#d0d5dd"
                  size={{ base: "md", md: "lg" }}
                  placeholder="A catchy headline for your business"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>About</FormLabel>
                <Textarea 
                  name="about" 
                  value={dealership?.about} 
                  onChange={handleChange} 
                  maxLength={400} 
                  bg="white" 
                  color="#101828" 
                  borderColor="#d0d5dd"
                  minH={{ base: "120px", md: "150px" }}
                  resize="vertical"
                  placeholder="Tell customers about your business..."
                />
                <Text mt={1} fontSize="xs" color="gray.500">{(dealership?.about || '').length}/400</Text>
              </FormControl>
            </VStack>
          </Box>

          {/* Verification Status Section */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={{ base: 4, md: 6 }}>
            <HStack justify="space-between" mb={4}>
              <Heading size={{ base: "sm", md: "md" }}>Verification Status</Heading>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={getDealership}
                isLoading={loading}
                loadingText="Refreshing..."
              >
                Refresh
              </Button>
            </HStack>
            <VerificationStatusDisplay 
              verifiedBusiness={dealership?.verified_business}
              verificationStatus={dealership?.business_verification_status}
              rejectionReason={dealership?.rejection_reason}
            />
          </Box>

          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>Registration</Heading>
            {(!dealership?.cac_number && !dealership?.tin_number) && (
              <Text fontSize="sm" color="gray.600" mb={4}>
                These fields will be automatically populated when your business verification is approved.
              </Text>
            )}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>CAC Number</FormLabel>
                <Input 
                  name="cac_number" 
                  disabled 
                  value={dealership?.cac_number || ''} 
                  onChange={handleChange} 
                  bg="gray.50" 
                  color="#101828" 
                  borderColor="#d0d5dd"
                  placeholder="Pending verification"
                />
              </FormControl>
              <FormControl>
                <FormLabel>TIN Number</FormLabel>
                <Input 
                  name="tin_number" 
                  disabled 
                  value={dealership?.tin_number || ''} 
                  onChange={handleChange} 
                  bg="gray.50" 
                  color="#101828" 
                  borderColor="#d0d5dd"
                  placeholder="Pending verification"
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* Services List Selector */}
          <Box border="1px solid" borderColor="#d0d5dd" borderRadius="xl" bg="white" overflow="hidden">
            <Box p={4} borderBottom="1px solid" borderColor="#d0d5dd">
              <FormLabel fontWeight="medium" mb={2}> 
                Choose services
              </FormLabel>
              <Flex flexWrap="wrap" gap={2}>
                {
                  dealerServices?.map((service) => {
                    const selectedServices = getAllSelectedServices();
                    const selected = selectedServices.includes(service);
                    if (selected) return null;
                    return (
                      <Tag
                        key={service}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        borderRadius="full"
                        fontSize="sm"
                        bg="white"
                        color="#667085"
                        borderColor="#d0d5dd"
                        _hover={{ bg: "gray.50" }}
                        onClick={() => addService(service)}
                      >
                        {service}
                      </Tag>
                    )
                  }
                  )}
              </Flex>
            </Box>

            <Box p={4}>
              <VStack spacing={3} align="stretch">
                {/* Core Services */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="#374151" mb={2}>Core Services</Text>
                  <Flex flexWrap="wrap" gap={2}>
                    {dealership.offers_purchase && (
                      <Tag
                        variant="solid"
                        cursor="pointer"
                        size="lg"
                        borderRadius="full"
                        fontSize="sm"
                        bg="#0460cc"
                        color="white"
                        borderColor="#0460cc"
                        _hover={{ bg: "#0354b4" }}
                        onClick={() => removeService('Car Sale')}
                      >
                        Car Sale
                      </Tag>
                    )}
                    {dealership.offers_rental && (
                      <Tag
                        variant="solid"
                        cursor="pointer"
                        size="lg"
                        borderRadius="full"
                        fontSize="sm"
                        bg="#0460cc"
                        color="white"
                        borderColor="#0460cc"
                        _hover={{ bg: "#0354b4" }}
                        onClick={() => removeService('Car Leasing')}
                      >
                        Car Leasing
                      </Tag>
                    )}
                    {dealership.offers_drivers && (
                      <Tag
                        variant="solid"
                        cursor="pointer"
                        size="lg"
                        borderRadius="full"
                        fontSize="sm"
                        bg="#0460cc"
                        color="white"
                        borderColor="#0460cc"
                        _hover={{ bg: "#0354b4" }}
                        onClick={() => removeService('Drivers')}
                      >
                        Drivers
                      </Tag>
                    )}
                    {dealership.offers_trade_in && (
                      <Tag
                        variant="solid"
                        cursor="pointer"
                        size="lg"
                        borderRadius="full"
                        fontSize="sm"
                        bg="#0460cc"
                        color="white"
                        borderColor="#0460cc"
                        _hover={{ bg: "#0354b4" }}
                        onClick={() => removeService('Trade-In Services')}
                      >
                        Trade-In Services
                      </Tag>
                    )}
                  </Flex>
                </Box>

                {/* Extended Services */}
                {dealership.extended_services && dealership.extended_services.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="#374151" mb={2}>Extended Services</Text>
                    <VStack spacing={2} align="stretch">
                      {dealership.extended_services.map((service, index) => (
                        <Box
                          key={index}
                          p={3}
                          border="1px solid"
                          borderColor="#e5e7eb"
                          borderRadius="md"
                          bg="#f9fafb"
                        >
                          <Flex justify="space-between" align="start">
                            <Box flex={1}>
                              <Text fontWeight="medium" fontSize="sm" color="#111827">
                                {service.name}
                              </Text>
                              <Text fontSize="xs" color="#6b7280" mt={1}>
                                {service.description}
                              </Text>
                              {service.price_range && (
                                <Text fontSize="xs" color="#059669" mt={1} fontWeight="medium">
                                  {service.price_range}
                                </Text>
                              )}
                            </Box>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeService(service.name)}
                            >
                              Remove
                            </Button>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                {getAllSelectedServices().length < 1 && (
                  <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                    No services selected yet
                  </Text>
                )}
              </VStack>
            </Box>
          </Box>

          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>Contact Details</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="contact_email" value={dealership?.contact_email} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              </FormControl>
              <FormControl>
                <FormLabel>Customer Care Phone Number</FormLabel>
                <Input type="tel" name="contact_phone" value={dealership?.contact_phone} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              </FormControl>
            </SimpleGrid>
          </Box>

          <HStack>
            <Button colorScheme="blue" onClick={handleSubmit}>Save Changes</Button>
          </HStack>
        </VStack>

        <Box 
          position={{ base: "relative", lg: "sticky" }} 
          top={4} 
          bg="white" 
          border="1px solid" 
          borderColor="#d0d5dd" 
          borderRadius="xl" 
          p={{ base: 4, md: 6 }}
          h="fit-content"
        >
          <Heading size={{ base: "sm", md: "md" }} mb={4} display={{ base: "block", lg: "none" }}>
            Preview
          </Heading>
          <VStack spacing={3} align="stretch">
            <HStack spacing={3}>
              {
                dealership?.logo?.file ? (
                  <Image 
                    src={dealership?.logo?.preview} 
                    w={{ base: "50px", md: "60px" }}
                    h={{ base: "50px", md: "60px" }}
                    objectFit="cover"
                    borderRadius="md"
                  />
                ) : (
                  <Image 
                    src={dealership?.logo} 
                    w={{ base: "50px", md: "60px" }}
                    h={{ base: "50px", md: "60px" }}
                    objectFit="cover"
                    borderRadius="md"
                  />
                )
              }
              <Box flex={1} minW={0}>
                <HStack spacing={2} align="center" mb={1}>
                  <Heading 
                    as="h3" 
                    fontSize={{ base: "sm", md: "md" }} 
                    fontWeight="semibold" 
                    color="#101828"
                    noOfLines={1}
                    flex={1}
                  >
                    {dealership?.business_name || 'Business name'}
                  </Heading>
                  <VerificationStatusDisplay 
                    verifiedBusiness={dealership?.verified_business}
                    verificationStatus={dealership?.business_verification_status}
                    isCompact={true}
                  />
                </HStack>
                <Text 
                  fontSize={{ base: "xs", md: "sm" }} 
                  color="#667085"
                  noOfLines={1}
                >
                  {dealership?.headline || 'Headline'}
                </Text>
              </Box>
            </HStack>
            <Divider />
            <Text 
              fontSize={{ base: "xs", md: "sm" }} 
              color="#667085"
              noOfLines={{ base: 3, md: 4 }}
            >
              {dealership?.about || 'Tell customers about your business...'}
            </Text>
            <VStack 
              align="start" 
              spacing={1} 
              fontSize={{ base: "xs", md: "sm" }} 
              color="#667085"
            >
              <Text noOfLines={1}>{dealership?.contact_email || 'email@example.com'}</Text>
              <Text noOfLines={1}>{dealership?.contact_phone || '+234 000 000 0000'}</Text>
            </VStack>
            <VStack spacing={2} align="stretch">
              <Flex flexWrap="wrap" gap={2}>
                {getAllSelectedServices().map((service, i) => (
                  <Badge 
                    key={i} 
                    colorScheme="blue" 
                    variant="subtle"
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    {service}
                  </Badge>
                ))}
                {getAllSelectedServices().length === 0 && (
                  <Text color="gray.500" fontSize="xs">No services selected</Text>
                )}
              </Flex>
              
              {/* Show extended services details in preview */}
              {dealership.extended_services && dealership.extended_services.length > 0 && (
                <Box>
                  <Text fontSize="xs" fontWeight="medium" color="#6b7280" mb={1}>Extended Services:</Text>
                  <VStack spacing={1} align="stretch">
                    {dealership.extended_services.slice(0, 3).map((service, i) => (
                      <Box key={i} fontSize="xs" color="#6b7280">
                        <Text fontWeight="medium">{service.name}</Text>
                        <Text fontSize="xs" color="#9ca3af">{service.price_range}</Text>
                      </Box>
                    ))}
                    {dealership.extended_services.length > 3 && (
                      <Text fontSize="xs" color="#6b7280">
                        +{dealership.extended_services.length - 3} more services
                      </Text>
                    )}
                  </VStack>
                </Box>
              )}
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

export default BusinessProfile;