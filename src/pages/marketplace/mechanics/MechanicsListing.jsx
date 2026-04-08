import {
  Box, Heading, Button, Container, Flex, Input, InputGroup, InputLeftElement, Select, Text,
  VStack, HStack, SimpleGrid, useColorModeValue, Card, CardBody, CardHeader, Alert, AlertIcon, Icon,
  Grid, GridItem, Stat, StatLabel, StatNumber, Badge, Tag, TagLabel, TagCloseButton,
  Wrap, WrapItem, Menu, MenuButton, MenuList, MenuItem, Spacer, Tooltip, IconButton
} from "@chakra-ui/react";
import { useContext, useEffect, useState, Fragment } from "react";
import { GlobalStore } from "../../../contexts/GlobalStore";
import { objectifyJSON, formatCurrency } from "../../../utils";
import { Link } from "react-router-dom";
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Search, Filter, SlidersHorizontal, MapPin, Wrench, Users, Clock, Star, Award, Phone, MessageCircle } from 'lucide-react';
import { MechanicListSkeleton } from "../../../components/loaders";
import { MapComponent, CustomPlacesAutocomplete } from "../../../components/maps";
import { MechanicCard } from "../../../components/MechanicCard";
import { ServiceFilter } from "../../../components/filters";

export const MechanicListPage = ({ props }) => {
  const [searching, setSearching] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState({ lat: 10, lng: 8, name: "Current Location" });
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [sort, setSort] = useState('relevance');
  const { axios, authUser, commaInt, notify, redirect } = useContext(GlobalStore);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const onLoad = (auto) => setAutocomplete(auto);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng, name: place.name });
      }
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude, name: "Current Location" });
        },
        (error) => {
          setError("Unable to retrieve location.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const filters = [
    <ServiceFilter key="service" onChange={console.log} />
  ];

  async function getData() {
    try {
      const res = await axios.get(`/mechanics/`);
      const _data = objectifyJSON(res.data);
      setMatches(_data?.data?.results || []);
      setData(_data?.data?.pagination);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      setMatches([]);
    }
  }

  async function performSearch() {
    try {
      const res = await axios.get(`/mechanics/find/?find=${query}`);
      const _data = objectifyJSON(res.data);
      setMatches(_data?.data?.results || []);
      setData(_data?.data?.pagination);
      setSearching(true);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      setMatches([]);
    }
  }

  function cancelSearch() {
    setSearching(false);
    setQuery("");
    getData();
  }

  function changeSort(next) {
    setSort(next);
    // Add sorting logic here
  }

  function clearAllFilters() {
    setAppliedFilters([]);
    getData();
  }

  useEffect(() => {
    getData();
    setTimeout(() => setLoading(false), 2500);
  }, []);

  if (loading) {
    return <MechanicListSkeleton />;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={6}>
        {/* Hero Section */}
        <VStack spacing={6} mb={8}>
          <Box textAlign="center">
            <Heading size="2xl" mb={4} color="gray.800">
              Find Trusted Mechanics
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
              Connect with verified automotive professionals in your area. Quality service, transparent pricing.
            </Text>
          </Box>

          {/* Enhanced Search Box */}
          <Card
            w="100%"
            maxW="800px"
            bg={bgColor}
            border="2px solid"
            borderColor="#F4A950"
            boxShadow="2xl"
            borderRadius="2xl"
            overflow="hidden"
          >
            <CardBody p={6}>
              <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap={4} alignItems="end">
                <GridItem>
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={2}>
                      <Icon as={Search} color="#F4A950" boxSize={5} />
                      <Text fontWeight="600" color="gray.700">
                        What service do you need?
                      </Text>
                    </HStack>
                    <InputGroup size="lg">
                      <InputLeftElement>
                        <SearchIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        value={query}
                        placeholder="Search services (e.g. Engine repair, Brake service, AC repair)"
                        bg="gray.50"
                        borderColor={borderColor}
                        _focus={{ borderColor: "#F4A950", boxShadow: "0 0 0 1px #F4A950" }}
                        borderRadius="xl"
                        onInput={e => setQuery(e.target.value)}
                      />
                    </InputGroup>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={3}>
                    <Button
                      onClick={performSearch}
                      isDisabled={!query.trim()}
                      bg="#F4A950"
                      color="white"
                      _hover={{ bg: "#E09940" }}
                      size="lg"
                      px={8}
                      borderRadius="xl"
                      fontWeight="bold"
                      leftIcon={<Search size={18} />}
                    >
                      Search
                    </Button>
                    {searching && (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={cancelSearch}
                        colorScheme="orange"
                        borderRadius="xl"
                      >
                        Clear Search
                      </Button>
                    )}
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="100%" maxW="800px">
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">500+</StatNumber>
              <StatLabel color="gray.600">Verified Mechanics</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">25+</StatNumber>
              <StatLabel color="gray.600">Cities</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">4.9★</StatNumber>
              <StatLabel color="gray.600">Average Rating</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">24/7</StatNumber>
              <StatLabel color="gray.600">Support</StatLabel>
            </Stat>
          </SimpleGrid>
        </VStack>

        {/* Search Alert */}
        {searching && (
          <Alert
            status="info"
            borderRadius="xl"
            mb={6}
            bg="blue.50"
            border="1px"
            borderColor="blue.200"
          >
            <AlertIcon />
            <Flex justify="space-between" align="center" w="100%">
              <Text>Showing results for "{query}"</Text>
              <Button onClick={cancelSearch} colorScheme="blue" size="sm">
                Clear
              </Button>
            </Flex>
          </Alert>
        )}

        {/* Filters and Sorting */}
        <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl" mb={6}>
          <CardBody p={4}>
            <Flex align="center" gap={4} wrap="wrap">
              <HStack spacing={3}>
                <Icon as={SlidersHorizontal} color="#F4A950" />
                <Menu>
                  <MenuButton
                    as={Button}
                    size="sm"
                    rightIcon={<ChevronDownIcon />}
                    variant="outline"
                    borderColor={borderColor}
                    _hover={{ borderColor: "#F4A950" }}
                  >
                    Sort: {sort === 'relevance' ? 'Relevance' : sort === 'rating' ? 'Rating' : sort === 'price_low' ? 'Price (Low→High)' : 'Price (High→Low)'}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => changeSort('relevance')}>Relevance</MenuItem>
                    <MenuItem onClick={() => changeSort('rating')}>Rating</MenuItem>
                    <MenuItem onClick={() => changeSort('price_low')}>Price (Low→High)</MenuItem>
                    <MenuItem onClick={() => changeSort('price_high')}>Price (High→Low)</MenuItem>
                  </MenuList>
                </Menu>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllFilters}
                  isDisabled={!appliedFilters.length}
                  color="#F4A950"
                  _hover={{ bg: "orange.50" }}
                >
                  Clear all
                </Button>
              </HStack>

              <Spacer />

              <Wrap spacing={2}>
                {filters.map((filter, i) => (
                  <WrapItem key={`filter-${i}`}>
                    {filter}
                  </WrapItem>
                ))}
              </Wrap>
            </Flex>

            {appliedFilters.length > 0 && (
              <Box mt={4} pt={4} borderTop="1px" borderColor={borderColor}>
                <Text fontSize="sm" color="gray.600" mb={2}>Active filters:</Text>
                <Wrap spacing={2}>
                  {appliedFilters.map((f) => (
                    <WrapItem key={`applied-${f}`}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        bg="#F4A950"
                        color="white"
                        variant="solid"
                      >
                        <TagLabel>{f}</TagLabel>
                        <TagCloseButton onClick={() => {/* remove filter logic */ }} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Results Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.800">
              Available Mechanics
            </Heading>
            <Text color="gray.600">
              {matches?.length || 0} mechanic{(matches?.length || 0) !== 1 ? 's' : ''} found near you
            </Text>
          </VStack>

          {matches?.length > 0 && (
            <HStack spacing={2}>
              <Icon as={Wrench} color="#F4A950" />
              <Text fontSize="sm" color="gray.600">
                Services from {formatCurrency(2000, 'NGN')}
              </Text>
            </HStack>
          )}
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 400px" }} gap={8}>
          {/* Mechanics List */}
          <GridItem>
            {matches?.length === 0 ? (
              <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl">
                <CardBody textAlign="center" py={12}>
                  <VStack spacing={4}>
                    <Icon as={Wrench} boxSize={16} color="gray.300" />
                    <Heading size="md" color="gray.600">
                      No mechanics found
                    </Heading>
                    <Text color="gray.500" maxW="400px">
                      Try adjusting your search criteria or check back later for new mechanics.
                    </Text>
                    <Button
                      bg="#F4A950"
                      color="white"
                      _hover={{ bg: "#E09940" }}
                      onClick={clearAllFilters}
                    >
                      Clear Filters
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {matches.map((mechanic) => (
                  <MechanicCard key={mechanic.id} mechanic={mechanic} />
                ))}
              </SimpleGrid>
            )}
          </GridItem>

          {/* Enhanced Map Section */}
          <GridItem>
            <VStack spacing={4}>
              {/* Map Card */}
              <Card
                bg={bgColor}
                border="2px solid"
                borderColor="#F4A950"
                borderRadius="2xl"
                position="sticky"
                top="20px"
                overflow="hidden"
                shadow="xl"
              >
                <CardHeader bg="#F4A950" color="white" p={4}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={MapPin} boxSize={5} />
                      <Heading size="md">Mechanics Near You</Heading>
                    </HStack>
                    <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full">
                      {matches?.length || 0} found
                    </Badge>
                  </HStack>
                </CardHeader>

                <CardBody p={0}>
                  <Box h="450px" position="relative">
                    <MapComponent
                      location={location}
                      style={{ height: "100%", width: "100%" }}
                    />

                    {/* Map Controls Overlay */}
                    <VStack
                      position="absolute"
                      top={4}
                      right={4}
                      spacing={2}
                      zIndex={10}
                    >
                      <Tooltip label="Center on my location">
                        <IconButton
                          icon={<Icon as={MapPin} />}
                          size="sm"
                          bg="whiteAlpha.900"
                          color="gray.800"
                          borderRadius="full"
                          shadow="lg"
                          _hover={{ bg: "white", transform: "scale(1.05)" }}
                          onClick={() => {
                            if ("geolocation" in navigator) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const { latitude, longitude } = position.coords;
                                  setLocation({ lat: latitude, lng: longitude, name: "Current Location" });
                                },
                                (error) => {
                                  notify({
                                    title: "Location Error",
                                    body: "Unable to get your location",
                                    color: "red"
                                  });
                                }
                              );
                            }
                          }}
                        />
                      </Tooltip>

                      <Tooltip label="Expand map">
                        <IconButton
                          icon={<Icon as={Search} />}
                          size="sm"
                          bg="whiteAlpha.900"
                          color="gray.800"
                          borderRadius="full"
                          shadow="lg"
                          _hover={{ bg: "white", transform: "scale(1.05)" }}
                          onClick={() => {
                            const control = document.querySelector("button.gm-fullscreen-control");
                            if (control) control.click();
                          }}
                        />
                      </Tooltip>
                    </VStack>

                    {/* Location Info Overlay */}
                    <Card
                      position="absolute"
                      bottom={4}
                      left={4}
                      right={4}
                      bg="whiteAlpha.900"
                      backdropFilter="blur(10px)"
                      border="1px"
                      borderColor="whiteAlpha.300"
                      borderRadius="lg"
                      size="sm"
                    >
                      <CardBody p={3}>
                        <HStack spacing={2}>
                          <Icon as={MapPin} color="#F4A950" boxSize={4} />
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {location?.name || "Current Location"}
                          </Text>
                        </HStack>
                      </CardBody>
                    </Card>
                  </Box>

                  {/* Map Controls */}
                  <Box p={4} bg="gray.50">
                    <VStack spacing={4}>
                      {/* Location Search */}
                      <Box w="100%">
                        <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                          Search Location
                        </Text>
                        <Box
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="lg"
                          p={3}
                          bg="white"
                          _focus={{ borderColor: "#F4A950", boxShadow: "0 0 0 1px #F4A950" }}
                        >
                          <CustomPlacesAutocomplete
                            onLoad={onLoad}
                            onPlaceChanged={onPlaceChanged}
                            placeholder="Enter city, area, or address..."
                          />
                        </Box>
                      </Box>

                      {/* Quick Location Buttons */}
                      <Box w="100%">
                        <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                          Quick Locations
                        </Text>
                        <SimpleGrid columns={2} spacing={2}>
                          {[
                            { name: "Lagos", lat: 6.5244, lng: 3.3792 },
                            { name: "Abuja", lat: 9.0765, lng: 7.3986 },
                            { name: "Port Harcourt", lat: 4.8156, lng: 7.0498 },
                            { name: "Kano", lat: 12.0022, lng: 8.5920 }
                          ].map((city) => (
                            <Button
                              key={city.name}
                              size="sm"
                              variant="outline"
                              borderColor={borderColor}
                              _hover={{ borderColor: "#F4A950", bg: "orange.50" }}
                              onClick={() => {
                                setLocation({ lat: city.lat, lng: city.lng, name: city.name });
                                // Optionally trigger a search for mechanics in this location
                              }}
                            >
                              {city.name}
                            </Button>
                          ))}
                        </SimpleGrid>
                      </Box>

                      {/* Distance Filter */}
                      <Box w="100%">
                        <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                          Search Radius
                        </Text>
                        <HStack spacing={2}>
                          <Select
                            size="sm"
                            bg="white"
                            borderColor={borderColor}
                            _focus={{ borderColor: "#F4A950" }}
                            defaultValue="10"
                          >
                            <option value="5">5 km</option>
                            <option value="10">10 km</option>
                            <option value="25">25 km</option>
                            <option value="50">50 km</option>
                            <option value="100">100 km</option>
                          </Select>
                          <Button
                            size="sm"
                            bg="#F4A950"
                            color="white"
                            _hover={{ bg: "#E09940" }}
                            flex={1}
                          >
                            Update
                          </Button>
                        </HStack>
                      </Box>

                      {/* Map Legend */}
                      <Box w="100%" pt={2} borderTop="1px" borderColor={borderColor}>
                        <Text fontSize="xs" fontWeight="semibold" mb={2} color="gray.600">
                          Map Legend
                        </Text>
                        <VStack spacing={1} align="stretch">
                          <HStack spacing={2}>
                            <Box w={3} h={3} bg="#F4A950" borderRadius="full" />
                            <Text fontSize="xs" color="gray.600">Available Mechanics</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Box w={3} h={3} bg="blue.500" borderRadius="full" />
                            <Text fontSize="xs" color="gray.600">Your Location</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Box w={3} h={3} bg="green.500" borderRadius="full" />
                            <Text fontSize="xs" color="gray.600">Top Rated</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>
                </CardBody>
              </Card>

              {/* Map Stats Card */}
              <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl" w="100%">
                <CardBody p={4}>
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                        Area Coverage
                      </Text>
                      <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
                        Active
                      </Badge>
                    </HStack>

                    <SimpleGrid columns={2} spacing={3} w="100%">
                      <Stat textAlign="center" size="sm">
                        <StatNumber fontSize="lg" color="#F4A950">
                          {matches?.length || 0}
                        </StatNumber>
                        <StatLabel fontSize="xs" color="gray.600">Mechanics</StatLabel>
                      </Stat>

                      <Stat textAlign="center" size="sm">
                        <StatNumber fontSize="lg" color="#F4A950">
                          10km
                        </StatNumber>
                        <StatLabel fontSize="xs" color="gray.600">Radius</StatLabel>
                      </Stat>
                    </SimpleGrid>

                    <Box w="100%" pt={2} borderTop="1px" borderColor={borderColor}>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.600">Avg. Response Time</Text>
                        <Text fontSize="xs" fontWeight="semibold" color="#F4A950">&lt; 30 min</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Quick Actions Card */}
              <Card bg="gradient.50" border="1px" borderColor={borderColor} borderRadius="xl" w="100%">
                <CardBody p={4}>
                  <VStack spacing={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" textAlign="center">
                      Quick Actions
                    </Text>

                    <VStack spacing={2} w="100%">
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="orange"
                        w="100%"
                        leftIcon={<Icon as={Phone} boxSize={3} />}
                        _hover={{ bg: "orange.50" }}
                      >
                        Emergency Service
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        w="100%"
                        leftIcon={<Icon as={MessageCircle} boxSize={3} />}
                        _hover={{ bg: "blue.50" }}
                      >
                        Live Chat Support
                      </Button>
                    </VStack>

                    <Box w="100%" pt={2} borderTop="1px" borderColor={borderColor}>
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Need help? Call +234 800 VEYU
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>

        {/* Trust Indicators */}
        <Card bg="gray.50" border="1px" borderColor={borderColor} borderRadius="xl" mt={12}>
          <CardBody p={8}>
            <VStack spacing={6}>
              <Heading size="lg" textAlign="center" color="gray.800">
                Why Choose Veyu Mechanics?
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="100%">
                <VStack spacing={3} textAlign="center">
                  <Icon as={Users} boxSize={8} color="#F4A950" />
                  <Heading size="md" color="gray.800">Verified Professionals</Heading>
                  <Text color="gray.600" fontSize="sm">
                    All mechanics are background-checked and skill-verified
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Icon as={Clock} boxSize={8} color="#F4A950" />
                  <Heading size="md" color="gray.800">Quick Response</Heading>
                  <Text color="gray.600" fontSize="sm">
                    Average response time under 1 hour for urgent repairs
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Icon as={Award} boxSize={8} color="#F4A950" />
                  <Heading size="md" color="gray.800">Quality Guarantee</Heading>
                  <Text color="gray.600" fontSize="sm">
                    All work comes with warranty and satisfaction guarantee
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default MechanicListPage;