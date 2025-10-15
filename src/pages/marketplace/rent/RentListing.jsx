import { ChevronDownIcon } from "@chakra-ui/icons"
import { 
    Badge, Box, Button, Card, CardBody,
    CardHeader, Container, Divider, Flex, Heading,
    HStack, Image, Menu, MenuButton, MenuItem,
    MenuList, Switch, Text, VStack, SimpleGrid,
    Input, useMediaQuery, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, Spacer,
} from "@chakra-ui/react"
import { Fragment, useContext, useEffect, useState, useRef } from "react"
import { GlobalStore } from "../../../App"
import { RiClockwiseLine, RiGasStationLine, RiFilterLine } from "react-icons/ri"
import { RxTimer } from "react-icons/rx"
import { TbManualGearbox } from "react-icons/tb"
import { ListingItemCard, DatePicker } from "../../../components"
import { objectifyJSON } from "../../../utils"
import { ListingSkeleton } from "../../../components/loaders"
import { CustomPlacesAutocomplete } from "../../../components/maps"
import { MapPin, Calendar as CalendarIcon, Search as SearchIcon } from "lucide-react";
import {Autocomplete} from "@react-google-maps/api";
import {
    CarBrandFilter,
    PriceFilter,
    LocationFilter,
    TransmissionFilter,
} from "../../../components/filters";


export const RentListing = ({ props }) => {
    const [listings, setListings] = useState([]);
    const [rental, setRental] = useState({
        'where': '',
        'from': '',
        'until': ''
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile] = useMediaQuery('(max-width: 768px)');
    const {axios, notify, commaInt, authUser, apiUrl, otherContext, setOtherContext} = useContext(GlobalStore);
    const [autocomplete, setAutocomplete] = useState(null);
    const [location, setLocation] = useState({lat: 10, lng: 8, name: 'Current Location'});
    const onLoad = (auto) => setAutocomplete(auto);
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [sort, setSort] = useState('relevance');

    const onPlaceChanged = () => {
        if (autocomplete) {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setLocation({ lat, lng, name: place.name });
            setRental({ ...rental, where: place.formatted_address || place.name});
          }
        }
    };

    /**
     * @param filter: filter object
     * e.g { brand: 'bmw'}
     * e.g { min_price: 120000, max_price: 5000000}
     * 
     * */
    function applyFilter({filter, value}){
        let url = window.location.search;
        const params = new URLSearchParams(url);
        const _filters = appliedFilters;
        params.delete(filter);

        if (!_filters.includes(filter) && Boolean(value)){
            _filters.push(filter);
            params.append(filter, value);
        }else if (_filters.includes(filter) && !Boolean(value)){
            _filters.splice(_filters.indexOf(filter), 1);
        }
        setAppliedFilters([ ..._filters ]);

        // convert filterList to url param
        getData(`/listings/rentals/?${params.toString()}`);
    }

    function removeFilter(name){
        const url = new URLSearchParams(window.location.search);
        url.delete(name);
        const next = appliedFilters.filter(f => f !== name);
        setAppliedFilters(next);
        getData(`/listings/rentals/?${url.toString()}`);
    }

    function clearAll(){
        setAppliedFilters([]);
        getData(`/listings/rentals/`);
    }

    function changeSort(next){
        setSort(next);
        const url = new URLSearchParams(window.location.search);
        url.set('ordering', next === 'price_low' ? 'price' : next === 'price_high' ? '-price' : next === 'newest' ? '-created_at' : '');
        if (!url.get('ordering')) url.delete('ordering');
        getData(`/listings/rentals/?${url.toString()}`);
    }

    async function getData(url=`/listings/rentals/`){
        try {
            const res = await axios.get(url);
            const parsed = objectifyJSON(res?.data);
            const payload = parsed?.data;

            setData(payload || null);
            const results = payload?.results;
            setListings(Array.isArray(results) ? results : []);

            if (res?.status !== 200) {
                notify?.({
                    title: 'Error',
                    body: parsed?.message || 'Something went wrong fetching rentals.'
                });
            }
        } catch (error) {
            console.log("Error fetching rentals:", error);
            setListings([]);
        } finally {
            setLoading(false);
        }
    }

    function init(){
        setLoading(true);
        getData();
    }

    function changeRental(val){
        const newVal = {...rental, ...val}
        console.log("Got Rental:", newVal);
        setRental(newVal);
        setOtherContext({ ...otherContext, rental})
    }

    useEffect(() => {
        init();
        console.log("Init Rentals Page")
    }, [])

    if (loading){
        return <ListingSkeleton />
    }

    const filters = [
        <CarBrandFilter key="brand" onChange={applyFilter} />,
        <PriceFilter key="price" onChange={applyFilter} />,
        <LocationFilter key="location" onChange={applyFilter} />,
        <TransmissionFilter key="transmission" onChange={applyFilter} />,
    ]

    return(
        <Fragment>
            <Container maxWidth={'container.xl'} py={4}>

                <Box
                    w="100%"
                    mx="auto"
                    maxWidth="900px"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    boxShadow="lg"
                    py={{ base: 3, md: 4 }}
                    px={{ base: 3, md: 4 }}
                    borderRadius="2xl"
                >
                    <Flex
                        flexWrap="wrap"
                        justifyContent={{ base: "center", md: "space-between" }}
                        alignItems={{base: "center", md: 'end'}}
                        gap={3}
                    >
                        <VStack flex={{ base: "1 1 100%", md: "1 1 auto" }} align="stretch">
                            <Text textAlign={{base: "center", md: "left"}} mb={1} lineHeight="1" fontWeight="600" className="small" color="gray.600">
                                Where
                            </Text>
                            <Flex align="center" gap={2} borderWidth="1px" borderColor="gray.200" bg="gray.50" borderRadius="full" px={3} py={2}>
                              <MapPin size={18} color="#64748B" />
                              <Box flex={1}>
                                <CustomPlacesAutocomplete onPlaceChange={console.log} />
                              </Box>
                            </Flex>
                            {/*<Autocomplete
                              onLoad={onLoad}
                              style={{width: "100%"}}
                              onPlaceChanged={onPlaceChanged}
                              className="w-full"
                            >
                                <Input type="text" border="1px solid lavender" placeholder="City, airport, hotel?" className="small" />
                            </Autocomplete>*/}
                        </VStack>

                        <VStack
                        flex={{ base: "1 1 100%", md: "1 1 auto" }}
                        align="stretch"
                        px={{ base: 0, md: 4 }}
                        borderLeft={{ base: "none", md: "1px solid" }}
                        borderRight={{ base: "none", md: "1px solid" }}
                        borderColor={{ md: 'gray.200' }}
                        >
                            <Text textAlign={{base: "center", md: "left"}} mb={1} lineHeight="1" fontWeight="600" className="small" color="gray.600">
                                From
                            </Text>
                            <Flex align="center" gap={2} borderWidth="1px" borderColor="gray.200" bg="gray.50" borderRadius="full" px={3} py={2}>
                              <CalendarIcon size={18} color="#64748B" />
                              <Box flex={1}>
                                <DatePicker onChange={(val) => changeRental({ 'from': val })} />
                              </Box>
                            </Flex>
                        </VStack>

                        <VStack flex={{ base: "1 1 100%", md: "1 1 auto" }} align="stretch">
                            <Text textAlign={{base: "center", md: "left"}} mb={1} lineHeight="1" fontWeight="600" className="small" color="gray.600">
                                Until
                            </Text>
                            <Flex align="center" gap={2} borderWidth="1px" borderColor="gray.200" bg="gray.50" borderRadius="full" px={3} py={2}>
                              <CalendarIcon size={18} color="#64748B" />
                              <Box flex={1}>
                                <DatePicker onChange={(val) => changeRental({ 'until': val })} />
                              </Box>
                            </Flex>
                        </VStack>

                        <Button
                            colorScheme="blue"
                            bg="primary"
                            leftIcon={<SearchIcon size={18} />}
                            borderRadius="full"
                            px={6}
                            h={{ base: 12, md: 10 }}
                            w={{ base: "100%", md: "auto" }}
                        >
                            Search
                        </Button>
                    </Flex>
                </Box>


                <Box my={2} py={3} px={3} borderWidth="1px" borderRadius="12px" bg="gray.50">
                  <Flex align="center" gap={3} wrap="wrap">
                    <HStack spacing={2}>
                      <Menu>
                        <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />} variant="outline">
                          Sort: {sort === 'relevance' ? 'Relevance' : sort === 'price_low' ? 'Price (Low→High)' : sort === 'price_high' ? 'Price (High→Low)' : 'Newest'}
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => changeSort('relevance')}>Relevance</MenuItem>
                          <MenuItem onClick={() => changeSort('price_low')}>Price (Low→High)</MenuItem>
                          <MenuItem onClick={() => changeSort('price_high')}>Price (High→Low)</MenuItem>
                          <MenuItem onClick={() => changeSort('newest')}>Newest</MenuItem>
                        </MenuList>
                      </Menu>
                      <Button size="sm" variant="ghost" onClick={clearAll} isDisabled={!appliedFilters.length}>Clear all</Button>
                    </HStack>
                    <Spacer />
                    <Wrap spacing={2} className="hidden-scroll" overflowX="auto">
                      {filters.map((filter, i) => <WrapItem key={`filter-${i}`}>{filter}</WrapItem>)}
                    </Wrap>
                  </Flex>

                  {!!appliedFilters.length && (
                    <Wrap mt={3} spacing={2}>
                      {appliedFilters.map((f) => (
                        <WrapItem key={`applied-${f}`}>
                          <Tag size="sm" borderRadius="full" colorScheme="blue" variant="subtle">
                            <TagLabel>{f}</TagLabel>
                            <TagCloseButton onClick={() => removeFilter(f)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>

                <Heading fontWeight="400" mb={3} size={'md'} color="primary" className=""> {listings?.length} cars are available in your area </Heading>

                <SimpleGrid
                 placeItems={isMobile ? 'center' : 'unset'}
                 gap={8}
                 spacing={8}
                 columns={{base: 1, md: 2, lg: 3, xl: 4}}
                >
                    {
                        (listings || []).map((listing, idx) =>
                            <ListingItemCard
                             listing={listing}
                             key={listing?.id ?? idx}
                             w="100%"
                             maxW={'350px'}
                            />
                        )
                    }
                </SimpleGrid>
            </Container>
        </Fragment>
    )
}


export default RentListing;