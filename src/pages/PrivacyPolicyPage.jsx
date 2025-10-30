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
  BreadcrumbLink
} from "@chakra-ui/react";
import {
  BsShieldLock,
  BsInfoCircle,
  BsPersonCircle,
  BsFileEarmarkText,
  BsShareFill,
  BsShieldCheck,
  BsClockHistory,
  BsLink45Deg,
  BsArrowClockwise,
  BsEnvelope,
  BsTelephone,
  BsGlobe,
  BsInstagram,
  BsGeoAlt,
  BsDatabase,
  BsPersonBadge,
  BsCookie,
  BsCheckCircle,
  BsEye,
  BsLock,
  BsTrash
} from "react-icons/bs";
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  Globe,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Database,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MotionBox = motion(Box);

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [readingProgress, setReadingProgress] = useState(0);

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
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
    { id: 'introduction', title: 'Introduction', icon: AlertCircle },
    { id: 'info-we-collect', title: 'Information We Collect', icon: Database },
    { id: 'use-of-info', title: 'How We Use Info', icon: Eye },
    { id: 'sharing', title: 'Sharing', icon: Share2 },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'rights', title: 'Your Rights', icon: Users },
    { id: 'retention', title: 'Retention', icon: Clock },
    { id: 'links', title: 'Third-Party Links', icon: Globe },
    { id: 'changes', title: 'Changes', icon: FileText },
    { id: 'contact', title: 'Contact', icon: Mail }
  ];

  const privacyHighlights = [
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'Your data is encrypted and protected with industry-standard security measures.',
      color: 'green'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'We clearly explain what data we collect and how we use it.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Your Control',
      description: 'You have full control over your data with rights to access, modify, or delete.',
      color: 'purple'
    },
    {
      icon: Lock,
      title: 'No Selling',
      description: 'We never sell your personal information to third parties.',
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
        colorScheme="blue" 
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
                <BreadcrumbLink as={Link} to="/" color="blue.500">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color="gray.600">Privacy Policy</BreadcrumbLink>
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
                bgGradient="linear(to-r, blue.400, purple.400, pink.400)"
              />
              
              <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
                <Box
                  p={4}
                  borderRadius="full"
                  bg="blue.100"
                  border="4px solid"
                  borderColor="blue.200"
                >
                  <Icon as={Shield} size={12} color="blue.600" />
                </Box>
                
                <VStack align={{ base: 'center', md: 'start' }} spacing={3} flex={1}>
                  <Heading size="2xl" color="gray.800" textAlign={{ base: 'center', md: 'left' }}>
                    Privacy Policy
                  </Heading>
                  <Text fontSize="lg" color={textColor} textAlign={{ base: 'center', md: 'left' }}>
                    Your privacy matters to us. Learn how we protect and handle your data.
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                      Last Updated: Oct 17, 2025
                    </Badge>
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                      GDPR Compliant
                    </Badge>
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          </MotionBox>

          {/* Privacy Highlights */}
          <MotionBox variants={itemVariants} mb={12}>
            <VStack spacing={6} textAlign="center" mb={8}>
              <Heading size="lg" color="gray.800">
                Our Privacy Commitment
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                We're committed to protecting your privacy with transparent practices and robust security measures.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {privacyHighlights.map((highlight, i) => (
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
              >
                <Heading size="md" mb={4} color="gray.800">
                  Quick Navigation
                </Heading>
                <VStack spacing={2} align="stretch">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'solid' : 'ghost'}
                      colorScheme="blue"
                      size="sm"
                      justifyContent="flex-start"
                      leftIcon={<Icon as={section.icon} size={4} />}
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        setActiveSection(section.id);
                      }}
                      _hover={{ bg: 'blue.50' }}
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
                
                {/* Introduction */}
                <MotionBox variants={itemVariants} id="introduction">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={AlertCircle} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">Introduction</Heading>
                    </HStack>
                    
                    <VStack spacing={4} align="start">
                      <Text color={textColor} lineHeight="tall">
                        Welcome to Veyu Ltd ("Company," "we," "us," or "our"). We operate the website www.veyu.cc, 
                        Android and iOS mobile apps, and provide services covering vehicle transactions and services 
                        across categories including cars, motorcycles, boats, aircraft, UAVs and more.
                      </Text>
                      
                      <Box
                        bg="blue.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                        w="full"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={CheckCircle} size={5} color="blue.500" />
                          <Text fontWeight="semibold" color="blue.700">
                            Key Point
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="blue.600">
                          By using our Services, you agree to the terms of this Privacy Policy. 
                          If you do not agree with the terms, please do not access or use our Services.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Information We Collect */}
                <MotionBox variants={itemVariants} id="info-we-collect">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Database} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">1. Information We Collect</Heading>
                    </HStack>

                    <Accordion allowMultiple>
                      <AccordionItem border="none" mb={4}>
                        <AccordionButton
                          bg="gray.50"
                          borderRadius="lg"
                          _hover={{ bg: 'gray.100' }}
                          p={4}
                        >
                          <HStack flex={1} spacing={3}>
                            <Icon as={BsPersonCircle} color="blue.500" />
                            <Text fontWeight="semibold">1.1 Personal Information</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={4}>
                          <Text mb={3} color={textColor}>
                            When you register on our platform or interact with us, we may collect:
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                            {['Name', 'Email Address', 'Phone Number', 'Address and Location', 'Payment Information'].map((item) => (
                              <HStack key={item} spacing={2}>
                                <Icon as={CheckCircle} size={4} color="green.500" />
                                <Text fontSize="sm" color={textColor}>{item}</Text>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem border="none" mb={4}>
                        <AccordionButton
                          bg="gray.50"
                          borderRadius="lg"
                          _hover={{ bg: 'gray.100' }}
                          p={4}
                        >
                          <HStack flex={1} spacing={3}>
                            <Icon as={BsFileEarmarkText} color="blue.500" />
                            <Text fontWeight="semibold">1.2 Non-Personal Information</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={4}>
                          <Text mb={3} color={textColor}>
                            We collect non-personal information that cannot identify you directly:
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                            {['Browser Type & Version', 'Device Information', 'IP Address', 'Operating System', 'Usage Data', 'Page Interactions'].map((item) => (
                              <HStack key={item} spacing={2}>
                                <Icon as={CheckCircle} size={4} color="green.500" />
                                <Text fontSize="sm" color={textColor}>{item}</Text>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem border="none">
                        <AccordionButton
                          bg="gray.50"
                          borderRadius="lg"
                          _hover={{ bg: 'gray.100' }}
                          p={4}
                        >
                          <HStack flex={1} spacing={3}>
                            <Icon as={BsCookie} color="blue.500" />
                            <Text fontWeight="semibold">1.3 Cookies & Tracking</Text>
                          </HStack>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={4}>
                          <Text color={textColor}>
                            We use cookies and similar tracking technologies (web beacons, pixels) to collect 
                            information about your activity and improve functionality and user experience.
                          </Text>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Box>
                </MotionBox>

                {/* How We Use Your Information */}
                <MotionBox variants={itemVariants} id="use-of-info">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Eye} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">2. How We Use Your Information</Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {[
                        {
                          title: 'Providing Services',
                          description: 'Process transactions, manage accounts, and provide customer support',
                          icon: CheckCircle,
                          color: 'green'
                        },
                        {
                          title: 'Communication',
                          description: 'Send updates, newsletters, and promotional materials (opt-out available)',
                          icon: Mail,
                          color: 'blue'
                        },
                        {
                          title: 'Analytics',
                          description: 'Understand user interactions and improve our offerings',
                          icon: Eye,
                          color: 'purple'
                        },
                        {
                          title: 'Security',
                          description: 'Detect and prevent fraud, unauthorized access, and unlawful activities',
                          icon: Shield,
                          color: 'orange'
                        }
                      ].map((use, i) => (
                        <VStack
                          key={i}
                          spacing={3}
                          p={4}
                          bg="gray.50"
                          borderRadius="lg"
                          align="start"
                        >
                          <HStack spacing={2}>
                            <Icon as={use.icon} size={5} color={`${use.color}.500`} />
                            <Text fontWeight="semibold" color="gray.800">{use.title}</Text>
                          </HStack>
                          <Text fontSize="sm" color={textColor}>
                            {use.description}
                          </Text>
                        </VStack>
                      ))}
                    </SimpleGrid>
                  </Box>
                </MotionBox>

                {/* Data Sharing */}
                <MotionBox variants={itemVariants} id="sharing">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Share2} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">3. How We Share Your Information</Heading>
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
                          <Icon as={Shield} size={5} color="red.500" />
                          <Text fontWeight="semibold" color="red.700">
                            Important: We Never Sell Your Data
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="red.600">
                          We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                        </Text>
                      </Box>

                      <Text color={textColor} mb={4}>
                        We may share your information only in these specific circumstances:
                      </Text>

                      <VStack spacing={3} w="full">
                        {[
                          {
                            title: 'Service Providers',
                            description: 'Third-party services that help us provide our Services (payment processors, email providers)',
                            icon: Users
                          },
                          {
                            title: 'Legal Requirements',
                            description: 'When required by law or to comply with legal obligations and protect our rights',
                            icon: FileText
                          },
                          {
                            title: 'Business Transfers',
                            description: 'If we merge with or are acquired by another company (as part of transaction)',
                            icon: ArrowRight
                          }
                        ].map((sharing, i) => (
                          <HStack
                            key={i}
                            spacing={4}
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            w="full"
                            align="start"
                          >
                            <Icon as={sharing.icon} size={5} color="blue.500" mt={1} />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold" color="gray.800">{sharing.title}</Text>
                              <Text fontSize="sm" color={textColor}>{sharing.description}</Text>
                            </VStack>
                          </HStack>
                        ))}
                      </VStack>
                    </VStack>
                  </Box>
                </MotionBox>      
          {/* Data Security */}
                <MotionBox variants={itemVariants} id="security">
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
                      <Heading size="lg" color="gray.800">4. Data Security</Heading>
                    </HStack>

                    <VStack spacing={6} align="start">
                      <Text color={textColor}>
                        We implement comprehensive security measures to protect your personal information:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                        {[
                          {
                            title: 'SSL Encryption',
                            description: 'Data protected during transmission',
                            icon: Lock,
                            color: 'green'
                          },
                          {
                            title: 'Access Controls',
                            description: 'Only authorized personnel access',
                            icon: Users,
                            color: 'blue'
                          },
                          {
                            title: 'Security Audits',
                            description: 'Regular vulnerability assessments',
                            icon: Shield,
                            color: 'purple'
                          }
                        ].map((security, i) => (
                          <VStack
                            key={i}
                            spacing={3}
                            p={4}
                            bg={`${security.color}.50`}
                            borderRadius="lg"
                            border="1px solid"
                            borderColor={`${security.color}.200`}
                            textAlign="center"
                          >
                            <Icon as={security.icon} size={8} color={`${security.color}.500`} />
                            <VStack spacing={1}>
                              <Text fontWeight="semibold" color="gray.800">{security.title}</Text>
                              <Text fontSize="sm" color={textColor}>{security.description}</Text>
                            </VStack>
                          </VStack>
                        ))}
                      </SimpleGrid>

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
                            Security Disclaimer
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="yellow.600">
                          While we implement robust security measures, no method of data transmission or storage 
                          is completely secure. We strive to protect your data but cannot guarantee absolute security.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Your Rights */}
                <MotionBox variants={itemVariants} id="rights">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={6}>
                      <Icon as={Users} size={6} color="purple.500" />
                      <Heading size="lg" color="gray.800">5. Your Privacy Rights</Heading>
                    </HStack>

                    <VStack spacing={4} align="start">
                      <Text color={textColor}>
                        You have comprehensive rights regarding your personal information:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                        {[
                          {
                            title: 'Access',
                            description: 'Request access to personal data we hold about you',
                            icon: Eye,
                            color: 'blue'
                          },
                          {
                            title: 'Correction',
                            description: 'Request correction of inaccurate or incomplete data',
                            icon: FileText,
                            color: 'green'
                          },
                          {
                            title: 'Deletion',
                            description: 'Request deletion of your personal data (subject to conditions)',
                            icon: BsTrash,
                            color: 'red'
                          },
                          {
                            title: 'Opt-Out',
                            description: 'Unsubscribe from marketing communications anytime',
                            icon: Mail,
                            color: 'orange'
                          }
                        ].map((right, i) => (
                          <HStack
                            key={i}
                            spacing={4}
                            p={4}
                            bg="gray.50"
                            borderRadius="lg"
                            align="start"
                          >
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg={`${right.color}.100`}
                            >
                              <Icon as={right.icon} size={5} color={`${right.color}.600`} />
                            </Box>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold" color="gray.800">{right.title}</Text>
                              <Text fontSize="sm" color={textColor}>{right.description}</Text>
                            </VStack>
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
                        <Text fontSize="sm" color="blue.600">
                          <strong>To exercise these rights:</strong> Contact us at support@veyu.cc with your request. 
                          We'll respond within 30 days and verify your identity before processing.
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>

                {/* Remaining Sections */}
                <MotionBox variants={itemVariants} id="retention">
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
                      <Heading size="lg" color="gray.800">6. Data Retention</Heading>
                    </HStack>
                    <Text color={textColor}>
                      We retain your personal information only as long as necessary to fulfill the purposes outlined 
                      in this Privacy Policy, unless a longer retention period is required by law. When no longer needed, 
                      we securely delete or anonymize your data.
                    </Text>
                  </Box>
                </MotionBox>

                <MotionBox variants={itemVariants} id="links">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={Globe} size={6} color="cyan.500" />
                      <Heading size="lg" color="gray.800">7. Third-Party Links</Heading>
                    </HStack>
                    <Text color={textColor}>
                      Our website may contain links to third-party websites. This Privacy Policy does not apply to 
                      external sites, and we're not responsible for their privacy practices. Please review their 
                      privacy policies before sharing information.
                    </Text>
                  </Box>
                </MotionBox>

                <MotionBox variants={itemVariants} id="changes">
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} mb={4}>
                      <Icon as={FileText} size={6} color="purple.500" />
                      <Heading size="lg" color="gray.800">8. Changes to This Policy</Heading>
                    </HStack>
                    <Text color={textColor}>
                      We may update this Privacy Policy periodically. We'll notify you of changes by posting the 
                      updated policy on our website and updating the "Last updated" date. Continued use of our 
                      Services indicates acceptance of the updated policy.
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
                      <Icon as={Mail} size={6} color="blue.500" />
                      <Heading size="lg" color="gray.800">9. Contact Us</Heading>
                    </HStack>

                    <VStack spacing={6} align="start">
                      <Text color={textColor}>
                        Have questions about this Privacy Policy or how we handle your data? We're here to help:
                      </Text>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                        <VStack spacing={4} align="start">
                          <HStack spacing={3}>
                            <Icon as={Mail} size={5} color="blue.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">Email</Text>
                              <Text fontSize="sm" color={textColor}>support@veyu.cc</Text>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={3}>
                            <Icon as={Phone} size={5} color="green.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" color="gray.800">Phone</Text>
                              <Text fontSize="sm" color={textColor}>+234 (0) 800 000 0000</Text>
                            </VStack>
                          </HStack>
                        </VStack>

                        <VStack spacing={4} align="start">
                          <HStack spacing={3}>
                            <Icon as={Globe} size={5} color="purple.500" />
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
                        bg="blue.50"
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="blue.200"
                        w="full"
                      >
                        <Text fontSize="sm" color="blue.600" textAlign="center">
                          <strong>Response Time:</strong> We typically respond to privacy inquiries within 24-48 hours.
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
                      Agreement Acknowledgment
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      By using our Services, you acknowledge that you have read and understood this Privacy Policy 
                      and agree to its terms. Thank you for trusting Veyu with your information.
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

export default PrivacyPolicy;