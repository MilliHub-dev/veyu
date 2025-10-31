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
        setSkipStep({ ...skipConfirmation, email: true });
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
    setStepValue((step + 1));
  }

  function gotoStep(num) {
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
      const res = await axios.get(`/accounts/register/?email=${email}`);
      const data = objectifyJSON(res.data);
      if (res.status === 200) {
        return true;
      } else {
        notify({
          title: 'Error!',
          body: data.message,
          color: 'red',
        });
        return false;
      }
    } catch (err) {
      notify({
        title: 'An error occurred!',
        body: err.message
      });
    }
  }

  async function createAccount(formData) {
    onSubmit(formData);
  }

  const StepComponent = ({ props }) => {
    const currentStep = steps[step];

    useEffect(() => {
      if (skipConfirmation[`${currentStep.key}`]) {
        nextStep();
      }
    }, []);
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
              <Box maxW="2xl" mx="auto">
                <Stepper index={activeStep} colorScheme="orange" size="lg">
                  {steps.map((stepItem, index) => (
                    <Step key={index}>
                      <StepIndicator>
                        <StepStatus
                          complete={<StepIcon />}
                          incomplete={<StepNumber />}
                          active={<StepNumber />}
                        />
                      </StepIndicator>
                      <Box flexShrink="0" display={{ base: 'none', md: 'block' }}>
                        <StepTitle>{stepItem.title}</StepTitle>
                        <StepDescription>{stepItem.description}</StepDescription>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
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
  const { axios, notify } = useContext(GlobalStore);
  const { checkEmail, user_type, addToPayload, setUserType, payload, nextStep } = useContext(SignupContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return notify({
          title: 'Invalid Email',
          color: 'red',
          body: 'Please enter a valid email address'
        });
      }

      if (password !== confirmPassword) {
        return notify({
          title: 'Password Mismatch',
          color: 'red',
          body: 'Passwords do not match'
        });
      }

      if (password.length < 8) {
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
          confirm_password: confirmPassword,
          provider: 'veyu',
          action: 'create-account',
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
    setIsLoading(true);

    const { first_name, last_name, phone_number } = formData;
    // Prepare the complete payload with all required fields
    // Prepare payload according to API documentation
    const newPayload = {
      email: payload?.email,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      password: payload?.password,
      confirm_password: payload?.confirm_password,
      user_type: user_type || 'customer',
      provider: 'veyu',
      phone_number: phone_number.trim() || null,
      action: 'create-account'  // Added action field as required by the API
    };
    
    // Remove any undefined values
    Object.keys(newPayload).forEach(key => {
      if (newPayload[key] === undefined) {
        delete newPayload[key];
      }
    });

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
        
        // Make the request with JSON instead of FormData
        res = await axios.post('https://dev.veyu.cc/api/v1/accounts/register/', 
          newPayload, // Use the raw payload object instead of FormData
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            validateStatus: (status) => true // Don't throw for any status code
          }
        );
        
        console.log('Signup response status:', res.status);
        console.log('Signup response data:', res.data);
        
        // Check if signup was successful (201) but has the email_verified error
        if (res.status === 201 || (res.status === 500 && 
            res.data?.message?.includes("'email_verified'"))) {
          // Try to log in with the same credentials
          try {
            const loginRes = await axios.post('https://dev.veyu.cc/api/v1/accounts/login/', {
              email: newPayload.email,
              password: newPayload.password
            });
            
            const loginData = objectifyJSON(loginRes.data);
            const token = loginData.token || loginData.api_token;
            
            if (token) {
              // Proceed with successful login
              const userData = {
                ...loginData.user,
                token: token,
                isAuthenticated: true,
                user_type: newPayload.user_type || 'customer'
              };
              
              // Save user data to localStorage or context
              localStorage.setItem('user', JSON.stringify(userData));
              
              // Redirect based on user type or to dashboard
              const redirectPath = userData.user_type === 'customer' ? '/dashboard' : `/${userData.user_type}/dashboard`;
              window.location.href = redirectPath;
              return;
            }
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            // Continue to show the error below
          }
        }
      } catch (error) {
        // Handle other errors
        if (error.response?.status === 400 && 
            error.response?.data?.email?.includes('already exists')) {
          // Email exists, try to log in
          try {
            const loginRes = await axios.post('https://dev.veyu.cc/api/v1/accounts/login/', {
              email: newPayload.email,
              password: newPayload.password
            });
            
            const loginData = objectifyJSON(loginRes.data);
            const token = loginData.token || loginData.api_token;
            
            if (token) {
              const userData = {
                ...loginData,
                token,
                api_token: token,
                user_type: user_type || loginData.user_type
              };
              
              localStorage.setItem('veyu-auth-user', jsonifyObject(userData));
              
              // Redirect to business profile for mechanics/dealers
              if (['mechanic', 'dealer'].includes(userData.user_type)) {
                // Update the auth state first
                onAuthenticated(userData);
                // Then redirect to the business profile setup
                navigate(`/dashboard/business-profile`, { replace: true });
                return;
              }
              // For regular users, go to dashboard
              navigate('/dashboard', { replace: true });
              return;
            }
          } catch (loginError) {
            console.error('Login error:', loginError);
            throw new Error('An account with this email already exists. Please use a different email or log in.');
          }
          return;
        }
        throw error; // Re-throw if it's not a duplicate email error
      }

      // If we get here, it's a new account
      const data = objectifyJSON(res.data);
      console.log('Signup response status:', res.status);
      console.log('Signup response data:', data);

      // Handle successful registration (201 Created) or other success statuses
      if (res.status === 201 || res.status === 200) {
        // If the response indicates an error but with 200 status (some APIs do this)
        if (data.error) {
          // If the error is about email_verified, we can proceed with login
          if (data.message && data.message.includes('email_verified')) {
            console.log('Proceeding with login despite email_verified error');
            // Continue with the login flow below
          } else {
            throw new Error(data.message || 'Registration failed');
          }
        }
        const authData = data.data || data;
        const token = authData.token || authData.api_token;
        
        if (token) {
          const userData = {
            ...authData,
            token,
            api_token: token,
            user_type: user_type || authData.user_type
          };
          
          localStorage.setItem('veyu-auth-user', jsonifyObject(userData));
          
          // For mechanics/dealers, redirect to business profile after signup
          if (['mechanic', 'dealer'].includes(userData.user_type)) {
            // Store the token in localStorage for the business profile setup
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_type', userData.user_type);
            
            // Store the user data in localStorage for the business profile setup
            localStorage.setItem('user_data', JSON.stringify({
              email: newPayload.email,
              first_name: newPayload.first_name,
              last_name: newPayload.last_name,
              phone_number: newPayload.phone_number
            }));
            
            // Navigate to business profile with user type
            navigate(`/business-profile?user_type=${userData.user_type}`, { 
              state: { 
                fromSignup: true,
                userData: {
                  ...userData,
                  email: newPayload.email,
                  first_name: newPayload.first_name,
                  last_name: newPayload.last_name,
                  phone_number: newPayload.phone_number
                }
              },
              replace: true 
            });
          } else {
            // For regular users, go to dashboard
            navigate('/dashboard', { 
              replace: true,
              state: { 
                userData: {
                  ...userData,
                  email: newPayload.email,
                  first_name: newPayload.first_name,
                  last_name: newPayload.last_name,
                  phone_number: newPayload.phone_number
                }
              }
            });
          }
          return;
        }

        // For regular users, proceed with email verification
        try {
          // Only attempt email verification if the user has an email
          if (newPayload.email) {
            const verifyResponse = await axios.post('https://dev.veyu.cc/api/v1/accounts/verify-email/', 
              {
                action: 'request-code',
                email: newPayload.email
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Token ${token}`
                },
                validateStatus: (status) => status < 500 // Don't throw for 4xx errors
              }
            );
            
            console.log('Email verification request response:', verifyResponse.data);
            
            if (verifyResponse.data.error) {
              console.warn('Email verification request had an error:', verifyResponse.data.message);
              // Continue with the flow even if email verification fails
            }

            notify({
              title: 'Verification Code Sent!',
              body: `We've sent a 6-digit code to ${newPayload.email}. Please check your inbox.`,
              color: 'green',
              duration: 5000,
              isClosable: true
            });

            // Update the payload with the complete user data
            addToPayload({
              ...newPayload,
              ...authData
            });

            // Force navigation to the email verification step
            setSkipStep(prev => ({
              ...prev,
              profile: true,
              email: false
            }));
            
            // Move to the next step (email verification)
            nextStep();
          }
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
          notify({
            title: 'Verification Email Error',
            body: 'Your account was created, but we encountered an error sending the verification email. Please try logging in and request a new verification code.',
            color: 'orange',
            duration: 7000
          });
          
          // Still navigate to the email verification step
          setSkipStep(prev => ({
            ...prev,
            profile: true,
            email: false
          }));
          nextStep();
        }
      } else {
        notify({
          title: 'Sign up Error!',
          color: 'red',
          body: data.message,
        });
      }
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
          // Handle validation errors
          if (data && typeof data === 'object') {
            errorMessage = 'Validation Error:\n' + Object.entries(data)
              .map(([field, errors]) => `• ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
          } else {
            errorMessage = data?.message || 'Invalid request. Please check your input.';
          }
        } else if (status === 500) {
          errorMessage = 'Server Error: ' + (data?.detail || 'Internal server error occurred');
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
      const res = await axios.get('/accounts/me/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (res.data?.email_verified) {
        setIsEmailVerified(true);
        // Redirect based on user type
        const redirectPath = res.data.user_type === 'customer' ? '/dashboard' : '/business-profile';
        setTimeout(() => navigate(redirectPath), 2000);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  };

  useEffect(() => {
    const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'));
    const token = auth?.token || auth?.api_token;
    
    // Set email from auth or payload
    if (auth?.email) {
      setEmail(auth.email);
    } else if (payload?.email) {
      setEmail(payload.email);
    }

    // Check if already verified
    const checkStatus = async () => {
      if (token) {
        const isVerified = await checkVerificationStatus(token);
        if (!isVerified) {
          // Only request code if not verified
          await requestCode();
        }
      } else {
        // If no token, just request code
        await requestCode();
      }
    };

    checkStatus();
    
    // Clean up interval on unmount
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  async function requestCode() {
    if (isResending) return; // Prevent multiple clicks
    
    setIsResending(true);
    try {
      const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'));
      const token = auth?.token || auth?.api_token;
      const emailToVerify = email || payload?.email;
      
      if (!emailToVerify) {
        throw new Error('Email address not found. Please try signing up again.');
      }

      // Start the countdown timer
      let time = 60;
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

      // Request verification code
      const res = await axios.post('/accounts/verify-email/', 
        {
          action: 'request-code',
          email: emailToVerify,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Token ${token}` } : {})
          }
        }
      );

      if (res.status === 200) {
        notify({
          title: 'Verification Code Sent!',
          description: `We've sent a 6-digit code to ${emailToVerify}. Please check your inbox.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      notify({
        title: 'Error',
        body: error.response?.data?.message || 'Failed to send verification code',
        color: 'red'
      });
    } finally {
      setIsResending(false);
    }
  }

  async function verifyCode() {
    if (!otp || otp.length !== 6) {
      notify({
        title: 'Invalid Code',
        description: 'Please enter a valid 6-digit verification code',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsVerifying(true);
    try {
      const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'));
      const token = auth?.token || auth?.api_token;
      const emailToVerify = email || payload?.email;

      if (!token) {
        notify({
          title: 'Authentication Required',
          description: 'Your session has expired. Please sign up again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return navigate('/signup');
      }

      if (!emailToVerify) {
        throw new Error('Email address not found. Please try signing up again.');
      }

      // Verify the code
      const res = await axios.post(
        '/accounts/verify-email/',
        {
          action: 'confirm-code',
          email: emailToVerify,
          code: otp
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }
      );

      if (res.status === 200) {
        // Update local storage with verified status
        const updatedAuth = {
          ...auth,
          email_verified: true,
          ...(res.data?.user || {}) // Update with any user data from the response
        };
        
        localStorage.setItem('veyu-auth-user', JSON.stringify(updatedAuth));
        
        // Get user type to determine redirect
        const userType = res.data?.user?.user_type || auth?.user_type;
        
        notify({
          title: 'Email Verified Successfully!',
          description: userType === 'customer' 
            ? 'Your account is now verified. Taking you to your dashboard...'
            : 'Your business account is now verified. Setting up your profile...',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect based on user type
        const redirectPath = userType === 'customer' 
          ? '/dashboard' 
          : '/dashboard/business-profile';
          
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      }
    } catch (error) {
      notify({
        title: 'Verification Failed',
        body: error.response?.data?.message || 'Invalid verification code. Please try again.',
        color: 'red'
      });
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
          onClick={requestCode}
          fontSize="sm"
          _disabled={{
            color: 'gray.400',
            cursor: 'not-allowed'
          }}
        >
          <span ref={timer}>Resend code</span>
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