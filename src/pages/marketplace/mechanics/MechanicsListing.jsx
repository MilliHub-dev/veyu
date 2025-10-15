import {
    Box, Heading,
    Button,
    Container,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Stack,
    Text,
    Avatar,
    Badge,
    Card,
    CardBody,
    Alert,
    Icon,
    VStack,
    HStack,
    Image,
    Tag,
    ButtonGroup,
    Divider,
    Checkbox,
    useColorModeValue,
 } from "@chakra-ui/react";
import { useContext, useEffect, useState, Fragment, useRef } from "react";
import { GlobalStore } from "../../../App";
import { jsonifyObject, objectifyJSON } from "../../../utils";
import { useSearchParams, Link } from "react-router-dom";
import { SearchIcon, StarIcon,  ChevronDownIcon } from '@chakra-ui/icons';
import {  RiFilterLine, } from 'react-icons/ri'
import {BiBuildings} from 'react-icons/bi';
import {GrLocation} from 'react-icons/gr';
import { MechanicListSkeleton } from "../../../components/loaders";
import { MapComponent, CustomPlacesAutocomplete } from "../../../components/maps";
import { TopRatedBadgeIcon } from "../../../components/icons";
import { 
  ServiceFilter
} from "../../../components/filters";
import { Paginator } from "../../../components/nav";



export const MechanicListPage = ({ props }) => {
  const [searching, setSearching] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [locationName, setLocationName] = useState("Current Location");
  const [inputValue, setInputValue] = useState("Your Current Location");
  const [query, setQuery] = useState("");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const [location, setLocation] = useState({ lat: 10, lng: 8, name: "Current Location" });
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [matches, setMatches] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { axios, authUser, commaInt, notify, redirect } = useContext(GlobalStore);
  const mapRef = useRef();

  const onLoad = (auto) => setAutocomplete(auto);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ lat, lng, name: place.name });
        setInputValue(place.formatted_address || place.name);
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

  function expandMap(e) {
    e.preventDefault();
    const control = document.querySelector("button.gm-fullscreen-control");
    if (control) control.click();
  }

  const filters = [
    <ServiceFilter onChange={console.log} />
  ];

  async function getData() {
    try {
      const res = await axios.get(`/mechanics/`);
      const _data = objectifyJSON(res.data);
      setSearchResults(_data.data);
      setMatches(_data?.data?.results);
      setData(_data?.data?.pagination);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
    }
  }

  async function performSearch() {
    try {
      const res = await axios.get(`/mechanics/find/?find=${query}`);
      const _data = objectifyJSON(res.data);
      setSearchResults(_data.data);
      setMatches(_data?.data?.results);
      setData(_data?.data?.pagination);
      setSearching(true)
    } catch (error) {
      console.error("Error fetching mechanics:", error);
    }
  }

  function cancelSearch(){
    setSearching(false);
    setQuery("");
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
    <Box minH="100vh">
        <Container maxW="container.xl" py={8}>
          <Container maxW={"container.xl"}>
            <Flex gap={4} mb={6} flexWrap={"wrap"} align="center">
              <InputGroup size="lg" flex={1}>
                <InputLeftElement>
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                </InputLeftElement>
                <Input value={query} placeholder="Search services (e.g. Engine, Brake, AC)" bg={bgColor} onInput={e => setQuery(e.target.value)} />
              </InputGroup>
              <HStack>
                <Button onClick={performSearch} isDisabled={!query.trim()} borderRadius={8} size="lg" bg="primary" colorScheme="primary">Search</Button>
                {searching && <Button variant="outline" size="lg" onClick={cancelSearch}>Clear</Button>}
              </HStack>
            </Flex>
          </Container>

          {/* Filters */}
          <Flex my={2} py={2} flexWrap={"nowrap"} gap={4} overflowX={"auto"} className="hidden-scroll">
            <Button minW={"max-content"} size={"md"} borderRadius={"10px"} as={Box} bgColor="gray.100" leftIcon={<RiFilterLine />}>
              Filters
            </Button>
            {filters.map((filter, idx) => <Fragment key={idx}>{filter}</Fragment>)}
          </Flex>

          {
            searching &&
            <Alert colorScheme="yellow" w="100%" gap={3} my={3} rounded="md" display={'flex'}>
              <Text flex={1}> Showing results for "{query}" </Text>
              <Button onClick={cancelSearch} colorScheme="yellow"> Cancel </Button>
            </Alert>
          }

          <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" rowGap={3}>
            <Text fontSize="xl" className="subtitle" color="primary" fontWeight="medium">
              {matches?.length || 0} Mechanic{(matches?.length || 0) > 1 && "s"} near you
            </Text>
            <HStack>
              <Text color="gray.600">Sort by</Text>
              <Select size="md" maxW="200px" bg={bgColor}>
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </Select>
            </HStack>
          </Flex>

          <Flex gap={6} alignItems="self-start" flexWrap="wrap-reverse">
            {/* Mechanics List */}
            <VStack w="100%" spacing={4} flex={1} maxW={{ md: "calc(100% - 350px)", lg: "calc(100% - 450px)" }}>
              {(!matches || matches.length === 0) && (
                <Alert colorScheme="blue" rounded="md">No mechanics found. Try adjusting your search or filters.</Alert>
              )}
              {matches?.map((mechanic) => (
                <Card key={mechanic.id} w="full" bg={bgColor} borderWidth={1} borderColor={borderColor} _hover={{ boxShadow: 'md' }}>
                  <CardBody>
                    <Flex direction={{ base: 'column', md: 'row'}} gap={4} align="flex-start">
                      <Link to={`/mechanics/${mechanic?.uuid}`}>
                        <Avatar size="lg" name={mechanic?.business_name || mechanic?.user?.name} src={mechanic?.logo} />
                      </Link>
                      <Box flex={1}>
                        <Flex justify="space-between" align="start" columnGap={4} rowGap={2} flexWrap="wrap">
                          <Box>
                            <Link to={`/mechanics/${mechanic?.uuid}`}>
                              <Heading size="md" fontWeight="600" mb={1}>
                                {mechanic?.business_name || mechanic?.user?.name}
                                {mechanic?.mechanic_type === "business" && <Icon><BiBuildings size={20} /></Icon>}
                              </Heading>
                            </Link>
                            <Text color="gray.800" fontWeight="md" fontSize="sm">{mechanic?.headline}</Text>
                          </Box>
                          <HStack>
                            <Badge colorScheme="blue" fontSize="xs" p={'6px'} rounded="lg" display="flex" alignItems="center" gap={1}>
                              <TopRatedBadgeIcon viewBox="0 0 27 28" w="18px" h="18px" /> {mechanic?.level}
                            </Badge>
                            <ButtonGroup size="sm">
                              <Button as={Link} to={`/mechanics/${mechanic?.uuid}`} variant="outline">View</Button>
                              <Button as={Link} to={`/mechanics/${mechanic?.uuid}`} colorScheme="blue" bg="primary">Book</Button>
                            </ButtonGroup>
                          </HStack>
                        </Flex>

                        <Flex align="center" gap={2} mt={3} color="gray.600" flexWrap="wrap">
                          <GrLocation />
                          <Text fontSize="sm">{mechanic?.location}</Text>
                          <Text fontSize="sm" color="gray.700">• {mechanic?.distance || "> 2km away"}</Text>
                        </Flex>

                        <HStack spacing={2} mt={3} flexWrap="wrap">
                          {mechanic?.services?.map((service, idx) =>
                            idx < 3 ? (
                              <Tag key={idx} size="sm" variant="subtle" borderRadius="30px" px={4} py={1.5} bgColor="gray.100">
                                {service?.service}
                              </Tag>
                            ) : (
                              idx === 3 && (
                                <Tag size="sm" py={1.5} px={4} variant="subtle" bgColor="gray.100" borderRadius="30px">
                                  +{mechanic?.services?.length - idx}
                                </Tag>
                              )
                            )
                          )}
                        </HStack>

                        <Divider my={4} />

                        <Flex justify="flex-start" columnGap={5} flexWrap="wrap" align="center">
                          <Flex align="center" gap={1}>
                            <Text color="gray.600">Services start from:</Text>
                            <Text fontSize="lg" fontWeight="bold">{parseInt(mechanic?.price_start).toLocaleString()}</Text>
                          </Flex>
                          <Flex align="center" gap={2}>
                            <Text color="gray.600">Average Rating: {mechanic?.rating}</Text>
                            <StarIcon boxSize={4} color="tertiary" />
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>

            {/* Map Section */}
            <Box className="map-wrapper" w="100%" maxW={{ md: "300px", lg: "400px" }} minH="500px" bg={bgColor} borderRadius="20px" borderWidth={1} borderColor={borderColor} px={4} py={4} top={4} position="sticky">
              <Box w="100%" as={MapComponent} ref={mapRef} data-map-id="mech" style={{ height: "320px", }} className="map-rounded" location={location} />      
              <Flex my={5} gap={2} borderWidth="1px" alignItems="center" rounded="lg" px={2} py={1}>
                <Text>Location:</Text>

                <CustomPlacesAutocomplete
                  onLoad={onLoad}
                  onPlaceChanged={onPlaceChanged}
                />
              </Flex>
              <Button w="100%" size="lg" colorScheme="blue" onClick={expandMap} p={4}>Expand Map</Button>
            </Box>
          </Flex>
        </Container>
    </Box>
  );
};

export default MechanicListPage;

