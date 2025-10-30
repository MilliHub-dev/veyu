import { useRef, useContext, Fragment, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useMediaQuery,
  Container,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  InputLeftElement,
  InputGroup,
  Image,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Tabs,
  TabList,
  Tab,
  ButtonGroup,
  Stack,
  Input,
  Avatar,
  Select,
  InputRightElement,
  useToast,
  Badge,
  useColorModeValue,
  Divider,
  Center,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { Autocomplete } from '@react-google-maps/api';
import {
  Globe,
  Shield,
  Clock,
  Star,
  Search,
  Car,
  DollarSign,
  Key,
  PenToolIcon as Tools,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Play,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  RefreshCw as RefreshIcon
} from 'lucide-react';
import Layout from './Layout';
import { motion } from 'framer-motion';
import { FaCirclePlus, FaCircleMinus, FaPlus } from 'react-icons/fa6';
import { RxArrowRight } from 'react-icons/rx';
import faqs from '../data/faqs.json';
import '../assets/Home.css';
import ScrollAnimation from 'react-animate-on-scroll';
import { DashboardSearchBar, ListingItemCard } from '../components';
import { MdHeight } from 'react-icons/md';
import { GlobalStore } from '../App';
import { objectifyJSON } from '../utils';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const featureList = [
  {
    label: 'Buy',
    background: { xAxis: '90%', yAxis: '10%' },
    image: '/assets/images/sell_car.jpg',
    cta: { label: 'Find your car', link: '' },
    content: 'Get more value for your car faster, easier and more securely',
    card: {
      image: { mobile: '/assets/images/buy-widget-mobile.svg', desktop: '/assets/images/buy-widget.svg' },
      posX: '10%', posY: '27.5%'
    }
  },
  {
    label: 'Sell',
    background: { xAxis: '50%', yAxis: '10%' },
    image: '/assets/images/list_car.jpg',
    cta: { label: 'List your car', link: '' },
    content: 'List your car for sale and get it sold in no time. Veyu connects you to verified dealers and certified mechanics across the Globe.',
    card: {
      image: { mobile: '/assets/images/sale-widget-mobile.svg', desktop: '/assets/images/sell-widget.svg' },
      posX: '50%', posY: '25px'
    }
  }
];

export const HomePage = ({ props }) => {
  const heroRef = useRef();
  const [isMobile] = useMediaQuery('(max-width: 760px)');

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgGradient}>
      <SearchHero />
      <StatsSection />
      <FeaturedDeals />
      <HowItWorks />
      <TrustedBy />
      <Features />
      <VinCheckSection />
      <PopularBrands />
      <Testimonials />
      <Partnership />
      <FAQSection />
    </Box>
  );
};

export default HomePage; function
  SearchHero() {
  const [isMobile] = useMediaQuery('(max-width: 760px)');
  const navigate = useNavigate();
  const [type, setType] = useState('vehicles');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState(null);
  const [showMakeSug, setShowMakeSug] = useState(false);
  const [showModelSug, setShowModelSug] = useState(false);

  const makesByType = {
    vehicles: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Lexus', 'Kia', 'Ford', 'Audi'],
    bikes: ['Yamaha', 'Honda', 'Kawasaki', 'Ducati', 'Suzuki'],
    boats: ['Bayliner', 'Sea Ray', 'Yamaha Boats', 'Tracker'],
  };

  const modelsByMake = {
    Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander'],
    Honda: ['Accord', 'Civic', 'CR-V'],
    BMW: ['3 Series', '5 Series', 'X3', 'X5'],
    Yamaha: ['R1', 'R6', 'MT-07'],
  };

  useEffect(() => {
    setShowModelSug(false);
  }, [type, make]);

  function onSearch() {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (location) params.set('q', location);

    if (type === 'mechanics') {
      navigate(`/search/mechanics/?${params.toString()}`);
      return;
    }
    params.set('type', type);
    navigate(`/search/cars/?${params.toString()}`);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
    });
  }

  return (
    <Box
      as={motion.section}
      id="welcome"
      position="relative"
      overflow="hidden"
      py={{ base: 20, md: 32 }}
      minH="100vh"
      display="flex"
      alignItems="center"
    >
      <Box
        position="absolute"
        inset={0}
        bgImage={`url('/assets/veyu/land1.jpg')`}
        bgSize="cover"
        bgPos="center"
        filter="blur(2px)"
        transform="scale(1.02)"
      />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, blackAlpha.700, blackAlpha.500, blackAlpha.800)"
      />

      <Container position="relative" zIndex={1} maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack align="start" spacing={8} color="white">
          <Badge
            colorScheme="blue"
            px={4}
            py={2}
            borderRadius="full"
            fontSize="sm"
            mb={6}
            bg="whiteAlpha.200"
            color="white"
            backdropFilter="blur(10px)"
          >
            🚀 Africa's #1 Vehicle Marketplace
          </Badge>

          <Heading
            size={{ base: '2xl', md: '4xl' }}
            lineHeight={1.1}
            mb={6}
            bgGradient="linear(to-r, white, blue.200)"
            bgClip="text"
          >
            Find Your Next Vehicle
            <br />
            <Text as="span" color="blue.300">or Service</Text>
          </Heading>

          <Text
            maxW={{ base: '100%', md: '70%' }}
            fontSize={{ base: 'lg', md: 'xl' }}
            lineHeight="tall"
            color="whiteAlpha.900"
            mb={8}
          >
            Buy, rent, or service cars, aircraft, bikes, boats, and more.
            Compare prices, explore deals, and book with verified partners across Africa.
          </Text>

          <Box
            bg="whiteAlpha.100"
            backdropFilter="blur(20px)"
            borderRadius="2xl"
            p={{ base: 4, md: 6 }}
            w="100%"
            maxW="1200px"
            border="1px solid"
            borderColor="whiteAlpha.200"
            shadow="2xl"
          >
            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              onChange={(i) => setType(['vehicles', 'bikes', 'boats', 'mechanics'][i])}
              mb={4}
            >
              <TabList flexWrap="wrap" bg="whiteAlpha.100" p={2} borderRadius="xl">
                <Tab color="white" _selected={{ bg: 'blue.500', color: 'white' }}>🚗 Vehicles</Tab>
                <Tab color="white" _selected={{ bg: 'blue.500', color: 'white' }}>✈️ Aircraft</Tab>
                <Tab color="white" _selected={{ bg: 'blue.500', color: 'white' }}>🏍️ Bikes</Tab>
                <Tab color="white" _selected={{ bg: 'blue.500', color: 'white' }}>🚤 Boats</Tab>
                <Tab color="white" _selected={{ bg: 'blue.500', color: 'white' }}>🔧 Mechanics</Tab>
              </TabList>
            </Tabs>

            <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
              <InputGroup position="relative" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" />
                </InputLeftElement>
                <Input
                  value={make}
                  onChange={(e) => { setMake(e.target.value); setShowMakeSug(true); }}
                  onFocus={() => setShowMakeSug(true)}
                  onBlur={() => setTimeout(() => setShowMakeSug(false), 150)}
                  placeholder={type === 'bikes' ? 'Brand (e.g., Yamaha)' : type === 'boats' ? 'Brand (e.g., Bayliner)' : 'Make (e.g., Toyota)'}
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _placeholder={{ color: 'whiteAlpha.700' }}
                  _focus={{ borderColor: 'blue.400', bg: 'whiteAlpha.300' }}
                />
              </InputGroup>

              <Button
                onClick={onSearch}
                colorScheme="blue"
                size="lg"
                px={8}
                rightIcon={<ArrowRight size={20} />}
                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                transition="all 0.2s"
                minW="140px"
              >
                Search
              </Button>
            </Flex>

            <HStack spacing={4} mt={4} color="whiteAlpha.800" flexWrap="wrap" fontSize="sm">
              <Text>🔥 Popular: Toyota, Honda, BMW • Motorbikes • Boats</Text>
            </HStack>
          </Box>

          <HStack spacing={8} pt={4} color="whiteAlpha.900" flexWrap="wrap">
            <HStack spacing={2}>
              <Icon as={Shield} size={5} />
              <Text fontWeight="medium">Verified dealers</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={DollarSign} size={5} />
              <Text fontWeight="medium">Transparent pricing</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={Clock} size={5} />
              <Text fontWeight="medium">Fast checkout</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={Award} size={5} />
              <Text fontWeight="medium">Trusted by 50,000+</Text>
            </HStack>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}

function StatsSection() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '50,000+', color: 'blue' },
    { icon: Car, label: 'Vehicles Listed', value: '25,000+', color: 'green' },
    { icon: CheckCircle, label: 'Completed Deals', value: '15,000+', color: 'purple' },
    { icon: Globe, label: 'Cities Covered', value: '150+', color: 'orange' }
  ];

  return (
    <Box py={16} bg="white">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
          {stats.map((stat, i) => (
            <VStack
              key={i}
              spacing={3}
              textAlign="center"
              p={6}
              borderRadius="xl"
              bg="gray.50"
              _hover={{ bg: `${stat.color}.50`, shadow: 'md' }}
              transition="all 0.3s"
            >
              <Box
                p={3}
                borderRadius="full"
                bg={`${stat.color}.100`}
              >
                <Icon as={stat.icon} size={8} color={`${stat.color}.600`} />
              </Box>
              <Text fontSize="3xl" fontWeight="bold" color={`${stat.color}.600`}>
                {stat.value}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {stat.label}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

function FeaturedDeals() {
  const { axios } = useContext(GlobalStore);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getListings() {
    try {
      setLoading(true);
      
      const response = await axios.get('/listings/', {
        params: {
          limit: 8,
          is_active: true,
          ordering: '-created_at'
        },
        timeout: 5000
      });

      if (response.data && Array.isArray(response.data.results)) {
        setListings(response.data.results);
      } else if (response.data && Array.isArray(response.data)) {
        setListings(response.data.slice(0, 8));
      } else {
        console.warn('Unexpected API response format:', response.data);
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getListings();
  }, []);

  return (
    <Box py={16} bg="gray.50">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} mb={12} textAlign="center">
          <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
            🚗 Latest Listings
          </Badge>
          <Heading size="xl" color="gray.800" mb={4}>
            Recently Added Vehicles
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Browse through our latest vehicle listings from trusted sellers.
          </Text>
        </VStack>

        {loading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} bg="white" borderRadius="2xl" overflow="hidden" shadow="lg" h="400px">
                <Box bg="gray.200" h="240px" />
                <Box p={4}>
                  <Box bg="gray.200" h="20px" mb={3} borderRadius="md" />
                  <Box bg="gray.200" h="16px" mb={2} borderRadius="md" w="60%" />
                  <Box bg="gray.200" h="16px" borderRadius="md" w="40%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : listings.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
            {listings.map((listing) => (
              <ListingItemCard key={listing.uuid} listing={listing} />
            ))}
          </SimpleGrid>
        ) : (
          <VStack spacing={6} textAlign="center" py={12}>
            <Icon as={Car} size={16} color="gray.400" />
            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                No listings available at the moment
              </Text>
              <Text color="gray.500">
                Check back later for new listings
              </Text>
            </VStack>
            <Button
              as={Link}
              to="/buy"
              colorScheme="blue"
              size="lg"
              rightIcon={<ArrowRight size={20} />}
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              Browse All Vehicles
            </Button>
          </VStack>
        )}
      </Container>
    </Box>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Search & Discover',
      text: 'Find vehicles, rentals, or mechanics near you with our advanced search filters.',
      color: 'blue'
    },
    {
      icon: Car,
      title: 'Compare & Choose',
      text: 'Compare options, prices, ratings, and reviews from verified partners.',
      color: 'green'
    },
    {
      icon: Key,
      title: 'Book & Pay',
      text: 'Secure checkout with multiple payment options and instant booking confirmation.',
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'Drive & Enjoy',
      text: 'Enjoy your purchase or service with our guarantee and 24/7 customer support.',
      color: 'orange'
    },
  ];

  return (
    <Box py={20} bg="white">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={12} textAlign="center">
          <Badge colorScheme="purple" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
            ⚡ Simple Process
          </Badge>
          <Heading size="xl" color="gray.800" mb={4}>
            How Veyu Works
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Get started in minutes with our streamlined process designed for your convenience.
          </Text>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8} w="full">
            {steps.map((step, i) => (
              <VStack
                key={i}
                spacing={6}
                p={8}
                bg="gray.50"
                borderRadius="2xl"
                position="relative"
                _hover={{
                  bg: `${step.color}.50`,
                  shadow: 'xl',
                  transform: 'translateY(-4px)'
                }}
                transition="all 0.3s"
                h="full"
              >
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  colorScheme={step.color}
                  borderRadius="full"
                  w={8}
                  h={8}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {i + 1}
                </Badge>

                <Box
                  p={4}
                  borderRadius="full"
                  bg={`${step.color}.100`}
                  border="4px solid"
                  borderColor={`${step.color}.200`}
                >
                  <Icon as={step.icon} size={8} color={`${step.color}.600`} />
                </Box>

                <VStack spacing={3} textAlign="center">
                  <Text fontWeight="bold" fontSize="lg" color="gray.800">
                    {step.title}
                  </Text>
                  <Text color="gray.600" fontSize="sm" lineHeight="tall">
                    {step.text}
                  </Text>
                </VStack>

                {i < steps.length - 1 && (
                  <Box
                    position="absolute"
                    top="50%"
                    right="-20px"
                    transform="translateY(-50%)"
                    display={{ base: 'none', md: 'block' }}
                    zIndex={1}
                  >
                    <Icon as={ChevronRight} size={6} color="gray.300" />
                  </Box>
                )}
              </VStack>
            ))}
          </SimpleGrid>

          <Button
            as={Link}
            to="/signup"
            size="lg"
            colorScheme="blue"
            rightIcon={<ArrowRight size={20} />}
            px={8}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            Get Started Now
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}

function TrustedBy() {
  const brands = [
    'Toyota', 'Honda', 'BMW', 'Mercedes', 'Lexus', 'Kia',
    'Yamaha', 'Ducati', 'Kawasaki', 'Suzuki',
    'Bayliner', 'Sea Ray', 'Tracker', 'Yamaha Boats',
    'Cessna', 'Bombardier', 'Airbus', 'Boeing'
  ];

  return (
    <Box py={16} bg="gray.50">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} textAlign="center">
          <Heading size="lg" color="gray.700" mb={2}>
            Trusted by Leading Brands
          </Heading>
          <Text color="gray.600">
            Partnering with top manufacturers and service providers worldwide
          </Text>

          <Flex
            wrap="wrap"
            gap={4}
            justify="center"
            align="center"
            maxW="6xl"
          >
            {brands.map((brand, i) => (
              <Box
                key={i}
                px={6}
                py={3}
                borderRadius="full"
                bg="white"
                shadow="sm"
                border="1px solid"
                borderColor="gray.200"
                _hover={{
                  shadow: 'md',
                  borderColor: 'blue.300',
                  bg: 'blue.50'
                }}
                transition="all 0.3s"
                cursor="pointer"
              >
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {brand}
                </Text>
              </Box>
            ))}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}

function Features() {
  const features = [
    {
      icon: '🏪',
      title: 'All-in-One Marketplace',
      description: 'Veyu offers you the best experience by providing solutions to your vehicle needs all in one place.',
      color: 'blue'
    },
    {
      icon: '🛡️',
      title: 'Trust & Transparency',
      description: 'Have peace of mind when dealing on Veyu with our secure technology and verified partners.',
      color: 'green'
    },
    {
      icon: '⚡',
      title: 'Ease of Use',
      description: 'Veyu makes it easy for users to find vehicles and mechanics with our intuitive interface.',
      color: 'purple'
    },
    {
      icon: '📚',
      title: 'Educational Content',
      description: 'Learn about vehicles, maintenance, and smart buying decisions with Veyu Reels - all under 60 seconds.',
      color: 'orange'
    }
  ];

  return (
    <Box py={20} bg="white">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={12} textAlign="center">
          <Badge colorScheme="green" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
            ✨ Why Choose Us
          </Badge>
          <Heading size="xl" color="gray.800" mb={4}>
            Why Veyu<Text as="span" color="blue.500">?</Text>
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Experience the future of automotive commerce with features designed for your success.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            {features.map((feature, i) => (
              <VStack
                key={i}
                spacing={6}
                p={8}
                bg="gray.50"
                borderRadius="2xl"
                h="full"
                _hover={{
                  bg: `${feature.color}.50`,
                  shadow: 'xl',
                  transform: 'translateY(-4px)'
                }}
                transition="all 0.3s"
                border="1px solid"
                borderColor="gray.200"
              >
                <Box
                  fontSize="4xl"
                  p={4}
                  borderRadius="full"
                  bg={`${feature.color}.100`}
                  border="3px solid"
                  borderColor={`${feature.color}.200`}
                >
                  {feature.icon}
                </Box>

                <VStack spacing={3} textAlign="center">
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {feature.title}
                  </Text>
                  <Text color="gray.600" fontSize="sm" lineHeight="tall">
                    {feature.description}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

function VinCheckSection() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();

  async function onCheckVin() {
    setError('');
    setResult(null);
    const clean = vin.trim().toUpperCase();
    if (!/^[A-HJ-NPR-Z0-9]{11,17}$/.test(clean)) {
      setError('Enter a valid VIN (11-17 characters, excluding I, O, Q)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${clean}?format=json`);
      const data = await res.json();
      const first = Array.isArray(data?.Results) ? data.Results[0] : null;
      if (!first) {
        setError('No result found for this VIN');
      } else {
        setResult(first);
        toast({
          title: 'VIN decoded',
          description: `Found ${first?.Make || ''} ${first?.Model || ''} ${first?.ModelYear || ''}`,
          status: 'success'
        });
      }
    } catch (e) {
      setError(e?.message || 'Failed to decode VIN');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: 'Make', key: 'Make' },
    { label: 'Model', key: 'Model' },
    { label: 'Year', key: 'ModelYear' },
    { label: 'Body Class', key: 'BodyClass' },
    { label: 'Vehicle Type', key: 'VehicleType' },
    { label: 'Trim', key: 'Trim' }
  ];

  return (
    <Box py={20} bg="gray.50">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} textAlign="center">
          <Badge colorScheme="orange" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
            🔍 VIN Decoder
          </Badge>
          <Heading size="xl" color="gray.800" mb={4}>
            Check a VIN
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={8} maxW="2xl">
            Enter a vehicle VIN to decode make, model, year and more details instantly.
          </Text>

          <Box w="full" maxW="900px">
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <Input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="Enter VIN e.g. 1HGCM82633A004352"
                bg="white"
                textTransform="uppercase"
                size="lg"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'blue.400' }}
                flex={1}
              />
              <Button
                onClick={onCheckVin}
                colorScheme="blue"
                isLoading={loading}
                size="lg"
                px={8}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                Check VIN
              </Button>
            </Flex>

            {error && (
              <Text mt={4} color="red.500" textAlign="center" fontSize="sm">
                {error}
              </Text>
            )}
          </Box>

          {result && (
            <Box w="full" maxW="900px">
              <Box
                bg="white"
                borderWidth="2px"
                borderColor="green.200"
                borderRadius="2xl"
                shadow="lg"
                p={8}
              >
                <VStack spacing={6}>
                  <HStack spacing={2} mb={4}>
                    <Icon as={CheckCircle} color="green.500" size={6} />
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      VIN Successfully Decoded
                    </Text>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                    {fields.map((field) => (
                      <Flex
                        key={field.key}
                        justify="space-between"
                        align="center"
                        p={3}
                        bg="gray.50"
                        borderRadius="lg"
                      >
                        <Text color="gray.600" fontWeight="medium">
                          {field.label}
                        </Text>
                        <Text fontWeight="semibold" color="gray.800">
                          {result?.[field.key] || '—'}
                        </Text>
                      </Flex>
                    ))}
                  </SimpleGrid>

                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Data provided by NHTSA. Always verify details with the seller.
                  </Text>
                </VStack>
              </Box>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

function PopularBrands() {
  const categories = [
    // Car Brands with Company Logos
    { name: 'Toyota', type: 'Cars', logo: '/assets/icons/ToyotaLogo.svg', color: 'red' },
    { name: 'Ford', type: 'Cars', logo: '/assets/icons/FordLogo.svg', color: 'blue' },
    { name: 'BMW', type: 'Cars', logo: '/assets/icons/BmwLogo.svg', color: 'gray' },
    { name: 'Mercedes', type: 'Cars', logo: '/assets/icons/MercedesLogo.svg', color: 'purple' },
    { name: 'Honda', type: 'Cars', logo: '/assets/icons/HondaLogo.svg', color: 'red' },
    { name: 'Lexus', type: 'Cars', logo: '/assets/icons/LexusLogo.svg', color: 'gray' },
    { name: 'Audi', type: 'Cars', logo: '/assets/icons/AudiLogo.svg', color: 'red' },
    { name: 'Volkswagen', type: 'Cars', logo: '/assets/icons/VolkswagenLogo.svg', color: 'blue' },
    { name: 'Nissan', type: 'Cars', logo: '/assets/icons/NissanLogo.svg', color: 'red' },
    { name: 'Hyundai', type: 'Cars', logo: '/assets/icons/HyundaiLogo.svg', color: 'blue' },
    { name: 'Kia', type: 'Cars', logo: '/assets/icons/KiaLogo.svg', color: 'red' },
    { name: 'Mazda', type: 'Cars', logo: '/assets/icons/MazdaLogo.svg', color: 'red' },

    // Motorcycle Brands
    { name: 'Yamaha', type: 'Motorcycles', logo: '/assets/icons/YamahaLogo.svg', color: 'blue' },
    { name: 'Honda', type: 'Motorcycles', logo: '/assets/icons/HondaLogo.svg', color: 'red' },
    { name: 'Kawasaki', type: 'Motorcycles', logo: '/assets/icons/KawasakiLogo.svg', color: 'green' },
    { name: 'Suzuki', type: 'Motorcycles', logo: '/assets/icons/SuzukiLogo.svg', color: 'yellow' },
    { name: 'Ducati', type: 'Motorcycles', logo: '/assets/icons/DucatiLogo.svg', color: 'red' },
    { name: 'Harley-Davidson', type: 'Motorcycles', logo: '/assets/icons/HarleyLogo.svg', color: 'orange' },

    // Marine/Boat Brands
    { name: 'Bayliner', type: 'Boats', logo: '/assets/icons/BaylinerLogo.svg', color: 'cyan' },
    { name: 'Sea Ray', type: 'Boats', logo: '/assets/icons/SeaRayLogo.svg', color: 'blue' },
    { name: 'Tracker', type: 'Boats', logo: '/assets/icons/TrackerLogo.svg', color: 'teal' },
    { name: 'Boston Whaler', type: 'Boats', logo: '/assets/icons/BostonWhalerLogo.svg', color: 'blue' },

    // Aircraft Brands
    { name: 'Cessna', type: 'Aircraft', logo: '/assets/icons/CessnaLogo.svg', color: 'blue' },
    { name: 'Airbus', type: 'Aircraft', logo: '/assets/icons/Airbus-Logo.png', color: 'blue' },
    { name: 'Boeing', type: 'Aircraft', logo: '/assets/icons/BoeingLogo.svg', color: 'blue' },
    { name: 'Bombardier', type: 'Aircraft', logo: '/assets/icons/BombardierLogo.svg', color: 'yellow' },

    // Commercial/Truck Brands
    { name: 'Volvo', type: 'Trucks', logo: '/assets/icons/VolvoLogo.svg', color: 'blue' },
    { name: 'Scania', type: 'Trucks', logo: '/assets/icons/ScaniaLogo.svg', color: 'red' },
    { name: 'MAN', type: 'Trucks', logo: '/assets/icons/MANLogo.svg', color: 'red' },
    { name: 'Mercedes', type: 'Trucks', logo: '/assets/icons/MercedesLogo.svg', color: 'gray' },

    // Electric Vehicle Brands
    { name: 'Tesla', type: 'Electric', logo: '/assets/icons/TeslaLogo.svg', color: 'red' },
    { name: 'BYD', type: 'Electric', logo: '/assets/icons/BYDLogo.svg', color: 'blue' },
    { name: 'Rivian', type: 'Electric', logo: '/assets/icons/RivianLogo.svg', color: 'green' },
    { name: 'Lucid', type: 'Electric', logo: '/assets/icons/LucidLogo.svg', color: 'purple' }
  ];

  return (
    <Box py={20} bg="white">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Badge colorScheme="purple" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
              🏆 Popular Brands
            </Badge>
            <Heading size="xl" color="gray.800" mb={4}>
              Browse All Vehicle Categories
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Discover top brands across cars, bikes, boats, aircraft, and more.
            </Text>
          </VStack>

          {/* Show only first 18 brands initially */}
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={6} w="full">
            {categories.slice(0, 18).map((item, idx) => (
              <VStack
                key={idx}
                spacing={4}
                p={6}
                bg="gray.50"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.200"
                _hover={{
                  bg: `${item.color}.50`,
                  borderColor: `${item.color}.300`,
                  shadow: 'lg',
                  transform: 'translateY(-4px)'
                }}
                transition="all 0.3s"
                cursor="pointer"
                h="full"
                minH="140px"
              >
                <Box
                  p={3}
                  borderRadius="lg"
                  bg="white"
                  shadow="sm"
                  border="1px solid"
                  borderColor="gray.100"
                  w="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minH="60px"
                >
                  <Image
                    src={item.logo}
                    alt={`${item.name} logo`}
                    maxH="50px"
                    maxW="50px"
                    objectFit="contain"
                    fallback={
                      <Box
                        w="50px"
                        h="50px"
                        bg={`${item.color}.100`}
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="bold" color={`${item.color}.600`}>
                          {item.name.charAt(0)}
                        </Text>
                      </Box>
                    }
                  />
                </Box>

                <VStack spacing={1} textAlign="center">
                  <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
                    {item.name}
                  </Text>
                  <Badge
                    colorScheme={item.color}
                    variant="subtle"
                    fontSize="xs"
                    borderRadius="full"
                    px={2}
                  >
                    {item.type}
                  </Badge>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>

          {/* Category breakdown */}
          <VStack spacing={4} w="full" maxW="4xl">
            <Text fontSize="md" color="gray.600" textAlign="center">
              Browse by Category
            </Text>
            <Flex wrap="wrap" gap={3} justify="center">
              {['Cars', 'Motorcycles', 'Boats', 'Aircraft', 'Trucks', 'Electric'].map((category) => (
                <Badge
                  key={category}
                  colorScheme="blue"
                  variant="outline"
                  px={4}
                  py={2}
                  borderRadius="full"
                  cursor="pointer"
                  _hover={{ bg: 'blue.50', borderColor: 'blue.400' }}
                  transition="all 0.2s"
                >
                  {category} ({categories.filter(item => item.type === category).length})
                </Badge>
              ))}
            </Flex>
          </VStack>

          <Button
            variant="outline"
            size="lg"
            rightIcon={<FaPlus />}
            colorScheme="blue"
            px={8}
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            Show All Brands
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}

function TestimonialCard({ name, role, comment, rating, avatar, title }) {
  return (
    <Box
      bg="white"
      p={8}
      borderRadius="2xl"
      shadow="lg"
      border="1px solid"
      borderColor="gray.200"
      minW="320px"
      maxW="320px"
      h="full"
      _hover={{ shadow: 'xl', borderColor: 'blue.300', transform: 'translateY(-4px)' }}
      transition="all 0.3s"
    >
      <VStack spacing={6} align="start" h="full">
        <HStack spacing={4}>
          <Avatar name={name} src={avatar} size="md" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="sm">
              {name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {role}
            </Text>
          </VStack>
        </HStack>

        <HStack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              as={Star}
              size={4}
              color={i < rating ? 'yellow.400' : 'gray.300'}
              fill={i < rating ? 'currentColor' : 'none'}
            />
          ))}
        </HStack>

        <VStack spacing={3} align="start" flex={1}>
          <Text fontWeight="bold" fontSize="md" color="gray.800">
            "{title}"
          </Text>
          <Text color="gray.600" fontSize="sm" lineHeight="tall">
            {comment}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}

function Testimonials() {
  const testimonials = [
    {
      name: 'Amaka O.',
      role: 'Bought a Lexus RX 350',
      title: 'Seamless from search to keys',
      comment: 'Found the exact spec I wanted and closed in days. Pricing transparency is A+.',
      rating: 5,
      avatar: '/assets/images/list_car.jpg',
    },
    {
      name: 'Tunde A.',
      role: 'Booked a mobile mechanic',
      title: 'Reliable pros, fast booking',
      comment: 'The mechanic arrived on time and fixed my brakes same day. Will use again.',
      rating: 5,
      avatar: '/assets/images/mechanic.jpg',
    },
    {
      name: 'Chioma N.',
      role: 'Weekend boat rental',
      title: 'Great selection and service',
      comment: 'Smooth checkout, fair pricing, and the boat was immaculate. Perfect getaway!',
      rating: 5,
      avatar: '/assets/images/image.jpg',
    },
    {
      name: 'Ola D.',
      role: 'Motorbike enthusiast',
      title: 'Love the multi-vehicle options',
      comment: 'Nice to have bikes, cars, and boats in one place. Super convenient!',
      rating: 5,
      avatar: '/assets/images/sell_car.jpg',
    },
  ];

  return (
    <Box py={20} bg="gray.50">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={12} textAlign="center">
          <Badge colorScheme="yellow" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
            ⭐ Customer Stories
          </Badge>
          <Heading size="xl" color="gray.800" mb={4}>
            What Our Clients Say
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Real experiences from thousands of satisfied customers across Africa.
          </Text>

          <Box w="full" overflow="hidden">
            <Flex
              gap={6}
              overflowX="auto"
              pb={4}
              className="hidden-scroll"
              justify={{ base: 'start', lg: 'center' }}
            >
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

function Partnership() {
  return (
    <Box
      py={24}
      position="relative"
      color="white"
      backgroundImage={`url('/assets/veyu/homes.jpg')`}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, blackAlpha.800, blackAlpha.600, blackAlpha.900)"
      />

      <Container position="relative" zIndex={1} maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} textAlign="center">
          <Badge
            colorScheme="yellow"
            px={4}
            py={2}
            borderRadius="full"
            fontSize="sm"
            mb={6}
            bg="yellow.400"
            color="gray.800"
          >
            🤝 Partner With Us
          </Badge>

          <Heading size="2xl" mb={6} lineHeight="shorter">
            Ready to Move Your Business Forward
            <Text as="span" color="yellow.400">?</Text>
            <br />
            Partner with us today.
          </Heading>

          <Text fontSize="xl" maxW="3xl" lineHeight="tall" color="whiteAlpha.900">
            Whether you're a dealer, mechanic, or fleet operator, Veyu helps you grow
            with cutting-edge tools, verified customers, and seamless transactions that convert.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8} maxW="4xl">
            <VStack spacing={3} textAlign="center">
              <Box
                p={3}
                borderRadius="full"
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
              >
                <Icon as={TrendingUp} size={6} />
              </Box>
              <Text fontWeight="bold">Grow Your Revenue</Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                Access thousands of verified buyers
              </Text>
            </VStack>

            <VStack spacing={3} textAlign="center">
              <Box
                p={3}
                borderRadius="full"
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
              >
                <Icon as={Shield} size={6} />
              </Box>
              <Text fontWeight="bold">Secure Transactions</Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                Protected payments and escrow services
              </Text>
            </VStack>

            <VStack spacing={3} textAlign="center">
              <Box
                p={3}
                borderRadius="full"
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
              >
                <Icon as={Zap} size={6} />
              </Box>
              <Text fontWeight="bold">Easy Management</Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                Powerful dashboard and analytics
              </Text>
            </VStack>
          </SimpleGrid>

          <HStack spacing={4} flexWrap="wrap" justify="center">
            <Button
              as={Link}
              to="/signup/business"
              size="lg"
              colorScheme="yellow"
              bg="yellow.400"
              color="gray.800"
              rightIcon={<ArrowRight size={20} />}
              px={8}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'xl',
                bg: 'yellow.300'
              }}
              transition="all 0.2s"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              borderColor="whiteAlpha.400"
              color="white"
              px={8}
              _hover={{
                bg: 'whiteAlpha.200',
                borderColor: 'whiteAlpha.600',
                transform: 'translateY(-2px)'
              }}
              transition="all 0.2s"
            >
              Learn More
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}

function FAQSection() {
  return (
    <Box bg="white" py={20}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={12} textAlign="center">
          <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm" mb={4}>
            ❓ Got Questions?
          </Badge>
          <Heading size="2xl" color="gray.800" mb={4}>
            Frequently Asked Questions
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Still not convinced?{' '}
            <Text as="span" color="blue.500" fontWeight="semibold" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
              Chat with our team here.
            </Text>
          </Text>

          <Box maxW="4xl" w="full">
            <Accordion allowMultiple allowToggle>
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} border="none" mb={4}>
                  {({ isExpanded }) => (
                    <Box
                      bg="gray.50"
                      borderRadius="xl"
                      overflow="hidden"
                      shadow={isExpanded ? 'lg' : 'md'}
                      transition="all 0.3s"
                      _hover={{ shadow: 'lg' }}
                      border="2px solid"
                      borderColor={isExpanded ? 'blue.200' : 'gray.200'}
                    >
                      <AccordionButton
                        py={6}
                        px={6}
                        _hover={{ bg: isExpanded ? 'blue.50' : 'gray.100' }}
                        transition="all 0.2s"
                      >
                        <HStack flex={1} spacing={4} align="center">
                          <Box
                            w={12}
                            h={12}
                            borderRadius="full"
                            bg={isExpanded ? 'blue.500' : 'gray.300'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            transition="all 0.3s"
                          >
                            <Icon
                              fontSize="20px"
                              color="white"
                            >
                              {isExpanded ? <FaCircleMinus /> : <FaCirclePlus />}
                            </Icon>
                          </Box>
                          <Text
                            flex={1}
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="semibold"
                            textAlign="left"
                            color="gray.800"
                          >
                            {faq?.question}
                          </Text>
                        </HStack>
                      </AccordionButton>

                      <AccordionPanel pb={6} px={6}>
                        <Box pl={16}>
                          <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="gray.600"
                            lineHeight="tall"
                          >
                            {faq?.answer}
                          </Text>
                        </Box>
                      </AccordionPanel>
                    </Box>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </Box>

          <VStack spacing={4}>
            <Text color="gray.600">
              Still have questions? We're here to help!
            </Text>
            <HStack spacing={4}>
              <Button
                leftIcon={<Mail size={20} />}
                colorScheme="blue"
                variant="outline"
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Email Support
              </Button>
              <Button
                leftIcon={<Phone size={20} />}
                colorScheme="green"
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Call Us
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}