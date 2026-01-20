import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons"
import {
    Badge, Box, Button, Card, CardBody, CardHeader,
    Container, Divider, Flex, Heading, HStack, Image,
    Menu, MenuButton, MenuItem, MenuList, Switch, Text,
    ButtonGroup, Checkbox, Input, SimpleGrid,
    useMediaQuery, Tag, TagLabel, TagCloseButton,
    Wrap, WrapItem, Spacer, VStack, InputGroup,
    InputLeftElement, IconButton, useColorModeValue,
    Stat, StatLabel, StatNumber, StatHelpText,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    useBreakpointValue, Grid, GridItem,
} from "@chakra-ui/react"

import { Fragment, useContext, useEffect, useState } from "react"
import { GlobalStore } from "../../../App"
import {
    Filter,
    SlidersHorizontal,
    Grid3X3,
    List,
    TrendingUp,
    MapPin,
    Car,
    Zap,
    Calendar,
    Eye,
    Heart,
    Share2,
    ChevronRight,
    X,
    Plane,
    Ship,
    Bike,
    Radio
} from "lucide-react"
import { ListingItemCard } from "../../../components"
import { Paginator } from "../../../components/nav"
import { objectifyJSON } from "../../../utils"
import { ListingSkeleton } from "../../../components/loaders"
import {
    CarBrandFilter,
    PriceFilter,
    LocationFilter,
    TransmissionFilter,
    FuelSystemFilter,
} from "../../../components/filters"
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const BuyListing = ({ }) => {
    const [listings, setListings] = useState([]);
    const [appliedFilters, setAppliedFilters] = useState({});
    const [data, setData] = useState(null);
    const [carType, setCarType] = useState('all'); // Changed default to 'all'
    const [vehicleCategory, setVehicleCategory] = useState('all'); // New vehicle category filter
    const [sort, setSort] = useState('relevance');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [showFilters, setShowFilters] = useState(false);

    // Vehicle categories with icons and colors
    // Map frontend IDs to API vehicle_type values
    const vehicleCategories = [
        { id: 'all', name: 'All Vehicles', icon: Eye, color: 'gray.600', apiValue: null },
        { id: 'cars', name: 'Cars', icon: Car, color: '#F4A950', apiValue: 'car' },
        { id: 'motorcycles', name: 'Motorcycles', icon: Bike, color: 'blue.500', apiValue: 'bike' },
        { id: 'boats', name: 'Boats', icon: Ship, color: 'cyan.500', apiValue: 'boat' },
        { id: 'aircraft', name: 'Aircraft', icon: Plane, color: 'purple.500', apiValue: 'plane' },
        { id: 'uavs', name: 'UAVs', icon: Radio, color: 'green.500', apiValue: 'uav' }
    ];

    const { axios, notify, commaInt } = useContext(GlobalStore);
    const [loading, setLoadingState] = useState(true);
    const [isMobile] = useMediaQuery('(max-width: 768px)')
    const isMd = useBreakpointValue({ base: false, md: true });

    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    function gotoPage(pageNum) {
        console.log("Page:", pageNum)
        getData(`/listings/buy/?offset${pageNum * 25}`)
        // const res = await axios.get(`/listings/buy/`,);
        // let data = objectifyJSON(res.data);
    }

    async function gotoNextPage() {
        await setLoadingState(true)
        const next = data?.pagination?.next || null;
        if (next) {
            const res = await axios.get(`${next}`,);
            const _data = objectifyJSON(res.data);


            if (res.status === 200) {
                setData(_data?.data);
                setListings(_data?.data?.results);
                setTimeout(() => setLoadingState(false), 500)
            }
        }
    }

    async function gotoPrevPage() {
        await setLoadingState(true)
        const prev = data?.pagination?.previous || null;
        if (prev) {
            const res = await axios.get(`${prev}`,);
            const _data = objectifyJSON(res.data);

            if (res.status === 200) {
                setData(_data?.data);
                setListings(_data?.data?.results);
                setTimeout(() => setLoadingState(false), 500)
            }
        }
    }

    async function getData(url = `/listings/buy/`) {
        try {
            const res = await axios.get(url,);
            let _data = objectifyJSON(res.data);

            setData(_data.data);
            setListings(_data?.data?.results || []);

            if (res.status !== 200) {
                notify({
                    title: 'Error',
                    body: _data?.message || "Something went wrong"
                })
            }
        } catch (error) {
            console.error("Error fetching buy listings:", error);
            setListings([]);
            // Optional: Handle specific errors like 401 if needed, 
            // but usually buy listings should be public.
        }
    }

    /**
     * @param filter: filter object
     * e.g { filter: 'brands', value : 'bmw', 'audi'}
     * e.g { filter: 'price', value: 1200000-5000000}
     * e.g { filter: 'vehicle_type', value: 'car,plane'}
     * 
     * */
    function applyFilter({ filter, value }) {
        const params = new URLSearchParams();

        // Create a new copy of appliedFilters to avoid mutations
        let updatedFilters = { ...appliedFilters };

        if (Boolean(value)) {
            // Add/update the filter value
            updatedFilters[filter] = value;
        } else {
            // Remove the filter if the value is falsy
            delete updatedFilters[filter];
        }

        // Convert appliedFilters to URL parameters
        Object.entries(updatedFilters).forEach(([key, val]) => {
            params.set(key, val);
        });
        
        // Include sort ordering if applied
        if (sort && sort !== 'relevance') {
            params.set('ordering', sort === 'price_low' ? 'price' : sort === 'price_high' ? '-price' : sort === 'newest' ? '-created_at' : '');
            if (!params.get('ordering')) params.delete('ordering');
        }

        setAppliedFilters(updatedFilters);
        console.log("Applied filters", updatedFilters)

        // Send updated filter parameters to the server
        getData(`/listings/buy/?${params.toString()}`);
    }

    function removeFilter(filter) {
        applyFilter({ filter, value: null }); // Pass a falsy value to trigger removal logic
    }

    function clearAll() {
        setAppliedFilters({});
        setSort('relevance');
        setCarType('all');
        setVehicleCategory('all');
        setSearchQuery('');
        getData(`/listings/buy/`);
    }

    function changeSort(next) {
        setSort(next);
        const params = new URLSearchParams();
        
        // Include existing filters
        Object.entries(appliedFilters).forEach(([key, val]) => {
            params.set(key, val);
        });
        
        // Add ordering parameter
        params.set('ordering', next === 'price_low' ? 'price' : next === 'price_high' ? '-price' : next === 'newest' ? '-created_at' : '');
        if (!params.get('ordering')) params.delete('ordering');
        
        const query = params.toString();
        getData(`/listings/buy/${query ? `?${query}` : ''}`);
    }

    // Handle vehicle category change - sends vehicle_type to API
    function changeVehicleCategory(categoryId) {
        setVehicleCategory(categoryId);
        
        const category = vehicleCategories.find(c => c.id === categoryId);
        
        if (category?.apiValue) {
            // Apply vehicle_type filter to API
            applyFilter({ filter: 'vehicle_type', value: category.apiValue });
        } else {
            // Remove vehicle_type filter (show all)
            applyFilter({ filter: 'vehicle_type', value: null });
        }
    }


    function init() {
        getData();
        setTimeout(() => setLoadingState(false), 2500);
    }

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {

    }, [listings, carType,])

    const filters = [
        <CarBrandFilter 
            key="brand" 
            onChange={applyFilter} 
            category={vehicleCategories.find(c => c.id === vehicleCategory)?.apiValue || 'car'}
        />,
        <PriceFilter key="price" onChange={applyFilter} />,
        <TransmissionFilter key="transmission" onChange={applyFilter} />,
        <FuelSystemFilter key="fuel" onChange={applyFilter} />,
        <LocationFilter key="location" onChange={applyFilter} />,
    ]

    // Filter listings based on carType (condition: new/used)
    // Vehicle category filtering is now handled by API via vehicle_type parameter
    const getFilteredListings = () => {
        if (!listings) return [];

        let filtered = listings;

        // Filter by condition (new/used/all) - client-side only
        switch (carType) {
            case 'new':
                filtered = filtered.filter((listing) => ['new', 'New'].includes(listing?.vehicle?.condition));
                break;
            case 'used':
                filtered = filtered.filter((listing) => !['new', 'New'].includes(listing?.vehicle?.condition));
                break;
            case 'all':
            default:
                // No condition filtering
                break;
        }

        // Search query filter - client-side
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((listing) => {
                const title = listing?.title?.toLowerCase() || '';
                const brand = listing?.vehicle?.brand?.toLowerCase() || '';
                const model = listing?.vehicle?.model?.toLowerCase() || '';
                return title.includes(query) || brand.includes(query) || model.includes(query);
            });
        }

        return filtered;
    };

    const filteredListings = getFilteredListings();

    // Get count for each vehicle category from current listings
    const getCategoryCount = (categoryId) => {
        if (categoryId === 'all') return listings?.length || 0;
        
        const category = vehicleCategories.find(c => c.id === categoryId);
        if (!category?.apiValue) return 0;
        
        return listings?.filter(l => {
            const vehicleKind = l?.vehicle?.kind?.toLowerCase() || '';
            return vehicleKind === category.apiValue;
        }).length || 0;
    };

    if (loading) {
        return <ListingSkeleton />
    }

    return (
        <Box bg={bgColor} minH="100vh">
            {/* Enhanced Header Section */}
            <Box bg="white" shadow="sm" borderBottom="1px solid" borderColor={borderColor}>
                <Container maxW="7xl" py={6}>
                    <VStack spacing={6} align="stretch">
                        {/* Breadcrumb */}
                        <Breadcrumb spacing="8px" separator={<ChevronRight size={16} color="#F4A950" />}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={Link} to="/" color="gray.600" _hover={{ color: '#F4A950' }}>
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={Link} to="/marketplace" color="gray.600" _hover={{ color: '#F4A950' }}>
                                    Marketplace
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color="#F4A950" fontWeight="semibold">
                                    Buy Vehicles
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>

                        {/* Header Content */}
                        <Flex justify="space-between" align="start" flexWrap="wrap" gap={6}>
                            <VStack align="start" spacing={4} flex={1}>
                                <VStack align="start" spacing={2}>
                                    <Heading size="xl" color="gray.800">
                                        Find Your Perfect Vehicle
                                    </Heading>
                                    <Text fontSize="lg" color="gray.600">
                                        Browse through thousands of quality vehicles from verified dealers
                                    </Text>
                                </VStack>

                                {/* Enhanced Search Bar */}
                                <Box w="full" maxW="500px">
                                    <InputGroup size="lg">
                                        <InputLeftElement>
                                            <SearchIcon color="#F4A950" />
                                        </InputLeftElement>
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by make, model, or keyword..."
                                            bg="gray.50"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            borderRadius="full"
                                            _hover={{ borderColor: '#F4A950' }}
                                            _focus={{
                                                borderColor: '#F4A950',
                                                bg: 'white',
                                                shadow: '0 0 0 1px #F4A950'
                                            }}
                                            pl={12}
                                        />
                                    </InputGroup>
                                </Box>
                            </VStack>

                            {/* Stats Cards */}
                            <HStack spacing={4} display={{ base: 'none', lg: 'flex' }}>
                                <Stat textAlign="center" bg="orange.50" p={4} borderRadius="xl" minW="120px">
                                    <StatNumber color="#F4A950" fontSize="2xl">
                                        {data?.total_count || listings?.length || 0}
                                    </StatNumber>
                                    <StatLabel color="gray.600" fontSize="sm">
                                        Total Vehicles
                                    </StatLabel>
                                </Stat>
                                <Stat textAlign="center" bg="green.50" p={4} borderRadius="xl" minW="120px">
                                    <StatNumber color="green.600" fontSize="2xl">
                                        500+
                                    </StatNumber>
                                    <StatLabel color="gray.600" fontSize="sm">
                                        Verified Dealers
                                    </StatLabel>
                                </Stat>
                            </HStack>
                        </Flex>
                    </VStack>
                </Container>
            </Box>

            <Container maxW="7xl" py={8}>
                {/* Enhanced Filter Section */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    mb={8}
                >
                    <Card bg={cardBg} shadow="lg" borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                        <CardBody p={6}>
                            <VStack spacing={6} align="stretch">
                                {/* Vehicle Type Filters */}
                                <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between" align="center">
                                        <HStack spacing={3}>
                                            <Car size={24} color="#F4A950" />
                                            <Heading size="md" color="gray.800">
                                                Vehicle Condition
                                            </Heading>
                                        </HStack>

                                        {/* View Mode Toggle */}
                                        <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                                            <Text fontSize="sm" color="gray.600">View:</Text>
                                            <ButtonGroup size="sm" isAttached variant="outline">
                                                <IconButton
                                                    icon={<Grid3X3 size={16} />}
                                                    onClick={() => setViewMode('grid')}
                                                    bg={viewMode === 'grid' ? '#F4A950' : 'transparent'}
                                                    color={viewMode === 'grid' ? 'white' : 'gray.600'}
                                                    borderColor="#F4A950"
                                                    _hover={{ bg: viewMode === 'grid' ? 'orange.600' : 'orange.50' }}
                                                    aria-label="Grid view"
                                                />
                                                <IconButton
                                                    icon={<List size={16} />}
                                                    onClick={() => setViewMode('list')}
                                                    bg={viewMode === 'list' ? '#F4A950' : 'transparent'}
                                                    color={viewMode === 'list' ? 'white' : 'gray.600'}
                                                    borderColor="#F4A950"
                                                    _hover={{ bg: viewMode === 'list' ? 'orange.600' : 'orange.50' }}
                                                    aria-label="List view"
                                                />
                                            </ButtonGroup>
                                        </HStack>
                                    </HStack>

                                    {/* Enhanced Vehicle Type Buttons */}
                                    <ButtonGroup spacing={4} flexWrap="wrap">
                                        <Button
                                            onClick={() => setCarType('all')}
                                            size="lg"
                                            px={8}
                                            py={6}
                                            borderRadius="full"
                                            bg={carType === 'all' ? '#F4A950' : 'transparent'}
                                            color={carType === 'all' ? 'white' : 'gray.600'}
                                            border="2px solid"
                                            borderColor={carType === 'all' ? '#F4A950' : 'gray.300'}
                                            _hover={{
                                                bg: carType === 'all' ? 'orange.600' : 'orange.50',
                                                borderColor: '#F4A950',
                                                color: carType === 'all' ? 'white' : '#F4A950',
                                                transform: 'translateY(-2px)',
                                                shadow: 'lg'
                                            }}
                                            _active={{ transform: 'translateY(0)' }}
                                            transition="all 0.2s"
                                            leftIcon={<Eye size={20} />}
                                        >
                                            All Vehicles ({listings?.length || 0})
                                        </Button>

                                        <Button
                                            onClick={() => setCarType('new')}
                                            size="lg"
                                            px={8}
                                            py={6}
                                            borderRadius="full"
                                            bg={carType === 'new' ? '#F4A950' : 'transparent'}
                                            color={carType === 'new' ? 'white' : 'gray.600'}
                                            border="2px solid"
                                            borderColor={carType === 'new' ? '#F4A950' : 'gray.300'}
                                            _hover={{
                                                bg: carType === 'new' ? 'orange.600' : 'orange.50',
                                                borderColor: '#F4A950',
                                                color: carType === 'new' ? 'white' : '#F4A950',
                                                transform: 'translateY(-2px)',
                                                shadow: 'lg'
                                            }}
                                            _active={{ transform: 'translateY(0)' }}
                                            transition="all 0.2s"
                                            leftIcon={<Zap size={20} />}
                                        >
                                            New ({listings?.filter(l => ['new', 'New'].includes(l?.vehicle?.condition)).length || 0})
                                        </Button>

                                        <Button
                                            onClick={() => setCarType('used')}
                                            size="lg"
                                            px={8}
                                            py={6}
                                            borderRadius="full"
                                            bg={carType === 'used' ? '#F4A950' : 'transparent'}
                                            color={carType === 'used' ? 'white' : 'gray.600'}
                                            border="2px solid"
                                            borderColor={carType === 'used' ? '#F4A950' : 'gray.300'}
                                            _hover={{
                                                bg: carType === 'used' ? 'orange.600' : 'orange.50',
                                                borderColor: '#F4A950',
                                                color: carType === 'used' ? 'white' : '#F4A950',
                                                transform: 'translateY(-2px)',
                                                shadow: 'lg'
                                            }}
                                            _active={{ transform: 'translateY(0)' }}
                                            transition="all 0.2s"
                                            leftIcon={<Calendar size={20} />}
                                        >
                                            Used ({listings?.filter(l => !['new', 'New'].includes(l?.vehicle?.condition)).length || 0})
                                        </Button>
                                    </ButtonGroup>
                                </VStack>

                                <Divider />

                                {/* Vehicle Category Filters */}
                                <VStack spacing={4} align="stretch">
                                    <HStack spacing={3}>
                                        <Filter size={24} color="#F4A950" />
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
                                                        bg={isActive ? category.color : 'transparent'}
                                                        color={isActive ? 'white' : 'gray.600'}
                                                        border="2px solid"
                                                        borderColor={isActive ? category.color : 'gray.300'}
                                                        _hover={{
                                                            bg: isActive ? category.color : `${category.color}20`,
                                                            borderColor: category.color,
                                                            color: isActive ? 'white' : category.color,
                                                            transform: 'translateY(-2px)',
                                                            shadow: 'md'
                                                        }}
                                                        _active={{ transform: 'translateY(0)' }}
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

                                {/* Sort and Filter Controls */}
                                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                                    <HStack spacing={4} flexWrap="wrap">
                                        {/* Sort Menu */}
                                        <Menu>
                                            <MenuButton
                                                as={Button}
                                                rightIcon={<ChevronDownIcon />}
                                                variant="outline"
                                                borderColor="#F4A950"
                                                color="#F4A950"
                                                _hover={{ bg: 'orange.50' }}
                                                _active={{ bg: 'orange.100' }}
                                                leftIcon={<TrendingUp size={16} />}
                                            >
                                                Sort: {sort === 'relevance' ? 'Relevance' : sort === 'price_low' ? 'Price (Low→High)' : sort === 'price_high' ? 'Price (High→Low)' : 'Newest'}
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem onClick={() => changeSort('relevance')}>Relevance</MenuItem>
                                                <MenuItem onClick={() => changeSort('price_low')}>Price (Low→High)</MenuItem>
                                                <MenuItem onClick={() => changeSort('price_high')}>Price (High→Low)</MenuItem>
                                                <MenuItem onClick={() => changeSort('newest')}>Newest</MenuItem>
                                            </MenuList>
                                        </Menu>

                                        {/* Filter Toggle */}
                                        <Button
                                            onClick={() => setShowFilters(!showFilters)}
                                            variant="outline"
                                            borderColor="#F4A950"
                                            color="#F4A950"
                                            _hover={{ bg: 'orange.50' }}
                                            _active={{ bg: 'orange.100' }}
                                            leftIcon={<SlidersHorizontal size={16} />}
                                        >
                                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                                        </Button>

                                        {/* Clear All */}
                                        <Button
                                            variant="ghost"
                                            onClick={clearAll}
                                            isDisabled={!Object.keys(appliedFilters).length}
                                            color="gray.600"
                                            _hover={{ color: 'red.500', bg: 'red.50' }}
                                            leftIcon={<X size={16} />}
                                        >
                                            Clear All
                                        </Button>
                                    </HStack>

                                    {/* Results Count */}
                                    <Text color="gray.600" fontSize="sm" fontWeight="medium">
                                        Showing {filteredListings.length} of {listings?.length || 0} vehicles
                                    </Text>
                                </Flex>

                                {/* Advanced Filters */}
                                {showFilters && (
                                    <MotionBox
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Divider mb={4} />
                                        <Wrap spacing={4}>
                                            {filters.map((filter, i) => (
                                                <WrapItem key={`filter-${i}`}>
                                                    {filter}
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                    </MotionBox>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </MotionBox>

                {/* Applied Filters */}
                <FilterList appliedFilters={appliedFilters} onRemove={removeFilter} />

                {/* Listings Grid */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {filteredListings.length > 0 ? (
                        <SimpleGrid
                            columns={{
                                base: 1,
                                md: viewMode === 'list' ? 1 : 2,
                                lg: viewMode === 'list' ? 1 : 3,
                                xl: viewMode === 'list' ? 1 : 4
                            }}
                            spacing={8}
                            placeItems={isMobile ? 'center' : 'unset'}
                        >
                            {filteredListings.map((listing, idx) => (
                                <MotionBox
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                    w="100%"
                                    maxW={viewMode === 'list' ? 'full' : '350px'}
                                >
                                    <ListingItemCard
                                        listing={listing}
                                        w="100%"
                                    />
                                </MotionBox>
                            ))}
                        </SimpleGrid>
                    ) : (
                        <VStack spacing={6} py={16} textAlign="center">
                            <Car size={64} color="#F4A950" />
                            <VStack spacing={2}>
                                <Heading size="lg" color="gray.600">
                                    No vehicles found
                                </Heading>
                                <Text color="gray.500" maxW="400px">
                                    Try adjusting your filters or search criteria to find more vehicles.
                                </Text>
                            </VStack>
                            <Button
                                onClick={clearAll}
                                bg="#F4A950"
                                color="white"
                                _hover={{ bg: 'orange.600' }}
                                size="lg"
                                borderRadius="full"
                                px={8}
                            >
                                Clear All Filters
                            </Button>
                        </VStack>
                    )}
                </MotionBox>

                {/* Enhanced Pagination */}
                {data?.pagination && (
                    <Box mt={12}>
                        <Paginator
                            pagination={data.pagination}
                            onNext={gotoNextPage}
                            onPrevious={gotoPrevPage}
                            onClick={console.log}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    )
}


const FilterList = ({ appliedFilters, onRemove }) => {
    const hasFilters = Object.keys(appliedFilters).length > 0;

    if (!hasFilters) return null;

    return (
        <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            mb={6}
        >
            <Card bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200">
                <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                        <HStack spacing={2}>
                            <Filter size={16} color="#F4A950" />
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                Active Filters ({Object.keys(appliedFilters).length})
                            </Text>
                        </HStack>

                        <Wrap spacing={2}>
                            {Object.keys(appliedFilters).map((key, idx) => (
                                <WrapItem key={idx}>
                                    <Tag
                                        size="lg"
                                        bg="#F4A950"
                                        color="white"
                                        borderRadius="full"
                                        px={4}
                                        py={2}
                                        _hover={{ bg: 'orange.600' }}
                                        transition="all 0.2s"
                                    >
                                        <TagLabel textTransform="capitalize" fontWeight="medium">
                                            {key}: {appliedFilters[key]}
                                        </TagLabel>
                                        <TagCloseButton
                                            onClick={() => onRemove(key)}
                                            ml={2}
                                            _hover={{ bg: 'whiteAlpha.200' }}
                                        />
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </VStack>
                </CardBody>
            </Card>
        </MotionBox>
    );
};






export default BuyListing