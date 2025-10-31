import { 
  CloudUpload, 
  Building,
  MapPin,
  Phone,
  Mail,
  Camera,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Plus,
  X
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
  useToast
} from "@chakra-ui/react";
import { useContext, useRef, useState, useEffect } from "react";
import { GlobalStore } from "../../App";
import { SignupContext } from "./Signup";
import { motion } from 'framer-motion';
import { CustomPlacesAutocomplete } from "../../components/maps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { objectifyJSON } from "../../utils";

const MotionBox = motion(Box);

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
  
  const [businessProfile, setBusinessProfile] = useState({
    logo: null,
    business_name: '',
    services: [],
    location: {
      lat: '',
      lng: '',
      country: '',
      state: '',
      city: '',
      zip_code: '',
      place_id: '',
      street_address: '',
    },
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
    'Car Rentals',
    'Car Sales',
    'Drivers',
    'Vehicle Financing',
    'Trade-ins',
    'Warranty Service',
    'Insurance',
    'Vehicle Inspection',
    'Delivery Service',
    'Maintenance Plans'
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

  // Update completion progress when businessProfile changes
  useEffect(() => {
    setCompletionProgress(calculateCompletion(businessProfile));
  }, [businessProfile]);

  // Auto-submit if verification is successful
  useEffect(() => {
    const submitAfterVerification = async () => {
      if (verificationCode && emailVerificationSent) {
        await handleSubmit(new Event('submit'));
      }
    };
    
    submitAfterVerification();
  }, [verificationCode, emailVerificationSent]);

  // Calculate form completion percentage
  const calculateCompletion = (profile) => {
    let completedFields = 0;
    const requiredFields = [
      'business_name',
      'business_type',
      'contact_phone',
      'contact_email',
      'services',
      'location',
      'headline'
    ];

    requiredFields.forEach(field => {
      if (field === 'services' && profile[field]?.length > 0) {
        completedFields++;
      } else if (field === 'location' && profile[field]?.street_address) {
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

  // Send verification email
  const sendVerificationEmail = async (email) => {
    try {
      const response = await axios.post('/accounts/send-verification-email/', { email });
      toast({
        title: 'Verification Email Sent',
        description: `We've sent a verification code to ${email}. Please check your inbox.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      throw new Error(errorMessage);
    }
  };

  // Verify email with code
  const verifyEmailCode = async (email, code) => {
    try {
      const response = await axios.post('/accounts/verify-email/', {
        email,
        code
      });
      return response.data.verified === true;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Check if email needs verification
      if (!emailVerificationSent && businessProfile.contact_email) {
        await sendVerificationEmail(businessProfile.contact_email);
        setEmailVerificationSent(true);
        return;
      }
      
      // If verification is required but not completed
      if (emailVerificationSent && !verificationCode) {
        toast({
          title: 'Verification Required',
          description: 'Please enter the verification code sent to your email',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      // Verify email if code is provided
      if (verificationCode) {
        setIsVerifying(true);
        try {
          const verified = await verifyEmailCode(businessProfile.contact_email, verificationCode);
          if (!verified) {
            throw new Error('Invalid verification code. Please try again.');
          }
        } finally {
          setIsVerifying(false);
        }
      }
      
      const authUser = JSON.parse(localStorage.getItem('veyu-auth-user'));
      if (!authUser) {
        throw new Error('Session expired. Please log in again.');
      }
      
      // Create form data for submission
      const formData = new FormData();
      
      // Append files if they exist
      if (businessProfile.logo) {
        formData.append('logo', businessProfile.logo);
      }
      
      // Append other form data
      formData.append('action', 'setup-business-profile');
      formData.append('user_type', user_type);
      formData.append('business_type', businessProfile.business_type);
      formData.append('about', businessProfile.about || '');
      formData.append('headline', businessProfile.headline);
      formData.append('business_name', businessProfile.business_name);
      formData.append('contact_phone', businessProfile.contact_phone);
      formData.append('contact_email', businessProfile.contact_email);
      formData.append('services', JSON.stringify(businessProfile.services));
      formData.append('location', JSON.stringify(businessProfile.location));
      
      const token = authUser?.api_token || authUser?.token;
      
      // Submit the form
      const res = await axios.post('/accounts/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        }
      });
      
      const data = objectifyJSON(res.data);

      if (res.status === 200 || res.status === 201) {
        toast({
          title: 'Success!',
          description: 'Business profile created successfully! Welcome to Veyu!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        if (data.data || data.user) {
          localStorage.setItem('veyu-auth-user', JSON.stringify(data.data || data.user || data));
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to set up business profile');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data)
        || error.message;
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
              
              <Heading size="lg">Verify Your Email</Heading>
              
              <Text color={textColor}>
                We've sent a verification code to <strong>{businessProfile.contact_email}</strong>.
                Please enter the 6-digit code below to continue.
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
                
                {isVerifying ? (
                  <Button
                    isLoading
                    loadingText="Verifying..."
                    colorScheme="orange"
                    size="lg"
                    w="full"
                    mt={4}
                  />
                ) : (
                  <Button
                    colorScheme="orange"
                    size="lg"
                    w="full"
                    mt={4}
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
                )}
                
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
          <MotionBox variants={itemVariants} textAlign="center" mb={8}>
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
                            name={businessProfile?.business_name}
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

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel color="gray.700" fontWeight="semibold">
                            Business Name
                          </FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Building size={20} color="gray" />
                            </InputLeftElement>
                            <Input
                              value={businessProfile.business_name}
                              onChange={(e) => changeValue('business_name', e.target.value)}
                              placeholder="Your Business Name"
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
                      </SimpleGrid>

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
                              placeholder="+1 (555) 123-4567"
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
                      </SimpleGrid>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Location */}
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
                        <Icon as={MapPin} boxSize={6} color="#F4A950" />
                        <Heading size="md" color="gray.800">Business Location</Heading>
                      </HStack>

                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Business Address
                        </FormLabel>
                        <CustomPlacesAutocomplete
                          onSelect={(location) => changeValue('location', location)}
                          placeholder="Enter your business address"
                          inputProps={{
                            size: "lg",
                            bg: "gray.50",
                            border: "2px solid",
                            borderColor: borderColor,
                            _hover: { borderColor: 'orange.300' },
                            _focus: { 
                              borderColor: '#F4A950', 
                              bg: 'white',
                              shadow: '0 0 0 1px #F4A950'
                            }
                          }}
                        />
                      </FormControl>
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
                        name={businessProfile.business_name}
                        bg="orange.100"
                        color="#F4A950"
                      />
                      
                      <VStack spacing={2} textAlign="center">
                        <Text fontWeight="bold" color="gray.800">
                          {businessProfile.business_name || 'Your Business Name'}
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