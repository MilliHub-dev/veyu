import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Divider, 
  UnorderedList, 
  ListItem, 
  Flex, 
  Icon, 
  Tag, 
  Link as CLink,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import {
  BsFileEarmarkText,
  BsShieldCheck,
  BsPerson,
  BsPersonBadge,
  BsCreditCard,
  BsCalendar,
  BsExclamationTriangle,
  BsLock,
  BsClock,
  BsGear,
  BsGlobe,
  BsExclamationCircle,
  BsShieldShaded,
  BsEnvelope,
  BsTelephone,
  BsGlobe2,
  BsInstagram,
  BsGeoAlt,
  BsCheckCircle,
  BsXCircle
} from "react-icons/bs";
import { 
  FileText, 
  Shield, 
  Users, 
  UserCheck, 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Settings,
  Globe,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  XCircle,
  Scale,
  Gavel,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MotionBox = motion(Box);

const TermsOfServicePage = () => {
  const [activeSection, setActiveSection] = useState('agreement');
  const [readingProgress, setReadingProgress] = useState(0);

  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50, blue.50)',
    'linear(to-br, gray.900, purple.900, pink.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'agreement', title: 'Agreement', icon: FileText },
    { id: 'services', title: 'Our Services', icon: Globe },
    { id: 'ip', title: 'IP Rights', icon: Shield },
    { id: 'user-representations', title: 'User Representations', icon: Users },
    { id: 'registration', title: 'Registration', icon: UserCheck },
    { id: 'payments', title: 'Payments', icon: CreditCard },
    { id: 'subscriptions', title: 'Subscriptions', icon: Calendar },
    { id: 'prohibited', title: 'Prohibited Activities', icon: AlertTriangle },
    { id: 'privacy', title: 'Privacy Policy', icon: Lock },
    { id: 'term', title: 'Term & Termination', icon: Clock },
    { id: 'modifications', title: 'Modifications', icon: Settings },
    { id: 'law', title: 'Governing Law', icon: Scale },
    { id: 'liability', title: 'Liability', icon: AlertCircle },
    { id: 'indemnification', title: 'Indemnification', icon: Shield },
    { id: 'communications', title: 'Electronic Comms', icon: MessageSquare },
    { id: 'contact', title: 'Contact', icon: Mail }
  ];

  const keyHighlights = [
    {
      icon: CheckCircle,
      title: 'Fair Terms',
      description: 'Clear, transparent terms designed to protect both users and the platform.',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'User Protection',
      description: 'Comprehensive protections for your transactions and personal data.',
      color: 'blue'
    },
    {
      icon: Scale,
      title: 'Legal Compliance',
      description: 'Fully compliant with Nigerian laws and international standards.',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Community Standards',
      description: 'Guidelines that ensure a safe, respectful environment for all users.',
      color: 'orange'
    }
  ];

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
    <Box bg={bgGradient} minH="100vh">
      {/* Reading Progress Bar */}
      <Progress 
        value={readingProgress} 
        size="xs" 
        colorScheme="purple" 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={1000}
      />

      <Container maxW="7xl" py={8} px={{ base: 4, md: 8 }}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Breadcrumb */}
          <MotionBox variants={itemVariants} mb={6}>
            <Breadcrumb spacing="8px" separator={<ArrowRight size={16} />}>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/" color="purple.500">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="gray.600">Terms of Service</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </MotionBox>

          {/* Hero Header */}
          <MotionBox variants={itemVariants} mb={12}>
            <Box
              bg={cardBg}
              p={8}
              borderRadius="2xl"
              shadow="xl"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="4px"
                bgGradient="linear(to-r, purple.400, pink.400, blue.400)"
              />
              
              <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                <Box
                  p={4}
                  borderRadius="full"
                  bg="purple.100"
                  border="4px solid"
                  borderColor="purple.200"
                >
                  <Icon as={FileText} size={12} color="purple.600" />
                </Box>
                
                <VStack align={{ base: 'center', md: 'start' }} spacing={3} flex={1}>
                  <Heading size="2xl" color="gray.800" textAlign={{ base: 'center', md: 'left' }}>
                    Terms of Service
                  </Heading>
                  <Text fontSize="lg" color={textColor} textAlign={{ base: 'center', md: 'left' }}>
                    Your rights and responsibilities when using Veyu's platform and services.
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                      Last Updated: Oct 17, 2025
                    </Badge>
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                      Legally Binding
                    </Badge>
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          </MotionBox>

          {/* Key Highlights */}
          <MotionBox variants={itemVariants} mb={12}>
            <VStack spacing={6} textAlign="center" mb={8}>
              <Heading size="lg" color="gray.800">
                Our Terms Commitment
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                We believe in fair, transparent terms that protect everyone in our community.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {keyHighlights.map((highlight, i) => (
                <MotionBox
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack
                    spacing={4}
                    p={6}
                    bg={cardBg}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{
                      shadow: 'lg',
                      borderColor: `${highlight.color}.300`
                    }}
                    transition="all 0.3s"
                    h="full"
                  >
                    <Box
                      p={3}
                      borderRadius="full"
                      bg={`${highlight.color}.100`}
                    >
                      <Icon as={highlight.icon} size={6} color={`${highlight.color}.600`} />
                    </Box>
                    <VStack spacing={2} textAlign="center">
                      <Text fontWeight="bold" color="gray.800">
                        {highlight.title}
                      </Text>
                      <Text fontSize="sm" color={textColor} lineHeight="tall">
                        {highlight.description}
                      </Text>
                    </VStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>      
    {/* Important Notice */}
          <MotionBox variants={itemVariants} mb={12}>
            <Alert
              status="warning"
              variant="left-accent"
              borderRadius="xl"
              p={6}
              bg="orange.50"
              borderColor="orange.200"
            >
              <AlertIcon as={AlertTriangle} color="orange.500" />
              <Box>
                <AlertTitle color="orange.700" mb={2}>
                  Important Legal Agreement
                </AlertTitle>
                <AlertDescription color="orange.600">
                  These Terms of Service constitute a legally binding agreement. By using Veyu's services, 
                  you agree to be bound by all terms outlined below. Please read carefully before proceeding.
                </AlertDescription>
              </Box>
            </Alert>
          </MotionBox>

          {/* Main Content Layout */}
          <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={8}>
            {/* Sidebar Navigation */}
            <MotionBox variants={itemVariants}>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="xl"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                position="sticky"
                top={8}
                maxH="80vh"
                overflowY="auto"
              >
                <Heading size="md" mb={4} color="gray.800">
                  Quick Navigation
                </Heading>
                <VStack spacing={1} align="stretch">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'solid' : 'ghost'}
                      colorScheme="purple"
                      size="sm"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={section.icon} size={4} />}
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        setActiveSection(section.id);
                      }}
                      _hover={{ bg: 'purple.50' }}
                      fontSize="xs"
                    >
                      {section.title}
                    </Button>
                  ))}
                </VStack>
              </Box>
            </MotionBox>

            {/* Content Area */}
            <Box gridColumn={{ base: 1, lg: '2 / 5' }}>
              <VStack spacing={8} align="stretch">
                
                {/* Agreement */}
                <MotionBox variants={itemVariants} id="agreement">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={FileText} size={6} color="purple.500" />
                      <Heading size="lg" color="gray.800">Agreement to Our Legal Terms</Heading>
                    </HStack>
                    
                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        We are <strong>Veyu Ltd</strong> ("Company," "we," "us," or "our"), a company registered in Nigeria. 
                        We operate the website www.veyu.cc, mobile applications, and related products and services 
                        that refer to these terms (collectively, the "Services").
                      </Text>
                      
                      <Box
                        bg="purple.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="purple.200"
                        w="full"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={AlertCircle} size={5} color="purple.500" />
                          <Text fontWeight="semibold" color="purple.700">
                            Binding Agreement
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="purple.600">
                          These Terms constitute a legally binding agreement between you and Veyu Ltd. 
                          By accessing our Services, you agree to be bound by all terms outlined here.
                        </Text>
                      </Box>

                      <Text color={textColor} lineHeight="tall">
                        <strong>Contact Information:</strong> You can reach us at +234 (0) 800 000 0000 or support@veyu.cc
                      </Text>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Our Services */}
                <MotionBox variants={itemVariants} id="services">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Globe} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">1. Our Services</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        The Services include a comprehensive platform for:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        {[
                          'Buying and selling vehicles',
                          'Vehicle rental bookings',
                          'Verified mechanic services',
                          'Service provider access',
                          'Multi-category support',
                          'Secure transactions'
                        ].map((service, i) => (
                          <HStack key={i} spacing={2}>
                            <Icon as={CheckCircle} size={4} color="green.500" />
                            <Text fontSize="sm" color={textColor}>{service}</Text>
                          </HStack>
                        ))}
                      </SimpleGrid>

                      <Box
                        bg="blue.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                        w="full"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={Users} size={5} color="blue.500" />
                          <Text fontWeight="semibold" color="blue.700">
                            Age Requirement
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="blue.600">
                          Services are intended for users 18+ years old. Users under 18 must have parental 
                          permission and direct supervision.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Intellectual Property Rights */}
                <MotionBox variants={itemVariants} id="ip">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Shield} size={6} color="green.500" />
                      <Heading size="lg" color="gray.800">2. Intellectual Property Rights</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        Veyu Ltd. owns all intellectual property rights in the Services, including:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                        {[
                          'Website design and layout',
                          'Company logos and branding',
                          'Software and applications',
                          'Content and documentation',
                          'Trademarks and copyrights',
                          'Proprietary algorithms'
                        ].map((item, i) => (
                          <HStack key={i} spacing={2}>
                            <Icon as={CheckCircle} size={4} color="green.500" />
                            <Text fontSize="sm" color={textColor}>{item}</Text>
                          </HStack>
                        ))}
                      </SimpleGrid>

                      <Box
                        bg="green.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="green.200"
                        w="full"
                      >
                        <Text fontSize="sm" color="green.600">
                          <strong>Your License:</strong> You are granted a non-exclusive, revocable license to access 
                          the Services for personal or internal business use. Reproduction, distribution, or creating 
                          derivative works requires our express written permission.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* User Representations */}
                <MotionBox variants={itemVariants} id="user-representations">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Users} size={6} color="orange.500" />
                      <Heading size="lg" color="gray.800">3. User Representations</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        By using the Services, you represent and warrant that:
                      </Text>

                      <VStack spacing={3} w="full">
                        {[
                          'All registration information you provide will be accurate and current',
                          'You will maintain the accuracy of such information and update as needed',
                          'You have the legal capacity and authority to comply with these Terms',
                          'You will not access the Services through automated or non-human means',
                          'You will not use the Services for any illegal or unauthorized purposes',
                          'Your use complies with applicable laws and regulations in your jurisdiction'
                        ].map((representation, i) => (
                          <HStack key={i} spacing={3} align="start" w="full">
                            <Icon as={CheckCircle} size={5} color="orange.500" mt={1} />
                            <Text fontSize="sm" color={textColor} lineHeight="tall">
                              {representation}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* User Registration */}
                <MotionBox variants={itemVariants} id="registration">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={UserCheck} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">4. User Registration</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        Registration may be required to access certain features of the Services.
                      </Text>

                      <Box
                        bg="blue.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                        w="full"
                      >
                        <VStack spacing={2} align="start">
                          <Text fontWeight="semibold" color="blue.700">
                            Your Responsibilities:
                          </Text>
                          <UnorderedList spacing={1} color="blue.600" fontSize="sm">
                            <ListItem>Keep your password confidential and secure</ListItem>
                            <ListItem>You are responsible for all activities under your account</ListItem>
                            <ListItem>Notify us immediately of any unauthorized access</ListItem>
                            <ListItem>Provide accurate and complete registration information</ListItem>
                          </UnorderedList>
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox> 
               {/* Purchases and Payment */}
                <MotionBox variants={itemVariants} id="payments">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={CreditCard} size={6} color="green.500" />
                      <Heading size="lg" color="gray.800">5. Purchases and Payment</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        We accept multiple payment methods for Services:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                        {[
                          { method: 'Card Payments', icon: CreditCard, color: 'blue' },
                          { method: 'Bank Transfer', icon: Gavel, color: 'green' },
                          { method: 'Veyu Wallet', icon: Lock, color: 'purple' }
                        ].map((payment, i) => (
                          <VStack
                            key={i}
                            spacing={2}
                            p={4}
                            bg={`${payment.color}.50`}
                            borderRadius="lg"
                            border="1px solid"
                            borderColor={`${payment.color}.200`}
                            textAlign="center"
                          >
                            <Icon as={payment.icon} size={6} color={`${payment.color}.500`} />
                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                              {payment.method}
                            </Text>
                          </VStack>
                        ))}
                      </SimpleGrid>

                      <Box
                        bg="green.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="green.200"
                        w="full"
                      >
                        <VStack spacing={2} align="start">
                          <Text fontWeight="semibold" color="green.700">
                            Payment Terms:
                          </Text>
                          <UnorderedList spacing={1} color="green.600" fontSize="sm">
                            <ListItem>Provide current, complete, and accurate payment information</ListItem>
                            <ListItem>Authorize us to charge your chosen payment method</ListItem>
                            <ListItem>Transaction fees will be disclosed at checkout</ListItem>
                            <ListItem>Refunds processed per our policy and applicable law</ListItem>
                          </UnorderedList>
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Subscriptions */}
                <MotionBox variants={itemVariants} id="subscriptions">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Calendar} size={6} color="purple.500" />
                      <Heading size="lg" color="gray.800">6. Subscriptions</Heading>
                    </HStack>

                    <Accordion allowMultiple>
                      <AccordionItem border="none" mb={4}>
                        <AccordionButton
                          bg="purple.50"
                          borderRadius="lg"
                          _hover={{ bg: 'purple.100' }}
                          p={4}
                        >
                          <HStack flex={1} spacing={3}>
                            <Icon as={Calendar} color="purple.500" />
                            <Text fontWeight="semibold">Subscription Billing</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={4}>
                          <Text fontSize="sm" color={textColor}>
                            If offered, subscriptions will automatically renew unless cancelled. 
                            You consent to our charging your payment method on a recurring basis until cancellation.
                          </Text>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem border="none" mb={4}>
                        <AccordionButton
                          bg="green.50"
                          borderRadius="lg"
                          _hover={{ bg: 'green.100' }}
                          p={4}
                        >
                          <HStack flex={1} spacing={3}>
                            <Icon as={CheckCircle} color="green.500" />
                            <Text fontWeight="semibold">Free Trial</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={4}>
                          <Text fontSize="sm" color={textColor}>
                            We may offer free trials for new users. Charges will apply at the end of the 
                            trial period unless cancelled before the trial expires.
                          </Text>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem border="none">
                        <AccordionButton
                          bg="orange.50"
                          borderRadius="lg"
                          _hover={{ bg: 'orange.100' }}
                          p={4}
                        >
                          <HStack flex={1} spacing={3}>
                            <Icon as={XCircle} color="orange.500" />
                            <Text fontWeight="semibold">Cancellation</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={4}>
                          <Text fontSize="sm" color={textColor}>
                            You may cancel your subscription through your account settings. 
                            Cancellation takes effect at the end of the current billing term.
                          </Text>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Box>
                </MotionBox>

                {/* Prohibited Activities */}
                <MotionBox variants={itemVariants} id="prohibited">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={AlertTriangle} size={6} color="red.500" />
                      <Heading size="lg" color="gray.800">7. Prohibited Activities</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Box
                        bg="red.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="red.200"
                        w="full"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={XCircle} size={5} color="red.500" />
                          <Text fontWeight="semibold" color="red.700">
                            Strictly Prohibited
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="red.600">
                          The following activities are strictly prohibited and may result in immediate account termination.
                        </Text>
                      </Box>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        {[
                          'Unauthorized data collection or scraping',
                          'Using bots or automated systems',
                          'Interfering with Service operations',
                          'Violating local, state, or federal laws',
                          'Impersonating others or misrepresentation',
                          'Distributing malware or harmful code',
                          'Harassment or abusive behavior',
                          'Fraudulent transactions or activities'
                        ].map((activity, i) => (
                          <HStack key={i} spacing={2} align="start">
                            <Icon as={XCircle} size={4} color="red.500" mt={1} />
                            <Text fontSize="sm" color={textColor}>{activity}</Text>
                          </HStack>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Privacy Policy Reference */}
                <MotionBox variants={itemVariants} id="privacy">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Lock} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">8. Privacy Policy</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        We care deeply about your privacy and security. Our comprehensive Privacy Policy 
                        details how we collect, use, and protect your information.
                      </Text>

                      <Box
                        bg="blue.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                        w="full"
                      >
                        <VStack spacing={3} align="start">
                          <Text fontWeight="semibold" color="blue.700">
                            By using our Services, you agree to:
                          </Text>
                          <UnorderedList spacing={1} color="blue.600" fontSize="sm">
                            <ListItem>The collection and use of your data as described in our Privacy Policy</ListItem>
                            <ListItem>Our data processing practices and security measures</ListItem>
                            <ListItem>The terms outlined in our comprehensive privacy documentation</ListItem>
                          </UnorderedList>
                          <Button
                            as={Link}
                            to="/privacy-policy"
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            rightIcon={<ArrowRight size={16} />}
                          >
                            Read Privacy Policy
                          </Button>
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Remaining sections with similar styling */}
                <MotionBox variants={itemVariants} id="term">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={Clock} size={6} color="orange.500" />
                      <Heading size="lg" color="gray.800">9. Term and Termination</Heading>
                    </HStack>
                    <Text color={textColor} lineHeight="tall">
                      These Terms remain effective as long as you use the Services. We reserve the right to 
                      suspend or terminate your access at any time, without notice, if you violate any terms 
                      of this Agreement. Upon termination, your right to use the Services ceases immediately.
                    </Text>
                  </Box>
                </MotionBox>

                <MotionBox variants={itemVariants} id="modifications">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={Settings} size={6} color="purple.500" />
                      <Heading size="lg" color="gray.800">10. Modifications and Interruptions</Heading>
                    </HStack>
                    <Text color={textColor} lineHeight="tall">
                      We may modify or discontinue all or part of the Services without notice. We are not liable 
                      for any interruptions or changes to the Services. We reserve the right to change, modify, 
                      or remove the contents of the Services at any time for any reason without notice.
                    </Text>
                  </Box>
                </MotionBox>

                <MotionBox variants={itemVariants} id="law">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={Scale} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">11. Governing Law</Heading>
                    </HStack>
                    <Text color={textColor} lineHeight="tall">
                      These Terms are governed by and construed in accordance with the laws of Nigeria. 
                      Any disputes arising from these Terms shall be resolved through arbitration in Nigeria, 
                      and you consent to the jurisdiction of Nigerian courts.
                    </Text>
                  </Box>
                </MotionBox> 
               <MotionBox variants={itemVariants} id="liability">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={AlertCircle} size={6} color="yellow.500" />
                      <Heading size="lg" color="gray.800">12. Limitations of Liability</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Box
                        bg="yellow.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="yellow.200"
                        w="full"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={AlertCircle} size={5} color="yellow.600" />
                          <Text fontWeight="semibold" color="yellow.700">
                            Liability Limitations
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="yellow.600">
                          Veyu Ltd. shall not be liable for any direct, indirect, incidental, special, 
                          consequential, or punitive damages arising from your use of the Services.
                        </Text>
                      </Box>

                      <Text color={textColor} lineHeight="tall">
                        Our liability to you for any cause whatsoever will be limited to the amount paid, 
                        if any, by you to us during the six-month period prior to the cause of action arising.
                      </Text>
                    </VStack>
                  </Box>
                </MotionBox>

                <MotionBox variants={itemVariants} id="indemnification">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={Shield} size={6} color="green.500" />
                      <Heading size="lg" color="gray.800">13. Indemnification</Heading>
                    </HStack>
                    <Text color={textColor} lineHeight="tall">
                      You agree to indemnify, defend, and hold harmless Veyu Ltd., its officers, directors, 
                      employees, and agents from any claims, damages, losses, or expenses (including reasonable 
                      attorneys' fees) resulting from your use of the Services or breach of these Terms.
                    </Text>
                  </Box>
                </MotionBox>

                <MotionBox variants={itemVariants} id="communications">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={MessageSquare} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">14. Electronic Communications</Heading>
                    </HStack>
                    <Text color={textColor} lineHeight="tall">
                      By using the Services, you consent to receive electronic communications from us. 
                      You agree that all agreements, notices, disclosures, and other communications provided 
                      to you electronically satisfy any legal requirement that such communications be in writing.
                    </Text>
                  </Box>
                </MotionBox>

                {/* Contact Section */}
                <MotionBox variants={itemVariants} id="contact">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Mail} size={6} color="purple.500" />
                      <Heading size="lg" color="gray.800">15. Contact Us</Heading>
                    </HStack>

                    <VStack spacing={6} align="start">
                      <Text color={textColor}>
                        Have questions about these Terms of Service? We're here to help clarify any concerns:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                        <VStack spacing={4} align="start">
                          <HStack spacing={3}>
                            <Icon as={Mail} size={5} color="purple.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">Email Support</Text>
                              <Text fontSize="sm" color={textColor}>support@veyu.cc</Text>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={Phone} size={5} color="green.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">Phone Support</Text>
                              <Text fontSize="sm" color={textColor}>+234 (0) 800 000 0000</Text>
                            </VStack>
                          </HStack>
                        </VStack>

                        <VStack spacing={4} align="start">
                          <HStack spacing={3}>
                            <Icon as={Globe} size={5} color="blue.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">Website</Text>
                              <Text fontSize="sm" color={textColor}>www.veyu.cc</Text>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={MapPin} size={5} color="orange.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">Address</Text>
                              <Text fontSize="sm" color={textColor}>Lagos, Nigeria</Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      </SimpleGrid>

                      <Box
                        bg="purple.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="purple.200"
                        w="full"
                      >
                        <Text fontSize="sm" color="purple.600" textAlign="center">
                          <strong>Response Time:</strong> We typically respond to legal inquiries within 2-3 business days.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Final Agreement */}
                <MotionBox variants={itemVariants}>
                  <Box
                    bg="gray.50"
                    p={6}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    textAlign="center"
                  >
                    <Text fontWeight="semibold" color="gray.800" mb={2}>
                      Legal Agreement Acknowledgment
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      By using the Services, you acknowledge that you have read, understood, and agree to be bound 
                      by these Terms and Conditions. This agreement is legally binding and enforceable.
                    </Text>
                  </Box>
                </MotionBox>
              </VStack>
            </Box>
          </SimpleGrid>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default TermsOfServicePage;