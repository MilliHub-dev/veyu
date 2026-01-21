import { Fragment, useContext, useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { GlobalStore } from "../../../App";
import { LocationBreadcrumb, DatePicker, ReviewCard, RatingCard, ListingItemCard } from "../../../components";
import { ListingDetailSkeleton } from "../../../components/loaders";
import { BusinessLogo } from "../../../components/BusinessLogo";
import { 
  ChevronLeft, ChevronRight, Star, Users, MapPin, Calendar,
  DoorOpen, Zap, Gauge, Key, Camera, Music, Phone, Heart, Share2,
  Smartphone, Sun, BatteryCharging, Shield, Clock, CheckCircle, MessageCircle, Edit
} from 'lucide-react'
import { objectifyJSON, formatCurrency } from "../../../utils";
import {
  Box, Container, Grid, Heading, Text, Button, HStack, VStack, Divider, List, ListItem, Stack,
  Image, Avatar, Badge, Flex, Icon, Progress, SimpleGrid, Input, Select, Switch, IconButton,
  useColorModeValue, useMediaQuery, Card, CardBody, CardHeader, Stat, StatLabel, StatNumber,
  Tabs, TabList, TabPanels, Tab, TabPanel, Alert, AlertIcon, Tooltip, useToast
} from '@chakra-ui/react'


const FeatureIcons = [
  { icon: <Key />, label: 'Keyless Entry' },
  { icon: <Camera />, label: 'Parking Camera' },
  { icon: <Music />, label: 'Car Play' },
  { icon: <Smartphone />, label: 'Android Auto' },
  { icon: <Sun />, label: 'Sun Roof' },
  { icon: <BatteryCharging />, label: 'USB-C Charging' },
  { icon: <Shield />, label: 'Lane Assist' },
  { icon: <Zap />, label: 'Wireless Charging' },
]

function FeatureCard({ feature }) {
  const iconObj = FeatureIcons.find((feat) => feat.label.toLowerCase() === feature.toLowerCase());

  return (
    <Card bg="white" border="1px" borderColor="gray.200" _hover={{ shadow: "md", borderColor: "#F4A950" }} transition="all 0.2s">
      <CardBody p={4}>
        <HStack spacing={3}>
          <Flex
            w="50px"
            h="50px"
            bg="#FFF7ED"
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
            color="#F4A950"
          >
            {iconObj ? iconObj.icon : <Text>❓</Text>}
          </Flex>
          <Text fontSize="md" fontWeight="medium">{feature}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
}

// Enhanced Image Carousel Component
function ImageCarousel({ images, ...props }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageList, setImageList] = useState([])
  const [loading, setLoadingState] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoadingState(false), 500);
    if (images){
      const normalized = (Array.isArray(images) ? images : []).map(img => {
           if (typeof img === 'string') return { url: img };
           if (!img) return { url: '' };
           return { url: img.url || img.file || img.image || img.src || '' };
      }).filter(img => img.url);
      setImageList(normalized)
    }
  }, [images])

  if(loading){
    return (
      <Box w="full" h="500px" bg="gray.100" borderRadius="2xl" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={3} color="gray.400">
          <Box fontSize="4xl">🚗</Box>
          <Text>Loading images...</Text>
        </VStack>
      </Box>
    )
  }

  if (!imageList || imageList.length === 0) {
    return (
      <Box w="full" h="500px" bg="gray.100" borderRadius="2xl" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={3} color="gray.400">
          <Box fontSize="4xl">🚗</Box>
          <Text>No images available</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box position="relative" borderRadius="2xl" overflow="hidden" boxShadow="2xl">
      <Image
        src={imageList[currentImage]?.url}
        alt="Vehicle"
        w="full"
        h={{ base: "300px", md: "500px" }}
        objectFit="cover"
      />
      
      {/* Image Counter */}
      <Badge
        position="absolute"
        top={4}
        right={4}
        bg="blackAlpha.800"
        color="white"
        px={4}
        py={2}
        borderRadius="full"
        fontSize="sm"
        fontWeight="bold"
      >
        {currentImage + 1} / {imageList?.length}
      </Badge>

      {/* Navigation Arrows */}
      {imageList?.length > 1 && (
        <>
          <IconButton
            icon={<ChevronLeft size="24px" />}
            position="absolute"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            onClick={() => setCurrentImage((prev) => (prev > 0 ? prev - 1 : imageList?.length - 1))}
            bg="whiteAlpha.900"
            color="gray.800"
            borderRadius="full"
            size="lg"
            _hover={{ bg: "white", transform: "translateY(-50%) scale(1.1)" }}
            boxShadow="lg"
            aria-label="Previous image"
          />
          <IconButton
            icon={<ChevronRight size="24px" />}
            position="absolute"
            right={4}
            top="50%"
            transform="translateY(-50%)"
            onClick={() => setCurrentImage((prev) => (prev < imageList?.length - 1 ? prev + 1 : 0))}
            bg="whiteAlpha.900"
            color="gray.800"
            borderRadius="full"
            size="lg"
            _hover={{ bg: "white", transform: "translateY(-50%) scale(1.1)" }}
            boxShadow="lg"
            aria-label="Next image"
          />
        </>
      )}

      {/* Thumbnail Navigation */}
      {imageList?.length > 1 && (
        <HStack
          position="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          spacing={2}
          bg="blackAlpha.600"
          p={3}
          borderRadius="full"
        >
          {imageList?.map((_, index) => (
            <Box
              key={index}
              w={index === currentImage ? 8 : 3}
              h={3}
              borderRadius="full"
              bg={index === currentImage ? "#F4A950" : "whiteAlpha.600"}
              cursor="pointer"
              onClick={() => setCurrentImage(index)}
              transition="all 0.2s"
              _hover={{ bg: index === currentImage ? "#E09940" : "whiteAlpha.800" }}
            />
          ))}
        </HStack>
      )}
    </Box>
  )
}

export default function RentalDetails() {
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const {listingId} = useParams();
    const [reviews, setReviews] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoadingState] = useState(true);
    const [listing, setListing] = useState();
    const [isFavorited, setIsFavorited] = useState(false);
    const {authUser, axios, notify, commaInt, otherContext, setOtherContext} = useContext(GlobalStore);
    const [isMobile] = useMediaQuery('(max-width: 768px)');
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const toast = useToast();

    async function getData(){
      try{
        const res = await axios.get(`/listings/rentals/${listingId}/`);
        let data = objectifyJSON(res.data);
        if (res.status === 200){
          let listingData = data.data.listing;
          if (listingData?.vehicle?.images && Array.isArray(listingData.vehicle.images)) {
              listingData.vehicle.images = listingData.vehicle.images.map(img => 
                  typeof img === 'string' ? { url: img } : img
              );
          }
          setListing(listingData);
          setRecommended(data.data.recommended);
          let rats = [], _reviews = data.data.listing.vehicle.dealer.reviews;
          setReviews(_reviews)
          for(var i=0; i < _reviews?.length; i++){
            console.log("Rat:", _reviews[i].ratings)
            rats.push(_reviews[i].ratings);
          }
          setRatings(rats)
        }
      }catch(error){
        console.log("Error getting ratings", error)
      }
    }

    const toggleFavorite = () => {
      setIsFavorited(!isFavorited);
      toast({
        title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
        description: `${listing?.title} ${isFavorited ? 'removed from' : 'added to'} your favorites!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    };

    const shareVehicle = () => {
      if (navigator.share) {
        navigator.share({
          title: listing?.title,
          text: `Check out this rental on Veyu`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Rental link copied to clipboard',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    function init(){
        getData();
    }

    useEffect(() => {
      init();
      setTimeout(() => setLoadingState(false), 2500)
    }, []);

    if (loading){
      return <ListingDetailSkeleton />
    }

  return (
    <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" pt={5} pb={16}>
            <LocationBreadcrumb label={listing?.title} />

            {/* Header Section */}
            <Box my={6}>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Box flex={1}>
                  <Heading size="2xl" color="gray.800" mb={3}> 
                    {listing?.title} 
                  </Heading>
                  <HStack spacing={4} mb={4}>
                    <HStack spacing={1}>
                      <Icon as={MapPin} color="#F4A950" />
                      <Text color="gray.600" fontSize="md"> 
                        {listing?.vehicle?.dealer?.location} 
                      </Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={Star} color="#F4A950" fill="#F4A950" />
                      <Text fontWeight="bold" color="gray.800">
                        {listing?.vehicle?.dealer?.rating || '4.8'}
                      </Text>
                      <Text color="gray.600" fontSize="sm"> 
                        ({reviews?.length} reviews) 
                      </Text>
                    </HStack>
                  </HStack>
                  
                  {/* Vehicle Badges */}
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="green" variant="solid" px={3} py={1}>
                      <Icon as={CheckCircle} mr={1} boxSize={3} />
                      Verified Host
                    </Badge>
                    <Badge colorScheme="blue" variant="outline" px={3} py={1}>
                      {listing?.vehicle?.condition}
                    </Badge>
                    <Badge colorScheme="purple" variant="outline" px={3} py={1}>
                      Instant Book
                    </Badge>
                  </HStack>
                </Box>
                
                {/* Action Buttons */}
                <HStack spacing={2}>
                  <Tooltip label={isFavorited ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton
                      icon={<Heart fill={isFavorited ? "#F4A950" : "none"} />}
                      colorScheme={isFavorited ? "orange" : "gray"}
                      variant={isFavorited ? "solid" : "outline"}
                      onClick={toggleFavorite}
                      size="lg"
                      bg={isFavorited ? "#F4A950" : "white"}
                      _hover={{ bg: isFavorited ? "#E09940" : "gray.50" }}
                    />
                  </Tooltip>
                  <Tooltip label="Share rental">
                    <IconButton
                      icon={<Share2 />}
                      colorScheme="gray"
                      variant="outline"
                      onClick={shareVehicle}
                      size="lg"
                      bg="white"
                      _hover={{ bg: "gray.50" }}
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </Box>

            <Grid
             templateColumns={{base: '1fr', lg: '2fr 1fr' }}
             gap={8}
             mt={8}
            >
              {/* Left Column */}
              <Box>
                {/* Image Carousel */}
                <ImageCarousel images={listing?.vehicle?.images} />

                {/* Vehicle Stats Cards */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} my={8}>
                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody textAlign="center" py={4}>
                      <Icon as={Users} size="24px" color="#F4A950" mb={2} />
                      <Stat>
                        <StatNumber fontSize="lg" fontWeight="bold">
                          {listing?.vehicle?.seats || "5"}
                        </StatNumber>
                        <StatLabel fontSize="sm" color="gray.600">Seats</StatLabel>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody textAlign="center" py={4}>
                      <Icon as={DoorOpen} size="20px" color="#F4A950" mb={2} />
                      <Stat>
                        <StatNumber fontSize="lg" fontWeight="bold">
                          {listing?.vehicle?.doors || "4"}
                        </StatNumber>
                        <StatLabel fontSize="sm" color="gray.600">Doors</StatLabel>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody textAlign="center" py={4}>
                      <Icon as={Gauge} size="20px" color="#F4A950" mb={2} />
                      <Stat>
                        <StatNumber fontSize="lg" fontWeight="bold">
                          {listing?.vehicle?.transmission || "Auto"}
                        </StatNumber>
                        <StatLabel fontSize="sm" color="gray.600">Transmission</StatLabel>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} border="1px" borderColor={borderColor}>
                    <CardBody textAlign="center" py={4}>
                      <Icon as={Zap} size="20px" color="#F4A950" mb={2} />
                      <Stat>
                        <StatNumber fontSize="lg" fontWeight="bold">
                          {listing?.vehicle?.fuel_system || "Petrol"}
                        </StatNumber>
                        <StatLabel fontSize="sm" color="gray.600">Fuel Type</StatLabel>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Detailed Information Tabs */}
                <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl" mb={8}>
                  <CardBody p={0}>
                    <Tabs variant="enclosed" colorScheme="orange">
                      <TabList>
                        <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Description</Tab>
                        <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Features</Tab>
                        <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Host Info</Tab>
                        <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Reviews</Tab>
                      </TabList>

                      <TabPanels>
                        {/* Description Tab */}
                        <TabPanel>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Heading size="md" mb={3} color="#F4A950">About this rental</Heading>
                              <Text color="gray.700" lineHeight="1.6">
                                {listing?.notes || "This vehicle is perfect for your rental needs. Clean, well-maintained, and ready for your next adventure."}
                              </Text>
                            </Box>
                            
                            <Alert status="info" borderRadius="md">
                              <AlertIcon />
                              <Box fontSize="sm">
                                <Text fontWeight="semibold">Rental includes:</Text>
                                <Text>• Full insurance coverage</Text>
                                <Text>• 24/7 roadside assistance</Text>
                                <Text>• Free cancellation up to 24 hours</Text>
                              </Box>
                            </Alert>
                          </VStack>
                        </TabPanel>

                        {/* Features Tab */}
                        <TabPanel>
                          <VStack align="stretch" spacing={4}>
                            <Heading size="md" color="#F4A950">Features & Accessories</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              {(listing?.vehicle?.features || ['Air Conditioning', 'Bluetooth', 'GPS Navigation', 'USB Charging']).map((feature, index) => (
                                <FeatureCard key={index} feature={feature} />
                              ))}
                            </SimpleGrid>
                          </VStack>
                        </TabPanel>

                        {/* Host Info Tab */}
                        <TabPanel>
                          <VStack align="stretch" spacing={6}>
                            <Card bg="gray.50" border="1px" borderColor={borderColor}>
                              <CardBody p={6}>
                                <HStack spacing={4} mb={4}>
                                  <BusinessLogo
                                    logoUrl={listing?.vehicle?.dealer?.logo}
                                    businessName={listing?.vehicle?.dealer?.business_name}
                                    size="xl"
                                    borderRadius="50%"
                                  />
                                  <Box flex={1}>
                                    <HStack mb={2}>
                                      <Heading size="lg">{listing?.vehicle?.dealer?.business_name}</Heading>
                                      <Badge colorScheme="blue">
                                        <HStack spacing={1}>
                                          <CheckCircle size={12} />
                                          <Text>VERIFIED</Text>
                                        </HStack>
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={1} mb={2}>
                                      <Icon as={Star} color="#F4A950" fill="#F4A950" />
                                      <Text fontWeight="bold">{listing?.vehicle?.dealer?.rating || '4.8'}</Text>
                                      <Text color="gray.500">({reviews?.length} review{reviews?.length !== 1 && 's'})</Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600">
                                      Joined {new Date().getFullYear() - 2} years ago
                                    </Text>
                                  </Box>
                                </HStack>
                                
                                <Text fontSize="sm" color="gray.700" mb={4}>
                                  Top rated host on Veyu with exceptional rental service and customer satisfaction.
                                </Text>
                                
                                <Button 
                                  as={Link} 
                                  to={`/dealership/${listing?.vehicle?.dealer?.uuid}`} 
                                  variant="outline" 
                                  colorScheme="orange"
                                  size="sm"
                                >
                                  View Host Profile
                                </Button>
                              </CardBody>
                            </Card>
                          </VStack>
                        </TabPanel>

                        {/* Reviews Tab */}
                        <TabPanel>
                          <VStack align="stretch" spacing={6}>
                            {/* Ratings Summary */}
                            <RatingCard
                              avg_rating={listing?.vehicle?.dealer?.rating}
                              ratings={ratings}
                            />

                            {/* Individual Reviews */}
                            <VStack align="stretch" spacing={4}>
                              {reviews?.map((review, index) => (
                                <ReviewCard key={index} review={review} />
                              ))}
                            </VStack>

                            {reviews?.length === 0 && (
                              <Card bg="gray.50" border="1px" borderColor={borderColor}>
                                <CardBody textAlign="center" py={8}>
                                  <Icon as={MessageCircle} boxSize={12} color="gray.300" mb={4} />
                                  <Text color="gray.600">No reviews yet</Text>
                                  <Text fontSize="sm" color="gray.500">Be the first to review this rental!</Text>
                                </CardBody>
                              </Card>
                            )}
                          </VStack>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </CardBody>
                </Card>

                {/* Recommended Rentals */}
                {recommended?.length > 0 && (
                  <Box>
                    <Heading size="lg" mb={6} color="gray.800">
                      Similar Rentals
                    </Heading>
                    <SimpleGrid
                      columns={{ base: 1, md: 2, lg: 3 }}
                      spacing={6}
                      placeItems="center"
                    >
                      {recommended?.map((listing, idx) => (
                        <ListingItemCard
                          listing={listing}
                          key={idx}
                          w="100%"
                          maxW="350px"
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </Box>

              {/* Right Column - Booking Form */}
              <BookingForm listing={listing} />
            </Grid>
      </Container>
    </Box>
  )
}

const BookingForm = ({ listing, ...props }) => {
  const {authUser, axios, notify, commaInt, otherContext, setOtherContext} = useContext(GlobalStore);
  const navigate = useNavigate();
  const [from, setFrom] = useState(otherContext?.rental?.from);
  const [until, setUntil] = useState(otherContext?.rental?.until);
  const [where, setLocation] = useState(otherContext?.rental?.where);
  const [needsDriver, setNeedsDriver] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Check if current user is the owner
  const isOwner = authUser?.id && (
    authUser.id === listing?.user_id || 
    authUser.id === listing?.dealer_id ||
    authUser.id === listing?.vehicle?.dealer?.user_id ||
    authUser.id === listing?.vehicle?.dealer?.uuid
  );

  if (isOwner) {
    return (
      <Box {...props}>
        <Card 
          bg={bgColor} 
          border="2px" 
          borderColor="#F4A950" 
          borderRadius="2xl" 
          position="sticky" 
          top="20px"
          shadow="2xl"
        >
          <CardHeader p={6} pb={4}>
             <Heading size="md" color="#F4A950">Manage Listing</Heading>
          </CardHeader>

          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
             <Text>You are the owner of this listing.</Text>
             <Button
                onClick={() => navigate(`/dashboard/inventory/edit/${listing?.uuid || listing?.id}`)}
                colorScheme="blue"
                width="full"
                leftIcon={<Edit size={16} />}
             >
                Edit Listing
             </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    )
  }

  const calculateDays = () => {
    if (from && until) {
      const fromDate = new Date(from);
      const untilDate = new Date(until);
      const diffTime = Math.abs(untilDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    }
    return 1;
  };

  const totalDays = calculateDays();
  const basePrice = listing?.price || 0;
  const driverFee = needsDriver ? 2000 : 0;
  const serviceFee = Math.round(basePrice * 0.05);
  const totalPrice = (basePrice * totalDays) + driverFee + serviceFee;

  return(
    <Box {...props}>
      <Card 
        bg={bgColor} 
        border="2px" 
        borderColor="#F4A950" 
        borderRadius="2xl" 
        position="sticky" 
        top="20px"
        shadow="2xl"
      >
        <CardHeader p={6} pb={4}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Heading size="2xl" color="#F4A950">
                {formatCurrency(basePrice, listing?.currency)}
              </Heading>
              <Text color="gray.600" fontSize="sm">
                per {listing?.payment_cycle || 'day'}
              </Text>
            </VStack>
            <HStack spacing={1}>
              <Icon as={Star} color="#F4A950" fill="#F4A950" />
              <Text fontWeight="bold">{listing?.vehicle?.dealer?.rating || '4.8'}</Text>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody p={6} pt={2}>
          <VStack spacing={4} align="stretch">
            {/* Date Selection */}
            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <Text mb={2} fontWeight="medium" color="gray.700">From</Text>
                <Box
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg="gray.50"
                  borderRadius="lg"
                  px={3}
                  py={2}
                >
                  <DatePicker defaultValue={from} onChange={val => setFrom(val)} />
                </Box>
              </Box>
              
              <Box>
                <Text mb={2} fontWeight="medium" color="gray.700">Until</Text>
                <Box
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg="gray.50"
                  borderRadius="lg"
                  px={3}
                  py={2}
                >
                  <DatePicker defaultValue={until} onChange={val => setUntil(val)} />
                </Box>
              </Box>
            </SimpleGrid>

            {/* Location */}
            <Box>
              <Text mb={2} fontWeight="medium" color="gray.700">Pickup Location</Text>
              <Input 
                type="text" 
                name="location" 
                onInput={e => setLocation(e.target.value)} 
                value={where} 
                placeholder="Enter pickup address" 
                borderColor={borderColor}
                bg="gray.50"
                borderRadius="lg"
                _focus={{ borderColor: "#F4A950", boxShadow: "0 0 0 1px #F4A950" }}
              />
            </Box>

            {/* Driver Option */}
            <Card bg="gray.50" border="1px" borderColor={borderColor}>
              <CardBody p={4}>
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">Need a driver?</Text>
                    <Text fontSize="sm" color="gray.600">+{formatCurrency(2000, listing?.currency)} per day</Text>
                  </VStack>
                  <Switch 
                    colorScheme="orange" 
                    isChecked={needsDriver}
                    onChange={(e) => setNeedsDriver(e.target.checked)}
                  />
                </Flex>
              </CardBody>
            </Card>

            {/* Price Breakdown */}
            <Card bg="gray.50" border="1px" borderColor={borderColor}>
              <CardBody p={4}>
                <VStack spacing={2} align="stretch">
                  <Flex justify="space-between">
                    <Text>{formatCurrency(basePrice, listing?.currency)} × {totalDays} day{totalDays !== 1 ? 's' : ''}</Text>
                    <Text>{formatCurrency(basePrice * totalDays, listing?.currency)}</Text>
                  </Flex>
                  {needsDriver && (
                    <Flex justify="space-between">
                      <Text>Driver fee</Text>
                      <Text>{formatCurrency(driverFee, listing?.currency)}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Text>Service fee</Text>
                    <Text>{formatCurrency(serviceFee, listing?.currency)}</Text>
                  </Flex>
                  <Divider />
                  <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                    <Text>Total</Text>
                    <Text color="#F4A950">{formatCurrency(totalPrice, listing?.currency)}</Text>
                  </Flex>
                </VStack>
              </CardBody>
            </Card>

            {/* Book Button */}
            <Button
              as={Link}
              to={`/checkout/?listingId=${listing?.uuid}`}
              bg="#F4A950"
              color="white"
              _hover={{ bg: "#E09940" }}
              size="lg"
              isDisabled={!where?.trim() || !from || !until}
              borderRadius="lg"
              fontWeight="bold"
              py={6}
            >
              Book Rental
            </Button>

            {/* Contact Host */}
            <Button
              variant="outline"
              colorScheme="orange"
              size="lg"
              borderRadius="lg"
              leftIcon={<Phone size={18} />}
            >
              Contact Host
            </Button>

            {/* Trust Indicators */}
            <VStack spacing={2} pt={4} borderTop="1px" borderColor={borderColor}>
              <HStack spacing={2} w="100%">
                <Icon as={CheckCircle} color="green.500" />
                <Text fontSize="sm" color="gray.600">Free cancellation</Text>
              </HStack>
              <HStack spacing={2} w="100%">
                <Icon as={Shield} color="blue.500" />
                <Text fontSize="sm" color="gray.600">Full insurance included</Text>
              </HStack>
              <HStack spacing={2} w="100%">
                <Icon as={Clock} color="orange.500" />
                <Text fontSize="sm" color="gray.600">24/7 support</Text>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}