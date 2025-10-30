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
  const toast = useToast();
  
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

  // Calculate completion progress
  useEffect(() => {
    const fields = [
      businessProfile.logo,
      businessProfile.business_name,
      businessProfile.headline,
      businessProfile.about,
      businessProfile.contact_email,
      businessProfile.contact_phone,
      businessProfile.services.length > 0,
      businessProfile.location.street_address
    ];
    const completed = fields.filter(Boolean).length;
    setCompletionProgress((completed / fields.length) * 100);
  }, [businessProfile]);

  const changeValue = (key, value) => {
    setBusinessProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addService = (service) => {
    if (!businessProfile.services.includes(service)) {
      changeValue('services', [...businessProfile.services, service]);
    }
  };

  const removeService = (service) => {
    const updatedServices = businessProfile.services.filter(s => s !== service);
    changeValue('services', updatedServices);
  };

  async function setupBusinessProfile(e) {
    e.preventDefault();
    setIsSubmitting(true);

    if (!businessProfile.logo) {
      setIsSubmitting(false);
      return notify({
        color: 'red',
        title: 'Logo Required',
        body: 'Please upload your business logo to continue'
      });
    }
    
    if (businessProfile.logo && businessProfile.logo.size / 10**6 > 2.048) {
      setIsSubmitting(false);
      return notify({
        color: 'red',
        title: 'File Too Large',
        body: 'Your logo file size exceeds 2MB. Please choose a smaller file.',
        timeout: 4500,
      });
    }

    try {
      const authUser = objectifyJSON(localStorage.getItem('veyu-auth-user')) 
                    || objectifyJSON(localStorage.getItem('motaa-auth-user'));
      
      if (!authUser) {
        setIsSubmitting(false);
        return notify({
          title: 'Authentication Error',
          body: 'Please log in first to set up your business profile',
          color: 'red'
        });
      }

      const payload = new FormData();
      payload.append('action', 'setup-business-profile');
      payload.append('user_type', user_type);
      payload.append('logo', businessProfile?.logo, businessProfile.logo?.name);
      payload.append('business_type', businessProfile.business_type);
      payload.append('about', businessProfile.about);
      payload.append('headline', businessProfile.headline);
      payload.append('business_name', businessProfile.business_name);
      payload.append('contact_phone', businessProfile.contact_phone);
      payload.append('contact_email', businessProfile.contact_email);
      payload.append('services', businessProfile.services);
      payload.append('location', JSON.stringify(businessProfile.location));
      
      const token = authUser?.api_token || authUser?.token;
      
      const res = await axios.post('/accounts/register/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        }
      });
      
      const data = objectifyJSON(res.data);

      if (res.status === 200 || res.status === 201) {
        notify({
          title: 'Success!',
          body: "Business profile created successfully! Welcome to Veyu!",
          color: 'green'
        });
        
        if (data.data || data.user) {
          localStorage.setItem('veyu-auth-user', JSON.stringify(data.data || data.user || data));
        }
        
        setTimeout(() => {
          redirect('/dashboard');
        }, 1500);
      } else {
        notify({
          title: 'Setup Failed',
          timeout: 5000,
          body: data.message || 'Failed to set up business profile',
          color: 'red'
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data)
        || error.message;
      
      notify({
        title: 'Error',
        timeout: 5000,
        body: errorMessage,
        color: 'red'
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