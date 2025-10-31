import { useState, useEffect, useContext, Fragment } from "react"
import {GlobalStore} from '../../../App';
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
  const {axios, notify, authUser, naturalDate, naturalTime } = useContext(GlobalStore);

  const filters = [
    'All',
    'Accepted',
    'Completed',
    'Declined',
    'Working',
  ]

  async function init(){
    const res = await axios.get('/admin/mechanics/bookings/');
    const data = await objectifyJSON(res.data);

    if (res.status === 200){
      console.log("Bookings:", data.bookings);
      setPendingRequests(data.bookings.requests);
      setBookingHistory(data.bookings.history);
      setFilteredBookings(data.bookings.history);
    }
  }


  async function handleStartJob(requestId){
    const res = await axios.post(`/admin/mechanics/bookings/${requestId}/`, jsonifyObject({
      action: 'start-job'
    }));
    const data = await objectifyJSON(res.data);
    if (res.status === 200){
      notify({
        title: 'Success',
        body: 'Job Started!',
        level: 'info'
      });

      init();

    }
  }
  

  // Filter bookings based on selected filter
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)

    if (filter === "All") {
      setFilteredBookings(bookingHistory)
    } else {
      setFilteredBookings(bookingHistory.filter((booking) => booking.status.toLowerCase() === filter.toLowerCase()))
    }
  }


  async function handleAcceptRequest(requestId){
    const res = await axios.post(`/admin/mechanics/bookings/${requestId}/`, jsonifyObject({
      action: 'accept'
    }));
    const data = await objectifyJSON(res.data);
    if (res.status === 200){
      notify({
        title: 'Success',
        body: 'Request Accepted!',
        level: 'info'
      });

      init();

    }
  }
  
  async function handleDeclineRequest(requestId){
    const res = await axios.post(`/admin/mechanics/bookings/${requestId}/`, jsonifyObject({
      action: 'decline'
    }));
    const data = await objectifyJSON(res.data);
    if (res.status === 200){
      notify({
        title: 'Success',
        body: 'Request Declined!',
        level: 'info'
      });

      init();

    }
  }


  useEffect(() => {
    init();
  }, [])

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
              <Input placeholder="Search bookings..." borderColor="gray.200" />
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

