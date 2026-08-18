import { Fragment, useState, useEffect } from 'react';
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
  Input,
  Avatar,
  useToast,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  Shield,
  Clock,
  Star,
  Search,
  Car,
  DollarSign,
  Key,
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Zap,
  Quote,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FaCircleMinus, FaCirclePlus, FaPlus } from 'react-icons/fa6';
import faqs from '../data/faqs.json';
import '../assets/Home.css';
import { ListingItemCard } from '../components';
import { objectifyJSON } from '../utils';
import listingsService from '../services/listingsService';

/* ────────────────────────────────────────────────────────────────────────────
   Shared layout tokens — one rhythm for every section on the page.
   ──────────────────────────────────────────────────────────────────────────── */
const SECTION_PY = { base: 16, md: 24 };
const SHELL_PX = { base: 5, md: 8 };

const marqueeScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const shimmer = keyframes`
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
`;

const displayHeading = {
  fontWeight: 800,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  // Spans nested in a heading don't inherit its line-height — they pick up the
  // global 1.5, which inflates the line box around them.
  sx: { '& span': { lineHeight: 'inherit' } }
};

function Eyebrow({ colorScheme = 'blue', dark = false, children }) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      px={3.5}
      py={1.5}
      borderRadius="full"
      bg={dark ? 'whiteAlpha.200' : `${colorScheme}.50`}
      border="1px solid"
      borderColor={dark ? 'whiteAlpha.300' : `${colorScheme}.100`}
      backdropFilter={dark ? 'blur(10px)' : undefined}
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="0.12em"
        color={dark ? 'whiteAlpha.900' : `${colorScheme}.700`}
        whiteSpace="nowrap"
      >
        {children}
      </Text>
    </Box>
  );
}

function SectionHeader({
  eyebrow,
  colorScheme = 'blue',
  title,
  subtitle,
  align = 'center',
  dark = false,
  action
}) {
  const centered = align === 'center';

  return (
    <Flex
      w="full"
      direction={{ base: 'column', md: action ? 'row' : 'column' }}
      align={{ base: centered ? 'center' : 'flex-start', md: action ? 'flex-end' : centered ? 'center' : 'flex-start' }}
      justify="space-between"
      gap={6}
      mb={{ base: 10, md: 14 }}
    >
      <VStack
        spacing={4}
        align={centered && !action ? 'center' : 'flex-start'}
        textAlign={centered && !action ? 'center' : 'left'}
        maxW={centered && !action ? '3xl' : '2xl'}
        mx={centered && !action ? 'auto' : undefined}
      >
        {eyebrow && (
          <Eyebrow colorScheme={colorScheme} dark={dark}>
            {eyebrow}
          </Eyebrow>
        )}

        <Heading
          as="h2"
          fontSize={{ base: '2rem', sm: '2.5rem', md: '3.25rem' }}
          color={dark ? 'white' : 'gray.900'}
          {...displayHeading}
        >
          {title}
        </Heading>

        {subtitle && (
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color={dark ? 'whiteAlpha.800' : 'gray.600'}
            lineHeight="tall"
          >
            {subtitle}
          </Text>
        )}
      </VStack>

      {action}
    </Flex>
  );
}

export const HomePage = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

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

export default HomePage;

/* ──────────────────────────────── HERO ─────────────────────────────────── */

function SearchHero() {
  const navigate = useNavigate();
  const [type, setType] = useState('cars');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [showMakeSug, setShowMakeSug] = useState(false);

  const makesByType = {
    cars: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Lexus', 'Kia', 'Ford', 'Audi'],
    aircraft: ['Cessna', 'Bombardier', 'Airbus', 'Boeing'],
    bikes: ['Yamaha', 'Honda', 'Kawasaki', 'Ducati', 'Suzuki'],
    boats: ['Bayliner', 'Sea Ray', 'Yamaha Boats', 'Tracker'],
    mechanics: []
  };

  const placeholderByType = {
    cars: 'Make (e.g., Toyota)',
    aircraft: 'Manufacturer (e.g., Cessna)',
    bikes: 'Brand (e.g., Yamaha)',
    boats: 'Brand (e.g., Bayliner)',
    mechanics: 'Service or workshop name'
  };

  const suggestions = (makesByType[type] || []).filter(
    (m) => !make || m.toLowerCase().includes(make.toLowerCase())
  );

  useEffect(() => {
    setModel('');
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

  const trustPoints = [
    { icon: Shield, label: 'Verified dealers' },
    { icon: DollarSign, label: 'Transparent pricing' },
    { icon: Clock, label: 'Fast checkout' },
    { icon: Award, label: 'Trusted by 50,000+' }
  ];

  return (
    <Box
      as={motion.section}
      id="welcome"
      position="relative"
      overflow="hidden"
      py={{ base: 24, md: 32 }}
      minH={{ base: 'auto', md: '100vh' }}
      display="flex"
      alignItems="center"
    >
      <Box
        position="absolute"
        inset={0}
        bgImage={`url('/assets/veyu/land1.jpg')`}
        bgSize="cover"
        bgPos="center"
        transform="scale(1.04)"
      />
      {/* Layered scrim: keeps the photo readable and anchors the copy to the left */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-r, blackAlpha.900, blackAlpha.700 45%, blackAlpha.500)"
      />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-t, blackAlpha.800, transparent 35%)"
      />

      <Container position="relative" zIndex={1} maxW="7xl" px={SHELL_PX}>
        <VStack align="start" spacing={{ base: 7, md: 9 }} color="white">
          <Eyebrow colorScheme="blue" dark>
            🚀 Africa's #1 Vehicle Marketplace
          </Eyebrow>

          <Heading
            as="h1"
            fontSize={{ base: '2.75rem', sm: '3.5rem', md: '5rem' }}
            fontWeight="800"
            letterSpacing="-0.04em"
            lineHeight="0.98"
            maxW="5xl"
            sx={{ '& span': { lineHeight: 'inherit' } }}
          >
            {/* Explicit block spans so each line is its own box and the gradient
                clip applies per line. */}
            <Box
              as="span"
              display="block"
              bgGradient="linear(to-r, white, blue.200)"
              bgClip="text"
            >
              Find Your Next Vehicle
            </Box>
            <Box as="span" display="block" color="blue.300">
              or Service
            </Box>
          </Heading>

          <Text
            maxW={{ base: '100%', md: '60%' }}
            fontSize={{ base: 'md', md: 'xl' }}
            lineHeight="tall"
            color="whiteAlpha.800"
          >
            Buy, rent, or service cars, aircraft, bikes, boats, and more.
            Compare prices, explore deals, and book with verified partners across Africa.
          </Text>

          {/* Search panel */}
          <Box
            bg="whiteAlpha.100"
            backdropFilter="blur(24px)"
            borderRadius="2xl"
            p={{ base: 3, md: 4 }}
            w="100%"
            maxW="1000px"
            border="1px solid"
            borderColor="whiteAlpha.200"
            shadow="0 24px 60px -20px rgba(0,0,0,0.6)"
          >
            <Tabs
              variant="unstyled"
              onChange={(i) =>
                setType(['cars', 'aircraft', 'bikes', 'boats', 'mechanics'][i])
              }
              mb={3}
            >
              <TabList
                flexWrap="wrap"
                gap={1}
                bg="blackAlpha.400"
                p={1}
                borderRadius="full"
                w="fit-content"
                maxW="full"
              >
                {['cars', 'Aircraft', 'Bikes', 'Boats', 'Mechanics'].map((label) => (
                  <Tab
                    key={label}
                    px={{ base: 3.5, md: 5 }}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    borderRadius="full"
                    color="whiteAlpha.700"
                    textTransform="capitalize"
                    transition="all 0.2s"
                    _hover={{ color: 'white' }}
                    _selected={{ bg: 'blue.500', color: 'white', shadow: 'md' }}
                  >
                    {label}
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            <Flex direction={{ base: 'column', md: 'row' }} gap={2.5}>
              <Box position="relative" flex={1}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none" h="full">
                    <Icon as={Search} boxSize={5} color="whiteAlpha.600" />
                  </InputLeftElement>
                  <Input
                    value={make}
                    onChange={(e) => {
                      setMake(e.target.value);
                      setShowMakeSug(true);
                    }}
                    onFocus={() => setShowMakeSug(true)}
                    onBlur={() => setTimeout(() => setShowMakeSug(false), 150)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    placeholder={placeholderByType[type]}
                    bg="whiteAlpha.200"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="xl"
                    color="white"
                    _placeholder={{ color: 'whiteAlpha.600' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{
                      borderColor: 'blue.400',
                      bg: 'whiteAlpha.300',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                    }}
                  />
                </InputGroup>

                {showMakeSug && suggestions.length > 0 && (
                  <VStack
                    position="absolute"
                    top="calc(100% + 8px)"
                    left={0}
                    right={0}
                    zIndex={3}
                    align="stretch"
                    spacing={0}
                    bg="white"
                    borderRadius="xl"
                    overflow="hidden"
                    shadow="2xl"
                    maxH="240px"
                    overflowY="auto"
                  >
                    {suggestions.map((suggestion) => (
                      <Box
                        key={suggestion}
                        as="button"
                        type="button"
                        textAlign="left"
                        px={4}
                        py={2.5}
                        fontSize="sm"
                        fontWeight="500"
                        color="gray.700"
                        _hover={{ bg: 'blue.50', color: 'blue.700' }}
                        transition="all 0.15s"
                        onMouseDown={() => {
                          setMake(suggestion);
                          setShowMakeSug(false);
                        }}
                      >
                        {suggestion}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              <Button
                onClick={onSearch}
                colorScheme="blue"
                size="lg"
                px={10}
                borderRadius="xl"
                rightIcon={<ArrowRight size={18} />}
                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
                minW={{ base: 'full', md: '160px' }}
              >
                Search
              </Button>
            </Flex>

            <Flex
              mt={3.5}
              align="center"
              justify="space-between"
              gap={3}
              flexWrap="wrap"
            >
              <Text fontSize="sm" color="whiteAlpha.700">
                🔥 Popular: Toyota, Honda, BMW • Motorbikes • Boats
              </Text>
              <Button
                onClick={useMyLocation}
                variant="link"
                size="sm"
                color="blue.200"
                fontWeight="600"
                leftIcon={<MapPin size={14} />}
                _hover={{ color: 'white' }}
              >
                Use my location
              </Button>
            </Flex>
          </Box>

          {/* Trust strip — plain Flex rather than Stack's `divider` prop, which
              overwrites the divider's own margins with the stack spacing (0). */}
          <Flex
            pt={2}
            align="center"
            flexWrap="wrap"
            columnGap={{ base: 6, md: 0 }}
            rowGap={2}
          >
            {trustPoints.map(({ icon, label }, i) => (
              <Fragment key={label}>
                {i > 0 && (
                  <Box
                    w="1px"
                    h="14px"
                    bg="whiteAlpha.400"
                    mx={5}
                    display={{ base: 'none', md: 'block' }}
                  />
                )}
                <HStack spacing={2.5} py={1} color="whiteAlpha.900">
                  <Icon as={icon} boxSize={4} color="blue.300" />
                  <Text fontSize="sm" fontWeight="600">
                    {label}
                  </Text>
                </HStack>
              </Fragment>
            ))}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}

/* ──────────────────────────────── STATS ────────────────────────────────── */

function StatsSection() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '50,000+', color: 'blue' },
    { icon: Car, label: 'Vehicles Listed', value: '25,000+', color: 'green' },
    { icon: CheckCircle, label: 'Completed Deals', value: '15,000+', color: 'purple' },
    { icon: Globe, label: 'Cities Covered', value: '150+', color: 'orange' }
  ];

  return (
    <Box py={{ base: 12, md: 16 }} bg="white">
      <Container maxW="7xl" px={SHELL_PX}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 4, md: 6 }}>
          {stats.map((stat) => (
            <VStack
              key={stat.label}
              spacing={4}
              align="flex-start"
              p={{ base: 5, md: 7 }}
              borderRadius="2xl"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.100"
              position="relative"
              overflow="hidden"
              _hover={{
                borderColor: `${stat.color}.200`,
                bg: `${stat.color}.50`,
                transform: 'translateY(-3px)',
                shadow: 'lg'
              }}
              transition="all 0.3s ease"
            >
              <Flex
                boxSize={11}
                borderRadius="xl"
                bg={`${stat.color}.100`}
                align="center"
                justify="center"
              >
                <Icon as={stat.icon} boxSize={5} color={`${stat.color}.600`} />
              </Flex>

              <Box>
                <Text
                  fontSize={{ base: '2rem', md: '2.5rem' }}
                  color="gray.900"
                  {...displayHeading}
                >
                  {stat.value}
                </Text>
                <Text
                  mt={1}
                  fontSize="sm"
                  color="gray.500"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  {stat.label}
                </Text>
              </Box>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

/* ───────────────────────────── FEATURED DEALS ──────────────────────────── */

function FeaturedDeals() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getListings() {
    try {
      setLoading(true);

      // Try fetching all listings first
      // If /listings/ endpoint fails or returns empty, we might try a fallback
      // but let's assume listingsService handles it.
      let items = [];

      try {
        const response = await listingsService.getAllListings({
          limit: 8,
          is_active: true,
          ordering: '-created_at'
        });

        const raw = objectifyJSON(response);

        if (Array.isArray(raw?.data?.results)) {
          items = raw.data.results;
        } else if (Array.isArray(raw?.results)) {
          items = raw.results;
        } else if (Array.isArray(raw?.data)) {
          items = raw.data;
        } else if (Array.isArray(raw)) {
          items = raw;
        }
      } catch (err) {
        console.warn('Failed to fetch from main listings endpoint, trying fallback...', err);
        // Fallback to buy listings if main endpoint fails
        const buyRes = await listingsService.getBuyListings({
          limit: 8,
          ordering: '-created_at'
        });

        if (buyRes && buyRes.results) {
          items = buyRes.results;
        }
      }

      if (items.length > 0) {
        setListings(items.slice(0, 8));
      } else {
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
    <Box py={SECTION_PY} bg="gray.50">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="🚗 Latest Listings"
          colorScheme="blue"
          title="Recently Added Vehicles"
          subtitle="Browse through our latest vehicle listings from trusted sellers."
          align="left"
          action={
            <Button
              as={Link}
              to="/buy"
              variant="outline"
              colorScheme="blue"
              borderRadius="full"
              px={6}
              rightIcon={<ArrowRight size={16} />}
              _hover={{ bg: 'blue.50', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              flexShrink={0}
            >
              Browse All Vehicles
            </Button>
          }
        />

        {loading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.100"
                h="400px"
                sx={{
                  '& .skeleton': {
                    background:
                      'linear-gradient(90deg, var(--chakra-colors-gray-100) 25%, var(--chakra-colors-gray-200) 50%, var(--chakra-colors-gray-100) 75%)',
                    backgroundSize: '200% 100%',
                    animation: `${shimmer} 1.6s linear infinite`
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    '& .skeleton': { animation: 'none' }
                  }
                }}
              >
                <Box className="skeleton" h="240px" />
                <Box p={5}>
                  <Box className="skeleton" h="20px" mb={3} borderRadius="md" />
                  <Box className="skeleton" h="16px" mb={2} borderRadius="md" w="60%" />
                  <Box className="skeleton" h="16px" borderRadius="md" w="40%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : listings.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {listings.map((listing) => (
              <ListingItemCard key={listing.uuid} listing={listing} requireAuth={true} />
            ))}
          </SimpleGrid>
        ) : (
          <VStack
            spacing={5}
            textAlign="center"
            py={16}
            bg="white"
            borderRadius="2xl"
            border="1px dashed"
            borderColor="gray.200"
          >
            <Flex
              boxSize={16}
              borderRadius="2xl"
              bg="gray.100"
              align="center"
              justify="center"
            >
              <Icon as={Car} boxSize={7} color="gray.400" />
            </Flex>
            <VStack spacing={1}>
              <Text fontSize="xl" fontWeight="700" color="gray.700">
                No listings available at the moment
              </Text>
              <Text color="gray.500">Check back later for new listings</Text>
            </VStack>
            <Button
              as={Link}
              to="/buy"
              colorScheme="blue"
              size="lg"
              borderRadius="full"
              px={8}
              rightIcon={<ArrowRight size={18} />}
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

/* ──────────────────────────── HOW IT WORKS ─────────────────────────────── */

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
    }
  ];

  return (
    <Box py={SECTION_PY} bg="white">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="⚡ Simple Process"
          colorScheme="purple"
          title="How Veyu Works"
          subtitle="Get started in minutes with our streamlined process designed for your convenience."
        />

        <Box position="relative">
          {/* Connector rail behind the steps */}
          <Box
            position="absolute"
            top="60px"
            left="12%"
            right="12%"
            h="1px"
            borderTop="2px dashed"
            borderColor="gray.200"
            display={{ base: 'none', md: 'block' }}
          />

          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} w="full">
            {steps.map((step, i) => (
              <VStack
                key={step.title}
                spacing={5}
                p={7}
                bg="white"
                borderRadius="2xl"
                border="1px solid"
                borderColor="gray.200"
                position="relative"
                align="flex-start"
                _hover={{
                  borderColor: `${step.color}.300`,
                  shadow: 'xl',
                  transform: 'translateY(-4px)'
                }}
                transition="all 0.3s ease"
                h="full"
              >
                <Text
                  position="absolute"
                  top={5}
                  right={6}
                  fontSize="3xl"
                  fontWeight="800"
                  color={`${step.color}.100`}
                  lineHeight={1}
                >
                  {String(i + 1).padStart(2, '0')}
                </Text>

                <Flex
                  boxSize={14}
                  borderRadius="2xl"
                  bg={`${step.color}.50`}
                  border="1px solid"
                  borderColor={`${step.color}.100`}
                  align="center"
                  justify="center"
                >
                  <Icon as={step.icon} boxSize={6} color={`${step.color}.600`} />
                </Flex>

                <VStack spacing={2} align="flex-start">
                  <Text fontWeight="700" fontSize="lg" color="gray.900" letterSpacing="-0.01em">
                    {step.title}
                  </Text>
                  <Text color="gray.600" fontSize="sm" lineHeight="tall">
                    {step.text}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>

        <Flex justify="center" mt={12}>
          <Button
            as={Link}
            to="/signup"
            size="lg"
            colorScheme="blue"
            borderRadius="full"
            rightIcon={<ArrowRight size={18} />}
            px={10}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s"
          >
            Get Started Now
          </Button>
        </Flex>
      </Container>
    </Box>
  );
}

/* ───────────────────────────── TRUSTED BY ──────────────────────────────── */

function TrustedBy() {
  const brands = [
    'Toyota', 'Honda', 'BMW', 'Mercedes', 'Lexus', 'Kia',
    'Yamaha', 'Ducati', 'Kawasaki', 'Suzuki',
    'Bayliner', 'Sea Ray', 'Tracker', 'Yamaha Boats',
    'Cessna', 'Bombardier', 'Airbus', 'Boeing'
  ];

  const rows = [brands.slice(0, 9), brands.slice(9)];

  return (
    <Box py={SECTION_PY} bg="gray.50" overflow="hidden">
      <Container maxW="7xl" px={SHELL_PX}>
        <VStack spacing={3} textAlign="center" mb={12}>
          <Heading
            as="h2"
            fontSize={{ base: '1.75rem', md: '2.5rem' }}
            color="gray.900"
            {...displayHeading}
          >
            Trusted by Leading Brands
          </Heading>
          <Text color="gray.600" fontSize={{ base: 'md', md: 'lg' }}>
            Partnering with top manufacturers and service providers worldwide
          </Text>
        </VStack>
      </Container>

      {/* Two counter-scrolling rails, faded at both edges */}
      <VStack
        spacing={4}
        sx={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
        }}
      >
        {rows.map((row, rowIndex) => (
          <Flex
            key={rowIndex}
            w="max-content"
            gap={4}
            sx={{
              animation: `${marqueeScroll} ${rowIndex === 0 ? 45 : 38}s linear infinite`,
              animationDirection: rowIndex === 0 ? 'normal' : 'reverse',
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
            }}
            _hover={{ animationPlayState: 'paused' }}
          >
            {/* The strip translates by -50%, so each half must be wider than the
                viewport or a gap opens up at the wrap point. Two copies per half. */}
            {[...row, ...row, ...row, ...row].map((brand, i) => (
              <Flex
                key={`${brand}-${i}`}
                px={7}
                py={3.5}
                borderRadius="full"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                align="center"
                flexShrink={0}
                cursor="pointer"
                _hover={{ borderColor: 'blue.300', bg: 'blue.50', shadow: 'md' }}
                transition="all 0.25s"
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="gray.700"
                  letterSpacing="0.02em"
                  whiteSpace="nowrap"
                >
                  {brand}
                </Text>
              </Flex>
            ))}
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

/* ────────────────────────────── FEATURES ───────────────────────────────── */

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
    <Box py={SECTION_PY} bg="white">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="✨ Why Choose Us"
          colorScheme="green"
          title={
            <>
              Why Veyu
              <Text as="span" color="blue.500">?</Text>
            </>
          }
          subtitle="Experience the future of automotive commerce with features designed for your success."
        />

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
          {features.map((feature) => (
            <VStack
              key={feature.title}
              spacing={5}
              p={7}
              align="flex-start"
              bg="gray.50"
              borderRadius="2xl"
              h="full"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
              _hover={{
                bg: 'white',
                borderColor: `${feature.color}.300`,
                shadow: 'xl',
                transform: 'translateY(-4px)'
              }}
              transition="all 0.3s ease"
            >
              {/* Soft accent wash in the corner */}
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                boxSize="120px"
                borderRadius="full"
                bg={`${feature.color}.100`}
                opacity={0.5}
                filter="blur(30px)"
              />

              <Flex
                boxSize={14}
                fontSize="2xl"
                borderRadius="2xl"
                bg="white"
                border="1px solid"
                borderColor={`${feature.color}.200`}
                align="center"
                justify="center"
                shadow="sm"
                position="relative"
              >
                {feature.icon}
              </Flex>

              <VStack spacing={2.5} align="flex-start" position="relative">
                <Text fontSize="lg" fontWeight="700" color="gray.900" letterSpacing="-0.01em">
                  {feature.title}
                </Text>
                <Text color="gray.600" fontSize="sm" lineHeight="tall">
                  {feature.description}
                </Text>
              </VStack>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

/* ───────────────────────────── VIN DECODER ─────────────────────────────── */

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
    <Box py={SECTION_PY} bg="gray.50">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="🔍 VIN Decoder"
          colorScheme="orange"
          title="Check a VIN"
          subtitle="Enter a vehicle VIN to decode make, model, year and more details instantly."
        />

        <VStack spacing={6} maxW="900px" mx="auto">
          <Box
            w="full"
            bg="white"
            borderRadius="2xl"
            border="1px solid"
            borderColor="gray.200"
            p={{ base: 4, md: 5 }}
            shadow="sm"
          >
            <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
              <Input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onCheckVin()}
                placeholder="Enter VIN e.g. 1HGCM82633A004352"
                bg="gray.50"
                textTransform="uppercase"
                size="lg"
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.200"
                fontFamily="mono"
                letterSpacing="0.05em"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{
                  borderColor: 'blue.400',
                  bg: 'white',
                  boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                }}
                flex={1}
              />
              <Button
                onClick={onCheckVin}
                colorScheme="blue"
                isLoading={loading}
                loadingText="Decoding"
                size="lg"
                borderRadius="xl"
                px={10}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                Check VIN
              </Button>
            </Flex>

            {error && (
              <HStack mt={3} spacing={2} px={1}>
                <Box boxSize="6px" borderRadius="full" bg="red.500" />
                <Text color="red.500" fontSize="sm" fontWeight="500">
                  {error}
                </Text>
              </HStack>
            )}
          </Box>

          {result && (
            <Box
              w="full"
              bg="white"
              borderWidth="1px"
              borderColor="green.200"
              borderRadius="2xl"
              overflow="hidden"
              shadow="lg"
            >
              <HStack spacing={2.5} px={7} py={4} bg="green.50" borderBottom="1px solid" borderColor="green.100">
                <Icon as={CheckCircle} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="700" color="green.700" letterSpacing="0.02em">
                  VIN Successfully Decoded
                </Text>
              </HStack>

              <Box p={{ base: 5, md: 7 }}>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacingX={8} spacingY={0} w="full">
                  {fields.map((field) => (
                    <Flex
                      key={field.key}
                      justify="space-between"
                      align="center"
                      py={3.5}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      gap={4}
                    >
                      <Text
                        color="gray.500"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                      >
                        {field.label}
                      </Text>
                      <Text fontWeight="600" color="gray.900" textAlign="right" noOfLines={1}>
                        {result?.[field.key] || '—'}
                      </Text>
                    </Flex>
                  ))}
                </SimpleGrid>

                <Text fontSize="xs" color="gray.500" textAlign="center" mt={6}>
                  Data provided by NHTSA. Always verify details with the seller.
                </Text>
              </Box>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

/* ─────────────────────────── POPULAR BRANDS ────────────────────────────── */

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
    <Box py={SECTION_PY} bg="white">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="🏆 Popular Brands"
          colorScheme="purple"
          title="Browse All Vehicle Categories"
          subtitle="Discover top brands across cars, bikes, boats, aircraft, and more."
        />

        {/* Show only first 18 brands initially */}
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4} w="full">
          {categories.slice(0, 18).map((item, idx) => (
            <VStack
              key={`${item.name}-${item.type}-${idx}`}
              spacing={4}
              p={5}
              bg="white"
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.200"
              _hover={{
                borderColor: `${item.color}.300`,
                shadow: 'lg',
                transform: 'translateY(-4px)',
                '& .brand-logo': { filter: 'grayscale(0)', opacity: 1 }
              }}
              transition="all 0.3s ease"
              cursor="pointer"
              h="full"
              minH="150px"
              justify="center"
            >
              <Flex
                w="full"
                minH="56px"
                align="center"
                justify="center"
                borderRadius="xl"
                bg="gray.50"
              >
                <Image
                  className="brand-logo"
                  src={item.logo}
                  alt={`${item.name} logo`}
                  maxH="42px"
                  maxW="42px"
                  objectFit="contain"
                  filter="grayscale(1)"
                  opacity={0.75}
                  transition="all 0.3s ease"
                  fallback={
                    <Flex
                      boxSize="42px"
                      bg={`${item.color}.100`}
                      borderRadius="lg"
                      align="center"
                      justify="center"
                    >
                      <Text fontSize="md" fontWeight="800" color={`${item.color}.600`}>
                        {item.name.charAt(0)}
                      </Text>
                    </Flex>
                  }
                />
              </Flex>

              <VStack spacing={1.5} textAlign="center">
                <Text fontWeight="700" fontSize="sm" color="gray.900" noOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                  color={`${item.color}.500`}
                >
                  {item.type}
                </Text>
              </VStack>
            </VStack>
          ))}
        </SimpleGrid>

        {/* Category breakdown */}
        <VStack spacing={4} w="full" maxW="4xl" mx="auto" mt={12}>
          <Text
            fontSize="xs"
            color="gray.500"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.14em"
          >
            Browse by Category
          </Text>
          <Flex wrap="wrap" gap={2.5} justify="center">
            {['Cars', 'Motorcycles', 'Boats', 'Aircraft', 'Trucks', 'Electric'].map((category) => (
              <Flex
                key={category}
                align="center"
                gap={2}
                px={4}
                py={2}
                borderRadius="full"
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                _hover={{ bg: 'blue.50', borderColor: 'blue.400' }}
                transition="all 0.2s"
              >
                <Text fontSize="sm" fontWeight="600" color="gray.700">
                  {category}
                </Text>
                <Text fontSize="xs" fontWeight="700" color="blue.500">
                  {categories.filter((item) => item.type === category).length}
                </Text>
              </Flex>
            ))}
          </Flex>
        </VStack>

        <Flex justify="center" mt={10}>
          <Button
            variant="outline"
            size="lg"
            borderRadius="full"
            rightIcon={<FaPlus />}
            colorScheme="blue"
            px={8}
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            Show All Brands
          </Button>
        </Flex>
      </Container>
    </Box>
  );
}

/* ──────────────────────────── TESTIMONIALS ─────────────────────────────── */

function TestimonialCard({ name, role, comment, rating, avatar, title }) {
  return (
    <VStack
      bg="white"
      p={7}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.200"
      minW={{ base: '280px', sm: '340px' }}
      maxW={{ base: '280px', sm: '340px' }}
      h="auto"
      align="start"
      spacing={5}
      position="relative"
      overflow="hidden"
      _hover={{ shadow: 'xl', borderColor: 'blue.300', transform: 'translateY(-4px)' }}
      transition="all 0.3s ease"
    >
      <Icon
        as={Quote}
        boxSize={12}
        color="gray.100"
        position="absolute"
        top={4}
        right={4}
        transform="scaleX(-1)"
      />

      <HStack spacing={1} position="relative">
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon
            key={i}
            as={Star}
            boxSize={4}
            color={i < rating ? 'yellow.400' : 'gray.200'}
            fill={i < rating ? 'currentColor' : 'none'}
          />
        ))}
      </HStack>

      <VStack spacing={2.5} align="start" flex={1} position="relative">
        <Text fontWeight="700" fontSize="md" color="gray.900" letterSpacing="-0.01em">
          "{title}"
        </Text>
        <Text color="gray.600" fontSize="sm" lineHeight="tall">
          {comment}
        </Text>
      </VStack>

      <Divider borderColor="gray.100" />

      <HStack spacing={3.5}>
        <Avatar name={name} src={avatar} size="md" />
        <VStack align="start" spacing={0.5}>
          <Text fontWeight="700" fontSize="sm" color="gray.900">
            {name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {role}
          </Text>
        </VStack>
      </HStack>
    </VStack>
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
      avatar: '/assets/images/list_car.jpg'
    },
    {
      name: 'Tunde A.',
      role: 'Booked a mobile mechanic',
      title: 'Reliable pros, fast booking',
      comment: 'The mechanic arrived on time and fixed my brakes same day. Will use again.',
      rating: 5,
      avatar: '/assets/images/mechanic.jpg'
    },
    {
      name: 'Chioma N.',
      role: 'Weekend boat rental',
      title: 'Great selection and service',
      comment: 'Smooth checkout, fair pricing, and the boat was immaculate. Perfect getaway!',
      rating: 5,
      avatar: '/assets/images/image.jpg'
    },
    {
      name: 'Ola D.',
      role: 'Motorbike enthusiast',
      title: 'Love the multi-vehicle options',
      comment: 'Nice to have bikes, cars, and boats in one place. Super convenient!',
      rating: 5,
      avatar: '/assets/images/sell_car.jpg'
    }
  ];

  return (
    <Box py={SECTION_PY} bg="gray.50">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="⭐ Customer Stories"
          colorScheme="yellow"
          title="What Our Clients Say"
          subtitle="Real experiences from thousands of satisfied customers across Africa."
        />

        <Box
          w="full"
          overflow="hidden"
          sx={{
            maskImage: {
              base: 'none',
              lg: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)'
            },
            WebkitMaskImage: {
              base: 'none',
              lg: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)'
            }
          }}
        >
          <Flex
            gap={5}
            overflowX="auto"
            pt={2}
            pb={5}
            px={1}
            justify="flex-start"
            sx={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              '& > *': { scrollSnapAlign: 'start' }
            }}
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}

/* ───────────────────────────── PARTNERSHIP ─────────────────────────────── */

function Partnership() {
  const [isMobile] = useMediaQuery('(max-width: 760px)');

  const perks = [
    {
      icon: TrendingUp,
      title: 'Grow Your Revenue',
      text: 'Access thousands of verified buyers'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      text: 'Protected payments and escrow services'
    },
    {
      icon: Zap,
      title: 'Easy Management',
      text: 'Powerful dashboard and analytics'
    }
  ];

  return (
    <Box
      py={{ base: 20, md: 28 }}
      position="relative"
      color="white"
      overflow="hidden"
      backgroundImage={`url('/assets/veyu/homes.jpg')`}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment={isMobile ? 'scroll' : 'fixed'}
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, blackAlpha.900, blackAlpha.700, blackAlpha.900)"
      />

      <Container position="relative" zIndex={1} maxW="7xl" px={SHELL_PX}>
        <VStack spacing={8} textAlign="center">
          <Eyebrow colorScheme="yellow" dark>
            🤝 Partner With Us
          </Eyebrow>

          <Heading
            as="h2"
            fontSize={{ base: '2.25rem', sm: '3rem', md: '4rem' }}
            fontWeight="800"
            letterSpacing="-0.035em"
            lineHeight="1.05"
            maxW="4xl"
            sx={{ '& span': { lineHeight: 'inherit' } }}
          >
            <Box as="span" display="block">
              Ready to Move Your Business Forward
              <Text as="span" color="yellow.400">?</Text>
            </Box>
            <Box as="span" display="block">
              Partner with us today.
            </Box>
          </Heading>

          <Text fontSize={{ base: 'md', md: 'xl' }} maxW="3xl" lineHeight="tall" color="whiteAlpha.800">
            Whether you're a dealer, mechanic, or fleet operator, Veyu helps you grow
            with cutting-edge tools, verified customers, and seamless transactions that convert.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} maxW="4xl" w="full" pt={4}>
            {perks.map((perk) => (
              <VStack
                key={perk.title}
                spacing={3.5}
                textAlign="center"
                p={7}
                borderRadius="2xl"
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.200"
                backdropFilter="blur(12px)"
                _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.400', transform: 'translateY(-4px)' }}
                transition="all 0.3s ease"
              >
                <Flex
                  boxSize={12}
                  borderRadius="xl"
                  bg="yellow.400"
                  align="center"
                  justify="center"
                >
                  <Icon as={perk.icon} boxSize={5} color="gray.900" />
                </Flex>
                <Text fontWeight="700" fontSize="md">
                  {perk.title}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.800" lineHeight="tall">
                  {perk.text}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>

          <HStack spacing={3} flexWrap="wrap" justify="center" pt={4}>
            <Button
              as={Link}
              to="/signup/business"
              size="lg"
              colorScheme="yellow"
              bg="yellow.400"
              color="gray.900"
              borderRadius="full"
              rightIcon={<ArrowRight size={18} />}
              px={10}
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
              borderRadius="full"
              borderColor="whiteAlpha.400"
              color="white"
              px={10}
              _hover={{
                bg: 'whiteAlpha.200',
                borderColor: 'whiteAlpha.700',
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

/* ─────────────────────────────── FAQ ───────────────────────────────────── */

function FAQSection() {
  return (
    <Box bg="white" py={SECTION_PY}>
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow="❓ Got Questions?"
          colorScheme="blue"
          title="Frequently Asked Questions"
          subtitle={
            <>
              Still not convinced?{' '}
              <Text
                as="span"
                color="blue.500"
                fontWeight="600"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
              >
                Chat with our team here.
              </Text>
            </>
          }
        />

        <Box maxW="4xl" w="full" mx="auto">
          <Accordion allowMultiple allowToggle>
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} border="none" mb={3}>
                {({ isExpanded }) => (
                  <Box
                    bg={isExpanded ? 'blue.50' : 'gray.50'}
                    borderRadius="2xl"
                    overflow="hidden"
                    transition="all 0.25s ease"
                    border="1px solid"
                    borderColor={isExpanded ? 'blue.200' : 'gray.200'}
                    _hover={{ borderColor: isExpanded ? 'blue.300' : 'gray.300' }}
                  >
                    <AccordionButton
                      py={5}
                      px={{ base: 5, md: 6 }}
                      _hover={{ bg: 'transparent' }}
                      _focusVisible={{ boxShadow: 'outline' }}
                    >
                      <HStack flex={1} spacing={4} align="center">
                        <Flex
                          boxSize={9}
                          flexShrink={0}
                          borderRadius="full"
                          bg={isExpanded ? 'blue.500' : 'white'}
                          border="1px solid"
                          borderColor={isExpanded ? 'blue.500' : 'gray.200'}
                          align="center"
                          justify="center"
                          transition="all 0.25s ease"
                        >
                          <Icon
                            fontSize="16px"
                            color={isExpanded ? 'white' : 'gray.500'}
                          >
                            {isExpanded ? <FaCircleMinus /> : <FaCirclePlus />}
                          </Icon>
                        </Flex>
                        <Text
                          flex={1}
                          fontSize={{ base: 'md', md: 'lg' }}
                          fontWeight="600"
                          textAlign="left"
                          color="gray.900"
                          letterSpacing="-0.01em"
                        >
                          {faq?.question}
                        </Text>
                      </HStack>
                    </AccordionButton>

                    <AccordionPanel pb={6} px={{ base: 5, md: 6 }} pt={0}>
                      <Box pl={{ base: 0, md: 13 }}>
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

        <VStack spacing={4} mt={14}>
          <Text color="gray.600">Still have questions? We're here to help!</Text>
          <HStack spacing={3} flexWrap="wrap" justify="center">
            <Button
              leftIcon={<Mail size={18} />}
              colorScheme="blue"
              variant="outline"
              borderRadius="full"
              px={7}
              _hover={{ transform: 'translateY(-2px)', shadow: 'md', bg: 'blue.50' }}
              transition="all 0.2s"
            >
              Email Support
            </Button>
            <Button
              leftIcon={<Phone size={18} />}
              colorScheme="green"
              borderRadius="full"
              px={7}
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
              transition="all 0.2s"
            >
              Call Us
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
