import { Fragment, useState, useEffect, useRef } from 'react';
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
  Image,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  AccordionIcon,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
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
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  Store,
  MousePointerClick,
  GraduationCap,
  Copy,
  X,
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
import {
  normalizeVin,
  validateVin,
  hasValidCheckDigit,
  decodeVin,
  fetchRecalls,
  groupDecodedFields,
  extraDecodedFields,
  buildVehicleTitle,
  buildVinSummary,
  titleCase,
  getRecentVins,
  rememberVin,
  clearRecentVins
} from '../services/vinService';

/* ────────────────────────────────────────────────────────────────────────────
   Shared layout tokens — one rhythm for every section on the page.
   ──────────────────────────────────────────────────────────────────────────── */
const SECTION_PY = { base: 16, md: 24 };
const SHELL_PX = { base: 5, md: 8 };

const marqueeScroll = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
`;

const nudge = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50%      { transform: translateY(5px); opacity: 1; }
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

const HERO_TYPES = [
  { key: 'cars', label: 'Cars' },
  { key: 'aircraft', label: 'Aircraft' },
  { key: 'bikes', label: 'Bikes' },
  { key: 'boats', label: 'Boats' },
  { key: 'mechanics', label: 'Mechanics' }
];

function HeroField({ icon, label, children, ...inputProps }) {
  return (
    <Flex
      flex={1}
      minW={0}
      align="center"
      gap={3}
      px={{ base: 4, md: 5 }}
      py={2.5}
      borderRadius="full"
      transition="background 0.2s ease"
      _hover={{ bg: 'gray.50' }}
      _focusWithin={{ bg: 'gray.50' }}
    >
      <Icon as={icon} boxSize="18px" color="gray.400" flexShrink={0} />
      <Box flex={1} minW={0} textAlign="left">
        <Text
          fontSize="10px"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.12em"
          color="gray.400"
          lineHeight={1.4}
        >
          {label}
        </Text>
        <Input
          variant="unstyled"
          fontSize="sm"
          fontWeight="600"
          color="gray.900"
          h="22px"
          _placeholder={{ color: 'gray.400', fontWeight: 500 }}
          {...inputProps}
        />
      </Box>
      {children}
    </Flex>
  );
}

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

  const fieldLabelByType = {
    cars: { label: 'Make', placeholder: 'Any make, e.g. Toyota' },
    aircraft: { label: 'Manufacturer', placeholder: 'Any manufacturer, e.g. Cessna' },
    bikes: { label: 'Brand', placeholder: 'Any brand, e.g. Yamaha' },
    boats: { label: 'Brand', placeholder: 'Any brand, e.g. Bayliner' },
    mechanics: { label: 'Service', placeholder: 'Service or workshop name' }
  };

  const field = fieldLabelByType[type];
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
      as="section"
      id="welcome"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      minH={{ base: 'auto', md: '100vh' }}
      pt={{ base: 28, md: 32 }}
      pb={{ base: 20, md: 28 }}
    >
      {/* Photographic base */}
      <Box
        position="absolute"
        inset={0}
        bgImage="url('/assets/veyu/land1.jpg')"
        bgSize="cover"
        bgPos="center"
        transform="scale(1.05)"
      />
      {/* Scrims: darken globally, then deepen top and bottom so the fixed navbar
          and the section seam both have something solid to sit against. */}
      <Box position="absolute" inset={0} bg="rgba(12, 15, 20, 0.72)" />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-b, rgba(12,15,20,0.92), transparent 28%, transparent 62%, rgba(12,15,20,0.95))"
      />
      {/* Brand-orange bloom behind the headline */}
      <Box
        position="absolute"
        top="18%"
        left="50%"
        transform="translateX(-50%)"
        w={{ base: '520px', md: '900px' }}
        h={{ base: '320px', md: '460px' }}
        bg="primary"
        opacity={0.16}
        filter="blur(120px)"
        borderRadius="full"
        pointerEvents="none"
      />

      <Container position="relative" zIndex={1} maxW="7xl" px={SHELL_PX}>
        <VStack spacing={{ base: 6, md: 8 }} textAlign="center" color="white">
          {/* Eyebrow */}
          <HStack
            spacing={2.5}
            px={4}
            py={2}
            borderRadius="full"
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            backdropFilter="blur(12px)"
          >
            <Text
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.14em"
              whiteSpace="nowrap"
            >
               Africa's #1 Vehicle Marketplace
            </Text>
          </HStack>

          {/* Headline */}
          <Heading
            as="h1"
            fontSize={{ base: '2.75rem', sm: '4rem', md: '5.5rem', lg: '6rem' }}
            fontWeight="800"
            letterSpacing="-0.045em"
            lineHeight="0.95"
            maxW="6xl"
            sx={{ '& span': { lineHeight: 'inherit' } }}
          >
            <Box as="span" display="block">
              Find Your Next Vehicle
            </Box>
            <Box
              as="span"
              display="block"
              bgGradient="linear(to-r, #FDD153, #F4A950)"
              bgClip="text"
            >
              or Service
            </Box>
          </Heading>

          <Text
            maxW="2xl"
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight="tall"
            color="whiteAlpha.800"
          >
            Buy, rent, or service cars, aircraft, bikes, boats, and more.
            Compare prices, explore deals, and book with verified partners across Africa.
          </Text>

          {/* Search command bar */}
          <Box w="full" maxW="4xl" pt={{ base: 2, md: 4 }}>
            <Flex justify="center" gap={2} mb={4} flexWrap="wrap">
              {HERO_TYPES.map((t) => (
                <Box
                  key={t.key}
                  as="button"
                  type="button"
                  onClick={() => setType(t.key)}
                  px={4}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="600"
                  border="1px solid"
                  transition="all 0.2s ease"
                  bg={type === t.key ? 'primary' : 'whiteAlpha.100'}
                  color={type === t.key ? 'secondary' : 'whiteAlpha.800'}
                  borderColor={type === t.key ? 'primary' : 'whiteAlpha.200'}
                  backdropFilter="blur(12px)"
                  _hover={type === t.key ? {} : { bg: 'whiteAlpha.200', color: 'white' }}
                >
                  {t.label}
                </Box>
              ))}
            </Flex>

            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="stretch"
              gap={{ base: 2, md: 1 }}
              bg="white"
              p={2}
              borderRadius={{ base: '2xl', md: 'full' }}
              boxShadow="0 24px 60px -20px rgba(0,0,0,0.6)"
            >
              <Box position="relative" flex={1} minW={0}>
                <HeroField
                  icon={Search}
                  label={field.label}
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setShowMakeSug(true);
                  }}
                  onFocus={() => setShowMakeSug(true)}
                  onBlur={() => setTimeout(() => setShowMakeSug(false), 150)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                  placeholder={field.placeholder}
                />

                {showMakeSug && suggestions.length > 0 && (
                  <VStack
                    position="absolute"
                    top="calc(100% + 12px)"
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
                        _hover={{ bg: 'orange.50', color: 'orange.700' }}
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

              <Box
                w="1px"
                bg="gray.200"
                my={2}
                display={{ base: 'none', md: 'block' }}
                flexShrink={0}
              />

              <HeroField
                icon={MapPin}
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder="Anywhere"
              >
                <Button
                  onClick={useMyLocation}
                  variant="link"
                  size="xs"
                  color="orange.600"
                  fontWeight="700"
                  flexShrink={0}
                  _hover={{ color: 'orange.700' }}
                >
                  Use mine
                </Button>
              </HeroField>

              <Button
                onClick={onSearch}
                size="lg"
                bg="secondary"
                color="white"
                borderRadius="full"
                px={8}
                h={{ base: '52px', md: '56px' }}
                flexShrink={0}
                rightIcon={<ArrowRight size={18} />}
                _hover={{ bg: 'dark.600', transform: 'translateY(-1px)', shadow: 'xl' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s ease"
              >
                Search
              </Button>
            </Flex>

            <Text mt={4} fontSize="sm" color="whiteAlpha.700">
               Popular: Toyota, Honda, BMW • Motorbikes • Boats
            </Text>
          </Box>

          {/* Trust chips */}
          <Flex justify="center" flexWrap="wrap" gap={2.5} pt={{ base: 2, md: 4 }}>
            {trustPoints.map(({ icon, label }) => (
              <HStack
                key={label}
                spacing={2}
                px={4}
                py={2}
                borderRadius="full"
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.200"
                backdropFilter="blur(12px)"
                transition="all 0.2s ease"
                _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.400' }}
              >
                <Icon as={icon} boxSize={4} color="primary" />
                <Text fontSize="sm" fontWeight="600" whiteSpace="nowrap">
                  {label}
                </Text>
              </HStack>
            ))}
          </Flex>
        </VStack>
      </Container>

      {/* Scroll cue */}
      <VStack
        position="absolute"
        bottom={6}
        left="50%"
        transform="translateX(-50%)"
        spacing={1.5}
        color="whiteAlpha.600"
        display={{ base: 'none', md: 'flex' }}
        pointerEvents="none"
      >
        <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="0.2em">
          Scroll
        </Text>
        <Icon
          as={ChevronDown}
          boxSize={4}
          sx={{
            animation: `${nudge} 1.8s ease-in-out infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' }
          }}
        />
      </VStack>
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
          eyebrow=" Latest Listings"
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
          eyebrow=" Simple Process"
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
      icon: Store,
      title: 'All-in-One Marketplace',
      description: 'Veyu offers you the best experience by providing solutions to your vehicle needs all in one place.',
      color: 'blue'
    },
    {
      icon: ShieldCheck,
      title: 'Trust & Transparency',
      description: 'Have peace of mind when dealing on Veyu with our secure technology and verified partners.',
      color: 'green'
    },
    {
      icon: MousePointerClick,
      title: 'Ease of Use',
      description: 'Veyu makes it easy for users to find vehicles and mechanics with our intuitive interface.',
      color: 'purple'
    },
    {
      icon: GraduationCap,
      title: 'Educational Content',
      description: 'Learn about vehicles, maintenance, and smart buying decisions with Veyu Reels - all under 60 seconds.',
      color: 'orange'
    }
  ];

  return (
    <Box py={SECTION_PY} bg="white">
      <Container maxW="7xl" px={SHELL_PX}>
        <SectionHeader
          eyebrow=" Why Choose Us"
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
                borderRadius="2xl"
                bg="white"
                border="1px solid"
                borderColor={`${feature.color}.200`}
                align="center"
                justify="center"
                shadow="sm"
                position="relative"
              >
                <Icon as={feature.icon} boxSize={6} color={`${feature.color}.600`} strokeWidth={1.75} />
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

function VinSpecRow({ label, value }) {
  return (
    <Flex
      justify="space-between"
      align="baseline"
      py={2.5}
      borderBottom="1px solid"
      borderColor="gray.100"
      gap={4}
    >
      <Text color="gray.500" fontSize="sm" flexShrink={0}>
        {label}
      </Text>
      <Text fontWeight="600" color="gray.900" fontSize="sm" textAlign="right">
        {value}
      </Text>
    </Flex>
  );
}

function RecallPanel({ state }) {
  if (state.status === 'loading') {
    return (
      <HStack spacing={3} px={{ base: 5, md: 7 }} py={4} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
        <Spinner size="sm" color="gray.400" />
        <Text fontSize="sm" color="gray.500">Checking NHTSA safety recalls…</Text>
      </HStack>
    );
  }

  if (state.status === 'error') {
    return (
      <HStack spacing={2.5} px={{ base: 5, md: 7 }} py={4} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
        <Icon as={AlertTriangle} boxSize={4} color="gray.400" />
        <Text fontSize="sm" color="gray.500">Recall lookup unavailable right now.</Text>
      </HStack>
    );
  }

  if (state.status !== 'done') return null;

  if (state.count === 0) {
    return (
      <HStack spacing={2.5} px={{ base: 5, md: 7 }} py={4} bg="green.50" borderTop="1px solid" borderColor="green.100">
        <Icon as={ShieldCheck} boxSize={4} color="green.600" />
        <Text fontSize="sm" fontWeight="600" color="green.800">
          No open safety recalls reported for this year, make and model.
        </Text>
      </HStack>
    );
  }

  // parkIt / parkOutSide are NHTSA's "stop driving" and "fire risk" flags.
  const urgent = state.recalls.filter((r) => r.parkIt || r.parkOutSide).length;

  return (
    <Box borderTop="1px solid" borderColor="red.100" bg="red.50">
      <HStack spacing={2.5} px={{ base: 5, md: 7 }} pt={4} pb={urgent ? 2 : 4} align="flex-start">
        <Icon as={AlertTriangle} boxSize={4} color="red.500" mt="2px" />
        <Box>
          <Text fontSize="sm" fontWeight="700" color="red.800">
            {state.count} safety recall{state.count === 1 ? '' : 's'} reported for this year, make and model
          </Text>
          {urgent > 0 && (
            <Text fontSize="xs" fontWeight="600" color="red.700" mt={1}>
              {urgent} carries a “do not drive” or “park outside” warning.
            </Text>
          )}
        </Box>
      </HStack>

      <Accordion allowToggle px={{ base: 3, md: 5 }} pb={4}>
        {state.recalls.slice(0, 8).map((recall) => (
          <AccordionItem key={recall.NHTSACampaignNumber} border="none" mb={2}>
            <AccordionButton
              bg="white"
              borderRadius="lg"
              border="1px solid"
              borderColor="red.100"
              _hover={{ borderColor: 'red.200' }}
              px={4}
              py={3}
            >
              <Box flex={1} textAlign="left">
                <Text fontSize="sm" fontWeight="600" color="gray.900" noOfLines={1}>
                  {/* NHTSA packs components as "AIR BAGS:FRONTAL:DRIVER SIDE" */}
                  {titleCase(recall.Component || 'Safety recall').replace(/\s*:\s*/g, ' · ')}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={0.5}>
                  Campaign {recall.NHTSACampaignNumber}
                  {recall.ReportReceivedDate ? ` · ${recall.ReportReceivedDate}` : ''}
                </Text>
              </Box>
              <AccordionIcon color="gray.400" />
            </AccordionButton>

            <AccordionPanel px={4} pt={3} pb={4}>
              <VStack align="stretch" spacing={3}>
                {[
                  ['Summary', recall.Summary],
                  ['Risk', recall.Consequence],
                  ['Remedy', recall.Remedy]
                ]
                  .filter(([, body]) => body)
                  .map(([heading, body]) => (
                    <Box key={heading}>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                        color="red.600"
                        mb={1}
                      >
                        {heading}
                      </Text>
                      <Text fontSize="sm" color="gray.700" lineHeight="tall">
                        {body}
                      </Text>
                    </Box>
                  ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      {state.count > 8 && (
        <Text fontSize="xs" color="red.700" px={{ base: 5, md: 7 }} pb={4}>
          Showing the 8 most recent of {state.count} recalls.
        </Text>
      )}
    </Box>
  );
}

function VinCheckSection() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [recalls, setRecalls] = useState({ status: 'idle' });
  const [showAllFields, setShowAllFields] = useState(false);
  const [recentVins, setRecentVins] = useState([]);
  const requestRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setRecentVins(getRecentVins());
    // Abort any in-flight lookup if the visitor navigates away mid-request.
    return () => requestRef.current?.abort();
  }, []);

  const checkDigitOk = hasValidCheckDigit(vin);

  async function onCheckVin(rawVin = vin) {
    const candidate = normalizeVin(rawVin);
    setVin(candidate);

    const { valid, message, warning: checkWarning } = validateVin(candidate);
    setError(valid ? '' : message);
    setWarning(valid ? checkWarning || '' : '');
    if (!valid) {
      setResult(null);
      setRecalls({ status: 'idle' });
      return;
    }

    // Supersede any lookup still in flight so responses can't land out of order.
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setLoading(true);
    setResult(null);
    setShowAllFields(false);
    setRecalls({ status: 'idle' });

    try {
      const { record, notes, partial } = await decodeVin(candidate, { signal: controller.signal });
      if (controller.signal.aborted) return;

      setResult({ vin: candidate, record, notes, partial });
      setRecentVins(rememberVin(candidate));
      toast({
        title: 'VIN decoded',
        description: buildVehicleTitle(record),
        status: 'success',
        duration: 3000
      });

      // Recalls are a bonus — a failure here must not sink the decode result.
      setRecalls({ status: 'loading' });
      try {
        const found = await fetchRecalls(
          { make: record.Make, model: record.Model, modelYear: record.ModelYear },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        setRecalls(found ? { status: 'done', ...found } : { status: 'idle' });
      } catch (recallError) {
        if (!controller.signal.aborted) setRecalls({ status: 'error' });
      }
    } catch (e) {
      if (controller.signal.aborted || e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to decode VIN');
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  function onClear() {
    requestRef.current?.abort();
    requestRef.current = null;
    setVin('');
    setResult(null);
    setError('');
    setWarning('');
    setRecalls({ status: 'idle' });
    setLoading(false);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(buildVinSummary(result.vin, result.record));
      toast({ title: 'Copied to clipboard', status: 'success', duration: 2000 });
    } catch {
      toast({ title: "Couldn't copy", status: 'error', duration: 2500 });
    }
  }

  function onSearchListings() {
    const params = new URLSearchParams({ type: 'cars' });
    if (result?.record?.Make) params.set('make', titleCase(result.record.Make));
    if (result?.record?.Model) params.set('model', result.record.Model);
    navigate(`/search/cars/?${params.toString()}`);
  }

  const groups = result ? groupDecodedFields(result.record) : [];
  const extras = result && showAllFields ? extraDecodedFields(result.record) : [];

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
          {/* Input */}
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
              <InputGroup size="lg" flex={1}>
                <Input
                  value={vin}
                  onChange={(e) => {
                    setVin(normalizeVin(e.target.value));
                    setError('');
                    setWarning('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && onCheckVin()}
                  placeholder="Enter VIN e.g. 1HGCM82633A004352"
                  bg="gray.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={error ? 'red.300' : 'gray.200'}
                  fontFamily="mono"
                  letterSpacing="0.08em"
                  pr="4.5rem"
                  _hover={{ borderColor: error ? 'red.400' : 'gray.300' }}
                  _focus={{
                    borderColor: error ? 'red.400' : 'blue.400',
                    bg: 'white',
                    boxShadow: `0 0 0 1px var(--chakra-colors-${error ? 'red' : 'blue'}-400)`
                  }}
                />
                <InputRightElement w="4.5rem" h="full" pr={2} justifyContent="flex-end">
                  {vin ? (
                    <HStack spacing={1}>
                      <Text fontSize="xs" fontWeight="600" color={vin.length === 17 ? 'green.500' : 'gray.400'}>
                        {vin.length}/17
                      </Text>
                      <IconButton
                        onClick={onClear}
                        size="xs"
                        variant="ghost"
                        borderRadius="full"
                        color="gray.400"
                        _hover={{ bg: 'gray.100', color: 'gray.600' }}
                        icon={<Icon as={X} boxSize={3.5} />}
                        aria-label="Clear VIN"
                      />
                    </HStack>
                  ) : null}
                </InputRightElement>
              </InputGroup>

              <Button
                onClick={() => onCheckVin()}
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

            {/* Validation feedback */}
            {error && (
              <HStack mt={3} spacing={2} px={1} align="flex-start">
                <Icon as={AlertTriangle} boxSize={3.5} color="red.500" mt="3px" />
                <Text color="red.600" fontSize="sm" fontWeight="500">{error}</Text>
              </HStack>
            )}
            {!error && warning && (
              <HStack mt={3} spacing={2} px={1} align="flex-start">
                <Icon as={AlertTriangle} boxSize={3.5} color="orange.500" mt="3px" />
                <Text color="orange.700" fontSize="sm" fontWeight="500">{warning}</Text>
              </HStack>
            )}
            {!error && !warning && vin.length === 17 && checkDigitOk && (
              <HStack mt={3} spacing={2} px={1}>
                <Icon as={CheckCircle} boxSize={3.5} color="green.500" />
                <Text color="green.600" fontSize="sm" fontWeight="500">
                  Check digit valid.
                </Text>
              </HStack>
            )}

            {/* Recent lookups */}
            {recentVins.length > 0 && (
              <Flex mt={4} pt={4} borderTop="1px solid" borderColor="gray.100" align="center" gap={2} flexWrap="wrap">
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color="gray.400">
                  Recent
                </Text>
                {recentVins.map((recent) => (
                  <Box
                    key={recent}
                    as="button"
                    type="button"
                    onClick={() => onCheckVin(recent)}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    border="1px solid"
                    borderColor="gray.200"
                    fontFamily="mono"
                    fontSize="xs"
                    color="gray.600"
                    _hover={{ bg: 'blue.50', borderColor: 'blue.300', color: 'blue.700' }}
                    transition="all 0.2s"
                  >
                    {recent}
                  </Box>
                ))}
                <Button
                  onClick={() => setRecentVins(clearRecentVins())}
                  variant="link"
                  size="xs"
                  color="gray.400"
                  fontWeight="600"
                  _hover={{ color: 'gray.600' }}
                >
                  Clear
                </Button>
              </Flex>
            )}
          </Box>

          {/* Result */}
          {result && (
            <Box
              w="full"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="2xl"
              overflow="hidden"
              shadow="lg"
            >
              <Flex
                px={{ base: 5, md: 7 }}
                py={5}
                bg="gray.50"
                borderBottom="1px solid"
                borderColor="gray.100"
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap={4}
              >
                <Box minW={0}>
                  <HStack spacing={2} mb={1}>
                    <Icon as={CheckCircle} color="green.500" boxSize={4} />
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      color="green.700"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                    >
                      VIN Decoded
                    </Text>
                  </HStack>
                  <Heading as="h3" fontSize={{ base: 'xl', md: '2xl' }} color="gray.900" {...displayHeading}>
                    {buildVehicleTitle(result.record)}
                  </Heading>
                  <Text fontFamily="mono" fontSize="xs" color="gray.500" letterSpacing="0.08em" mt={1}>
                    {result.vin}
                  </Text>
                </Box>

                <HStack spacing={2} flexShrink={0}>
                  <Button
                    onClick={onCopy}
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    leftIcon={<Copy size={14} />}
                    _hover={{ bg: 'white' }}
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={onSearchListings}
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Find similar
                  </Button>
                </HStack>
              </Flex>

              {/* NHTSA caveats for partially decoded VINs */}
              {result.notes.length > 0 && (
                <VStack
                  align="stretch"
                  spacing={1.5}
                  px={{ base: 5, md: 7 }}
                  py={4}
                  bg="orange.50"
                  borderBottom="1px solid"
                  borderColor="orange.100"
                >
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color="orange.700">
                    Notes from NHTSA
                  </Text>
                  {result.notes.map((note) => (
                    <Text key={note} fontSize="sm" color="orange.800" lineHeight="tall">
                      {note}
                    </Text>
                  ))}
                </VStack>
              )}

              <Box p={{ base: 5, md: 7 }}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={10} spacingY={7}>
                  {groups.map((group) => (
                    <Box key={group.title}>
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                        color="blue.600"
                        mb={2}
                      >
                        {group.title}
                      </Text>
                      {group.rows.map((row) => (
                        <VinSpecRow key={row.key} label={row.label} value={row.value} />
                      ))}
                    </Box>
                  ))}
                </SimpleGrid>

                {showAllFields && extras.length > 0 && (
                  <Box mt={7}>
                    <Text
                      fontSize="xs"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="0.1em"
                      color="blue.600"
                      mb={2}
                    >
                      Everything else NHTSA returned
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={10}>
                      {extras.map((row) => (
                        <VinSpecRow key={row.key} label={row.label} value={row.value} />
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                <Flex justify="center" mt={6}>
                  <Button
                    onClick={() => setShowAllFields((open) => !open)}
                    variant="ghost"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    rightIcon={
                      <Icon
                        as={ChevronDown}
                        boxSize={4}
                        transform={showAllFields ? 'rotate(180deg)' : 'none'}
                        transition="transform 0.2s"
                      />
                    }
                  >
                    {showAllFields
                      ? 'Show fewer details'
                      : `Show all ${extraDecodedFields(result.record).length} additional fields`}
                  </Button>
                </Flex>
              </Box>

              <RecallPanel state={recalls} />

              <Text
                fontSize="xs"
                color="gray.500"
                textAlign="center"
                px={5}
                py={4}
                borderTop="1px solid"
                borderColor="gray.100"
              >
                Data provided by NHTSA. Always verify details with the seller.
              </Text>
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
          eyebrow=" Popular Brands"
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
          eyebrow=" Customer Stories"
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
             Partner With Us
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
          eyebrow=" Got Questions?"
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
