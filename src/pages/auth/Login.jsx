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
    setIsLoading(true);
    
    try {
      const data = await authService.login(email, password);
      
      onAuthenticated(data);
      notify({
        'title': 'Welcome Back!',
        'body': `Successfully logged in! Welcome back ${data?.user?.user_type || data?.user_type}`,
        'color': 'green'
      });

      const userType = data?.user?.user_type || data?.user_type;
      switch (userType) {
        case 'dealer': redirect('/dashboard'); break;
        case 'mechanic': redirect('/dashboard'); break;
        default: redirect(`/home?user=${data?.user?.email || data?.email}`); break;
      }
    } catch (error) {
      return onError(error.message);
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

        const userType = data?.user?.user_type || data?.user_type;
        switch (userType) {
          case 'dealer': redirect('/dashboard'); break;
          case 'mechanic': redirect('/dashboard'); break;
          default: redirect(`/home?user=${data?.user?.email || data?.email}`); break;
        }
      }
    } catch (error) {
      console.error("Google sign-in error", error);
      onError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  function onError(message, reload = false) {
    if (notify && typeof notify === 'function') {
      notify({
        'title': 'Login Failed',
        'body': message || 'Something went wrong! Please try again.',
        'color': 'red'
      });
    } else {
      console.error('Notify function not available:', message);
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