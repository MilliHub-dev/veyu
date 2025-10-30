import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  Select,
  useToast,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  User,
  Building,
  Globe,
  Shield,
  Headphones,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion(Box);

export default function ContactPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'support@veyu.cc',
      color: 'blue.500',
      gradient: 'linear(to-br, blue.400, blue.600)'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team directly',
      contact: '+234 (0) 800 000 0000',
      color: 'green.500',
      gradient: 'linear(to-br, green.400, green.600)'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available 9AM - 6PM WAT',
      color: 'purple.500',
      gradient: 'linear(to-br, purple.400, purple.600)'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come see us in person',
      contact: 'Lagos, Nigeria',
      color: 'orange.500',
      gradient: 'linear(to-br, orange.400, orange.600)'
    }
  ];

  const supportTeam = [
    {
      name: 'Sarah Johnson',
      role: 'Customer Success Manager',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      speciality: 'General Inquiries'
    },
    {
      name: 'Michael Chen',
      role: 'Technical Support Lead',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      speciality: 'Technical Issues'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Business Relations',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      speciality: 'Partnership & Sales'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you within 24 hours.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Box bg={bgGradient} minH="100vh">
      <Container maxW="container.xl" pt={20} pb={16}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <VStack spacing={8} textAlign="center" mb={16}>
            <MotionBox variants={itemVariants}>
              <Badge
                colorScheme="blue"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                mb={4}
              >
                💬 We're Here to Help
              </Badge>
              <Heading
                size="3xl"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                mb={4}
              >
                Get in Touch
              </Heading>
              <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
                Have questions about Veyu? Need help with your account? Want to partner with us?
                Our friendly team is here to assist you every step of the way.
              </Text>
            </MotionBox>
          </VStack>

          {/* Contact Methods */}
          <MotionBox variants={itemVariants} mb={16}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {contactMethods.map((method, i) => (
                <MotionBox
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    shadow="lg"
                    border="1px"
                    borderColor="gray.200"
                    position="relative"
                    overflow="hidden"
                    _hover={{
                      shadow: 'xl',
                      borderColor: method.color,
                    }}
                    transition="all 0.3s"
                    cursor="pointer"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="3px"
                      bgGradient={method.gradient}
                    />

                    <VStack spacing={4} align="center">
                      <Box
                        p={3}
                        borderRadius="full"
                        bg={`${method.color.split('.')[0]}.50`}
                      >
                        <Icon as={method.icon} size={6} color={method.color} />
                      </Box>

                      <VStack spacing={2} textAlign="center">
                        <Heading size="sm">{method.title}</Heading>
                        <Text fontSize="sm" color={textColor}>
                          {method.description}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={method.color}>
                          {method.contact}
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>
          {/* Main Contact Section */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} mb={16}>
            {/* Contact Form */}
            <MotionBox variants={itemVariants}>
              <Box
                bg={cardBg}
                p={8}
                borderRadius="2xl"
                shadow="xl"
                border="1px"
                borderColor="gray.200"
              >
                <VStack spacing={6} align="stretch">
                  <VStack spacing={2} align="start">
                    <Heading size="lg">Send us a Message</Heading>
                    <Text color={textColor}>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </Text>
                  </VStack>

                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Full Name</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={User} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Your full name"
                              bg="gray.50"
                              border="1px"
                              borderColor="gray.200"
                              _focus={{ borderColor: 'blue.500', bg: 'white' }}
                            />
                          </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Email Address</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={Mail} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="your@email.com"
                              bg="gray.50"
                              border="1px"
                              borderColor="gray.200"
                              _focus={{ borderColor: 'blue.500', bg: 'white' }}
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl isRequired>
                        <FormLabel>Subject</FormLabel>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What's this about?"
                          bg="gray.50"
                          border="1px"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Category</FormLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          placeholder="Select a category"
                          bg="gray.50"
                          border="1px"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="partnership">Partnership</option>
                          <option value="feedback">Feedback</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Message</FormLabel>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us how we can help you..."
                          rows={6}
                          bg="gray.50"
                          border="1px"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'blue.500', bg: 'white' }}
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        rightIcon={<Send size={20} />}
                        isLoading={isSubmitting}
                        loadingText="Sending..."
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        Send Message
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </Box>
            </MotionBox>

            {/* Contact Info & Team */}
            <VStack spacing={8} align="stretch">
              {/* Quick Info */}
              <MotionBox variants={itemVariants}>
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  shadow="lg"
                  border="1px"
                  borderColor="gray.200"
                >
                  <VStack spacing={4} align="start">
                    <Heading size="md">Quick Information</Heading>

                    <VStack spacing={3} align="start" w="full">
                      <HStack spacing={3}>
                        <Icon as={Clock} color="blue.500" />
                        <VStack spacing={0} align="start">
                          <Text fontWeight="semibold">Response Time</Text>
                          <Text fontSize="sm" color={textColor}>Within 24 hours</Text>
                        </VStack>
                      </HStack>

                      <HStack spacing={3}>
                        <Icon as={Shield} color="green.500" />
                        <VStack spacing={0} align="start">
                          <Text fontWeight="semibold">Data Security</Text>
                          <Text fontSize="sm" color={textColor}>Your information is secure</Text>
                        </VStack>
                      </HStack>

                      <HStack spacing={3}>
                        <Icon as={Globe} color="purple.500" />
                        <VStack spacing={0} align="start">
                          <Text fontWeight="semibold">Global Support</Text>
                          <Text fontSize="sm" color={textColor}>Available worldwide</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              </MotionBox>
              {/* Support Team */}
              <MotionBox variants={itemVariants}>
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  shadow="lg"
                  border="1px"
                  borderColor="gray.200"
                >
                  <VStack spacing={4} align="start">
                    <Heading size="md">Our Support Team</Heading>

                    <VStack spacing={4} w="full">
                      {supportTeam.map((member, i) => (
                        <HStack key={i} spacing={3} w="full">
                          <Avatar
                            src={member.avatar}
                            size="md"
                            name={member.name}
                          />
                          <VStack spacing={0} align="start" flex={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {member.name}
                            </Text>
                            <Text fontSize="xs" color="blue.500">
                              {member.role}
                            </Text>
                            <Text fontSize="xs" color={textColor}>
                              {member.speciality}
                            </Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </Box>
              </MotionBox>

              {/* Customer Satisfaction */}
              <MotionBox variants={itemVariants}>
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  shadow="lg"
                  border="1px"
                  borderColor="gray.200"
                  textAlign="center"
                >
                  <VStack spacing={3}>
                    <HStack spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} as={Star} color="yellow.400" fill="yellow.400" />
                      ))}
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      4.9/5
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      Customer Satisfaction Rating
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      Based on 2,500+ reviews
                    </Text>
                  </VStack>
                </Box>
              </MotionBox>
            </VStack>
          </SimpleGrid>

          {/* FAQ Section */}
          <MotionBox variants={itemVariants}>
            <Box
              bg={cardBg}
              p={8}
              borderRadius="2xl"
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              textAlign="center"
            >
              <VStack spacing={6}>
                <VStack spacing={2}>
                  <Heading size="lg">Frequently Asked Questions</Heading>
                  <Text color={textColor}>
                    Can't find what you're looking for? Check out our comprehensive FAQ section.
                  </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                  <VStack spacing={2}>
                    <Icon as={Headphones} size={8} color="blue.500" />
                    <Text fontWeight="semibold">Account Support</Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      Help with login, registration, and account management
                    </Text>
                  </VStack>

                  <VStack spacing={2}>
                    <Icon as={Building} size={8} color="green.500" />
                    <Text fontWeight="semibold">Business Inquiries</Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      Partnership opportunities and business solutions
                    </Text>
                  </VStack>

                  <VStack spacing={2}>
                    <Icon as={CheckCircle} size={8} color="purple.500" />
                    <Text fontWeight="semibold">Technical Help</Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      Platform issues, bugs, and technical assistance
                    </Text>
                  </VStack>
                </SimpleGrid>

                <Button
                  variant="outline"
                  rightIcon={<ArrowRight size={20} />}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  View All FAQs
                </Button>
              </VStack>
            </Box>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
}