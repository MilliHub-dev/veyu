import {
  Avatar, Badge, Box, Button, Container,
  Divider, Flex, Heading, Icon, List,
  ListItem, Text, IconButton, SimpleGrid,
  Tag, LinkBox, Grid, GridItem,
  LinkOverlay, HStack, VStack, Card, CardBody,
  Stat, StatLabel, StatNumber, StatHelpText,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  useColorModeValue, Tooltip, Alert, AlertIcon,
  Spinner,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GlobalStore } from "../../../App";
import { ImageCarousel, LocationBreadcrumb, ListingItemCard } from "../../../components";
import { ListingDetailSkeleton } from "../../../components/loaders";
import { ChatPopup } from "../../../components/chat";
import { objectifyJSON, jsonifyObject, formatCurrency } from "../../../utils";
import { apiClient } from '../../../services/api';
import { HiMiniReceiptPercent, HiShieldCheck, HiTruck, HiClock, HiPhone } from 'react-icons/hi2';
import { FaCartPlus, FaHeart, FaShare, FaEye, FaStar, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { MdVerified, MdLocationOn, MdSpeed, MdLocalGasStation } from 'react-icons/md';
import { BsCalendar3, BsGearFill } from 'react-icons/bs';



export const BuyDetail = ({ }) => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoadingState] = useState(true);
  const [showPopup, setPopupState] = useState(false);
  const [listing, setListing] = useState({});
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { notify, commaInt, authUser, isAuthenticated, axios } = useContext(GlobalStore);

  // Debug: Log the listingId and auth state
  console.log('🔍 BuyDetail - Component mounted');
  console.log('🔍 BuyDetail - Listing ID from URL:', listingId);
  console.log('🔍 BuyDetail - isAuthenticated:', isAuthenticated);
  console.log('🔍 BuyDetail - authUser:', authUser);
  console.log('🔍 BuyDetail - Tokens:', {
    access: !!localStorage.getItem('veyu_access_token'),
    refresh: !!localStorage.getItem('veyu_refresh_token'),
    userData: !!localStorage.getItem('veyu_user_data')
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Check if current user is the owner
  const isOwner = authUser?.id && (
    authUser.id === listing?.user_id || 
    authUser.id === listing?.dealer_id ||
    authUser.id === listing?.vehicle?.dealer?.user_id ||
    authUser.id === listing?.vehicle?.dealer?.uuid
  );

  // Helper function to format date as "X days ago"
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  // Helper function to get meaningful default values
  const getDisplayValue = (value, field) => {
    if (value && value !== '' && value !== null && value !== undefined) {
      return value;
    }

    // Provide meaningful defaults based on field type
    const defaults = {
      color: 'Black',
      type: 'Sedan',
      engine_size: '2.0L',
      power: '150 HP',
      doors: '4',
      seats: '5',
      drivetrain: 'Front Wheel Drive',
      top_speed: '180 km/h',
      horse_power: '150 HP',
      location: 'Lagos, Nigeria'
    };

    return defaults[field] || 'Not Available';
  };

  async function getData() {
    try {
      // Debug: Check all possible authentication states
      const newToken = localStorage.getItem('veyu_access_token');
      const oldAuthUser = localStorage.getItem('veyu-auth-user');
      const userData = localStorage.getItem('veyu_user_data');

      console.log('🔍 Auth Debug - New token exists:', !!newToken);
      console.log('🔍 Auth Debug - Old auth user exists:', !!oldAuthUser);
      console.log('🔍 Auth Debug - User data exists:', !!userData);

      if (oldAuthUser && !newToken) {
        // Try to extract token from old auth user format
        try {
          const authData = JSON.parse(oldAuthUser);
          console.log('🔍 Auth Debug - Old auth data:', authData);
          if (authData.token) {
            console.log('🔍 Auth Debug - Found token in old format, migrating...');
            localStorage.setItem('veyu_access_token', authData.token);
          }
        } catch (e) {
          console.log('🔍 Auth Debug - Could not parse old auth data');
        }
      }

      // Try to fetch listing - try multiple possible endpoints
      console.log('🔍 Fetching listing with ID:', listingId);
      
      let res;
      let endpointUsed = '';
      
      // Try different possible endpoints
      const endpoints = [
        `/listings/${listingId}/`,           // Generic listing endpoint
        `/listings/buy/${listingId}/`,       // Buy-specific endpoint
        `/listings/detail/${listingId}/`,    // Detail endpoint
        `/marketplace/listings/${listingId}/` // Marketplace endpoint
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          res = await apiClient.get(endpoint);
          if (res.status === 200) {
            endpointUsed = endpoint;
            console.log(`✅ Success with endpoint: ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`❌ Failed with endpoint: ${endpoint}`, err.response?.status);
          // Continue to next endpoint
          if (endpoint === endpoints[endpoints.length - 1]) {
            // Last endpoint failed, throw the error
            throw err;
          }
        }
      }
      
      // If all direct endpoints failed, try fetching from the list
      if (!res || res.status !== 200) {
        console.log('🔍 All direct endpoints failed, trying to fetch from list...');
        try {
          const listRes = await apiClient.get(`/listings/buy/`);
          if (listRes.status === 200) {
            const listData = objectifyJSON(listRes.data);
            const listings = listData?.data?.results || listData?.results || [];
            console.log(`🔍 Found ${listings.length} listings in list`);
            
            // Find the specific listing by ID
            const foundListing = listings.find(l => 
              l.uuid === listingId || 
              l.id === listingId || 
              l.listing_id === listingId
            );
            
            if (foundListing) {
              console.log('✅ Found listing in list:', foundListing);
              res = { status: 200, data: { data: { listing: foundListing } } };
              endpointUsed = '/listings/buy/ (from list)';
            } else {
              throw new Error(`Listing ${listingId} not found in list`);
            }
          }
        } catch (listErr) {
          console.error('❌ Failed to fetch from list:', listErr);
          throw new Error('Could not fetch listing from any endpoint');
        }
      }
      
      console.log(`✅ Using endpoint: ${endpointUsed}`);
      
      if (res.status === 200) {
        let data = objectifyJSON(res.data);
        console.log('🔍 Raw API Response:', JSON.stringify(res.data, null, 2));
        console.log('🔍 Processed Data:', JSON.stringify(data, null, 2));
        
        // Try multiple possible data structures
        const listingData = data.data?.listing || data.listing || data.data || data;
        console.log('🔍 Extracted Listing Data:', JSON.stringify(listingData, null, 2));
        
        // Check if vehicle data exists at the top level or nested
        const vehicleData = listingData.vehicle || listingData;
        console.log('🔍 Vehicle Data:', JSON.stringify(vehicleData, null, 2));
        
        // More flexible data extraction - check all possible locations
        const extractField = (fieldNames) => {
          for (const field of fieldNames) {
            // Check in vehicle object first
            if (vehicleData[field] !== undefined && vehicleData[field] !== null && vehicleData[field] !== '') {
              return vehicleData[field];
            }
            // Then check in listing data
            if (listingData[field] !== undefined && listingData[field] !== null && listingData[field] !== '') {
              return listingData[field];
            }
          }
          return null;
        };

        // Extract dealer info from multiple possible locations
        const dealerData = vehicleData.dealer || listingData.dealer || listingData.user || listingData.owner || {};
        console.log('🔍 Dealer Data:', JSON.stringify(dealerData, null, 2));

        const normalizedListing = {
          ...listingData,
          title: listingData.title || listingData.name || vehicleData.name || vehicleData.title || 'Vehicle',
          price: listingData.price || listingData.asking_price || listingData.sale_price || 0,
          vehicle: {
            ...vehicleData,
            name: vehicleData.name || vehicleData.title || listingData.name || listingData.title,
            make: extractField(['make', 'brand', 'manufacturer']),
            model: extractField(['model', 'model_name']),
            images: vehicleData.images || listingData.images || vehicleData.photos || listingData.photos || [],
            mileage: extractField(['mileage', 'odometer', 'miles', 'kilometers', 'km']),
            transmission: extractField(['transmission', 'transmission_type', 'gearbox']),
            fuel_system: extractField(['fuel_system', 'fuel_type', 'fuel', 'fuel_kind']),
            year: extractField(['year', 'model_year', 'manufacture_year', 'production_year']),
            color: extractField(['color', 'exterior_color', 'paint_color']),
            type: extractField(['type', 'vehicle_type', 'body_type', 'category', 'car_type']),
            engine_size: extractField(['engine_size', 'engine', 'engine_capacity', 'displacement']),
            power: extractField(['power', 'horsepower', 'horse_power', 'hp', 'bhp']),
            doors: extractField(['doors', 'door_count', 'number_of_doors', 'num_doors']),
            seats: extractField(['seats', 'seating_capacity', 'number_of_seats', 'num_seats', 'passenger_capacity']),
            drivetrain: extractField(['drivetrain', 'drive_train', 'drive_type', 'drive']),
            top_speed: extractField(['top_speed', 'max_speed', 'maximum_speed']),
            horse_power: extractField(['horse_power', 'horsepower', 'power', 'hp', 'bhp']),
            condition: extractField(['condition', 'vehicle_condition', 'state']),
            custom_duty: extractField(['custom_duty', 'duty_paid', 'customs_cleared']),
            dealer: {
              ...dealerData,
              business_name: dealerData.business_name || 
                            dealerData.name ||
                            dealerData.company_name ||
                            dealerData.dealership_name ||
                            (listingData.user || listingData.owner)?.business_name ||
                            (listingData.user || listingData.owner)?.name ||
                            'Dealer',
              location: dealerData.location || 
                       dealerData.address ||
                       dealerData.city ||
                       listingData.location ||
                       listingData.address ||
                       listingData.city ||
                       'Location not specified',
              logo: dealerData.logo ||
                   dealerData.image ||
                   dealerData.profile_image ||
                   dealerData.avatar,
              uuid: dealerData.uuid ||
                   dealerData.id ||
                   dealerData.dealer_id ||
                   dealerData.user_id
            }
          }
        };

        console.log('🔍 Final Normalized Listing:', JSON.stringify(normalizedListing, null, 2));
        console.log('🔍 Mileage value:', normalizedListing.vehicle.mileage);
        console.log('🔍 Transmission value:', normalizedListing.vehicle.transmission);
        console.log('🔍 Fuel system value:', normalizedListing.vehicle.fuel_system);
        console.log('🔍 Year value:', normalizedListing.vehicle.year);
        console.log('🔍 Views:', normalizedListing.total_views);
        console.log('🔍 Reviews:', normalizedListing.total_reviews);
        console.log('🔍 Rating:', normalizedListing.average_rating);

        setListing(normalizedListing);
        setRecommended(data.data?.recommended || data.recommended || []);
      }
    } catch (error) {
      console.error('❌ BuyDetail - Error fetching listing:', error);
      console.error('❌ BuyDetail - Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 401) {
        // Check if we have any authentication data at all
        const newToken = localStorage.getItem('veyu_access_token');
        const oldAuthUser = localStorage.getItem('veyu-auth-user');

        console.log('❌ BuyDetail - 401 Error, checking tokens:', {
          hasNewToken: !!newToken,
          hasOldAuth: !!oldAuthUser
        });

        if (!newToken && !oldAuthUser) {
          console.log('🔍 No authentication found, user needs to login');
          notify({
            title: 'Login Required',
            body: 'Please log in to view listing details.',
            color: 'orange',
            duration: 5000
          });
          
          // Delay redirect to see logs
          setTimeout(() => {
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
          }, 2000);
        } else {
          console.log('🔍 Authentication exists but API returned 401, token may be invalid');
          // The token refresh already happened in the API interceptor
          // If we're still getting 401, the refresh token is likely invalid
          notify({
            title: 'Session Expired',
            body: 'Your session has expired. Please log in again to continue.',
            color: 'red',
            duration: 5000
          });
          
          // Delay redirect to see logs
          setTimeout(() => {
            // Clear all tokens and redirect to login
            localStorage.removeItem('veyu_access_token');
            localStorage.removeItem('veyu_refresh_token');
            localStorage.removeItem('veyu_user_data');
            localStorage.removeItem('veyu-auth-user');
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
          }, 2000);
        }
      } else if (error.response?.status === 404) {
        notify({
          title: 'Listing Not Found',
          body: 'The requested listing could not be found.',
          color: 'red',
          duration: 3000
        });
      } else {
        notify({
          title: 'Error',
          body: 'Failed to load listing details. Please try again.',
          color: 'red',
          duration: 3000
        });
      }
    }
  }

  async function checkAuth() {
    try {
      // First check GlobalStore authentication state
      console.log('🔍 Auth Check - GlobalStore isAuthenticated:', isAuthenticated);
      console.log('🔍 Auth Check - GlobalStore authUser:', !!authUser);

      if (isAuthenticated && authUser) {
        console.log('✅ User is authenticated via GlobalStore');
        return true;
      }

      // Fallback: Check localStorage for authentication data
      const newToken = localStorage.getItem('veyu_access_token');
      const oldAuthUser = localStorage.getItem('veyu-auth-user');
      const legacyToken = localStorage.getItem('access_token') || localStorage.getItem('token');
      const userData = localStorage.getItem('veyu_user_data') ||
        localStorage.getItem('user_data');

      console.log('🔍 Auth Check - All localStorage keys:', Object.keys(localStorage));
      console.log('🔍 Auth Check - New token:', newToken ? `${newToken.substring(0, 20)}...` : 'null');
      console.log('🔍 Auth Check - Old auth user:', oldAuthUser ? 'exists' : 'null');
      console.log('🔍 Auth Check - Legacy token:', legacyToken ? `${legacyToken.substring(0, 20)}...` : 'null');
      console.log('� Auth Checkh - User data:', userData ? 'exists' : 'null');

      // Parse old auth user to check for token
      let oldAuthToken = null;
      if (oldAuthUser) {
        try {
          const authData = JSON.parse(oldAuthUser);
          oldAuthToken = authData.token || authData.api_token || authData.access_token;
          console.log('🔍 Auth Check - Token from old auth:', oldAuthToken ? `${oldAuthToken.substring(0, 20)}...` : 'null');
        } catch (e) {
          console.log('🔍 Auth Check - Could not parse old auth user');
        }
      }

      // Check if user is authenticated in any way
      const hasAnyAuth = !!(newToken || legacyToken || oldAuthToken || (oldAuthUser && userData));

      console.log('🔍 Auth Check - Final result:', hasAnyAuth);

      if (hasAnyAuth) {
        console.log('✅ User is authenticated via localStorage');
        return true;
      }

      console.log('❌ No authentication found');
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }

  async function addToCart() {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
      notify({
        title: 'Login Required',
        body: 'Please log in to add items to your cart.',
        color: 'orange',
        duration: 3000,
        onClose: () => {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      console.log('🛒 Add to Cart - Listing ID:', listingId);
      console.log('🛒 Add to Cart - API endpoint: /accounts/cart/');

      const payload = {
        action: 'add-to-cart',
        listing_id: listingId
      };
      
      console.log('🛒 Payload being sent:', payload);
      console.log('🛒 Payload JSON:', JSON.stringify(payload));

      const res = await axios.post(`/accounts/cart/`, payload);

      console.log('🛒 Add to Cart - Response:', res);

      if (res.status === 200 || res.status === 201) {
        // Update cart count in global state or local storage
        const cartCount = localStorage.getItem('cartCount') || 0;
        localStorage.setItem('cartCount', parseInt(cartCount) + 1);

        // Dispatch event to update cart count in other components
        window.dispatchEvent(new Event('cartUpdated'));

        notify({
          title: 'Added to Cart',
          body: `${listing?.title || 'Item'} was added to your cart!`,
          color: 'green',
          duration: 3000,
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);

      let errorMessage = 'Failed to add item to cart';
      let shouldRetry = false;

      if (error.response) {
        // Handle specific error messages from the server
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Optionally clear invalid token
          localStorage.removeItem('token');
        } else if (error.response.status === 400) {
          console.log('🛒 400 Error Details:', error.response.data);
          errorMessage = error.response.data?.message || error.response.data?.error || 'Invalid request. Please check your input.';
        } else if (error.response.status === 404) {
          errorMessage = 'Item not found or no longer available';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
          shouldRetry = true;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
        shouldRetry = true;
      }

      notify({
        title: 'Error',
        body: errorMessage,
        color: 'red',
        duration: 5000,
        position: 'top-right',
        actions: shouldRetry ? [
          {
            label: 'Retry',
            onClick: () => addToCart()
          }
        ] : []
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    notify({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      body: `${listing?.title} ${isFavorited ? 'removed from' : 'added to'} your favorites!`
    });
  };

  const shareVehicle = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this ${listing?.vehicle?.name} on Veyu`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify({
        title: 'Link copied!',
        body: 'Vehicle link copied to clipboard'
      });
    }
  };

  function init() {
    setLoadingState(true);
    getData();
    setTimeout(() => setLoadingState(false), 2500);
  }

  useEffect(() => {
    init();
  }, [listingId]);

  if (loading) {
    return <ListingDetailSkeleton />
  }

  return (
    <Container display={'block'} w={'100%'} maxW={'container.xl'} py={'2rem'}>
      <LocationBreadcrumb label={listing?.title} />

      {/* Header Section */}
      <Box my={6}>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box flex={1}>
            <Heading size={'xl'} color="gray.800" mb={2}>
              {listing?.title}
            </Heading>
            <HStack spacing={4} mb={3} flexWrap="wrap">
              <HStack spacing={1}>
                <Icon as={MdLocationOn} color="#F4A950" />
                <Text color="gray.600" fontSize="md">
                  {listing?.vehicle?.dealer?.location}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaEye} color="gray.500" />
                <Text color="gray.600" fontSize="sm">
                  {listing?.total_views || 0} views
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={BsCalendar3} color="gray.500" />
                <Text color="gray.600" fontSize="sm">
                  Listed {getTimeAgo(listing?.date_listed)}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaStar} color={listing?.total_reviews > 0 ? "#F4A950" : "gray.300"} />
                <Text color="gray.600" fontSize="sm">
                  {listing?.average_rating?.toFixed(1) || '0.0'} ({listing?.total_reviews || 0} {listing?.total_reviews === 1 ? 'review' : 'reviews'})
                </Text>
              </HStack>
            </HStack>

            {/* Vehicle Badges */}
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme="green" variant="solid" px={3} py={1}>
                <Icon as={MdVerified} mr={1} />
                Verified
              </Badge>
              <Badge colorScheme="blue" variant="outline" px={3} py={1}>
                {listing?.vehicle?.condition}
              </Badge>
              <Badge colorScheme="purple" variant="outline" px={3} py={1}>
                {listing?.vehicle?.type}
              </Badge>
            </HStack>
          </Box>

          {/* Action Buttons */}
          <HStack spacing={2}>
            <Tooltip label={isFavorited ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                icon={<FaHeart />}
                colorScheme={isFavorited ? "red" : "gray"}
                variant={isFavorited ? "solid" : "outline"}
                onClick={toggleFavorite}
                size="lg"
              />
            </Tooltip>
            <Tooltip label="Share vehicle">
              <IconButton
                icon={<FaShare />}
                colorScheme="gray"
                variant="outline"
                onClick={shareVehicle}
                size="lg"
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} my={6}>
        {/* Left Column - Images and Details */}
        <GridItem>
          {/* Image Carousel */}
          <Box mb={6}>
            <ImageCarousel
              w={'100%'}
              height={{ base: '300px', md: '400px', lg: '450px' }}
              images={listing?.vehicle?.images}
            />
          </Box>

          {/* Vehicle Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={MdSpeed} size="24px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.mileage ? `${commaInt(listing.vehicle.mileage)} mi` : "0 mi"}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Miles</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={BsGearFill} size="20px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.transmission || 'Manual'}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Transmission</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={MdLocalGasStation} size="20px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.fuel_system || 'Petrol'}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Fuel Type</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={BsCalendar3} size="20px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.year || new Date().getFullYear()}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Year</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </GridItem>

        {/* Right Column - Purchase Card */}
        <GridItem>
          <Card
            bg={bgColor}
            border="2px"
            borderColor="#F4A950"
            borderRadius="xl"
            position="sticky"
            top="20px"
            shadow="xl"
          >
            <CardBody p={6}>
              {/* Dealer Info */}
              <LinkBox mb={6}>
                <LinkOverlay as={Link} to={`/dealership/${listing?.vehicle?.dealer?.uuid}`}>
                  <Flex gap={3} align="center" p={4} bg="gray.50" borderRadius="lg">
                    <Avatar
                      name={listing?.vehicle?.dealer?.business_name}
                      src={listing?.vehicle?.dealer?.logo}
                      size="md"
                    />
                    <Box flex={1}>
                      <Heading size={'sm'} color="gray.800">
                        {listing?.vehicle?.dealer?.business_name}
                      </Heading>
                      <HStack spacing={1} mt={1}>
                        <Icon as={MdLocationOn} color="gray.500" size="14px" />
                        <Text fontSize={'sm'} color="gray.600">
                          {getDisplayValue(listing?.vehicle?.dealer?.location, 'location')}
                        </Text>
                      </HStack>
                      <HStack spacing={1} mt={1}>
                        <Icon as={FaStar} color={listing?.total_reviews > 0 ? "#F4A950" : "gray.300"} size="14px" />
                        <Text fontSize={'sm'} color="gray.600">
                          {listing?.average_rating?.toFixed(1) || '0.0'} ({listing?.total_reviews || 0} {listing?.total_reviews === 1 ? 'review' : 'reviews'})
                        </Text>
                      </HStack>
                    </Box>
                    <Icon as={MdVerified} color="green.500" size="20px" />
                  </Flex>
                </LinkOverlay>
              </LinkBox>

              {/* Price Section */}
              <Box mb={6}>
                <Flex alignItems="baseline" gap={2} mb={2}>
                  <Heading size={'2xl'} color="#F4A950">
                    {formatCurrency(listing?.price, listing?.currency)}
                  </Heading>
                  <Text color="gray.500" textDecoration="line-through" fontSize="lg">
                    {formatCurrency(listing?.price * 1.15, listing?.currency)}
                  </Text>
                </Flex>

                <Alert status="info" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box fontSize="sm">
                    <Text fontWeight="semibold">Price includes:</Text>
                    <Text>• Documentation fees</Text>
                    <Text>• Basic inspection</Text>
                    <Text>• 30-day warranty</Text>
                  </Box>
                </Alert>

                <Tag
                  as={Flex}
                  alignItems="center"
                  gap={2}
                  bg="orange.50"
                  color="orange.700"
                  p={2}
                  borderRadius="md"
                >
                  <Icon as={HiMiniReceiptPercent} />
                  <Text fontSize="sm">+0.5% processing fee applies</Text>
                </Tag>
              </Box>

              <Divider mb={6} />

              {/* Action Buttons */}
              <VStack spacing={3}>
                {isOwner ? (
                    <Button
                        onClick={() => navigate(`/dashboard/inventory/edit/${listing?.uuid || listing?.id}`)}
                        bg={'blue.500'}
                        color="white"
                        size="lg"
                        w={'100%'}
                        _hover={{ bg: 'blue.600' }}
                        leftIcon={<FaEdit />}
                    >
                        Edit Listing
                    </Button>
                ) : (
                    <>
                        <Button
                          onClick={async (e) => {
                            e.preventDefault();
                            const isAuthenticated = await checkAuth();
                            if (!isAuthenticated) {
                              notify({
                                title: 'Login Required',
                                body: 'Please log in to proceed to checkout',
                                color: 'orange',
                                duration: 3000,
                              });
                              setTimeout(() => {
                                navigate(`/login?next=${encodeURIComponent(`/checkout/pay?listingId=${listingId}`)}`);
                              }, 1000);
                              return;
                            }
                            console.log('🔍 Buy Now - Redirecting to checkout with listingId:', listingId);
                            const checkoutUrl = `/checkout/pay?listingId=${listingId}`;
                            console.log('🔍 Buy Now - Checkout URL:', checkoutUrl);
                            navigate(checkoutUrl);
                          }}
                          bg={'#F4A950'}
                          color="white"
                          size="lg"
                          w={'100%'}
                          _hover={{ bg: '#E09940' }}
                          leftIcon={<FaCheckCircle />}
                        >
                          Buy Now
                        </Button>
        
                        <Flex gap={2} w="100%">
                          <Button
                            variant="outline"
                            colorScheme="orange"
                            flex={1}
                            leftIcon={isAddingToCart ? <Spinner size="sm" /> : <FaCartPlus />}
                            onClick={addToCart}
                            isLoading={isAddingToCart}
                            loadingText="Adding..."
                            isDisabled={isAddingToCart}
                          >
                            Add to Cart
                          </Button>
                          <Button
                            onClick={() => setPopupState(true)}
                            variant={'outline'}
                            colorScheme="blue"
                            flex={1}
                            leftIcon={<HiPhone />}
                          >
                            Message
                          </Button>
                        </Flex>
                    </>
                )}
              </VStack>

              {/* Trust Indicators */}
              <VStack spacing={3} mt={6} pt={6} borderTop="1px" borderColor={borderColor}>
                <HStack spacing={2} w="100%">
                  <Icon as={HiShieldCheck} color="green.500" />
                  <Text fontSize="sm" color="gray.600">Secure payment</Text>
                </HStack>
                
                <HStack spacing={2} w="100%">
                  <Icon as={HiClock} color="orange.500" />
                  <Text fontSize="sm" color="gray.600">14-day return policy</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <ChatPopup
        isOpen={showPopup}
        onClose={() => setPopupState(false)}
        recipient_type="dealer"
        recipient_id={listing?.vehicle?.dealer?.uuid}
        vehicleDetails={{
          listing_id: listingId,
          title: listing?.title,
          price: listing?.price,
          year: listing?.vehicle?.year,
          make: listing?.vehicle?.make,
          model: listing?.vehicle?.model,
          mileage: listing?.vehicle?.mileage,
          transmission: listing?.vehicle?.transmission,
          fuel_system: listing?.vehicle?.fuel_system,
          image: listing?.vehicle?.images?.[0]?.url,
          url: window.location.href
        }}
      />

      {/* Detailed Information Tabs */}
      <Box my={8}>
        <Tabs variant="enclosed" colorScheme="orange">
          <TabList>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Overview</Tab>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Specifications</Tab>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Performance</Tab>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Description</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Basic Information</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between">
                        <Text color="gray.600">Condition:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.condition}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Mileage:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.mileage || "0"} miles</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Color:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.color, 'color')}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Vehicle Type:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.type, 'type')}</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Engine & Performance</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between">
                        <Text color="gray.600">Transmission:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.transmission}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Fuel Type:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.fuel_system}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Engine Size:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.engine_size, 'engine_size')}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Power:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.power, 'power')}</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Features & Comfort</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between">
                        <Text color="gray.600">Doors:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.doors, 'doors')}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Seats:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.seats, 'seats')}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Drivetrain:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.drivetrain, 'drivetrain')}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Custom Duty:</Text>
                        <Badge colorScheme={listing?.vehicle?.custom_duty ? "green" : "red"}>
                          {listing?.vehicle?.custom_duty ? 'Paid' : 'Not Paid'}
                        </Badge>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Specifications Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Technical Specifications</Heading>
                    <List spacing={3}>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Engine Size:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.engine_size, 'engine_size')}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Transmission:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.transmission}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Fuel System:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.fuel_system}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Drivetrain:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.drivetrain, 'drivetrain')}</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Dimensions & Capacity</Heading>
                    <List spacing={3}>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Doors:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.doors, 'doors')}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Seats:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.seats, 'seats')}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Color:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.color, 'color')}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Vehicle Type:</Text>
                        <Text fontWeight="semibold">{getDisplayValue(listing?.vehicle?.type, 'type')}</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Performance Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card bg={bgColor} border="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <Icon as={MdSpeed} size="40px" color="#F4A950" mb={3} />
                    <Stat>
                      <StatNumber fontSize="2xl" color="#F4A950">
                        {getDisplayValue(listing?.vehicle?.top_speed, 'top_speed')}
                      </StatNumber>
                      <StatLabel>Top Speed</StatLabel>
                      <StatHelpText>Maximum velocity</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <Icon as={BsGearFill} size="32px" color="#F4A950" mb={3} />
                    <Stat>
                      <StatNumber fontSize="2xl" color="#F4A950">
                        {getDisplayValue(listing?.vehicle?.horse_power, 'horse_power')}
                      </StatNumber>
                      <StatLabel>Horsepower</StatLabel>
                      <StatHelpText>Engine power output</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <Icon as={MdLocalGasStation} size="32px" color="#F4A950" mb={3} />
                    <Stat>
                      <StatNumber fontSize="2xl" color="#F4A950">
                        {listing?.vehicle?.mileage || "0"}
                      </StatNumber>
                      <StatLabel>Mileage</StatLabel>
                      <StatHelpText>Total miles driven</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Description Tab */}
            <TabPanel px={0}>
              <Card bg={bgColor} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Heading size="sm" mb={4} color="#F4A950">Seller Notes</Heading>
                  <Box
                    dangerouslySetInnerHTML={{ __html: listing?.notes || "No additional information provided by the seller." }}
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    minH="200px"
                  />
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <WhyBuyOnVeyu />

      {/* Recommended Vehicles Section */}
      <Box my={12}>
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={3} color="gray.800">
              You Might Also Like
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Similar vehicles that match your preferences
            </Text>
          </Box>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={6}
            w="100%"
            placeItems="center"
          >
            {recommended && recommended?.map((listing, idx) =>
              <ListingItemCard
                listing={listing}
                key={idx}
                w="100%"
                maxW={'320px'}
              />
            )}
          </SimpleGrid>

          {recommended?.length === 0 && (
            <Card bg={bgColor} border="1px" borderColor={borderColor} w="100%" maxW="400px">
              <CardBody textAlign="center" py={8}>
                <Icon as={FaEye} size="40px" color="gray.400" mb={4} />
                <Text color="gray.600" fontSize="lg" mb={2}>No recommendations yet</Text>
                <Text color="gray.500" fontSize="sm">
                  Check back later for similar vehicles
                </Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Container>
  )
}


const FeatureItem = ({ icon, text, description }) => (
  <Card bg="white" border="1px" borderColor="gray.200" _hover={{ shadow: "md", borderColor: "#F4A950" }} transition="all 0.2s">
    <CardBody textAlign="center" py={6}>
      <Flex w="60px" h="60px" borderRadius="full" bg="#FFF7ED" alignItems="center" justifyContent="center" mx="auto" mb={4}>
        {icon}
      </Flex>
      <Text fontWeight="semibold" fontSize="md" mb={2}>
        {text}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {description}
      </Text>
    </CardBody>
  </Card>
)

const WhyBuyOnVeyu = () => {
  return (
    <Box py={12} px={4} mb={6} bg="gray.50" borderRadius="xl">
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4} color="gray.800">
              Why buy on Veyu?
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
              Experience the future of vehicle purchasing with our secure, transparent, and customer-focused platform
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
            <FeatureItem
              icon={<Icon as={HiShieldCheck} size="24px" color="#F4A950" />}
              text="Secure Payments"
              description="Protected transactions with escrow service and fraud protection"
            />
            <FeatureItem
              icon={<Icon as={HiTruck} size="24px" color="#F4A950" />}
              text="Free Delivery"
              description="Complimentary home delivery for all verified vehicles"
            />
            <FeatureItem
              icon={<Icon as={MdVerified} size="24px" color="#F4A950" />}
              text="Verified Vehicles"
              description="Every vehicle undergoes thorough inspection and verification"
            />
            <FeatureItem
              icon={<Icon as={HiClock} size="24px" color="#F4A950" />}
              text="14-Day Returns"
              description="Not satisfied? Return within 14 days for full refund"
            />
          </SimpleGrid>

          {/* Contact Support Card */}
          <Card
            bg="white"
            border="2px"
            borderColor="#F4A950"
            borderRadius="xl"
            shadow="lg"
            maxW="400px"
            w="100%"
          >
            <CardBody p={6}>
              <Flex align="center" gap={4}>
                <Box flex={1}>
                  <Heading size="md" mb={2} color="gray.800">
                    Need Help?
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Our sales team is here to assist you with any questions
                  </Text>
                  <Button
                    bg="#F4A950"
                    color="white"
                    size="md"
                    borderRadius="md"
                    _hover={{ bg: "#E09940" }}
                    leftIcon={<Icon as={HiPhone} />}
                    w="100%"
                  >
                    Contact Sales
                  </Button>
                </Box>
                <Box>
                  <Flex
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    bg="#FFF7ED"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={HiPhone} size="32px" color="#F4A950" />
                  </Flex>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}



export default BuyDetail;