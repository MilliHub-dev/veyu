import { ChevronDownIcon, StarIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Switch,
  Text,
  VStack,
  SimpleGrid,
  Input,
  useMediaQuery,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Spacer,
  Grid,
  GridItem,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  InputGroup,
  InputLeftElement,
  Select,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { Fragment, useContext, useEffect, useState, useRef } from "react";
import { GlobalStore } from "../../../App";
import {
  RiClockwiseLine,
  RiGasStationLine,
  RiFilterLine,
} from "react-icons/ri";
import { RxTimer } from "react-icons/rx";
import { TbManualGearbox } from "react-icons/tb";
import { ListingItemCard, DatePicker } from "../../../components";
import { objectifyJSON, formatCurrency } from "../../../utils";
import { ListingSkeleton } from "../../../components/loaders";
import { CustomPlacesAutocomplete } from "../../../components/maps";
import {
  MapPin,
  Calendar as CalendarIcon,
  Search as SearchIcon,
  Filter,
  SlidersHorizontal,
  Car,
  Clock,
  Users,
  Zap,
  Plane,
  Ship,
  Bike,
  Radio,
} from "lucide-react";
import {
  CarBrandFilter,
  PriceFilter,
  LocationFilter,
  TransmissionFilter,
  FuelSystemFilter,
} from "../../../components/filters";

export const RentListing = ({ props }) => {
  const [listings, setListings] = useState([]);
  const [rental, setRental] = useState({
    where: "",
    from: "",
    until: "",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const {
    axios,
    notify,
    commaInt,
    authUser,
    apiUrl,
    otherContext,
    setOtherContext,
  } = useContext(GlobalStore);
  const [autocomplete, setAutocomplete] = useState(null);
  const [location, setLocation] = useState({
    lat: 10,
    lng: 8,
    name: "Current Location",
  });
  const onLoad = (auto) => setAutocomplete(auto);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [sort, setSort] = useState("relevance");
  const [vehicleCategory, setVehicleCategory] = useState("all");

  // Move hooks before any conditional returns to follow Rules of Hooks
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Vehicle categories with icons and colors
  const vehicleCategories = [
    {
      id: "all",
      name: "All Vehicles",
      icon: Car,
      color: "gray.600",
      apiValue: null,
    },
    { id: "cars", name: "Cars", icon: Car, color: "#F4A950", apiValue: "car" },
    {
      id: "motorcycles",
      name: "Motorcycles",
      icon: Bike,
      color: "blue.500",
      apiValue: "bike",
    },
    {
      id: "boats",
      name: "Boats",
      icon: Ship,
      color: "cyan.500",
      apiValue: "boat",
    },
    {
      id: "aircraft",
      name: "Aircraft",
      icon: Plane,
      color: "purple.500",
      apiValue: "plane",
    },
    {
      id: "uavs",
      name: "UAVs",
      icon: Radio,
      color: "green.500",
      apiValue: "uav",
    },
  ];

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng, name: place.name });
        setRental({ ...rental, where: place.formatted_address || place.name });
      }
    }
  };

  /**
   * @param filter: filter object
   * e.g { filter: 'brands', value: 'bmw,audi'}
   * e.g { filter: 'price', value: '120000-5000000'}
   * e.g { filter: 'vehicle_type', value: 'car,plane'}
   *
   * */
  function applyFilter({ filter, value }) {
    const params = new URLSearchParams();
    const _filters = appliedFilters;

    if (!_filters.includes(filter) && Boolean(value)) {
      _filters.push(filter);
    } else if (_filters.includes(filter) && !Boolean(value)) {
      _filters.splice(_filters.indexOf(filter), 1);
    }
    setAppliedFilters([..._filters]);

    // Build params from all applied filters
    _filters.forEach((f) => {
      if (f === filter && value) {
        params.set(f, value);
      } else if (f !== filter) {
        // Keep existing filter values from current URL
        const currentParams = new URLSearchParams(window.location.search);
        const existingValue = currentParams.get(f);
        if (existingValue) {
          params.set(f, existingValue);
        }
      }
    });

    // Add the new/updated filter
    if (Boolean(value)) {
      params.set(filter, value);
    }

    // Include sort ordering if applied
    if (sort && sort !== "relevance") {
      params.set(
        "ordering",
        sort === "price_low"
          ? "price"
          : sort === "price_high"
            ? "-price"
            : sort === "newest"
              ? "-date_created"
              : "",
      );
      if (!params.get("ordering")) params.delete("ordering");
    }

    // Convert filterList to url param
    getData(`/listings/rentals/?${params.toString()}`);
  }

  function removeFilter(name) {
    const url = new URLSearchParams(window.location.search);
    url.delete(name);
    const next = appliedFilters.filter((f) => f !== name);
    setAppliedFilters(next);
    getData(`/listings/rentals/?${url.toString()}`);
  }

  function clearAll() {
    setAppliedFilters([]);
    setSort("relevance");
    setVehicleCategory("all");
    getData(`/listings/rentals/`);
  }

  // Handle vehicle category change - sends vehicle_type to API
  function changeVehicleCategory(categoryId) {
    setVehicleCategory(categoryId);

    const category = vehicleCategories.find((c) => c.id === categoryId);

    if (category?.apiValue) {
      // Apply vehicle_type filter to API
      applyFilter({ filter: "vehicle_type", value: category.apiValue });
    } else {
      // Remove vehicle_type filter (show all)
      applyFilter({ filter: "vehicle_type", value: null });
    }
  }

  // Get count for each vehicle category from current listings
  const getCategoryCount = (categoryId) => {
    if (categoryId === "all") return listings?.length || 0;

    const category = vehicleCategories.find((c) => c.id === categoryId);
    if (!category?.apiValue) return 0;

    return (
      listings?.filter((l) => {
        const vehicleKind = l?.vehicle?.kind?.toLowerCase() || "";
        return vehicleKind === category.apiValue;
      }).length || 0
    );
  };

  function changeSort(next) {
    setSort(next);
    const params = new URLSearchParams();

    // Include existing filters
    appliedFilters.forEach((filter) => {
      const currentParams = new URLSearchParams(window.location.search);
      const value = currentParams.get(filter);
      if (value) {
        params.set(filter, value);
      }
    });

    // Add ordering parameter
    params.set(
      "ordering",
      next === "price_low"
        ? "price"
        : next === "price_high"
          ? "-price"
          : next === "newest"
            ? "-date_created"
            : "",
    );
    if (!params.get("ordering")) params.delete("ordering");

    getData(`/listings/rentals/?${params.toString()}`);
  }

  async function getData(url = `/listings/rentals/`) {
    console.error(`Fetching rentals... ${"https://dev.veyu.cc/api/v1/".url}`);
    try {
      const res = await axios.get(`https://dev.veyu.cc/api/v1${url}`);
      const parsed = objectifyJSON(res?.data);
      const payload = parsed?.data;

      setData(payload || null);
      const results = payload?.results;
      setListings(Array.isArray(results) ? results : []);

      if (res?.status !== 200) {
        notify?.({
          title: "Error",
          body: parsed?.message || "Something went wrong fetching rentals.",
        });
      }
    } catch (error) {
      console.log("Error fetching rentals:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  function init() {
    setLoading(true);
    getData();
  }

  function changeRental(val) {
    const newVal = { ...rental, ...val };
    console.log("Got Rental:", newVal);
    setRental(newVal);
    setOtherContext({ ...otherContext, rental });
  }

  useEffect(() => {
    init();
    console.log("Init Rentals Page");
  }, []);

  if (loading) {
    return <ListingSkeleton />;
  }

  const filters = [
    <CarBrandFilter
      key="brand"
      onChange={applyFilter}
      category={
        vehicleCategories.find((c) => c.id === vehicleCategory)?.apiValue ||
        "car"
      }
    />,
    <PriceFilter key="price" onChange={applyFilter} />,
    <TransmissionFilter key="transmission" onChange={applyFilter} />,
    <FuelSystemFilter key="fuel" onChange={applyFilter} />,
    <LocationFilter key="location" onChange={applyFilter} />,
  ];

  const cheapestListing =
    listings?.length > 0
      ? listings.reduce(
          (prev, curr) =>
            Number(prev.price || 0) < Number(curr.price || 0) ? prev : curr,
          listings[0],
        )
      : null;

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxWidth={"container.xl"} py={6}>
        {/* Hero Section */}
        <VStack spacing={6} mb={8}>
          <Box textAlign="center">
            <Heading size="2xl" mb={4} color="gray.800">
              Find Your Perfect Rental
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
              Discover thousands of vehicles available for rent in your area.
              From daily commutes to weekend adventures.
            </Text>
          </Box>

          {/* Enhanced Search Box */}
          <Card
            w="100%"
            maxW="1000px"
            bg={bgColor}
            border="2px solid"
            borderColor="#F4A950"
            boxShadow="2xl"
            borderRadius="3xl"
            overflow="hidden"
          >
            <CardBody p={6}>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr 1fr auto" }}
                gap={4}
                alignItems="end"
              >
                {/* Location Input */}
                <GridItem>
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={MapPin} color="#F4A950" boxSize={4} />
                      <Text fontWeight="600" fontSize="sm" color="gray.700">
                        Where
                      </Text>
                    </HStack>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={MapPin} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="City, airport, address..."
                        borderColor={borderColor}
                        _focus={{
                          borderColor: "#F4A950",
                          boxShadow: "0 0 0 1px #F4A950",
                        }}
                        bg="gray.50"
                        borderRadius="xl"
                      />
                    </InputGroup>
                  </VStack>
                </GridItem>

                {/* From Date */}
                <GridItem>
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={CalendarIcon} color="#F4A950" boxSize={4} />
                      <Text fontWeight="600" fontSize="sm" color="gray.700">
                        From
                      </Text>
                    </HStack>
                    <Box
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg="gray.50"
                      borderRadius="xl"
                      px={3}
                      py={2}
                    >
                      <DatePicker
                        onChange={(val) => changeRental({ from: val })}
                      />
                    </Box>
                  </VStack>
                </GridItem>

                {/* Until Date */}
                <GridItem>
                  <VStack align="stretch" spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={CalendarIcon} color="#F4A950" boxSize={4} />
                      <Text fontWeight="600" fontSize="sm" color="gray.700">
                        Until
                      </Text>
                    </HStack>
                    <Box
                      borderWidth="1px"
                      borderColor={borderColor}
                      bg="gray.50"
                      borderRadius="xl"
                      px={3}
                      py={2}
                    >
                      <DatePicker
                        onChange={(val) => changeRental({ until: val })}
                      />
                    </Box>
                  </VStack>
                </GridItem>

                {/* Search Button */}
                <GridItem>
                  <Button
                    bg="#F4A950"
                    color="white"
                    _hover={{ bg: "#E09940" }}
                    leftIcon={<SearchIcon size={18} />}
                    borderRadius="xl"
                    px={8}
                    py={6}
                    fontSize="md"
                    fontWeight="bold"
                    w={{ base: "100%", md: "auto" }}
                    boxShadow="lg"
                    _active={{ transform: "translateY(1px)" }}
                  >
                    Search Rentals
                  </Button>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            spacing={6}
            w="100%"
            maxW="800px"
          >
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">
                2,500+
              </StatNumber>
              <StatLabel color="gray.600">Available Cars</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">
                50+
              </StatNumber>
              <StatLabel color="gray.600">Cities</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">
                4.8★
              </StatNumber>
              <StatLabel color="gray.600">Average Rating</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="2xl" color="#F4A950">
                24/7
              </StatNumber>
              <StatLabel color="gray.600">Support</StatLabel>
            </Stat>
          </SimpleGrid>
        </VStack>

        {/* Vehicle Categories and Filters */}
        <Card
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="xl"
          mb={6}
        >
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              {/* Vehicle Category Filters */}
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Icon as={Filter} color="#F4A950" boxSize={5} />
                  <Heading size="md" color="gray.800">
                    Vehicle Categories
                  </Heading>
                </HStack>

                {/* Vehicle Category Buttons */}
                <Wrap spacing={3}>
                  {vehicleCategories.map((category) => {
                    const IconComponent = category.icon;
                    const isActive = vehicleCategory === category.id;
                    const categoryCount = getCategoryCount(category.id);

                    return (
                      <WrapItem key={category.id}>
                        <Button
                          onClick={() => changeVehicleCategory(category.id)}
                          size="md"
                          px={6}
                          py={4}
                          borderRadius="full"
                          bg={isActive ? category.color : "transparent"}
                          color={isActive ? "white" : "gray.600"}
                          border="2px solid"
                          borderColor={isActive ? category.color : "gray.300"}
                          _hover={{
                            bg: isActive
                              ? category.color
                              : `${category.color}20`,
                            borderColor: category.color,
                            color: isActive ? "white" : category.color,
                            transform: "translateY(-2px)",
                            shadow: "md",
                          }}
                          _active={{ transform: "translateY(0)" }}
                          transition="all 0.2s"
                          leftIcon={<IconComponent size={18} />}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          {category.name} ({categoryCount})
                        </Button>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </VStack>

              <Divider />

              {/* Sort and Filters */}
              <Flex align="center" gap={4} wrap="wrap">
                {/* Sort Dropdown */}
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
                      Sort:{" "}
                      {sort === "relevance"
                        ? "Relevance"
                        : sort === "price_low"
                          ? "Price (Low→High)"
                          : sort === "price_high"
                            ? "Price (High→Low)"
                            : "Newest"}
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => changeSort("relevance")}>
                        Relevance
                      </MenuItem>
                      <MenuItem onClick={() => changeSort("price_low")}>
                        Price (Low→High)
                      </MenuItem>
                      <MenuItem onClick={() => changeSort("price_high")}>
                        Price (High→Low)
                      </MenuItem>
                      <MenuItem onClick={() => changeSort("newest")}>
                        Newest
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAll}
                    isDisabled={
                      !appliedFilters.length && vehicleCategory === "all"
                    }
                    color="#F4A950"
                    _hover={{ bg: "orange.50" }}
                  >
                    Clear all
                  </Button>
                </HStack>

                <Spacer />

                {/* Filter Buttons */}
                <Wrap spacing={2}>
                  {filters.map((filter, i) => (
                    <WrapItem key={`filter-${i}`}>{filter}</WrapItem>
                  ))}
                </Wrap>
              </Flex>

              {/* Applied Filters */}
              {!!appliedFilters.length && (
                <Box pt={4} borderTop="1px" borderColor={borderColor}>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Active filters:
                  </Text>
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
                          <TagCloseButton onClick={() => removeFilter(f)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Results Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.800">
              Available Rentals
            </Heading>
            <Text color="gray.600">
              {listings?.length} vehicles found in your area
            </Text>
          </VStack>

          {listings?.length > 0 && (
            <HStack spacing={2}>
              <Icon as={Car} color="#F4A950" />
              <Text fontSize="sm" color="gray.600">
                Starting from {formatCurrency(5000, "NGN")}/day
              </Text>
            </HStack>
          )}
        </Flex>

        {/* Listings Grid */}
        {listings?.length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={6}
            placeItems="center"
          >
            {listings.map((listing, idx) => (
              <ListingItemCard
                listing={listing}
                key={listing?.id ?? idx}
                w="100%"
                maxW="350px"
              />
            ))}
          </SimpleGrid>
        ) : (
          <Card
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
          >
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Icon as={Car} boxSize={16} color="gray.300" />
                <Heading size="md" color="gray.600">
                  No rentals found
                </Heading>
                <Text color="gray.500" maxW="400px">
                  Try adjusting your search criteria or check back later for new
                  listings.
                </Text>
                <Button
                  bg="#F4A950"
                  color="white"
                  _hover={{ bg: "#E09940" }}
                  onClick={clearAll}
                >
                  Clear Filters
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Trust Indicators */}
        <Card
          bg="gray.50"
          border="1px"
          borderColor={borderColor}
          borderRadius="xl"
          mt={12}
        >
          <CardBody p={8}>
            <VStack spacing={6}>
              <Heading size="lg" textAlign="center" color="gray.800">
                Why Choose Veyu Rentals?
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="100%">
                <VStack spacing={3} textAlign="center">
                  <Icon as={Users} boxSize={8} color="#F4A950" />
                  <Heading size="md" color="gray.800">
                    Verified Hosts
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    All our rental hosts are verified and rated by the community
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Icon as={Clock} boxSize={8} color="#F4A950" />
                  <Heading size="md" color="gray.800">
                    24/7 Support
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Round-the-clock customer support for all your rental needs
                  </Text>
                </VStack>

                <VStack spacing={3} textAlign="center">
                  <Icon as={Zap} boxSize={8} color="#F4A950" />
                  <Heading size="md" color="gray.800">
                    Instant Booking
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Book instantly and get on the road within minutes
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

export default RentListing;
