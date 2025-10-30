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
      if (password !== confirmPassword) {
        return notify({
          title: 'Error!',
          color: 'red',
          body: 'Passwords do not match'
        });
      }

      if (password.length < 8) {
        return notify({
          title: 'Error!',
          color: 'red',
          body: 'Password must be at least 8 characters long'
        });
      }

      const canProceed = await checkEmail(email);
      if (canProceed) {
        if (type === 'business' && !['dealer', 'mechanic'].includes(user_type)) {
          throw new Error("Please select a business type (Dealer or Mechanic)");
        }

        if (type === 'personal' || type === 'customer') {
          setUserType('customer');
        }

        addToPayload({
          email,
          password,
          confirm_password: confirmPassword,
          provider: 'veyu'
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
  const { payload, addToPayload, nextStep, user_type, gotoStep } = useContext(SignupContext);
  const [first_name, setFirstName] = useState(payload?.first_name);
  const [last_name, setLastName] = useState(payload?.last_name);
  const [phone_number, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const redirect = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    const newPayload = {
      ...payload,
      first_name,
      last_name,
      phone_number,
      user_type,
      action: 'create-account'
    };

    try {
      addToPayload({ ...newPayload });

      const res = await axios.post('/accounts/register/', newPayload, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = objectifyJSON(res.data);

      if (res.status === 201 || res.status === 200) {
        const authData = data.data || data;
        if (authData.token || authData.api_token) {
          localStorage.setItem('veyu-auth-user', jsonifyObject(authData));
        }

        notify({
          title: 'Account Created!',
          body: "Welcome to Veyu! Please verify your email to get started.",
          color: 'green'
        });

        nextStep();
      } else {
        notify({
          title: 'Sign up Error!',
          color: 'red',
          body: data.message,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data)
        || error.message;

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
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
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
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
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
              />
            </InputGroup>
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel color="gray.700" fontWeight="semibold">
            Phone Number
          </FormLabel>
          <InputGroup>
            <InputLeftElement>
              <Phone size={20} color="gray" />
            </InputLeftElement>
            <Input
              type="tel"
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
  const { nextStep, payload } = useContext(SignupContext);
  const [otp, setOTP] = useState('');
  const [timeout, setCodeTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const timer = useRef();
  const redirect = useNavigate();

  useEffect(() => {
    requestCode();
  }, []);

  async function requestCode() {
    setIsResending(true);
    try {
      timer.current.innerHTML = `Request new code in 60s`;
      let time = 60;
      const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'));
      const token = auth?.token || auth?.api_token;

      const counter = setInterval(() => {
        if (time > 0) {
          time -= 1;
          timer.current.innerHTML = `Request new code in ${time}s`;
          setCodeTimer(time);
        } else {
          timer.current.innerHTML = `Click to resend`;
          return clearInterval(counter);
        }
      }, 1000);

      const res = await axios.post('/accounts/verify-email/', JSON.stringify({
        action: 'request-code',
        email: payload.email,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });

      if (res.status === 200) {
        notify({
          title: 'Code Sent!',
          body: 'Verification code sent to your email',
          color: 'green'
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
    setIsVerifying(true);
    try {
      const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'));
      const token = auth?.token || auth?.api_token;

      if (!token) {
        notify({
          title: 'Error',
          body: 'Authentication token not found. Please sign up again.',
          color: 'red'
        });
        return redirect('/signup');
      }

      if (verification === 'email') {
        const res = await axios.post('/accounts/verify-email/', JSON.stringify({
          action: 'confirm-code',
          email: payload.email,
          code: otp
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });

        if (res.status === 200) {
          setOTP('');
          notify({
            title: "Welcome to Veyu!",
            body: "Your email has been verified! You can now sign in to your account.",
            color: 'green'
          });

          localStorage.removeItem('veyu-auth-user');
          setTimeout(() => {
            redirect('/login');
          }, 1500);
        }
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
          Check Your Email
        </Heading>
        <Text fontSize="md" color="gray.600" maxW="400px" lineHeight="tall">
          We've sent a 6-digit verification code to
        </Text>
        <Text fontSize="md" fontWeight="semibold" color="primary">
          {payload?.email}
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