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
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  IconButton,
  Link as ChakraLink,
  ButtonGroup,
  PinInput,
  PinInputField,
  Select,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  Badge,
  Alert,
  AlertIcon,
  Container,
  SimpleGrid,
  Progress,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps
} from "@chakra-ui/react";
import { useContext, useRef, useState, createContext, useEffect } from "react";
import { GlobalStore } from "../../App";
import { motion } from 'framer-motion';
import { CenteredLayout, OTPField } from "../../components";
import { redirect, useNavigate, useSearchParams, useParams, Link as RLink } from "react-router-dom";
import { RiCircleFill, RiCircleLine, RiMailCloseFill, RiMailFill, RiMessage2Line, RiMessage3Line, RiMessageLine } from "react-icons/ri";
import authService from '../../services/authService';
import { FcSms, FcVoicemail } from "react-icons/fc";
import { FaGoogle, FaFacebook, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { RxChatBubble, RxEnvelopeOpen } from "react-icons/rx";
import { jsonifyObject, objectifyJSON } from "../../utils";
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Shield,
  CheckCircle,
  Star,
  Users,
  Zap,
  Building,
  Wrench,
  Car
} from 'lucide-react';
import { auth } from "../../firebase";
import firebase from 'firebase/compat/app';
import BusinessProfile from './BusinessProfile';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export const SignupContext = createContext({});

export const SignupView = ({ ...props }) => {
  const { redirect, axios, notify } = useContext(GlobalStore);
  const [params] = useSearchParams();
  const type = params.get('type') || 'customer';
  const [step, setStepValue] = useState(0);
  const [payload, setPayload] = useState({});
  const [user, setUser] = useState(null);
  const [skipConfirmation, setSkipStep] = useState({
    profile: false,
    email: false,
    phone_number: true,
  });
  const [verification, setVerification] = useState('email');
  const [userProvider, setUserProvider] = useState('email');
  const [user_type, setUserType] = useState(type || 'customer');

  const bgGradient = useColorModeValue(
    'linear(to-br, orange.50, yellow.50, red.50)',
    'linear(to-br, gray.900, orange.900, yellow.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const context = {
    nextStep,
    gotoStep,
    addToPayload: onSubmit,
    payload,
    userProvider,
    setUserProvider,
    user_type,
    setUserType,
    createAccount,
    checkEmail,
    setSkipStep, // Add setSkipStep to context
  };

  const signUpWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);

      const _user = result.user;
      let [first_name, last_name] = _user.displayName.split(" ");
      const data = {
        email: _user.email,
        first_name,
        last_name,
        provider: 'google',
      };

      const newUser = await checkEmail(_user.email);

      if (newUser) {
        await setPayload({ ...data, user_type: type === 'business' ? 'dealer' : 'customer' });
        await setUser(_user);
        // For Google signup, email is pre-verified, so we can skip email verification
        setSkipStep({ ...skipConfirmation, email: true });
        setUserProvider('google'); // Set provider to indicate this is Google signup
        nextStep();
      }
    } catch (error) {
      console.error("Signup with google error", error);
    }
  };

  const steps = [
    {
      title: `Create ${type === 'business' ? 'a business' : 'your'} account`,
      description: 'Start Today!',
      key: 'signup',
      component: <EmailStep type={type} signUpWithGoogle={signUpWithGoogle} />
    },
    {
      title: 'Complete your profile',
      description: 'Tell us about yourself',
      key: 'profile',
      component: <SignupStep type={type} />
    },
    {
      title: 'Verify your email',
      description: 'Confirm your email address',
      key: 'email',
      component: <ConfirmationStep type={type} verification={'email'} />
    },
  ];

  const { activeStep } = useSteps({
    index: step,
    count: steps.length,
  });

  function nextStep() {
    console.log('nextStep called: current step', step, 'going to step', step + 1);
    setStepValue((step + 1));
  }

  function gotoStep(num) {
    console.log('gotoStep called: current step', step, 'going to step', num);
    setStepValue(num);
  }

  function onSubmit(data) {
    setPayload({
      ...payload,
      ...data
    });
  }

  async function checkEmail(email) {
    try {
      // Instead of checking if email exists, we'll just validate the email format
      // and let the registration endpoint handle duplicate email errors
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        notify({
          title: 'Invalid Email',
          body: 'Please enter a valid email address',
          color: 'red',
        });
        return false;
      }
      return true;
    } catch (err) {
      notify({
        title: 'An error occurred!',
        body: err.message
      });
      return false;
    }
  }

  async function createAccount(formData) {
    onSubmit(formData);
  }

  const StepComponent = ({ props }) => {
    const currentStep = steps[step];

    useEffect(() => {
      console.log('StepComponent useEffect:', {
        currentStepKey: currentStep.key,
        skipConfirmation,
        shouldSkip: skipConfirmation[`${currentStep.key}`],
        userProvider
      });

      // Special handling for email verification step
      if (currentStep.key === 'email') {
        const auth = JSON.parse(localStorage.getItem('veyu-auth-user') || '{}');
        const isEmailVerified = auth?.email_verified || false;
        
        console.log('Email verification step - checking if should skip:', {
          isEmailVerified,
          skipConfirmationEmail: skipConfirmation.email,
          userProvider,
          authData: auth
        });

        // Only skip email verification if:
        // 1. Email is actually verified, OR
        // 2. User signed up with Google (email is pre-verified by Google)
        if ((isEmailVerified || userProvider === 'google') && skipConfirmation[currentStep.key]) {
          console.log('Auto-skipping email verification step - email already verified or Google signup');
          nextStep();
        }
        // If skipConfirmation.email is true but conditions aren't met, don't skip
        return;
      }

      // For other steps, use the original logic
      if (skipConfirmation[`${currentStep.key}`]) {
        console.log('Auto-skipping step:', currentStep.key);
        nextStep();
      }
    }, [currentStep.key, skipConfirmation, userProvider]);

    return currentStep.component;
  };

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
    <SignupContext.Provider value={context}>
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
                Join Veyu Today
              </Heading>
              <Text fontSize="lg" color={textColor}>
                Create your account and start your automotive journey
              </Text>
            </MotionBox>

            {/* Progress Stepper */}
            <MotionBox variants={itemVariants} mb={8}>
              <Box maxW="2xl" mx="auto" px={{ base: 4, md: 0 }}>
                <Stepper 
                  index={activeStep} 
                  colorScheme="orange" 
                  size={{ base: 'md', md: 'lg' }}
                  orientation={{ base: 'horizontal', md: 'horizontal' }}
                  gap={{ base: 2, md: 4 }}
                >
                  {steps.map((stepItem, index) => (
                    <Step key={index}>
                      <StepIndicator 
                        sx={{
                          '&[data-status=complete]': {
                            bg: 'orange.500',
                            borderColor: 'orange.500',
                            color: 'white'
                          },
                          '&[data-status=active]': {
                            bg: 'orange.500',
                            borderColor: 'orange.500',
                            color: 'white'
                          },
                          '&[data-status=incomplete]': {
                            bg: 'gray.100',
                            borderColor: 'gray.300',
                            color: 'gray.500'
                          }
                        }}
                      >
                        <StepStatus
                          complete={<StepIcon />}
                          incomplete={<StepNumber />}
                          active={<StepNumber />}
                        />
                      </StepIndicator>
                      
                      {/* Desktop: Show full titles and descriptions */}
                      <Box 
                        flexShrink="0" 
                        display={{ base: 'none', lg: 'block' }}
                        ml={3}
                      >
                        <StepTitle fontSize="sm" fontWeight="semibold">
                          {stepItem.title}
                        </StepTitle>
                        <StepDescription fontSize="xs" color="gray.500">
                          {stepItem.description}
                        </StepDescription>
                      </Box>
                      
                      {/* Tablet: Show abbreviated titles only */}
                      <Box 
                        flexShrink="0" 
                        display={{ base: 'none', md: 'block', lg: 'none' }}
                        ml={2}
                      >
                        <StepTitle fontSize="xs" fontWeight="semibold" noOfLines={1}>
                          {stepItem.title.length > 20 ? `${stepItem.title.substring(0, 20)}...` : stepItem.title}
                        </StepTitle>
                      </Box>
                      
                      <StepSeparator 
                        sx={{
                          '&[data-status=complete]': {
                            bg: 'orange.500'
                          },
                          '&[data-status=active]': {
                            bg: 'orange.200'
                          }
                        }}
                      />
                    </Step>
                  ))}
                </Stepper>
                
                {/* Mobile: Show current step info below stepper */}
                <Box 
                  display={{ base: 'block', md: 'none' }} 
                  textAlign="center" 
                  mt={4}
                  p={3}
                  bg="orange.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <Text fontSize="sm" fontWeight="semibold" color="orange.800">
                    {steps[activeStep]?.title}
                  </Text>
                  <Text fontSize="xs" color="orange.600" mt={1}>
                    {steps[activeStep]?.description}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Step {activeStep + 1} of {steps.length}
                  </Text>
                </Box>
              </Box>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="start">
              {/* Left Side - Features */}
              <MotionBox variants={itemVariants} display={{ base: 'none', lg: 'block' }}>
                <VStack spacing={8} align="start" position="sticky" top={8}>
                  <Box>
                    <Heading size="lg" color="gray.800" mb={4}>
                      Why Join Veyu?
                    </Heading>
                    <Text fontSize="lg" color={textColor} lineHeight="tall">
                      Join Africa's fastest-growing automotive marketplace with verified dealers,
                      secure transactions, and comprehensive vehicle services.
                    </Text>
                  </Box>

                  <VStack spacing={6} w="full">
                    {[
                      {
                        icon: Shield,
                        title: 'Secure Platform',
                        description: 'Your transactions are protected with bank-level security',
                        color: 'green'
                      },
                      {
                        icon: Users,
                        title: '50,000+ Community',
                        description: 'Join thousands of satisfied buyers and sellers',
                        color: 'blue'
                      },
                      {
                        icon: Zap,
                        title: 'Instant Verification',
                        description: 'Get verified quickly and start trading immediately',
                        color: 'purple'
                      }
                    ].map((feature, i) => (
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
                        <Text fontSize="2xl" fontWeight="bold" color="primary">50K+</Text>
                        <Text fontSize="xs" color={textColor}>Active Users</Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">25K+</Text>
                        <Text fontSize="xs" color={textColor}>Vehicles</Text>
                      </VStack>
                      <VStack spacing={1}>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">4.8★</Text>
                        <Text fontSize="xs" color={textColor}>Rating</Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </MotionBox>

              {/* Right Side - Signup Form */}
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
                    bgGradient="linear(to-r, primary, orange.400)"
                    p={6}
                    color="white"
                    textAlign="center"
                  >
                    <Heading size="lg" mb={2}>{steps[step].title}</Heading>
                    <Text opacity={0.9}>{steps[step].description}</Text>
                    <Badge
                      position="absolute"
                      top={4}
                      right={4}
                      colorScheme="whiteAlpha"
                      variant="subtle"
                    >
                      Step {step + 1} of {steps.length}
                    </Badge>
                  </Box>

                  <Box p={8}>
                    <StepComponent />
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
                  {[
                    {
                      icon: Shield,
                      title: 'Secure Platform',
                      description: 'Bank-level security for all transactions',
                      color: 'green'
                    },
                    {
                      icon: Users,
                      title: '50,000+ Community',
                      description: 'Join thousands of satisfied users',
                      color: 'blue'
                    },
                    {
                      icon: Zap,
                      title: 'Instant Verification',
                      description: 'Quick verification process',
                      color: 'purple'
                    }
                  ].map((feature, i) => (
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
          </MotionBox>
        </Container>
      </Box>
    </SignupContext.Provider>
  );
};

const EmailStep = ({ type, signUpWithGoogle }) => {
  const [email, setEmail] = useState('');
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { axios, notify } = useContext(GlobalStore);
  const { checkEmail, user_type, addToPayload, setUserType, payload, nextStep, setSkipStep } = useContext(SignupContext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      // For regular email/password signup, ensure email verification is not skipped
      setSkipStep(prev => ({ ...prev, email: false }));
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setIsLoading(false);
        return notify({
          title: 'Invalid Email',
          color: 'red',
          body: 'Please enter a valid email address'
        });
      }

      if (password !== confirmPassword) {
        setIsLoading(false);
        return notify({
          title: 'Password Mismatch',
          color: 'red',
          body: 'Passwords do not match'
        });
      }

      if (password.length < 8) {
        setIsLoading(false);
        return notify({
          title: 'Weak Password',
          color: 'red',
          body: 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters'
        });
      }

      // Check password strength
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        setIsLoading(false);
        return notify({
          title: 'Weak Password',
          color: 'red',
          body: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      const canProceed = await checkEmail(email);
      if (canProceed) {
        if (type === 'business' && !['dealer', 'mechanic'].includes(user_type)) {
          throw new Error("Please select a business type (Dealer or Mechanic)");
        }

        const finalUserType = type === 'personal' || type === 'customer' ? 'customer' : user_type;
        setUserType(finalUserType);

        addToPayload({
          email,
          password,
          confirm_password: confirmPassword, // Use API-compliant field name
          provider: 'veyu',

          user_type: finalUserType,
          first_name: payload.first_name || '',
          last_name: payload.last_name || ''
        });
        nextStep();
      }
    } catch (err) {
      notify({
        title: 'Error!',
        color: 'red',
        body: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box>
      <form onSubmit={handleSubmit} method="post" name="sign-up-form">
        {type === 'business' && (
          <Box mb={6}>
            <FormLabel color="gray.700" fontWeight="semibold" textAlign="center">
              Select your business type
            </FormLabel>
            <ButtonGroup isAttached w="full">
              <Button
                flex={1}
                size="lg"
                variant={user_type === 'dealer' ? 'solid' : 'outline'}
                colorScheme="orange"
                leftIcon={<Car size={20} />}
                onClick={() => setUserType('dealer')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Dealer
              </Button>
              <Button
                flex={1}
                size="lg"
                variant={user_type === 'mechanic' ? 'solid' : 'outline'}
                colorScheme="orange"
                leftIcon={<Wrench size={20} />}
                onClick={() => setUserType('mechanic')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Mechanic
              </Button>
            </ButtonGroup>
          </Box>
        )}

        <VStack spacing={6}>
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
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'primary',
                  bg: 'white',
                  shadow: '0 0 0 1px var(--chakra-colors-primary)'
                }}
                pl={12}
              />
            </InputGroup>
          </FormControl>

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
                placeholder="Create a password (min 8 characters)"
                size="lg"
                bg="gray.50"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'primary',
                  bg: 'white',
                  shadow: '0 0 0 1px var(--chakra-colors-primary)'
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
                  _hover={{ color: 'primary' }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700" fontWeight="semibold">
              Confirm Password
            </FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Lock size={20} color="gray" />
              </InputLeftElement>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                size="lg"
                bg="gray.50"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'primary',
                  bg: 'white',
                  shadow: '0 0 0 1px var(--chakra-colors-primary)'
                }}
                pl={12}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  icon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                  _hover={{ color: 'primary' }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            size="lg"
            w="full"
            colorScheme="orange"
            bg="primary"
            rightIcon={<ArrowRight size={20} />}
            isLoading={isLoading}
            loadingText="Checking..."
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
            py={6}
          >
            Get Started
          </Button>

          <HStack w="full">
            <Divider />
            <Text fontSize="sm" color="gray.500" px={3} whiteSpace="nowrap">
              or continue with
            </Text>
            <Divider />
          </HStack>

          <Button
            w="full"
            size="lg"
            variant="outline"
            leftIcon={<FaGoogle />}
            onClick={signUpWithGoogle}
            isDisabled={type === 'business' && !['dealer', 'mechanic'].includes(user_type)}
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

          <Divider />

          <Button
            as={RLink}
            to={`/signup/?type=${type !== 'business' ? 'business' : 'customer'}`}
            size="lg"
            w="full"
            variant="outline"
            colorScheme="orange"
            rightIcon={<ArrowRight size={20} />}
            border="2px solid"
            borderColor="primary"
            _hover={{
              bg: 'orange.50',
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
            transition="all 0.2s"
            py={6}
          >
            Create {type === 'business' ? 'Personal' : 'Business'} Account
          </Button>

          <HStack justify="center">
            <Text color="gray.600">
              Already have an account?
            </Text>
            <ChakraLink
              as={RLink}
              to="/login"
              color="primary"
              fontWeight="semibold"
              _hover={{ color: 'orange.600', textDecoration: 'underline' }}
            >
              Sign in
            </ChakraLink>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

const SignupStep = ({ type }) => {
  const { axios, notify, onAuthenticated } = useContext(GlobalStore);
  const { payload, addToPayload, nextStep, user_type, gotoStep, setSkipStep } = useContext(SignupContext);
  const [formData, setFormData] = useState({
    first_name: payload?.first_name || '',
    last_name: payload?.last_name || '',
    phone_number: payload?.phone_number || '',
    business_name: payload?.business_name || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes for controlled components
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    console.log('🚀 SIGNUP FORM SUBMITTED');
    console.log('📋 Form Data:', formData);

    const { first_name, last_name, phone_number, business_name } = formData;
    console.log('📝 Extracted values:', { first_name, last_name, phone_number, business_name, user_type });
    // Prepare the complete payload with all required fields
    // Prepare payload according to API documentation
    const newPayload = {
      email: payload?.email,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      password: payload?.password,
      confirm_password: payload?.confirm_password, // Use API-compliant field name
      user_type: user_type || 'customer',
      provider: 'veyu',
    };

    // TEMPORARY DEBUG: Always add business_name
    newPayload.business_name = business_name ? business_name.trim() : 'Test Business Name';
    
    console.log('FORCE ADDED business_name to payload:', newPayload.business_name);
    console.log('Final user_type:', newPayload.user_type);
    console.log('Original user_type:', user_type);
    console.log('Original business_name from form:', business_name);

    // Add phone_number if provided
    if (phone_number && phone_number.trim()) {
      const cleanPhone = phone_number.trim();
      // Ensure phone number starts with + for international format
      if (cleanPhone && !cleanPhone.startsWith('+')) {
        // If it starts with 0, assume it's Nigerian and convert to +234
        if (cleanPhone.startsWith('0')) {
          newPayload.phone_number = '+234' + cleanPhone.substring(1);
        } else if (cleanPhone.length >= 10) {
          // If it's 10+ digits without +, assume it needs +234 prefix
          newPayload.phone_number = '+234' + cleanPhone;
        } else {
          // Keep as is if it's shorter (might be incomplete)
          newPayload.phone_number = cleanPhone;
        }
      } else {
        newPayload.phone_number = cleanPhone;
      }
    }

    // Debug: Log payload before cleanup
    console.log('Payload before cleanup:', JSON.stringify(newPayload, null, 2));
    console.log('Individual payload values:', {
      email: payload?.email,
      password: payload?.password,
      confirm_password: payload?.confirm_password,
      first_name: first_name,
      last_name: last_name,
      business_name: business_name,
      user_type: user_type
    });
    
    // Additional debug for business accounts
    console.log('USER TYPE DEBUG:', {
      user_type: user_type,
      is_business: user_type === 'dealer' || user_type === 'mechanic',
      formData_business_name: formData.business_name,
      extracted_business_name: business_name
    });
    
    if (user_type === 'dealer' || user_type === 'mechanic') {
      console.log('BUSINESS ACCOUNT FORM DEBUG:', {
        user_type: user_type,
        business_name_from_form: business_name,
        business_name_type: typeof business_name,
        business_name_length: business_name ? business_name.length : 'N/A',
        business_name_in_payload: 'business_name' in newPayload,
        business_name_payload_value: newPayload.business_name
      });
    }

    // Remove undefined/null values only for optional fields, keep required fields for validation
    const requiredFields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'business_name'];
    Object.keys(newPayload).forEach(key => {
      if ((newPayload[key] === undefined || newPayload[key] === null) && !requiredFields.includes(key)) {
        delete newPayload[key];
      }
    });

    // Log the final payload for debugging
    console.log('Final signup payload (after cleanup):', JSON.stringify(newPayload, null, 2));

    // Basic validation
    if (!first_name || !last_name) {
      setIsLoading(false);
      return notify({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }

    // Validate business name for business accounts
    if ((user_type === 'dealer' || user_type === 'mechanic') && (!business_name || !business_name.trim())) {
      setIsLoading(false);
      return notify({
        title: 'Business Name Required',
        description: 'Please enter your business name',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }

    try {
      addToPayload({ ...newPayload });

      // First, check if the email exists
      let res;

      // Ensure required fields are present
      if (!newPayload.email || !newPayload.password || !newPayload.confirm_password) {
        throw new Error('Email, password, and confirm password are required');
      }

      // Ensure passwords match
      if (newPayload.password !== newPayload.confirm_password) {
        throw new Error('Passwords do not match');
      }

      try {
        // Log the payload for debugging
        console.log('Sending signup payload:', JSON.stringify(newPayload, null, 2));

        // Create FormData to handle the request properly
        const formData = new FormData();

        // Add all fields to FormData
        Object.entries(newPayload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });

        // Log the final payload being sent
        console.log('Final signup payload:', Object.fromEntries(formData.entries()));

        // Create a seamless signup experience that handles server errors gracefully
        let registrationData = null;
        let accountCreated = false;

        // Retry logic for timeout errors
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          try {
            // Use the authService for registration
            console.log(`Attempting registration (attempt ${retryCount + 1}/${maxRetries + 1}) with payload:`, newPayload);
            console.log('Password field check:', {
              hasPassword: !!newPayload.password,
              passwordLength: newPayload.password ? newPayload.password.length : 0,
              passwordValue: newPayload.password ? '[REDACTED]' : 'MISSING'
            });

            registrationData = await authService.register(newPayload);
            accountCreated = true;
            console.log('Registration successful:', registrationData);
            break; // Success, exit retry loop
          } catch (registrationError) {
            console.log(`Registration attempt ${retryCount + 1} failed:`, registrationError.message);

            // Handle specific error cases that shouldn't be retried
            if (registrationError.message?.includes('already exists') ||
              registrationError.message?.includes('duplicate')) {
              throw new Error('An account with this email already exists. Please sign in instead.');
            }

            // Check if this is a timeout error and we can retry
            if (registrationError.message?.includes('timeout') && retryCount < maxRetries) {
              retryCount++;
              console.log(`Retrying registration due to timeout (attempt ${retryCount + 1}/${maxRetries + 1})...`);

              // Show user that we're retrying
              notify({
                title: 'Retrying...',
                description: `Server is slow to respond. Retrying registration (attempt ${retryCount + 1})...`,
                status: 'info',
                duration: 3000,
                isClosable: true,
              });

              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }

            // If not a timeout error or max retries reached, throw the error
            throw registrationError;
          }
        }

        if (!accountCreated) {
          throw new Error('Failed to create account. Please try again.');
        }

        // Account created successfully - make the experience seamless
        const userData = {
          email: newPayload.email,
          first_name: newPayload.first_name,
          last_name: newPayload.last_name,
          phone_number: newPayload.phone_number,
          user_type: newPayload.user_type,
          ...registrationData
        };

        // Check if we have a token and if email is already verified
        const token = registrationData?.token || registrationData?.access_token || registrationData?.api_token;
        const emailVerified = registrationData?.email_verified || registrationData?.data?.email_verified;

        if (token && emailVerified) {
          // User is already authenticated and verified, skip email verification and go directly to dashboard
          console.log('User authenticated and verified during registration, redirecting to dashboard...');

          // Store authentication data using consistent keys
          localStorage.setItem('veyu_access_token', token);
          localStorage.setItem('veyu_user_data', JSON.stringify(userData));

          // Update global auth state if available
          if (onAuthenticated) {
            onAuthenticated(userData);
          }

          notify({
            title: 'Welcome to Veyu!',
            description: newPayload.user_type === 'customer'
              ? 'Your account has been created successfully. Taking you to your dashboard...'
              : 'Your business account has been created successfully. Let\'s set up your business profile...',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // Redirect based on user type
          setTimeout(() => {
            let redirectPath;
            if (newPayload.user_type === 'customer') {
              redirectPath = '/dashboard';
            } else if (newPayload.user_type === 'mechanic' || newPayload.user_type === 'dealer') {
              // Business accounts should go to business profile setup first
              redirectPath = '/business-profile';
            } else {
              redirectPath = '/dashboard';
            }

            console.log('Token received during registration, redirecting to:', redirectPath, 'for user type:', newPayload.user_type);

            navigate(redirectPath, {
              replace: true,
              state: {
                fromRegistration: true,
                userType: newPayload.user_type,
                userData: userData
              }
            });
          }, 1500);

          return;
        }

        // If we have a token but email is not verified, store the token and proceed to email verification
        if (token && !emailVerified) {
          console.log('User registered with token but email not verified, proceeding to email verification...');

          // Store the token for authenticated API calls during verification
          localStorage.setItem('veyu_access_token', token);
          localStorage.setItem('veyu_user_data', JSON.stringify(userData));

          // Store auth data in the old format too for compatibility
          localStorage.setItem('veyu-auth-user', JSON.stringify({
            token: token,
            email: userData.email,
            user_type: userData.user_type,
            email_verified: false,
            ...userData
          }));

          notify({
            title: 'Account Created Successfully!',
            description: 'Please verify your email to complete the registration process.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Update payload with registration response
          addToPayload(userData);

          // Proceed to email verification step
          console.log('Moving to email verification step...');
          nextStep();
          return;
        }

        // If no token, proceed with email verification
        notify({
          title: 'Account Created Successfully!',
          description: 'Please verify your email to complete the registration process.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Update payload with registration response
        addToPayload(userData);

        // Proceed to email verification step
        console.log('Moving to next step (email verification)...');

        // Just move to the next step without changing skip settings
        // The email verification step should not be skipped (it's false by default)
        nextStep();
      } catch (error) {
        console.error('Registration error:', error);

        // Handle specific error cases
        if (error.message && (error.message.includes('already exists') || error.message.includes('Validation failed'))) {
          notify({
            title: 'Account Already Exists',
            description: 'An account with this email already exists. Please sign in instead.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });

          // Redirect to login page
          setTimeout(() => {
            navigate('/login', {
              state: {
                email: newPayload.email,
                message: 'Account already exists. Please sign in.'
              }
            });
          }, 2000);
          return;
        }

        // Handle specific error cases with user-friendly messages
        if (error.message && error.message.includes('email_verified')) {
          // This is a server-side bug, but let's make it seamless for the user
          notify({
            title: 'Almost There!',
            description: 'Your account is being set up. Please try signing in with your credentials.',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });

          setTimeout(() => {
            navigate('/login', {
              state: {
                email: newPayload.email,
                message: 'Please sign in with your new account credentials.'
              }
            });
          }, 1500);
          return;
        }

        throw error; // Re-throw other errors
      }

      // This code block is no longer needed as we're handling everything above
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup. Please try again.';
      let errorDetails = null;

      if (error.response) {
        // Handle HTTP errors (4xx, 5xx)
        const { data, status, headers } = error.response;
        console.error('Error response:', {
          status,
          headers: JSON.stringify(headers),
          data,
          request: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });

        errorDetails = data;

        if (status === 400) {
          // Handle validation errors - check for new API format first
          if (data?.code === 'VALIDATION_ERROR' && data?.details?.field_errors) {
            const fieldErrors = data.details.field_errors;
            errorMessage = 'Please fix the following errors:\n' + Object.entries(fieldErrors)
              .map(([field, errors]) => `• ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
          } else if (data && typeof data === 'object' && !data.error) {
            // Handle old format
            errorMessage = 'Validation Error:\n' + Object.entries(data)
              .map(([field, errors]) => `• ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
          } else {
            errorMessage = data?.message || 'Invalid request. Please check your input.';
          }
        } else if (status === 500) {
          // Handle the specific email_verified server error
          if (error.message && error.message.includes('email_verified')) {
            errorMessage = 'Account creation encountered a server issue, but your account may have been created. Please try logging in or contact support.';
          } else {
            errorMessage = 'Server Error: ' + (data?.detail || 'Internal server error occurred');
          }
          console.error('Server error details:', data);
        } else if (data?.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data && typeof data === 'object') {
          errorMessage = 'Error: ' + (data.message || JSON.stringify(data, null, 2));
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your internet connection and try again.';
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        errorMessage = `Request error: ${error.message}`;
      }

      // Log the full error for debugging
      console.error('Full error details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        },
        response: error.response?.data,
        stack: error.stack
      });

      notify({
        title: 'Error!',
        color: 'red',
        body: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} method="post">
      <VStack spacing={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel color="gray.700" fontWeight="semibold">
              First Name
            </FormLabel>
            <InputGroup>
              <InputLeftElement>
                <User size={20} color="gray" />
              </InputLeftElement>
              <Input
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="John"
                size="lg"
                bg="gray.50"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'primary',
                  bg: 'white',
                  shadow: '0 0 0 1px var(--chakra-colors-primary)'
                }}
                pl={12}
                isDisabled={isLoading}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700" fontWeight="semibold">
              Last Name
            </FormLabel>
            <InputGroup>
              <InputLeftElement>
                <User size={20} color="gray" />
              </InputLeftElement>
              <Input
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Doe"
                size="lg"
                bg="gray.50"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'primary',
                  bg: 'white',
                  shadow: '0 0 0 1px var(--chakra-colors-primary)'
                }}
                pl={12}
                isDisabled={isLoading}
              />
            </InputGroup>
          </FormControl>
        </SimpleGrid>

        {/* Business Name field - only for business accounts */}
        {(user_type === 'dealer' || user_type === 'mechanic') && (
          <FormControl isRequired>
            <FormLabel color="gray.700" fontWeight="semibold">
              Business Name
            </FormLabel>
            <InputGroup>
              <InputLeftElement>
                <Building size={20} color="gray" />
              </InputLeftElement>
              <Input
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                placeholder={user_type === 'dealer' ? 'AutoMax Motors Ltd' : 'John\'s Auto Services'}
                size="lg"
                bg="gray.50"
                border="2px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'orange.300' }}
                _focus={{
                  borderColor: 'primary',
                  bg: 'white',
                  shadow: '0 0 0 1px var(--chakra-colors-primary)'
                }}
                pl={12}
                isDisabled={isLoading}
              />
            </InputGroup>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Enter your official business name as registered
            </Text>
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel color="gray.700" fontWeight="semibold">
            Phone Number
          </FormLabel>
          <InputGroup>
            <InputLeftElement>
              <Phone size={20} color="gray" />
            </InputLeftElement>
            <Input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="+234 812 4128 234"
              size="lg"
              bg="gray.50"
              border="2px solid"
              borderColor="gray.200"
              _hover={{ borderColor: 'orange.300' }}
              _focus={{
                borderColor: 'primary',
                bg: 'white',
                shadow: '0 0 0 1px var(--chakra-colors-primary)'
              }}
              pl={12}
              isDisabled={isLoading}
            />
          </InputGroup>
        </FormControl>

        <Button
          type="submit"
          size="lg"
          w="full"
          colorScheme="orange"
          bg="primary"
          rightIcon={<ArrowRight size={20} />}
          isLoading={isLoading}
          loadingText="Creating Account..."
          _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
          transition="all 0.2s"
          py={6}
        >
          Continue
        </Button>

        <Alert
          status="info"
          variant="left-accent"
          borderRadius="lg"
          bg="orange.50"
          borderColor="orange.200"
        >
          <AlertIcon as={Shield} color="orange.500" />
          <Box>
            <Text fontSize="sm" color="orange.700">
              Your information is secure and will only be used to create your Veyu account.
            </Text>
          </Box>
        </Alert>
      </VStack>
    </form>
  );
}; const ConfirmationStep = ({ verification, type }) => {
  const { axios, notify, onAuthenticated } = useContext(GlobalStore);
  const { nextStep, payload, gotoStep } = useContext(SignupContext);
  const [otp, setOTP] = useState('');
  const [timeout, setCodeTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const timer = useRef();
  const navigate = useNavigate();

  // Check if user is already verified
  const checkVerificationStatus = async (token) => {
    try {
      console.log('Checking verification status with token:', token ? 'present' : 'missing');
      
      if (!token) {
        console.log('No token available, skipping verification status check');
        return false;
      }

      const userData = await authService.getProfile();
      console.log('Profile data received:', { email_verified: userData?.email_verified, user_type: userData?.user_type });

      if (userData?.email_verified) {
        console.log('Email already verified, setting verified state');
        setIsEmailVerified(true);
        
        // Check business profile completion status for business users
        let redirectPath;
        if (userData.user_type === 'customer') {
          redirectPath = '/dashboard';
        } else if (userData.user_type === 'mechanic' || userData.user_type === 'dealer') {
          // For business users, check if business profile is complete
          const completionStatus = authService.getBusinessProfileCompletionStatus();
          
          if (completionStatus.needsCompletion) {
            // Business profile is incomplete, redirect to business profile setup
            redirectPath = '/business-profile';
          } else {
            // Business profile is complete, redirect to dashboard
            redirectPath = '/dashboard';
          }
        } else {
          redirectPath = '/dashboard';
        }

        notify({
          title: 'Email Already Verified',
          description: redirectPath === '/business-profile'
            ? 'Your email is already verified. Let\'s complete your business profile...'
            : 'Your email is already verified. Redirecting to your dashboard...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setTimeout(() => navigate(redirectPath, { replace: true }), 2000);
        return true;
      }
      
      console.log('Email not yet verified, proceeding with verification flow');
      return false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      
      // Handle specific errors
      if (error.response?.status === 401) {
        console.log('Token invalid/expired, proceeding with verification flow');
        // Token is invalid, but that's okay - we'll proceed with email verification
        return false;
      } else if (error.response?.status === 404) {
        console.log('Profile not found, proceeding with verification flow');
        return false;
      } else if (error.message?.includes('timeout') || error.message?.includes('Network')) {
        console.log('Network error checking status, proceeding with verification flow');
        // Network issues, but don't block the verification flow
        return false;
      }
      
      // For other errors, log but don't block the flow
      console.log('Other error checking verification status, proceeding anyway:', error.message);
      return false;
    }
  };

  useEffect(() => {
    const initializeVerification = async () => {
      try {
        const authData = localStorage.getItem('veyu-auth-user');
        let auth = {};
        
        // Safely parse auth data
        if (authData) {
          try {
            auth = JSON.parse(authData);
          } catch (error) {
            console.error('Failed to parse auth data:', error);
            auth = {};
          }
        }
        
        const token = auth?.token || auth?.api_token;

        // Set email from auth or payload with validation
        let emailToUse = '';
        if (auth?.email) {
          emailToUse = auth.email;
        } else if (payload?.email) {
          emailToUse = payload.email;
        }

        if (!emailToUse) {
          console.error('No email found in auth or payload');
          notify({
            title: 'Email Not Found',
            description: 'No email address found. Please sign up again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setTimeout(() => navigate('/signup'), 2000);
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToUse)) {
          console.error('Invalid email format:', emailToUse);
          notify({
            title: 'Invalid Email',
            description: 'Invalid email format found. Please sign up again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setTimeout(() => navigate('/signup'), 2000);
          return;
        }

        setEmail(emailToUse);
        console.log('Email verification initialized for:', emailToUse);

        // Check if already verified (only if we have a token)
        if (token) {
          console.log('Token found, checking verification status...');
          const isVerified = await checkVerificationStatus(token);
          if (!isVerified) {
            // Don't automatically request code - it was already sent during signup
            console.log('Not verified, but verification code was already sent during signup');
            notify({
              title: 'Check Your Email',
              description: `A verification code was sent to ${emailToUse} during signup. Please check your inbox.`,
              status: 'info',
              duration: 5000,
              isClosable: true,
            });
          }
        } else {
          // If no token, don't request code - it was already sent during signup
          console.log('No token found, but verification code was already sent during signup');
          notify({
            title: 'Check Your Email',
            description: `A verification code was sent to ${emailToUse} during signup. Please check your inbox and spam folder.`,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }

      } catch (error) {
        console.error('Error initializing verification:', error);
        notify({
          title: 'Initialization Error',
          description: 'Failed to initialize email verification. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initializeVerification();

    // Clean up interval on unmount
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []); // Empty dependency array to run only once

  async function requestCode(isResend = false) {
    if (isResending) return; // Prevent multiple clicks

    setIsResending(true);
    try {
      const authData = localStorage.getItem('veyu-auth-user');
      let auth = {};
      
      // Safely parse auth data
      if (authData) {
        try {
          auth = JSON.parse(authData);
        } catch (error) {
          console.error('Failed to parse auth data in requestCode:', error);
          auth = {};
        }
      }
      
      const token = auth?.token || auth?.api_token;
      const emailToVerify = email || payload?.email;

      // Enhanced validation
      if (!emailToVerify) {
        throw new Error('Email address not found. Please try signing up again.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToVerify)) {
        throw new Error('Invalid email format. Please check your email address.');
      }

      console.log('Requesting verification code for:', emailToVerify, 'isResend:', isResend);

      // Start the countdown timer only after successful request
      let time = 60;

      // Handle initial vs resend requests differently
      let response;
      
      if (!isResend) {
        // For initial request, verification code was already sent during signup
        console.log('Initial verification code was already sent during signup, no need to request again');
        
        notify({
          title: 'Verification Code Ready',
          description: `A verification code was sent to ${emailToVerify} during signup. Please check your inbox and spam folder.`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        // Start timer without making API call
        setCodeTimer(time);

        if (timer.current) {
          clearInterval(timer.current);
        }

        timer.current = setInterval(() => {
          setCodeTimer(prevTime => {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              clearInterval(timer.current);
              return 0;
            }
            return newTime;
          });
        }, 1000);
        
        return; // Exit early, no API call needed for initial load
      }
      
      // For resend requests, we need authentication
      try {
        if (!token) {
          throw new Error('Authentication required to resend verification codes. Please sign in to your account and try again.');
        }
        
        response = await authService.resendEmailVerification(emailToVerify);

        // Only start timer after successful API call
        setCodeTimer(time);

        if (timer.current) {
          clearInterval(timer.current);
        }

        timer.current = setInterval(() => {
          setCodeTimer(prevTime => {
            const newTime = prevTime - 1;
            if (newTime <= 0) {
              clearInterval(timer.current);
              return 0;
            }
            return newTime;
          });
        }, 1000);

        notify({
          title: 'Verification Code Sent!',
          description: `We've sent a 6-digit code to ${emailToVerify}. Please check your inbox and spam folder.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        console.log('Verification code request successful:', response);

      } catch (apiError) {
        console.error('API error requesting verification code:', apiError);
        
        // Handle specific API errors
        if (apiError.response?.status === 401) {
          throw new Error('Your session has expired. Please sign in to your account to resend the verification code.');
        } else if (apiError.response?.status === 429) {
          throw new Error('Too many requests. Please wait a few minutes before requesting another code.');
        } else if (apiError.response?.status === 400) {
          const errorData = apiError.response?.data;
          if (errorData?.message) {
            throw new Error(errorData.message);
          } else if (errorData?.detail) {
            throw new Error(errorData.detail);
          } else {
            throw new Error('Invalid request. Please check your email address and try again.');
          }
        } else if (apiError.response?.status >= 500) {
          throw new Error('Server error. Please try again in a few minutes.');
        } else if (apiError.message?.includes('timeout')) {
          throw new Error('Request timeout. Please check your internet connection and try again.');
        } else if (apiError.message?.includes('Authentication required')) {
          throw new Error('Please sign in to your account to resend verification codes.');
        } else {
          throw new Error(apiError.message || 'Failed to send verification code. Please try again.');
        }
      }

    } catch (error) {
      console.error('Error in requestCode:', error);
      
      // Clear any timer that might have started
      if (timer.current) {
        clearInterval(timer.current);
      }
      setCodeTimer(0);

      // Show user-friendly error message with guidance
      let errorTitle = 'Error Sending Code';
      let errorDescription = error.message || 'Failed to send verification code. Please try again.';
      
      // Add helpful guidance for authentication errors
      if (error.message?.includes('Authentication required') || error.message?.includes('sign in')) {
        errorTitle = 'Sign In Required';
        errorDescription = `${error.message} You can also try entering the code that was sent during signup.`;
      }
      
      notify({
        title: errorTitle,
        description: errorDescription,
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    } finally {
      setIsResending(false);
    }
  }

  async function verifyCode() {
    if (isVerifying) return;

    // Enhanced validation
    if (!otp) {
      notify({
        title: 'Code Required',
        description: 'Please enter the verification code sent to your email',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (otp.length !== 6) {
      notify({
        title: 'Invalid Code Length',
        description: 'Verification code must be exactly 6 digits',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if code contains only numbers
    if (!/^\d{6}$/.test(otp)) {
      notify({
        title: 'Invalid Code Format',
        description: 'Verification code must contain only numbers',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsVerifying(true);
    try {
      const authData = localStorage.getItem('veyu-auth-user');
      let auth = {};
      
      // Safely parse auth data
      if (authData) {
        try {
          auth = JSON.parse(authData);
        } catch (error) {
          console.error('Failed to parse auth data in verifyCode:', error);
          auth = {};
        }
      }
      
      const token = auth?.token || auth?.api_token;
      const emailToVerify = email || payload?.email;

      // Enhanced email validation
      if (!emailToVerify) {
        throw new Error('Email address not found. Please try signing up again.');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToVerify)) {
        throw new Error('Invalid email format. Please try signing up again.');
      }

      console.log('Verifying email code:', { email: emailToVerify, codeLength: otp.length });

      // Verify the code using authService (uses unauthenticated endpoint)
      const verificationResponse = await authService.verifyEmail(emailToVerify, otp);

      console.log('Email verification successful:', verificationResponse);

      // Update local storage with verified status
      const updatedAuth = {
        ...auth,
        email_verified: true,
        ...verificationResponse
      };

      localStorage.setItem('veyu-auth-user', JSON.stringify(updatedAuth));

      // Also update the new format if we have user data
      const existingUserData = localStorage.getItem('veyu_user_data');
      if (existingUserData) {
        try {
          const userData = JSON.parse(existingUserData);
          userData.email_verified = true;
          localStorage.setItem('veyu_user_data', JSON.stringify(userData));
        } catch (e) {
          console.log('Could not update veyu_user_data:', e);
        }
      }

      // Get user type to determine redirect
      const userType = verificationResponse?.user_type || auth?.user_type || payload?.user_type || 'customer';

      // Check business profile completion status for business users
      let redirectPath;
      let notificationMessage;
      
      if (userType === 'customer') {
        // Customer flow: Verify -> Login -> Marketplace
        // We logout the user so they have to log in explicitly
        authService.logout();
        redirectPath = '/login';
        notificationMessage = 'Your account is verified. Please log in to continue.';
      } else if (userType === 'mechanic' || userType === 'dealer') {
        // Business flow: Verify -> Business Profile -> Login -> Dashboard
        // For business users, check if business profile is complete
        const completionStatus = authService.getBusinessProfileCompletionStatus();
        
        if (completionStatus.needsCompletion) {
          // Business profile is incomplete, redirect to business profile setup
          // Keep session active for profile setup
          redirectPath = '/business-profile';
          notificationMessage = 'Your email is verified. Let\'s set up your business profile...';
        } else {
          // Business profile is complete (rare case here), redirect to login
          authService.logout();
          redirectPath = '/login';
          notificationMessage = 'Your account is verified. Please log in to continue.';
        }
      } else {
        // Fallback for any other user types
        authService.logout();
        redirectPath = '/login';
        notificationMessage = 'Your account is verified. Please log in to continue.';
      }

      notify({
        title: 'Email Verified Successfully!',
        description: notificationMessage,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Set verified state to show success UI
      setIsEmailVerified(true);

      console.log('Email verified, redirecting to:', redirectPath, 'for user type:', userType);

      setTimeout(() => {
        navigate(redirectPath, {
          replace: true,
          state: {
            fromEmailVerification: true,
            userType: userType
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Email verification error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      let errorTitle = 'Verification Failed';

      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data?.message?.includes('Invalid') || data?.detail?.includes('Invalid')) {
            errorTitle = 'Invalid Code';
            errorMessage = 'The verification code you entered is incorrect. Please check and try again.';
          } else if (data?.message?.includes('expired') || data?.detail?.includes('expired')) {
            errorTitle = 'Code Expired';
            errorMessage = 'Your verification code has expired. Please request a new one.';
          } else if (data?.message?.includes('already verified')) {
            errorTitle = 'Already Verified';
            errorMessage = 'Your email is already verified. Redirecting to dashboard...';
            // Redirect to dashboard since email is already verified
            setTimeout(() => {
              const userType = payload?.user_type || 'customer';
              const redirectPath = userType === 'customer' ? '/dashboard' : '/business-profile';
              navigate(redirectPath, { replace: true });
            }, 2000);
            return;
          } else {
            errorMessage = data?.message || data?.detail || 'Invalid verification code. Please try again.';
          }
        } else if (status === 404) {
          errorTitle = 'Code Not Found';
          errorMessage = 'Verification code not found. Please request a new code.';
        } else if (status === 429) {
          errorTitle = 'Too Many Attempts';
          errorMessage = 'Too many verification attempts. Please wait a few minutes before trying again.';
        } else if (status >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Server error occurred. Please try again in a few minutes.';
        } else {
          errorMessage = data?.message || data?.detail || 'Verification failed. Please try again.';
        }
      } else if (error.message?.includes('timeout')) {
        errorTitle = 'Request Timeout';
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message?.includes('Network')) {
        errorTitle = 'Network Error';
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }

      notify({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });

      // Clear the OTP field for certain errors
      if (errorTitle === 'Invalid Code' || errorTitle === 'Code Expired') {
        setOTP('');
      }
    } finally {
      setIsVerifying(false);
    }
  }

  if (isEmailVerified) {
    return (
      <VStack spacing={8} textAlign="center" py={4}>
        <Box
          w={20}
          h={20}
          borderRadius="full"
          bg="green.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="4px solid"
          borderColor="green.200"
        >
          <Icon as={CheckCircle} fontSize="40px" color="green.500" />
        </Box>
        <VStack spacing={3}>
          <Heading size="lg" fontWeight="bold" color="gray.800">
            Email Verified!
          </Heading>
          <Text fontSize="md" color="gray.600" maxW="400px" lineHeight="tall">
            Your email has been successfully verified. Redirecting you now...
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} textAlign="center" py={4}>
      {/* Icon Section */}
      <Box
        w={20}
        h={20}
        borderRadius="full"
        bg="orange.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="4px solid"
        borderColor="orange.200"
      >
        <Icon
          fontSize="40px"
          color="primary"
        >
          <RxEnvelopeOpen />
        </Icon>
      </Box>

      {/* Heading Section */}
      <VStack spacing={3}>
        <Heading size="lg" fontWeight="bold" color="gray.800">
          Verify Your Email
        </Heading>
        <Text fontSize="md" color="gray.600" maxW="400px" lineHeight="tall">
          We've sent a 6-digit verification code to
        </Text>
        <Text fontSize="md" fontWeight="semibold" color="primary">
          {email || payload?.email}
        </Text>
      </VStack>

      {/* OTP Input Section */}
      <Box w="full" py={2}>
        <OTPField value={otp} onChange={val => setOTP(val)} />
      </Box>

      {/* Verify Button */}
      <Button
        onClick={verifyCode}
        isDisabled={!otp || otp.length < 6}
        isLoading={isVerifying}
        loadingText="Verifying..."
        size="lg"
        w="full"
        colorScheme="orange"
        bg="primary"
        rightIcon={<CheckCircle size={20} />}
        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
        _disabled={{
          bg: 'gray.300',
          cursor: 'not-allowed',
          transform: 'none'
        }}
        transition="all 0.2s"
        py={6}
      >
        Verify Email
      </Button>

      {/* Resend Section */}
      <HStack spacing={1} fontSize="sm" color="gray.600">
        <Text>Didn't receive the code?</Text>
        <Button
          variant="link"
          colorScheme="orange"
          fontWeight="semibold"
          isDisabled={timeout > 0}
          isLoading={isResending}
          onClick={() => requestCode(true)}
          fontSize="sm"
          _disabled={{
            color: 'gray.400',
            cursor: 'not-allowed'
          }}
        >
          {timeout > 0 ? `Resend in ${timeout}s` : 'Resend code'}
        </Button>
      </HStack>

      {/* Help Section */}
      <Alert
        status="info"
        variant="left-accent"
        borderRadius="lg"
        bg="blue.50"
        borderColor="blue.200"
        textAlign="left"
      >
        <AlertIcon as={Mail} color="blue.500" />
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={1}>
            Check your spam folder
          </Text>
          <Text fontSize="xs" color="blue.600">
            If you don't see the email in your inbox, please check your spam or junk folder.
          </Text>
        </Box>
      </Alert>

      {/* Back to Login */}
      <HStack spacing={1} fontSize="sm" color="gray.600">
        <Text>Want to use a different email?</Text>
        <ChakraLink
          as={RLink}
          to="/login"
          color="primary"
          fontWeight="semibold"
          _hover={{ color: 'orange.600', textDecoration: 'underline' }}
        >
          Sign in instead
        </ChakraLink>
      </HStack>
    </VStack>
  );
};

export default SignupView;