import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  Badge,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  Container,
  SimpleGrid
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { GlobalStore } from "../../App";
import { motion } from 'framer-motion';
import { 
  FaGoogle, 
  FaFacebook, 
  FaArrowRight, 
  FaEye, 
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaShieldAlt
} from "react-icons/fa";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield, 
  CheckCircle,
  Star,
  Users,
  Zap
} from 'lucide-react';
import { CenteredLayout } from "../../components";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import firebase from 'firebase/compat/app';
import authService from '../../services/authService';
import { formatErrorForUser, createErrorNotification, logError } from '../../utils/errorHandling';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export const LoginView = ({ ...props }) => {
  const context = useContext(GlobalStore);
  const { onAuthenticated, axios, notify } = context;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [provider, setProvider] = useState('veyu');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const redirect = useNavigate();

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const features = [
    {
      icon: Shield,
      title: 'Secure Login',
      description: 'Your data is protected with enterprise-grade security',
      color: 'green'
    },
    {
      icon: Users,
      title: '50,000+ Users',
      description: 'Join thousands of satisfied customers',
      color: 'blue'
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Get started immediately after login',
      color: 'purple'
    }
  ];

  async function handleLogin(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await authService.login(email, password);
      
      // Handle both response formats: {success, data: {user, tokens}} or {user, tokens}
      let user;
      
      if (result.success && result.data) {
        // New format: {success, data: {user, tokens}}
        user = result.data.user;
      } else if (result.user) {
        // Direct format: {user, tokens}
        user = result.user;
      }
      
      if (user) {
        // Pass the full result to onAuthenticated, not just the user
        onAuthenticated(result);
        
        notify({
          'title': 'Welcome Back!',
          'body': `Successfully logged in! Welcome back ${user?.first_name || user?.user_type}`,
          'color': 'green'
        });

        // Handle missing user data gracefully
        const userType = user?.user_type;
        if (!userType) {
          console.warn('⚠️ User type missing from login response, defaulting to customer');
        }
        
        console.log('🔐 Login redirect check:', {
          userType: userType || 'unknown',
          email_verified: user?.email_verified,
          is_verified: user?.is_verified,
          redirectUrl: authService.getPostLoginRedirectUrl()
        });
        
        // Redirect based on user type
        // Business users (dealers/mechanics) always go to dashboard after login
        // The dashboard will handle any profile completion checks
        if (userType === 'dealer' || userType === 'mechanic') {
          console.log('🔄 Business user - redirecting to dashboard');
          redirect('/dashboard');
        } else {
          // Customer users always redirect to home
          const userEmail = user?.email || 'unknown';
          console.log('🔄 Customer user - redirecting to home');
          redirect(`/home?user=${userEmail}`);
        }
      } else {
        throw new Error('Login failed - no user data received. Please try again.');
      }
    } catch (error) {
      // Enhanced error handling with detailed logging and user-friendly messages
      console.error('🚨 Login Error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      let errorMessage = error.message;
      
      // Handle specific API error responses
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data?.email) {
            errorMessage = 'Please enter a valid email address.';
          } else if (data?.password) {
            errorMessage = 'Password is required.';
          } else if (data?.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) 
              ? data.non_field_errors.join(' ') 
              : data.non_field_errors;
          } else {
            errorMessage = 'Invalid login credentials. Please check your email and password.';
          }
        } else if (status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (status === 429) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again in a few minutes.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.detail) {
          errorMessage = data.detail;
        }
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      // Create an error object with the processed message
      const processedError = {
        ...error,
        message: errorMessage,
        context: 'login'
      };
      return onError(processedError);
    } finally {
      setIsLoading(false);
    }
  }

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      
      const user = result.user;
      if (user) {
        const accessToken = await user.getIdToken();
        const data = await authService.socialLogin('google', accessToken);
        
        onAuthenticated(data);
        notify({
          'title': 'Welcome Back!',
          'body': `Successfully logged in with Google! Welcome back ${data?.user?.user_type || data?.user_type}`,
          'color': 'green'
        });

        // Extract user data from response and handle missing data gracefully
        const userData = data?.user || data;
        const userType = userData?.user_type;
        if (!userType) {
          console.warn('⚠️ User type missing from Google login response, defaulting to customer');
        }
        
        console.log('🔐 Login redirect check:', {
          userType: userType || 'unknown',
          email_verified: userData?.email_verified || user?.email_verified,
          is_verified: userData?.is_verified || user?.is_verified
        });
        
        // Redirect based on user type
        // Business users (dealers/mechanics) always go to dashboard after login
        // The dashboard will handle any profile completion checks
        if (userType === 'dealer' || userType === 'mechanic') {
          console.log('🔄 Business user - redirecting to dashboard');
          redirect('/dashboard');
        } else {
          // Customer users always redirect to home
          const userEmail = userData?.email || user?.email || 'unknown';
          console.log('🔄 Customer user - redirecting to home');
          redirect(`/home?user=${userEmail}`);
        }
      }
    } catch (error) {
      // Enhanced Google sign-in error handling
      console.error("🚨 Google Sign-in Error:", {
        error: error,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      // Handle specific Google sign-in errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-in was cancelled. Please try again if you want to continue.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error during Google sign-in. Please check your connection and try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many Google sign-in attempts. Please wait a few minutes before trying again.";
      } else if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          errorMessage = "Invalid Google authentication. Please try signing in again.";
        } else if (status === 401) {
          errorMessage = "Google authentication failed. Please try again.";
        } else if (status >= 500) {
          errorMessage = "Server error during Google sign-in. Please try again in a few minutes.";
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.message.includes('Network Error')) {
        errorMessage = "Network error during Google sign-in. Please check your connection and try again.";
      }

      // Create an error object with the processed message
      const processedError = {
        ...error,
        message: errorMessage,
        context: 'google-signin'
      };
      onError(processedError);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  function onError(error, reload = false, showRetry = true) {
    // Use the enhanced error handling utility
    const errorInfo = formatErrorForUser(error, 'login');
    
    // Log additional context for login errors
    logError(error, 'Login', {
      email: email ? email.substring(0, 3) + '***' : 'not provided',
      hasPassword: !!password,
      userAgent: navigator.userAgent
    });

    // Create notification configuration
    const retryCallback = showRetry ? () => {
      // Clear error state and allow retry
      setIsLoading(false);
      setIsGoogleLoading(false);
      // Focus on email field for user convenience
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput) emailInput.focus();
    } : null;

    const notificationConfig = createErrorNotification(errorInfo, retryCallback);
    
    // Convert to the format expected by the notify function
    const legacyNotificationConfig = {
      'title': notificationConfig.title,
      'body': notificationConfig.description,
      'color': 'red',
      'duration': notificationConfig.duration
    };

    if (notify && typeof notify === 'function') {
      notify(legacyNotificationConfig);
    } else {
      console.error('Notify function not available:', error.message);
      // Fallback to alert if notify is not available
      alert(`${notificationConfig.title}: ${notificationConfig.description}`);
    }
    
    if (reload) {
      refresh();
    }
  }
  
  function refresh() {
    setEmail('');
    setPassword('');
    setRememberMe(false);
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
              Welcome Back to Veyu
            </Heading>
            <Text fontSize="lg" color={textColor}>
              Sign in to access your automotive marketplace
            </Text>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
            {/* Left Side - Features */}
            <MotionBox variants={itemVariants} display={{ base: 'none', lg: 'block' }}>
              <VStack spacing={8} align="start">
                <Box>
                  <Heading size="lg" color="gray.800" mb={4}>
                    Why Choose Veyu?
                  </Heading>
                  <Text fontSize="lg" color={textColor} lineHeight="tall">
                    Join Africa's leading automotive marketplace with verified dealers, 
                    secure transactions, and comprehensive vehicle services.
                  </Text>
                </Box>

                <VStack spacing={6} w="full">
                  {features.map((feature, i) => (
                    <MotionBox
                      key={i}
                      variants={itemVariants}
                      whileHover={{ x: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HStack
                        spacing={4}
                        p={4}
                        bg={cardBg}
                        borderRadius="xl"
                        shadow="sm"
                        border="1px solid"
                        borderColor="gray.200"
                        w="full"
                        _hover={{
                          shadow: 'md',
                          borderColor: `${feature.color}.300`
                        }}
                        transition="all 0.3s"
                      >
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg={`${feature.color}.100`}
                        >
                          <feature.icon size={24} color={`var(--chakra-colors-${feature.color}-600)`} />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" color="gray.800">
                            {feature.title}
                          </Text>
                          <Text fontSize="sm" color={textColor}>
                            {feature.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </MotionBox>
                  ))}
                </VStack>

                {/* Stats */}
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  shadow="md"
                  border="1px solid"
                  borderColor="gray.200"
                  w="full"
                >
                  <SimpleGrid columns={3} spacing={4} textAlign="center">
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">50K+</Text>
                      <Text fontSize="xs" color={textColor}>Active Users</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">25K+</Text>
                      <Text fontSize="xs" color={textColor}>Vehicles</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.500">4.8★</Text>
                      <Text fontSize="xs" color={textColor}>Rating</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>
              </VStack>
            </MotionBox>            
{/* Right Side - Login Form */}
            <MotionBox variants={itemVariants}>
              <MotionCard
                bg={cardBg}
                shadow="2xl"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                overflow="hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  position="relative"
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  p={6}
                  color="white"
                  textAlign="center"
                >
                  <Heading size="lg" mb={2}>Sign In</Heading>
                  <Text opacity={0.9}>Access your Veyu account</Text>
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme="whiteAlpha"
                    variant="subtle"
                  >
                    Secure
                  </Badge>
                </Box>

                <Box p={8}>
                  <form onSubmit={handleLogin} method="post" name="sign-in-form">
                    <VStack spacing={6}>
                      {/* Email Field */}
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Email Address
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Mail size={20} color="gray" />
                          </InputLeftElement>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            size="lg"
                            bg="gray.50"
                            border="2px solid"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'blue.300' }}
                            _focus={{ 
                              borderColor: 'blue.500', 
                              bg: 'white',
                              shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                            }}
                            pl={12}
                          />
                        </InputGroup>
                      </FormControl>

                      {/* Password Field */}
                      <FormControl isRequired>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Password
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Lock size={20} color="gray" />
                          </InputLeftElement>
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            size="lg"
                            bg="gray.50"
                            border="2px solid"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'blue.300' }}
                            _focus={{ 
                              borderColor: 'blue.500', 
                              bg: 'white',
                              shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                            }}
                            pl={12}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              onClick={() => setShowPassword(!showPassword)}
                              variant="ghost"
                              size="sm"
                              color="gray.500"
                              _hover={{ color: 'blue.500' }}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      {/* Remember Me & Forgot Password */}
                      <HStack justify="space-between" w="full">
                        <Checkbox 
                          isChecked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)}
                          colorScheme="blue"
                        >
                          <Text fontSize="sm" color={textColor}>Remember me</Text>
                        </Checkbox>
                        <ChakraLink
                          as={Link}
                          to="/forgot-password"
                          fontSize="sm"
                          color="blue.500"
                          fontWeight="semibold"
                          _hover={{ color: 'blue.600', textDecoration: 'underline' }}
                        >
                          Forgot password?
                        </ChakraLink>
                      </HStack>

                      {/* Login Button */}
                      <Button
                        type="submit"
                        size="lg"
                        colorScheme="blue"
                        w="full"
                        rightIcon={<ArrowRight size={20} />}
                        isLoading={isLoading}
                        loadingText="Signing in..."
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                        py={6}
                      >
                        Sign In
                      </Button>

                      {/* Divider */}
                      <HStack w="full">
                        <Divider />
                        <Text fontSize="sm" color="gray.500" px={3} whiteSpace="nowrap">
                          or continue with
                        </Text>
                        <Divider />
                      </HStack>

                      {/* Google Sign In */}
                      <Button
                        w="full"
                        size="lg"
                        variant="outline"
                        leftIcon={<FaGoogle />}
                        onClick={signInWithGoogle}
                        isLoading={isGoogleLoading}
                        loadingText="Connecting..."
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ 
                          borderColor: 'red.300', 
                          bg: 'red.50',
                          transform: 'translateY(-2px)',
                          shadow: 'md'
                        }}
                        transition="all 0.2s"
                        py={6}
                      >
                        Continue with Google
                      </Button>

                      {/* Sign Up Link */}
                      <Box textAlign="center" pt={4}>
                        <Text color={textColor}>
                          Don't have an account?{' '}
                          <ChakraLink
                            as={Link}
                            to="/signup"
                            color="blue.500"
                            fontWeight="semibold"
                            _hover={{ color: 'blue.600', textDecoration: 'underline' }}
                          >
                            Sign up for free
                          </ChakraLink>
                        </Text>
                      </Box>

                      {/* Security Notice */}
                      <Alert
                        status="info"
                        variant="left-accent"
                        borderRadius="lg"
                        bg="blue.50"
                        borderColor="blue.200"
                      >
                        <AlertIcon as={Shield} color="blue.500" />
                        <Box>
                          <Text fontSize="sm" color="blue.700">
                            Your login is secured with enterprise-grade encryption and 
                            multi-factor authentication.
                          </Text>
                        </Box>
                      </Alert>
                    </VStack>
                  </form>
                </Box>
              </MotionCard>
            </MotionBox>
          </SimpleGrid>

          {/* Mobile Features (shown only on mobile) */}
          <MotionBox variants={itemVariants} display={{ base: 'block', lg: 'none' }} mt={8}>
            <VStack spacing={4}>
              <Heading size="md" color="gray.800" textAlign="center">
                Why Choose Veyu?
              </Heading>
              <SimpleGrid columns={1} spacing={4} w="full">
                {features.map((feature, i) => (
                  <HStack
                    key={i}
                    spacing={4}
                    p={4}
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="sm"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={`${feature.color}.100`}
                    >
                      <feature.icon size={20} color={`var(--chakra-colors-${feature.color}-600)`} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="gray.800" fontSize="sm">
                        {feature.title}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {feature.description}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>

          {/* Footer Links */}
          <MotionBox variants={itemVariants} mt={12}>
            <VStack spacing={4} textAlign="center">
              <HStack spacing={6} flexWrap="wrap" justify="center">
                <ChakraLink
                  as={Link}
                  to="/privacy-policy"
                  fontSize="sm"
                  color={textColor}
                  _hover={{ color: 'blue.500' }}
                >
                  Privacy Policy
                </ChakraLink>
                <ChakraLink
                  as={Link}
                  to="/terms-of-service"
                  fontSize="sm"
                  color={textColor}
                  _hover={{ color: 'blue.500' }}
                >
                  Terms of Service
                </ChakraLink>
                <ChakraLink
                  as={Link}
                  to="/contact"
                  fontSize="sm"
                  color={textColor}
                  _hover={{ color: 'blue.500' }}
                >
                  Contact Support
                </ChakraLink>
              </HStack>
              <Text fontSize="xs" color="gray.400">
                © 2025 Veyu Ltd. All rights reserved.
              </Text>
            </VStack>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default LoginView;