import { useContext, useEffect, useState } from "react";
import { GlobalStore } from "../../../App";
import { objectifyJSON } from "../../../utils";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Flex, Text, Avatar, Badge, Button, SimpleGrid, VStack, HStack, Heading,
  useColorModeValue, Card, CardBody, CardHeader, Icon, Stat, StatLabel, StatNumber,
  Tabs, TabList, TabPanels, Tab, TabPanel, Alert, AlertIcon, Input, Textarea,
  Collapse, useDisclosure, IconButton, Tooltip, useToast, Divider, Progress
} from '@chakra-ui/react'
import {
  ChevronDown, ChevronUp, MapPin, Star, Shield, MessageCircle, Phone, Calendar,
  Clock, Award, CheckCircle, Wrench, DollarSign, Users, Heart, Share2
} from 'lucide-react'
import { LocationBreadcrumb, ReviewCard, RatingCard } from '../../../components';
import { ChatPopup } from "../../../components/chat";
import { MapComponent, CustomPlacesAutocomplete } from "../../../components/maps";
import { CashMoneyIcon, TopRatedBadgeIcon } from "../../../components/icons";
import { ListingDetailSkeleton } from "../../../components/loaders";

const ServiceAccordion = ({ service, ...props }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      mb={4}
      _hover={{ shadow: "md", borderColor: "#F4A950" }}
      transition="all 0.2s"
    >
      <CardBody p={4}>
        <Flex justify="space-between" align="center">
          <Box flex={1}>
            <Heading size="md" mb={2} color="gray.800">
              {service?.service}
            </Heading>
            <HStack spacing={4} mb={2}>
              <HStack spacing={1}>
                <Icon as={DollarSign} color="#F4A950" boxSize={4} />
                <Text fontWeight="bold" color="#F4A950">
                  {service?.charge > 0 
                    ? `₦${parseInt(service?.charge).toLocaleString()}`
                    : "Free consultation"
                  }
                </Text>
              </HStack>
              <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                {service?.charge_rate || 'Fixed'} rate
              </Badge>
            </HStack>
          </Box>
          <IconButton
            aria-label="Toggle description"
            icon={isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            onClick={onToggle}
            variant="ghost"
            colorScheme="orange"
            size="lg"
          />
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
            <Text color="gray.700" lineHeight="1.6">
              {service?.description || 'Professional service with quality guarantee. Contact for detailed information about this service.'}
            </Text>
          </Box>
        </Collapse>
      </CardBody>
    </Card>
  );
};

export const MechanicDetailPage = ({ }) => {
  const [mechanic, setMechanic] = useState(null);
  const { mechId } = useParams();
  const [loading, setLoading] = useState(true);
  const [showPopup, setPopupState] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const { axios, authUser, commaInt, notify } = useContext(GlobalStore);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const redirect = useNavigate();
  const toast = useToast();

  function init() {
    setLoading(true);
    getData();
    setTimeout(() => setLoading(false), 2500);
  }

  function reverseGeocode(lat, lng) {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const place = results[0].address_components.find(addr => 
          addr.types.includes("administrative_area_level_2")
        );
        const formattedAddress = place?.long_name || "Current Location";
        setLocationName(formattedAddress);
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  }

  async function getData() {
    try {
      const res = await axios.get(`/mechanics/${mechId}`);
      const data = objectifyJSON(res.data);
      setMechanic(data?.data);
    } catch (error) {
      console.error("Error fetching mechanic:", error);
      notify({
        title: "Error",
        body: "Failed to load mechanic details",
        color: 'red'
      });
    }
  }

  const onLoad = (auto) => setAutocomplete(auto);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      description: `${mechanic?.business_name || mechanic?.user?.name} ${isFavorited ? 'removed from' : 'added to'} your favorites!`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: mechanic?.business_name || mechanic?.user?.name,
        text: `Check out this mechanic on Veyu`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Profile link copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  function gotoBookingPage() {
    if (address && address.trim()) {
      if (location && locationName.trim()) {
        const { lat, lng } = location;
        return redirect(`/mechanics/book/${mechId}/?lat=${lat}&lng=${lng}&address=${address}`);
      }
      return notify({
        title: "Error",
        body: 'Please select a location from the dropdown',
        color: 'red',
      });
    }
    return notify({
      title: "Error",
      body: 'Please enter your address',
      color: 'red',
    });
  }

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng, name: place.name });
        setLocationName(place.formatted_address || place.name);
      }
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: "Current Location"
          });
          reverseGeocode(position.coords.latitude, position.coords.longitude);
          setLocationName("Current Location");
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (!mechanic) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          Mechanic not found or failed to load.
        </Alert>
      </Container>
    );
  }

  const rating = mechanic?.rating || 4.5;
  const reviewCount = mechanic?.reviews?.length || 0;

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={6}>
        <LocationBreadcrumb label={mechanic?.business_name || mechanic?.user?.name} />

        {/* Header Section */}
        <Box my={6}>
          <Flex justify="space-between" align="flex-start" mb={6}>
            <Box flex={1}>
              <Flex gap={6} align="flex-start">
                <Avatar 
                  size="2xl" 
                  name={mechanic?.business_name || mechanic?.user?.name} 
                  src={mechanic?.logo}
                  border="4px solid"
                  borderColor="#F4A950"
                />
                
                <Box flex={1}>
                  <Heading size="2xl" color="gray.800" mb={3}>
                    {mechanic?.business_name || mechanic?.user?.name}
                  </Heading>
                  
                  <Text color="gray.600" fontSize="lg" mb={4}>
                    {mechanic?.headline || "Professional automotive service provider"}
                  </Text>

                  <HStack spacing={4} mb={4} flexWrap="wrap">
                    <HStack spacing={1}>
                      <Icon as={Star} color="#F4A950" fill="#F4A950" />
                      <Text fontWeight="bold" fontSize="lg">
                        {rating.toFixed(1)}
                      </Text>
                      <Text color="gray.600">
                        ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                      </Text>
                    </HStack>
                    
                    <Badge 
                      bg="#F4A950" 
                      color="white"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <TopRatedBadgeIcon viewBox="0 0 27 28" w="16px" h="16px" />
                      {mechanic?.level || 'Professional'}
                    </Badge>

                    <Badge colorScheme="green" variant="solid" px={4} py={2} borderRadius="full">
                      <Icon as={Shield} mr={1} boxSize={3} />
                      Verified
                    </Badge>
                  </HStack>

                  <HStack spacing={2} color="gray.600" mb={4}>
                    <Icon as={MapPin} color="#F4A950" />
                    <Text fontSize="md">
                      {mechanic?.location || 'Location not specified'}
                    </Text>
                    <Text color="gray.500">
                      • Available 24/7
                    </Text>
                  </HStack>
                </Box>
              </Flex>
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
              <Tooltip label="Share profile">
                <IconButton
                  icon={<Share2 />}
                  colorScheme="gray"
                  variant="outline"
                  onClick={shareProfile}
                  size="lg"
                  bg="white"
                  _hover={{ bg: "gray.50" }}
                />
              </Tooltip>
            </HStack>
          </Flex>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={Wrench} size="24px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {mechanic?.services?.length || 0}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Services</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={Users} size="24px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {mechanic?.completed_jobs || '100+'}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Jobs Done</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={Clock} size="24px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {mechanic?.response_time || '< 1hr'}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Response</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={Award} size="24px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {new Date().getFullYear() - 2018}+
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Years Exp.</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        <Flex gap={8} direction={{ base: 'column', lg: 'row' }} alignItems="flex-start">
          {/* Main Content */}
          <Box flex={1}>
            {/* Detailed Information Tabs */}
            <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl" mb={8}>
              <CardBody p={0}>
                <Tabs variant="enclosed" colorScheme="orange">
                  <TabList>
                    <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>About</Tab>
                    <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Services</Tab>
                    <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Reviews</Tab>
                    <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Gallery</Tab>
                  </TabList>

                  <TabPanels>
                    {/* About Tab */}
                    <TabPanel>
                      <VStack align="stretch" spacing={6}>
                        <Box>
                          <Heading size="md" mb={4} color="#F4A950">
                            About {mechanic?.business_type === 'business' ? 'Our Business' : 'Me'}
                          </Heading>
                          <Text color="gray.700" lineHeight="1.6" fontSize="md">
                            {mechanic?.about || "Professional automotive service provider with years of experience. We specialize in quality repairs and maintenance services for all vehicle types."}
                          </Text>
                        </Box>

                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box fontSize="sm">
                            <Text fontWeight="semibold">What's included:</Text>
                            <Text>• Professional diagnosis and consultation</Text>
                            <Text>• Quality parts and materials</Text>
                            <Text>• Service warranty and guarantee</Text>
                            <Text>• 24/7 customer support</Text>
                          </Box>
                        </Alert>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card bg="gray.50" border="1px" borderColor={borderColor}>
                            <CardBody>
                              <Heading size="sm" mb={3} color="#F4A950">Specializations</Heading>
                              <VStack align="stretch" spacing={2}>
                                <Text fontSize="sm">• Engine Repair & Maintenance</Text>
                                <Text fontSize="sm">• Brake System Service</Text>
                                <Text fontSize="sm">• Electrical Diagnostics</Text>
                                <Text fontSize="sm">• AC & Cooling System</Text>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card bg="gray.50" border="1px" borderColor={borderColor}>
                            <CardBody>
                              <Heading size="sm" mb={3} color="#F4A950">Certifications</Heading>
                              <VStack align="stretch" spacing={2}>
                                <Text fontSize="sm">• ASE Certified Technician</Text>
                                <Text fontSize="sm">• Manufacturer Training</Text>
                                <Text fontSize="sm">• Safety Compliance</Text>
                                <Text fontSize="sm">• Insurance Coverage</Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </VStack>
                    </TabPanel>

                    {/* Services Tab */}
                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md" color="#F4A950">Available Services</Heading>
                        {mechanic?.services?.length > 0 ? (
                          mechanic.services.map((service) => (
                            <ServiceAccordion key={service?.uuid} service={service} />
                          ))
                        ) : (
                          <Card bg="gray.50" border="1px" borderColor={borderColor}>
                            <CardBody textAlign="center" py={8}>
                              <Icon as={Wrench} boxSize={12} color="gray.300" mb={4} />
                              <Text color="gray.600">No services listed yet</Text>
                              <Text fontSize="sm" color="gray.500">Contact the mechanic for available services</Text>
                            </CardBody>
                          </Card>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Reviews Tab */}
                    <TabPanel>
                      <VStack align="stretch" spacing={6}>
                        <RatingCard
                          avg_rating={rating}
                          ratings={mechanic?.ratings || []}
                        />

                        <VStack align="stretch" spacing={4}>
                          {mechanic?.reviews?.length > 0 ? (
                            mechanic.reviews.map((review, index) => (
                              <ReviewCard key={index} review={review} />
                            ))
                          ) : (
                            <Card bg="gray.50" border="1px" borderColor={borderColor}>
                              <CardBody textAlign="center" py={8}>
                                <Icon as={MessageCircle} boxSize={12} color="gray.300" mb={4} />
                                <Text color="gray.600">No reviews yet</Text>
                                <Text fontSize="sm" color="gray.500">Be the first to review this mechanic!</Text>
                              </CardBody>
                            </Card>
                          )}
                        </VStack>
                      </VStack>
                    </TabPanel>

                    {/* Gallery Tab */}
                    <TabPanel>
                      <VStack spacing={4}>
                        <Heading size="md" color="#F4A950">Work Gallery</Heading>
                        <Card bg="gray.50" border="1px" borderColor={borderColor}>
                          <CardBody textAlign="center" py={8}>
                            <Icon as={Camera} boxSize={12} color="gray.300" mb={4} />
                            <Text color="gray.600">Gallery coming soon</Text>
                            <Text fontSize="sm" color="gray.500">Photos of completed work will be displayed here</Text>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </Box>

          {/* Booking Sidebar */}
          <Box w={{ base: 'full', lg: '400px' }}>
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
                <Heading size="lg" color="#F4A950" textAlign="center">
                  Book This Mechanic
                </Heading>
                <Text textAlign="center" color="gray.600" fontSize="sm">
                  Get professional service at your location
                </Text>
              </CardHeader>

              <CardBody p={6} pt={2}>
                <VStack spacing={4} align="stretch">
                  {/* Map */}
                  <Box borderRadius="xl" overflow="hidden" border="1px" borderColor={borderColor}>
                    <Box h="200px" position="relative">
                      <MapComponent 
                        location={location} 
                        style={{ height: "100%", width: "100%" }}
                      />
                    </Box>
                  </Box>

                  {/* Location Input */}
                  <Box>
                    <Text mb={2} fontWeight="medium" color="gray.700">
                      Select Location
                    </Text>
                    <Box
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg="gray.50"
                      borderRadius="lg"
                      p={3}
                    >
                      <CustomPlacesAutocomplete
                        onLoad={onLoad}
                        onPlaceChanged={onPlaceChanged}
                        value={locationName}
                        placeholder="Search for your location..."
                      />
                    </Box>
                  </Box>

                  {/* Address Input */}
                  <Box>
                    <Text mb={2} fontWeight="medium" color="gray.700">
                      Street Address
                    </Text>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. No. 6 Sule Drive, Abuja"
                      borderColor={borderColor}
                      bg="gray.50"
                      borderRadius="lg"
                      _focus={{ borderColor: "#F4A950", boxShadow: "0 0 0 1px #F4A950" }}
                    />
                  </Box>

                  {/* Booking Fee Info */}
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box fontSize="sm">
                      <Text fontWeight="semibold">Booking Fee: ₦5,000</Text>
                      <Text>Consultation fee (does not include service costs)</Text>
                    </Box>
                  </Alert>

                  {/* Action Buttons */}
                  <VStack spacing={3}>
                    <Button
                      onClick={gotoBookingPage}
                      bg="#F4A950"
                      color="white"
                      _hover={{ bg: "#E09940" }}
                      size="lg"
                      w="100%"
                      borderRadius="lg"
                      fontWeight="bold"
                      isDisabled={!address.trim() || !location}
                      leftIcon={<Calendar />}
                    >
                      Book Now
                    </Button>

                    <Button
                      onClick={() => setPopupState(true)}
                      variant="outline"
                      colorScheme="orange"
                      size="lg"
                      w="100%"
                      borderRadius="lg"
                      leftIcon={<MessageCircle />}
                    >
                      Message Mechanic
                    </Button>

                    <Button
                      variant="ghost"
                      colorScheme="orange"
                      size="md"
                      w="100%"
                      leftIcon={<Phone />}
                    >
                      Call Now
                    </Button>
                  </VStack>

                  {/* Trust Indicators */}
                  <VStack spacing={2} pt={4} borderTop="1px" borderColor={borderColor}>
                    <HStack spacing={2} w="100%">
                      <Icon as={CheckCircle} color="green.500" />
                      <Text fontSize="sm" color="gray.600">Verified professional</Text>
                    </HStack>
                    <HStack spacing={2} w="100%">
                      <Icon as={Shield} color="blue.500" />
                      <Text fontSize="sm" color="gray.600">Insured & bonded</Text>
                    </HStack>
                    <HStack spacing={2} w="100%">
                      <Icon as={Award} color="#F4A950" />
                      <Text fontSize="sm" color="gray.600">Quality guarantee</Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Container>

      <ChatPopup
        isOpen={showPopup}
        onClose={() => setPopupState(false)}
        recipient_type="mechanic" 
        recipient_id={mechanic?.uuid}
      />
    </Box>
  );
};

export default MechanicDetailPage;