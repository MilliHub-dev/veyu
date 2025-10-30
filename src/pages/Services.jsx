import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  VStack, 
  HStack, 
  Icon, 
  Button,
  Flex,
  Badge,
  useColorModeValue,
  Stack,
  Avatar,
  Divider,
  Center,
  Image,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { 
  Car, 
  Wrench, 
  ShieldCheck, 
  Wallet, 
  MessageCircle, 
  Truck,
  Plane,
  Ship,
  Bike,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Shield,
  Zap,
  Globe,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function ServicesPage() {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const services = [
    { 
      icon: Car, 
      title: 'Buy & Sell Vehicles', 
      desc: 'Browse verified listings across cars, bikes, boats, aircraft, UAVs and more with advanced search and filtering.',
      features: ['Verified Listings', 'Advanced Search', 'Price Comparison', 'Instant Messaging'],
      color: 'blue.500',
      gradient: 'linear(to-br, blue.400, blue.600)'
    },
    { 
      icon: Truck, 
      title: 'Vehicle Rentals', 
      desc: 'Flexible daily, weekly, or monthly rentals for diverse vehicle categories with insurance coverage.',
      features: ['Flexible Terms', 'Insurance Included', 'GPS Tracking', '24/7 Support'],
      color: 'green.500',
      gradient: 'linear(to-br, green.400, green.600)'
    },
    { 
      icon: Wrench, 
      title: 'Mechanic Marketplace', 
      desc: 'Find verified service providers, book maintenance and repairs seamlessly with transparent pricing.',
      features: ['Verified Mechanics', 'Transparent Pricing', 'Service Guarantee', 'Real-time Tracking'],
      color: 'orange.500',
      gradient: 'linear(to-br, orange.400, orange.600)'
    },
    { 
      icon: ShieldCheck, 
      title: 'Business Verification', 
      desc: 'Comprehensive verification for dealers and mechanics to ensure trust, safety and credibility.',
      features: ['Document Verification', 'Background Checks', 'Trust Badges', 'Compliance Monitoring'],
      color: 'purple.500',
      gradient: 'linear(to-br, purple.400, purple.600)'
    },
    { 
      icon: Wallet, 
      title: 'Digital Wallet & Payments', 
      desc: 'Secure payment processing with built-in wallet, escrow services and instant transactions.',
      features: ['Escrow Protection', 'Multiple Payment Methods', 'Instant Transfers', 'Transaction History'],
      color: 'teal.500',
      gradient: 'linear(to-br, teal.400, teal.600)'
    },
    { 
      icon: MessageCircle, 
      title: 'Communication Hub', 
      desc: 'Negotiate, book, and get updates on listings and services with real-time messaging and notifications.',
      features: ['Real-time Chat', 'Push Notifications', 'Video Calls', 'Document Sharing'],
      color: 'pink.500',
      gradient: 'linear(to-br, pink.400, pink.600)'
    },
  ];

  const vehicleCategories = [
    { icon: Car, name: 'Cars', count: '15,000+', color: 'blue' },
    { icon: Bike, name: 'Motorcycles', count: '8,500+', color: 'green' },
    { icon: Ship, name: 'Boats & Marine', count: '2,300+', color: 'cyan' },
    { icon: Plane, name: 'Aircraft', count: '450+', color: 'purple' },
    { icon: Truck, name: 'Commercial', count: '5,200+', color: 'orange' },
    { icon: Zap, name: 'Electric Vehicles', count: '3,100+', color: 'yellow' },
  ];

  const stats = [
    { icon: Users, label: 'Active Users', value: '50,000+', color: 'blue' },
    { icon: CheckCircle, label: 'Completed Transactions', value: '25,000+', color: 'green' },
    { icon: Star, label: 'Average Rating', value: '4.8/5', color: 'yellow' },
    { icon: Globe, label: 'Cities Covered', value: '150+', color: 'purple' },
  ];

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
      {/* Hero Section */}
      <Container maxW="container.xl" pt={20} pb={16}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
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
                ✨ Complete Vehicle Ecosystem
              </Badge>
              <Heading 
                size="3xl" 
                bgGradient="linear(to-r, blue.600, purple.600)" 
                bgClip="text"
                mb={4}
              >
                Everything Automotive
              </Heading>
              <Heading size="3xl" color="gray.700" mb={6}>
                In One Platform
              </Heading>
            </MotionBox>
            
            <MotionBox variants={itemVariants} maxW="2xl">
              <Text fontSize="xl" color={textColor} lineHeight="tall">
                From buying your dream car to finding the perfect mechanic, Veyu connects you 
                with a comprehensive ecosystem of automotive services, all in one trusted platform.
              </Text>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <HStack spacing={4} flexWrap="wrap" justify="center">
                <Button 
                  as={Link}
                  to="/signup"
                  size="lg"
                  colorScheme="blue"
                  rightIcon={<ArrowRight size={20} />}
                  px={8}
                  py={6}
                  fontSize="lg"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  Get Started Free
                </Button>
                <Button 
                  as={Link}
                  to="/login"
                  size="lg"
                  variant="outline"
                  px={8}
                  py={6}
                  fontSize="lg"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Sign In
                </Button>
              </HStack>
            </MotionBox>
          </VStack>

          {/* Stats Section */}
          <MotionBox variants={itemVariants}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} mb={20}>
              {stats.map((stat, i) => (
                <MotionBox
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack 
                    bg={cardBg} 
                    p={6} 
                    borderRadius="xl" 
                    shadow="lg"
                    border="1px"
                    borderColor="gray.200"
                  >
                    <Icon as={stat.icon} size={8} color={`${stat.color}.500`} />
                    <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.500`}>
                      {stat.value}
                    </Text>
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      {stat.label}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>

          {/* Services Grid */}
          <VStack spacing={12} align="stretch">
            <MotionBox variants={itemVariants} textAlign="center">
              <Heading size="xl" mb={4}>Our Services</Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
                Comprehensive solutions for every automotive need, backed by cutting-edge technology and trusted partnerships.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {services.map((service, i) => (
                <MotionBox
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="2xl"
                    shadow="xl"
                    border="1px"
                    borderColor="gray.200"
                    position="relative"
                    overflow="hidden"
                    _hover={{
                      shadow: '2xl',
                      borderColor: service.color,
                    }}
                    transition="all 0.3s"
                  >
                    {/* Gradient overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="4px"
                      bgGradient={service.gradient}
                    />
                    
                    <VStack align="start" spacing={4}>
                      <Flex align="center" justify="space-between" w="full">
                        <Box
                          p={3}
                          borderRadius="xl"
                          bg={`${service.color.split('.')[0]}.50`}
                        >
                          <Icon as={service.icon} size={6} color={service.color} />
                        </Box>
                        <Badge colorScheme={service.color.split('.')[0]} variant="subtle">
                          Popular
                        </Badge>
                      </Flex>
                      
                      <Box>
                        <Heading size="md" mb={2}>{service.title}</Heading>
                        <Text color={textColor} fontSize="sm" lineHeight="tall">
                          {service.desc}
                        </Text>
                      </Box>

                      <VStack align="start" spacing={2} w="full">
                        {service.features.map((feature, idx) => (
                          <HStack key={idx} spacing={2}>
                            <Icon as={CheckCircle} size={4} color="green.500" />
                            <Text fontSize="sm" color={textColor}>{feature}</Text>
                          </HStack>
                        ))}
                      </VStack>

                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme={service.color.split('.')[0]}
                        rightIcon={<ArrowRight size={16} />}
                        _hover={{ bg: `${service.color.split('.')[0]}.50` }}
                      >
                        Learn More
                      </Button>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Vehicle Categories */}
          <VStack spacing={8} align="stretch" mt={20}>
            <MotionBox variants={itemVariants} textAlign="center">
              <Heading size="xl" mb={4}>Vehicle Categories</Heading>
              <Text fontSize="lg" color={textColor}>
                Explore our diverse marketplace covering every type of vehicle imaginable.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6}>
              {vehicleCategories.map((category, i) => (
                <MotionBox
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <VStack
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    shadow="md"
                    border="1px"
                    borderColor="gray.200"
                    spacing={3}
                    _hover={{
                      shadow: 'lg',
                      borderColor: `${category.color}.300`,
                      bg: `${category.color}.50`
                    }}
                    transition="all 0.3s"
                    cursor="pointer"
                  >
                    <Box
                      p={3}
                      borderRadius="full"
                      bg={`${category.color}.100`}
                    >
                      <Icon as={category.icon} size={6} color={`${category.color}.600`} />
                    </Box>
                    <VStack spacing={1}>
                      <Text fontWeight="semibold" fontSize="sm">
                        {category.name}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {category.count}
                      </Text>
                    </VStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* CTA Section */}
          <MotionBox variants={itemVariants} mt={20}>
            <Box
              bg={cardBg}
              p={12}
              borderRadius="2xl"
              shadow="xl"
              border="1px"
              borderColor="gray.200"
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(45deg, blue.500, purple.500, pink.500)"
                opacity={0.05}
              />
              
              <VStack spacing={6} position="relative">
                <Heading size="lg">Ready to Get Started?</Heading>
                <Text fontSize="lg" color={textColor} maxW="2xl">
                  Join thousands of users who trust Veyu for all their automotive needs. 
                  Start buying, selling, renting, or servicing vehicles today.
                </Text>
                <HStack spacing={4} flexWrap="wrap" justify="center">
                  <Button 
                    as={Link}
                    to="/signup"
                    size="lg"
                    colorScheme="blue"
                    rightIcon={<ArrowRight size={20} />}
                    px={8}
                  >
                    Create Account
                  </Button>
                  <Button 
                    as={Link}
                    to="/contact"
                    size="lg"
                    variant="outline"
                    px={8}
                  >
                    Contact Sales
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
}
