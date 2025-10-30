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
  Avatar,
  Image
} from '@chakra-ui/react';
import {
  CheckCircle,
  Target,
  Eye,
  Users,
  Globe,
  Shield,
  Car,
  Bike,
  Ship,
  Plane,
  Truck,
  Wrench,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionBox = motion(Box);

export default function AboutPage() {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const values = [
    {
      icon: Target,
      title: 'Innovation First',
      description: 'We leverage cutting-edge technology to revolutionize the automotive marketplace experience.',
      color: 'blue.500'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Every transaction is protected with advanced security measures and verification processes.',
      color: 'green.500'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50,000+', icon: Users, color: 'blue' },
    { label: 'Vehicles Listed', value: '25,000+', icon: Car, color: 'green' },
    { label: 'Cities Covered', value: '150+', icon: Globe, color: 'purple' },
    { label: 'Success Rate', value: '98%', icon: TrendingUp, color: 'orange' }
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
      <Container maxW="container.xl" pt={20} pb={16}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center" mb={20}>
            <MotionBox variants={itemVariants}>
              <VStack align="flex-start" spacing={6}>
                <Badge
                  colorScheme="blue"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                >
                  🚀 Since 2025
                </Badge>

                <Heading
                  size="3xl"
                  bgGradient="linear(to-r, blue.600, purple.600)"
                  bgClip="text"
                  lineHeight="shorter"
                >
                  Revolutionizing the Automotive Marketplace
                </Heading>

                <Text fontSize="xl" color={textColor} lineHeight="tall">
                  Veyu is more than just a marketplace—we're building the future of automotive commerce.
                  From your first car to your dream yacht, we connect you with verified sellers, trusted mechanics,
                  and premium services across every vehicle category imaginable.
                </Text>

                <VStack align="flex-start" spacing={3}>
                  <HStack spacing={3}>
                    <Icon as={CheckCircle} color="green.500" />
                    <Text color={textColor}>Verified dealers, mechanics & service providers</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={CheckCircle} color="green.500" />
                    <Text color={textColor}>Secure payments with escrow protection</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={CheckCircle} color="green.500" />
                    <Text color={textColor}>Real-time chat, bookings & notifications</Text>
                  </HStack>
                </VStack>

                <HStack spacing={4} pt={4}>
                  <Button
                    as={Link}
                    to="/buy"
                    size="lg"
                    colorScheme="blue"
                    rightIcon={<ArrowRight size={20} />}
                  >
                    Explore Vehicles
                  </Button>
                  <Button
                    as={Link}
                    to="/rent"
                    size="lg"
                    variant="outline"
                  >
                    Rent a Vehicle
                  </Button>
                </HStack>
              </VStack>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <Box position="relative">
                <Image
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop"
                  w="100%"
                  h="400px"
                  borderRadius="2xl"
                  alt="Veyu Marketplace"
                  objectFit="cover"
                  shadow="2xl"
                />
                <Box
                  position="absolute"
                  top={4}
                  right={4}
                  bg={cardBg}
                  p={4}
                  borderRadius="xl"
                  shadow="lg"
                >
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">4.8★</Text>
                    <Text fontSize="sm" color={textColor}>User Rating</Text>
                  </VStack>
                </Box>
              </Box>
            </MotionBox>
          </SimpleGrid>
          {/* Stats Section */}
          <MotionBox variants={itemVariants} mb={20}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
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
                    spacing={3}
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

          {/* Mission & Vision */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} mb={20}>
            <MotionBox variants={itemVariants}>
              <Box
                bg={cardBg}
                p={8}
                borderRadius="2xl"
                shadow="xl"
                border="1px"
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
                  bgGradient="linear(to-r, blue.400, blue.600)"
                />

                <VStack align="start" spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={Target} size={6} color="blue.500" />
                    <Heading size="lg">Our Mission</Heading>
                  </HStack>
                  <Text color={textColor} fontSize="lg" lineHeight="tall">
                    To democratize access to vehicles and automotive services by creating the world's
                    most trusted, comprehensive, and user-friendly marketplace that connects every
                    participant in the automotive ecosystem.
                  </Text>
                </VStack>
              </Box>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <Box
                bg={cardBg}
                p={8}
                borderRadius="2xl"
                shadow="xl"
                border="1px"
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
                  bgGradient="linear(to-r, purple.400, purple.600)"
                />

                <VStack align="start" spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={Eye} size={6} color="purple.500" />
                    <Heading size="lg">Our Vision</Heading>
                  </HStack>
                  <Text color={textColor} fontSize="lg" lineHeight="tall">
                    A world where buying, selling, renting, and servicing any vehicle is as simple
                    as a few clicks—transparent, secure, and accessible to everyone, everywhere,
                    from land to sea to sky.
                  </Text>
                </VStack>
              </Box>
            </MotionBox>
          </SimpleGrid>
          {/* Core Values */}
          <VStack spacing={8} align="stretch" mb={20}>
            <MotionBox variants={itemVariants} textAlign="center">
              <Heading size="xl" mb={4}>Our Core Values</Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
                The principles that guide everything we do and every decision we make.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {values.map((value, i) => (
                <MotionBox
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    shadow="lg"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{
                      shadow: 'xl',
                      borderColor: value.color,
                    }}
                    transition="all 0.3s"
                  >
                    <HStack spacing={4} align="start">
                      <Box
                        p={3}
                        borderRadius="xl"
                        bg={`${value.color.split('.')[0]}.50`}
                        flexShrink={0}
                      >
                        <Icon as={value.icon} size={6} color={value.color} />
                      </Box>
                      <VStack align="start" spacing={3}>
                        <Heading size="md">{value.title}</Heading>
                        <Text color={textColor} lineHeight="tall">
                          {value.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Vehicle Categories */}
          <VStack spacing={8} align="stretch" mb={20}>
            <MotionBox variants={itemVariants} textAlign="center">
              <Heading size="xl" mb={4}>Vehicle Categories We Support</Heading>
              <Text fontSize="lg" color={textColor}>
                From everyday commuters to luxury yachts and private jets—we've got it all.
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6}>
              {[
                { icon: Car, name: 'Cars', color: 'blue' },
                { icon: Bike, name: 'Motorcycles', color: 'green' },
                { icon: Ship, name: 'Boats & Marine', color: 'cyan' },
                { icon: Plane, name: 'Aircraft', color: 'purple' },
                { icon: Truck, name: 'Commercial', color: 'orange' },
                { icon: Wrench, name: 'Services', color: 'red' }
              ].map((category, i) => (
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
                    <Text fontWeight="semibold" fontSize="sm" textAlign="center">
                      {category.name}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* CTA Section */}
          <MotionBox variants={itemVariants}>
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
                <Heading size="lg">Ready to Join the Veyu Community?</Heading>
                <Text fontSize="lg" color={textColor} maxW="2xl">
                  Whether you're buying your first car, selling a boat, or looking for reliable mechanics,
                  Veyu is here to make your automotive journey seamless and secure.
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
                    Get Started Today
                  </Button>
                  <Button
                    as={Link}
                    to="/contact"
                    size="lg"
                    variant="outline"
                    px={8}
                  >
                    Contact Us
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