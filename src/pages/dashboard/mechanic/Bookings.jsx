import { useState, useEffect, useContext, Fragment } from "react"
import {GlobalStore} from '../../../contexts/GlobalStore';
import {MechanicContext} from './Layout';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {
  Box,
  Button,
  Flex,
  Heading,
  Avatar,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  TableContainer,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Container,
  VStack,
  useColorModeValue,
  Tag,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react"
import {MoreVertical, MapPin, Search, CheckCircle, Clock, Filter} from 'lucide-react';
import { mechanicService } from '../../../services';
import { useToast } from '@chakra-ui/react';

const BookingStatusColors = {
  'accepted': 'blue',
  'working': 'purple',
  'requested': 'cyan',
  'completed': 'green',
  'declined': 'yellow',
  'expired': 'red',
  'canceled': 'red',
}


// Enhanced Client Info Component
const ClientInfo = ({ name, location, image }) => (
  <Flex align="center">
    <Avatar 
      src={image} 
      name={name} 
      size="md"
      mr={3}
      border="2px solid"
      borderColor="gray.100"
    />
    <Box>
      <Text fontWeight="semibold" fontSize="sm" color="gray.900">
        {name}
      </Text>
      <Flex align="center" color="gray.500" fontSize="xs" mt={1}>
        <MapPin size={12} style={{ marginRight: "4px" }} />
        <Text>{location}</Text>
      </Flex>
    </Box>
  </Flex>
)

const Bookings = () => {
  const [activeFilter, setActiveFilter] = useState("All")
  const [bookingHistory, setBookingHistory] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const {naturalDate, naturalTime } = useContext(GlobalStore);
  const {mechanic} = useContext(MechanicContext);
  const toast = useToast();

  const filters = [
    'All',
    'Accepted',
    'Completed',
    'Declined',
    'Working',
  ]

  async function init(){
    try {
      setLoading(true);
      setError(null);
      
      // If mechanic is new or profile is not fully set up, skip API call
      if (mechanic?.isNew || mechanic?.status === 'pending_verification') {
        console.log("New mechanic detected, skipping bookings fetch");
        setPendingRequests([]);
        setBookingHistory([]);
        setFilteredBookings([]);
        return;
      }

      // Pass skipErrorLogging to avoid console noise for 500/404 errors on new/incomplete profiles
      const data = await mechanicService.getBookings({}, { skipErrorLogging: true });
      console.log("Bookings:", data);
      
      const requests = data.bookings?.requests || data.requests || [];
      const history = data.bookings?.history || data.history || [];
      
      setPendingRequests(requests);
      setBookingHistory(history);
      setFilteredBookings(history);
    } catch (error) {
      // Handle 404 (Not Found) and 500 (Server Error) as empty state
      // This is common for new profiles or incomplete data
      if (error.response?.status === 404 || error.response?.status === 500 || error.status === 404 || error.status === 500) {
        console.log(`Bookings fetch skipped due to error (${error.response?.status || error.status}), using empty state`);
        setPendingRequests([]);
        setBookingHistory([]);
        setFilteredBookings([]);
        return;
      }
      
      console.error("Error fetching bookings:", error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStartJob(requestId){
    try {
      await mechanicService.startJob(requestId);
      
      toast({
        title: 'Success',
        description: 'Job started successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await init();
    } catch (error) {
      console.error("Error starting job:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start job. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }
  
  // Filter bookings based on selected filter
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)

    let filtered = bookingHistory;
    
    if (filter !== "All") {
      filtered = bookingHistory.filter((booking) => 
        booking.status.toLowerCase() === filter.toLowerCase()
      );
    }

    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((booking) =>
        booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.services?.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredBookings(filtered);
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    handleFilterChange(activeFilter); // Re-apply current filter with search
  };

  async function handleAcceptRequest(requestId){
    try {
      await mechanicService.acceptBooking(requestId);
      
      toast({
        title: 'Success',
        description: 'Request accepted successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await init();

    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept request. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }
  
  async function handleDeclineRequest(requestId){
    try {
      await mechanicService.declineBooking(requestId, 'Declined by mechanic');
      
      toast({
        title: 'Success',
        description: 'Request declined successfully!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      await init();
    } catch (error) {
      console.error("Error declining request:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline request. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    init();
  }, []);

  // Apply filters when activeFilter or searchQuery changes
  useEffect(() => {
    handleFilterChange(activeFilter);
  }, [activeFilter, searchQuery, bookingHistory]);

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="lg" color="gray.600">Loading bookings...</Text>
          </Box>
        </VStack>
      </Container>
    )
  }

  if (error && !bookingHistory.length) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="lg" color="red.500" mb={4}>Failed to load bookings</Text>
            <Button onClick={init} colorScheme="blue">
              Try Again
            </Button>
          </Box>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      {/* Modern Header */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={2}>
          <Box>
            <Heading as="h1" size="xl" color="gray.900" mb={2}>
              Bookings Management
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Manage your service requests and booking history
            </Text>
          </Box>
          <HStack>
            <Button leftIcon={<Filter size={16} />} variant="outline" size="sm">
              Filter
            </Button>
            <Button colorScheme="blue" size="sm">
              Export Data
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Pending Requests Section */}
      <Card mb={8} shadow="sm">
        <CardHeader pb={4}>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading as="h2" size="lg" color="gray.900">
                Pending Requests
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                {pendingRequests.length} requests awaiting your response
              </Text>
            </Box>
            <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
              {pendingRequests.length} Pending
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          {pendingRequests.length > 0 ? (
            <TableContainer borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th color="gray.600" fontWeight="semibold">Client</Th>
                    <Th color="gray.600" fontWeight="semibold">Services</Th>
                    <Th color="gray.600" fontWeight="semibold">Date</Th>
                    <Th color="gray.600" fontWeight="semibold">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendingRequests.map((request, idx) => (
                    <Tr key={idx} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <ClientInfo name={request?.customer?.name} location={request?.location} image={request?.customer?.image} />
                      </Td>
                      <Td>
                        <Flex flexWrap="wrap" gap={1}>
                          {request?.services?.map((service, idx) => (
                            <Tag key={idx} size="sm" colorScheme="blue" variant="subtle">
                              {service}
                            </Tag>
                          ))}
                        </Flex>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {naturalDate(new Date(request?.date_created))}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {naturalTime(new Date(request?.date_created))}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button 
                            onClick={() => handleAcceptRequest(request?.uuid)} 
                            colorScheme="green" 
                            size="sm"
                            leftIcon={<CheckCircle size={16} />}
                          >
                            Accept
                          </Button>
                          <Button 
                            onClick={() => handleDeclineRequest(request?.uuid)} 
                            variant="outline"
                            colorScheme="red" 
                            size="sm"
                          >
                            Decline
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={8}>
              <Clock size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg">No pending requests</Text>
              <Text color="gray.400" fontSize="sm">New requests will appear here</Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Booking History with Tabs */}
      <Card shadow="sm">
        <CardHeader pb={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading as="h2" size="lg" color="gray.900">
                Booking History
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                View and manage all your bookings
              </Text>
            </Box>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="#667085" />
              </InputLeftElement>
              <Input 
                placeholder="Search bookings..." 
                borderColor="gray.200" 
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </InputGroup>
          </Flex>

          {/* Filter Tabs */}
          <HStack spacing={2} flexWrap="wrap">
            {filters.map(filter => (
              <Button
                size="sm"
                key={filter}
                variant={activeFilter === filter ? "solid" : "outline"}
                colorScheme={activeFilter === filter ? "blue" : "gray"}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </Button>
            ))}
          </HStack>
        </CardHeader>

        <CardBody pt={0}>
          {filteredBookings.length > 0 ? (
            <TableContainer borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th color="gray.600" fontWeight="semibold">Client</Th>
                    <Th color="gray.600" fontWeight="semibold">Service</Th>
                    <Th color="gray.600" fontWeight="semibold">Date</Th>
                    <Th color="gray.600" fontWeight="semibold">Status</Th>
                    <Th color="gray.600" fontWeight="semibold">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredBookings.map((booking) => (
                    <Tr key={booking?.uuid} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <ClientInfo name={booking?.customer?.name} location={booking?.location} image={booking?.customer?.image} />
                      </Td>
                      <Td>
                        <Text fontWeight="medium" fontSize="sm">
                          {booking?.services[0]}
                        </Text>
                        {booking?.services?.length > 1 && (
                          <Text fontSize="xs" color="gray.500">
                            + {booking?.services?.length - 1} more services
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {naturalDate(new Date(booking?.date_created))}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {naturalTime(new Date(booking?.date_created))}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={BookingStatusColors[booking?.status]}
                          px={3}
                          py={1}
                          borderRadius="full"
                          textTransform="capitalize"
                          fontSize="xs"
                        >
                          {booking.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Flex gap={2}>
                          {booking?.status === 'accepted' && (
                            <Button size="sm" colorScheme="blue" onClick={() => handleStartJob(booking?.uuid)} leftIcon={<CheckCircle size={14} />}>
                              Start Job
                            </Button>
                          )}
                          {booking?.status === 'working' && (
                            <Fragment>
                              <Button size="sm" colorScheme="green">
                                Finish Job
                              </Button>
                              <Button size="sm" variant="outline" colorScheme="red">
                                Cancel
                              </Button>
                            </Fragment>
                          )}
                          {!['expired', 'canceled', 'declined'].includes(booking?.status) && (
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<MoreVertical size={16} />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem>View details</MenuItem>
                                <MenuItem>Contact client</MenuItem>
                                <MenuItem>Download invoice</MenuItem>
                              </MenuList>
                            </Menu>
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={8}>
              <Clock size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg">No bookings found</Text>
              <Text color="gray.400" fontSize="sm">Try adjusting your filters</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default Bookings

