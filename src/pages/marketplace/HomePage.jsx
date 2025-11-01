import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  ButtonGroup,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Text,
  VStack,
  Button,
  Badge,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Wrap,
  WrapItem,
  useBreakpointValue,
} from "@chakra-ui/react"
import {
  Search,
  MessageCircle,
  Bell,
  ShoppingCart,
  User,
  Star,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  Award,
  Clock,
  MapPin,
  ArrowRight,
  Play,
  CheckCircle,
  Heart,
  Filter,
  Sparkles,
  Target,
  Globe,
} from "lucide-react"
import { ListingItemCard, ImageCarousel, LocationBreadcrumb } from "../../components";
import { GlobalStore } from "../../App";
import { objectifyJSON } from "../../utils";
import { apiClient } from "../../services/api";
import ScrollAnimation from 'react-animate-on-scroll';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Enhanced Feature Card Component
function FeatureCard({ icon, title, description, gradient, ...props }) {
  return (
    <MotionCard
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      minW="280px"
      maxW="350px"
      bg="white"
      borderRadius="2xl"
      shadow="xl"
      border="1px solid"
      borderColor="gray.100"
      overflow="hidden"
      _hover={{
        shadow: '2xl',
        borderColor: '#F4A950'
      }}
      {...props}
    >
      <CardBody p={8}>
        <VStack spacing={4} align="start">
          <Box
            bg={gradient || "linear-gradient(135deg, #F4A950, #FF6B35)"}
            w="60px"
            h="60px"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            shadow="lg"
          >
            {icon}
          </Box>
          <VStack spacing={2} align="start">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              {title}
            </Text>
            <Text color="gray.600" lineHeight="1.6">
              {description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  )
}

// Stats Card Component
function StatsCard({ icon, number, label, trend, ...props }) {
  return (
    <Card bg="white" borderRadius="xl" shadow="md" border="1px solid" borderColor="gray.100" {...props}>
      <CardBody p={6}>
        <HStack spacing={4}>
          <Box
            bg="#F4A950"
            p={3}
            borderRadius="lg"
            color="white"
          >
            {icon}
          </Box>
          <VStack spacing={1} align="start">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {number}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {label}
            </Text>
            {trend && (
              <HStack spacing={1}>
                <TrendingUp size={12} color="#10B981" />
                <Text fontSize="xs" color="green.500" fontWeight="medium">
                  {trend}
                </Text>
              </HStack>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}

// Category Card Component
function CategoryCard({ title, count, image, href, ...props }) {
  return (
    <MotionCard
      as={Link}
      to={href}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      bg="white"
      borderRadius="xl"
      shadow="md"
      overflow="hidden"
      _hover={{
        shadow: 'lg',
        textDecoration: 'none'
      }}
      {...props}
    >
      <Box position="relative" h="120px" overflow="hidden">
        <Image
          src={image}
          alt={title}
          w="full"
          h="full"
          objectFit="cover"
          transition="transform 0.3s"
          _hover={{ transform: 'scale(1.1)' }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.400"
        />
        <VStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          justify="center"
          color="white"
          textAlign="center"
        >
          <Text fontSize="lg" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="sm" opacity={0.9}>
            {count} available
          </Text>
        </VStack>
      </Box>
    </MotionCard>
  )
}

export default function MainPage() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [query, setQuery] = useState("");
  const [topDeals, setTopDeals] = useState({
    rentals: [],
    sales: [],
    services: [],
  });
  const { authUser, redirect, axios, notify } = useContext(GlobalStore);
  const words = ['Cars', 'Motorcycles', 'Boats', 'Aircraft'];
  const [wordIndex, setWordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const isMobile = useBreakpointValue({ base: true, md: false });

  function navToPage(path) {
    if (!query.trim()) {
      return redirect(path)
    }
  }

  async function getData() {
    try {
      const res = await apiClient.get(`/listings/my-listings/?scope=recents;top-deals`);
      const data = objectifyJSON(res.data);

      setRecentlyViewed(data.recents || []);
      setTopDeals(data.top_deals || { rentals: [], sales: [], services: [] });
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // If it's a 401 error, the user might not be authenticated
      if (error.response?.status === 401) {
        console.log('User not authenticated, skipping personalized data');
        // Set empty data instead of showing error
        setRecentlyViewed([]);
        setTopDeals({ rentals: [], sales: [], services: [] });
      }
    }
  }

  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % words.length), 2000);
    return () => clearInterval(id);
  }, [])

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Enhanced Hero Section */}
      <Box
        bgGradient="linear(to-br, orange.50, yellow.50, red.50)"
        position="relative"
        overflow="hidden"
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgImage="radial-gradient(circle at 25% 25%, #F4A950 2px, transparent 2px)"
          bgSize="50px 50px"
        />

        <Container maxW="7xl" py={{ base: 12, md: 20 }}>
          <LocationBreadcrumb mb={8} />

          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={12}
            alignItems="center"
            minH="500px"
          >
            {/* Hero Content */}
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <VStack spacing={6} align="start">
                <Badge
                  bg="#F4A950"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  🚗 Nigeria's #1 Vehicle Marketplace
                </Badge>

                <Heading
                  size="2xl"
                  lineHeight="1.2"
                  color="gray.800"
                  fontWeight="800"
                >
                  Your Perfect{" "}
                  <Text
                    as="span"
                    color="#F4A950"
                    key={wordIndex}
                    display="inline-block"
                    animation="fadeIn 0.5s ease-in-out"
                  >
                    {words[wordIndex]}
                  </Text>
                  <br />
                  Awaits You
                </Heading>

                <Text fontSize="xl" color="gray.600" maxW="500px" lineHeight="1.6">
                  Discover, buy, rent, and maintain vehicles with Nigeria's most trusted marketplace.
                  From luxury cars to reliable mechanics - we've got you covered.
                </Text>

                {/* Enhanced Search Bar */}
                <Box w="full" maxW="600px">
                  <InputGroup size="lg">
                    <InputLeftElement>
                      <Search size={20} color="#F4A950" />
                    </InputLeftElement>
                    <Input
                      value={query}
                      placeholder="Search cars, motorcycles, boats, or services..."
                      borderRadius="full"
                      bg="white"
                      border="2px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: '#F4A950' }}
                      _focus={{
                        borderColor: '#F4A950',
                        shadow: '0 0 0 1px #F4A950'
                      }}
                      pl={12}
                      h="60px"
                      fontSize="md"
                      onInput={e => setQuery(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                {/* Action Buttons */}
                <HStack spacing={4} flexWrap="wrap">
                  <Button
                    as={Link}
                    to="/buy"
                    bg="#F4A950"
                    color="white"
                    size="lg"
                    px={8}
                    py={6}
                    borderRadius="full"
                    _hover={{
                      bg: 'orange.600',
                      transform: 'translateY(-2px)',
                      shadow: 'lg'
                    }}
                    leftIcon={<ShoppingCart size={20} />}
                  >
                    Buy Vehicles
                  </Button>
                  <Button
                    as={Link}
                    to="/rent"
                    variant="outline"
                    borderColor="#F4A950"
                    color="#F4A950"
                    size="lg"
                    px={8}
                    py={6}
                    borderRadius="full"
                    _hover={{
                      bg: '#F4A950',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      shadow: 'lg'
                    }}
                    leftIcon={<Clock size={20} />}
                  >
                    Rent Now
                  </Button>
                  <Button
                    as={Link}
                    to="/mechanics"
                    variant="ghost"
                    color="#F4A950"
                    size="lg"
                    px={8}
                    py={6}
                    borderRadius="full"
                    _hover={{
                      bg: 'orange.50',
                      transform: 'translateY(-2px)'
                    }}
                    leftIcon={<User size={20} />}
                  >
                    Find Mechanic
                  </Button>
                </HStack>

                {/* Trust Indicators */}
                <HStack spacing={6} pt={4}>
                  <HStack spacing={2}>
                    <CheckCircle size={16} color="#10B981" />
                    <Text fontSize="sm" color="gray.600">Verified Dealers</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <ShieldCheck size={16} color="#10B981" />
                    <Text fontSize="sm" color="gray.600">Secure Payments</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Award size={16} color="#10B981" />
                    <Text fontSize="sm" color="gray.600">Quality Assured</Text>
                  </HStack>
                </HStack>
              </VStack>
            </MotionBox>

            {/* Hero Image */}
            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              position="relative"
            >
              <Box
                position="relative"
                borderRadius="2xl"
                overflow="hidden"
                shadow="2xl"
                _hover={{ transform: 'scale(1.02)' }}
                transition="transform 0.3s"
              >
                <Image
                  src="/assets/veyu/usdash.jpg"
                  alt="Premium Vehicles"
                  w="full"
                  h="400px"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bgGradient="linear(to-t, blackAlpha.600, transparent)"
                />

                {/* Play Button Overlay */}
                <Flex
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  align="center"
                  justify="center"
                >
                  <Button
                    bg="whiteAlpha.900"
                    color="#F4A950"
                    borderRadius="full"
                    size="lg"
                    p={6}
                    _hover={{
                      bg: 'white',
                      transform: 'scale(1.1)'
                    }}
                    leftIcon={<Play size={24} />}
                  >
                    Watch Demo
                  </Button>
                </Flex>
              </Box>

              {/* Floating Stats */}
              <Box
                position="absolute"
                bottom={-6}
                right={-6}
                bg="white"
                p={4}
                borderRadius="xl"
                shadow="xl"
                border="1px solid"
                borderColor="gray.100"
              >
                <VStack spacing={2} align="center">
                  <Text fontSize="2xl" fontWeight="bold" color="#F4A950">
                    50K+
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Happy Customers
                  </Text>
                </VStack>
              </Box>
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxW="7xl" py={12}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <StatsCard
            icon={<ShoppingCart size={24} />}
            number="25K+"
            label="Vehicles Listed"
            trend="+12% this month"
          />
          <StatsCard
            icon={<Users size={24} />}
            number="15K+"
            label="Active Users"
            trend="+8% this month"
          />
          <StatsCard
            icon={<Award size={24} />}
            number="500+"
            label="Verified Dealers"
            trend="+15% this month"
          />
          <StatsCard
            icon={<Star size={24} />}
            number="4.8"
            label="Average Rating"
            trend="Excellent"
          />
        </SimpleGrid>
      </Container>

      {/* Vehicle Categories */}
      <Container maxW="7xl" py={12}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.800">
              Browse by Category
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Find exactly what you're looking for in our diverse vehicle categories
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
            <CategoryCard
              title="Cars"
              count="18,500"
              image="/assets/home/cars.jpg"
              href="/buy?category=cars"
            />
            <CategoryCard
              title="Motorcycles"
              count="3,200"
              image="/assets/home/motorbike.png"
              href="/buy?category=motorcycles"
            />
            <CategoryCard
              title="Boats"
              count="850"
              image="/assets/home/boat.jpg"
              href="/buy?category=boats"
            />
            <CategoryCard
              title="Aircraft"
              count="120"
              image="/assets/home/aircraft.jpg"
              href="/buy?category=aircraft"
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Recently Viewed Section */}
      {recentlyViewed?.length > 0 && (
        <Container maxW="7xl" py={12}>
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center">
                <HStack spacing={3}>
                  <Clock size={24} color="#F4A950" />
                  <Heading size="xl" color="gray.800">
                    Continue Where You Left Off
                  </Heading>
                </HStack>
                <Text fontSize="lg" color="gray.600">
                  Pick up from your recent browsing history
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8} w="full">
                {recentlyViewed?.map((listing, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ListingItemCard listing={listing} />
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>
        </Container>
      )}

      {/* Enhanced Tools Section */}
      <Box bg="#F4A950" color="white" position="relative" overflow="hidden">
        {/* Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.1}
          bgImage="radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)"
          bgSize="30px 30px"
        />

        <Container maxW="7xl" py={16} position="relative">
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image
                src="/assets/veyu/gif.gif"
                alt="Smart Tools"
                borderRadius="2xl"
                shadow="2xl"
                _hover={{ transform: 'scale(1.05)' }}
                transition="transform 0.3s"
              />
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <VStack spacing={6} align="start">
                <VStack spacing={4} align="start">
                  <Badge
                    bg="whiteAlpha.200"
                    color="white"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    🛠️ Smart Tools
                  </Badge>

                  <Heading size="2xl" lineHeight="1.2">
                    Plan Smarter,
                    <br />
                    Shop Faster
                  </Heading>

                  <Text fontSize="lg" opacity={0.9} lineHeight="1.6">
                    Access powerful tools to calculate payments, compare deals, check affordability,
                    find trusted dealers, and book professional services.
                  </Text>
                </VStack>

                <Wrap spacing={3}>
                  <WrapItem>
                    <Button
                      as={Link}
                      to="/tools/payment-calculator"
                      variant="outline"
                      borderColor="white"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      leftIcon={<Target size={16} />}
                    >
                      Payment Calculator
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button
                      as={Link}
                      to="/compare"
                      variant="outline"
                      borderColor="white"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      leftIcon={<TrendingUp size={16} />}
                    >
                      Compare Deals
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button
                      as={Link}
                      to="/tools/affordability"
                      variant="outline"
                      borderColor="white"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      leftIcon={<CheckCircle size={16} />}
                    >
                      Affordability Check
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button
                      as={Link}
                      to="/dealers"
                      variant="outline"
                      borderColor="white"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      leftIcon={<MapPin size={16} />}
                    >
                      Find Dealers
                    </Button>
                  </WrapItem>
                </Wrap>

                <Button
                  as={Link}
                  to="/tools"
                  bg="white"
                  color="#F4A950"
                  size="lg"
                  px={8}
                  py={6}
                  borderRadius="full"
                  fontWeight="bold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'xl'
                  }}
                  rightIcon={<ArrowRight size={20} />}
                >
                  Explore All Tools
                </Button>
              </VStack>
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Why Choose Us Section */}
      <Container maxW="7xl" py={20}>
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Badge
                bg="#F4A950"
                color="white"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
              >
                ✨ Why Choose Veyu
              </Badge>
              <Heading size="2xl" color="gray.800">
                Nigeria's Most Trusted
                <Text as="span" color="#F4A950"> Vehicle Platform</Text>
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="600px">
                Join thousands of satisfied customers who trust Veyu for all their vehicle needs
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <FeatureCard
                icon={<Search size={28} />}
                title="Smart Discovery"
                description="Advanced AI-powered search helps you find the perfect vehicle with intelligent filters and personalized recommendations."
                gradient="linear-gradient(135deg, #F4A950, #FF6B35)"
              />

              <FeatureCard
                icon={<ShieldCheck size={28} />}
                title="Trust & Security"
                description="Every dealer is verified, every vehicle is inspected, and every transaction is secured with our comprehensive protection."
                gradient="linear-gradient(135deg, #10B981, #059669)"
              />

              <FeatureCard
                icon={<Zap size={28} />}
                title="Lightning Fast"
                description="From search to purchase in minutes. Our streamlined process eliminates paperwork and reduces waiting time."
                gradient="linear-gradient(135deg, #3B82F6, #1D4ED8)"
              />
            </SimpleGrid>

            {/* Additional Features */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full" pt={8}>
              <VStack spacing={3} textAlign="center">
                <Box
                  bg="orange.100"
                  p={4}
                  borderRadius="full"
                  color="#F4A950"
                >
                  <Globe size={24} />
                </Box>
                <Text fontWeight="bold" color="gray.800">Nationwide Coverage</Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Available in all 36 states across Nigeria
                </Text>
              </VStack>

              <VStack spacing={3} textAlign="center">
                <Box
                  bg="green.100"
                  p={4}
                  borderRadius="full"
                  color="green.600"
                >
                  <Heart size={24} />
                </Box>
                <Text fontWeight="bold" color="gray.800">Customer First</Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  24/7 support with 4.8/5 satisfaction rating
                </Text>
              </VStack>

              <VStack spacing={3} textAlign="center">
                <Box
                  bg="blue.100"
                  p={4}
                  borderRadius="full"
                  color="blue.600"
                >
                  <Sparkles size={24} />
                </Box>
                <Text fontWeight="bold" color="gray.800">Premium Quality</Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Only the finest vehicles make it to our platform
                </Text>
              </VStack>

              <VStack spacing={3} textAlign="center">
                <Box
                  bg="purple.100"
                  p={4}
                  borderRadius="full"
                  color="purple.600"
                >
                  <Award size={24} />
                </Box>
                <Text fontWeight="bold" color="gray.800">Award Winning</Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Nigeria's Best Auto Platform 2024
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </MotionBox>
      </Container>

      {/* Top Deals Section */}

      <Container maxW="7xl" py={12} align="center">
        <Heading size="lg" mb={6} textAlign="center">
          Today’s top picks
        </Heading>

        <Tabs colorScheme="blue" align="center" mb={8}>
          <TabList align="center" mx="auto" as={ButtonGroup} size='md' border="none" isAttached variant='outline' mt={3}>
            <Tab as={Button}
              color="primary"
              _selected={{
                bgColor: 'primary',
                color: 'white'
              }}
              borderWidth="1px"
              colorScheme={'blue'}
              borderColor="cornflowerblue"
              borderRadius="30px" px={'35px'}
            >Buy</Tab>

            <Tab as={Button}
              color="primary"
              _selected={{
                bgColor: 'primary',
                color: 'white'
              }}
              borderWidth="1px"
              colorScheme={'blue'}
              borderColor="cornflowerblue"
              borderRadius="30px" px={'35px'}
            >Rent</Tab>

            <Tab as={Button}
              color="primary"
              _selected={{
                bgColor: 'primary',
                color: 'white'
              }}
              borderWidth="1px"
              colorScheme={'blue'}
              borderColor="cornflowerblue"
              borderRadius="30px" px={'35px'}
            >Mechanic</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {topDeals?.sales?.map((listing, index) => (
                  <ListingItemCard key={index} listing={listing} />
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {topDeals?.rentals?.map((listing, index) => (
                  <ListingItemCard key={index} listing={listing} />
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {/*{topDeals.services?.map((listing, index) => (
                  <ListingItemCard key={index} listing={listing} />
                ))}*/}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>


    </Box>
  )
}

