import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  Tag,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Container,
  VStack,
  Divider,
} from "@chakra-ui/react"
import {
  FaChevronDown,
  FaChevronRight,
} from 'react-icons/fa6'
import {useState, useEffect, useContext, Fragment} from 'react';
import {GlobalStore} from '../../../App';
import {MechanicContext} from './Layout';
import { Link } from 'react-router-dom';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {MapPin, Search, MoreVertical, TrendingUp, Users, Calendar, DollarSign, Clock, CheckCircle, Share2} from 'lucide-react';
import { mechanicService } from '../../../services';
import { useToast } from '@chakra-ui/react';
import { useDashboardError } from '../../../hooks/useDashboardError';
import { InlineError, EmptyStateError } from '../../../components/ErrorDisplay';

// Modern Metric Card Component
const MetricCard = ({ title, value, change, icon: IconComponent, suffix, color = "blue" }) => {
  const isPositive = change > 0
  const trendColor = isPositive ? "green.500" : "red.500"
  const changeText = `${isPositive ? "+" : ""}${change}%`
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.100", "gray.700")

  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="sm" _hover={{ shadow: "md", transform: "translateY(-2px)" }} transition="all 0.2s">
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              {title}
            </Text>
            <Flex align="baseline">
              <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                {value}
              </Text>
              {suffix && <Text ml={1} fontSize="sm" color="gray.500">{suffix}</Text>}
            </Flex>
          </Box>
          <Box p={3} bg={`${color}.50`} borderRadius="lg">
            <IconComponent size={20} color={`var(--chakra-colors-${color}-500)`} />
          </Box>
        </Flex>
        
        {change && (
          <Stat>
            <StatHelpText>
              <Flex align="center">
                <StatArrow type={isPositive ? "increase" : "decrease"} />
                <Text as="span" fontSize="sm" color={trendColor} fontWeight="medium" mr={1}>
                  {changeText}
                </Text>
                <Text as="span" fontSize="sm" color="gray.500">
                  this month
                </Text>
              </Flex>
            </StatHelpText>
          </Stat>
        )}
      </CardBody>
    </Card>
  )
}

// Enhanced Client Info Component
const ClientInfo = ({ customer, location }) => (
  <Flex align="center">
    <Avatar 
      src={customer?.image} 
      name={customer?.name} 
      size="md"
      mr={3}
      border="2px solid"
      borderColor="gray.100"
    />
    <Box>
      <Text fontWeight="semibold" fontSize="sm" color="gray.900">
        {customer?.name}
      </Text>
      <Flex align="center" color="gray.500" fontSize="xs" mt={1}>
        <MapPin size={12} style={{ marginRight: "4px" }} />
        <Text>{location}</Text>
      </Flex>
    </Box>
  </Flex>
)


const StatusColor = {
  'accepted': 'blue',
  'working': 'purple',
  'requested': 'cyan',
  'completed': 'green',
  'declined': 'yellow',
  'expired': 'red',
  'canceled': 'red',
}


export const MechanicOverview = () => {
  const {authUser, naturalDate, naturalTime} = useContext(GlobalStore);
  const {mechanic} = useContext(MechanicContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const toast = useToast();
  
  // Enhanced error handling
  const { 
    error, 
    clearError, 
    executeWithErrorHandling, 
    createRetryFunction 
  } = useDashboardError('mechanic dashboard');

  async function getData(){
    // If mechanic is new or profile is not fully set up, skip API call and use empty state
    // This prevents 404 errors in the console
    if (mechanic?.isNew || mechanic?.status === 'pending_verification') {
      console.log("New mechanic detected, skipping dashboard data fetch");
      const emptyData = {
        total_revenue: 0,
        total_hires: 0,
        total_bookings: 0,
        pending_requests: [],
        booking_history: []
      };
      setDashboardData(emptyData);
      setPendingRequests([]);
      setBookingHistory([]);
      return { data: emptyData };
    }

    return executeWithErrorHandling(
      async () => {
        try {
          // Pass skipErrorLogging: true to prevent API service from logging 404s for this endpoint
          const data = await mechanicService.getMechanicDashboard({ skipErrorLogging: true });
          
          console.log("Dashboard Data:", data);
          setDashboardData(data.data || data);
          setPendingRequests(data.data?.pending_requests || data.pending_requests || []);
          setBookingHistory(data.data?.booking_history || data.booking_history || []);
          return data;
        } catch (err) {
          // Handle 404 (Profile not found) and 500 (Server Error - likely missing profile data) gracefully
          // Check both standard Axios error structure and custom ApiError structure
          if ((err.response && (err.response.status === 404 || err.response.status === 500)) || err.status === 404 || err.status === 500) {
            console.log(`Mechanic dashboard error (${err.response?.status || err.status}), using empty state`);
            const emptyData = {
              total_revenue: 0,
              total_hires: 0,
              total_bookings: 0,
              pending_requests: [],
              booking_history: []
            };
            setDashboardData(emptyData);
            setPendingRequests([]);
            setBookingHistory([]);
            return { data: emptyData };
          }
          
          // Re-throw other errors to be handled by the hook
          throw err;
        }
      },
      { 
        customContext: 'loading mechanic dashboard data'
      }
    );
  }

  async function init(){
    setLoading(true);
    clearError();
    
    try {
      await getData();
    } catch (error) {
      // Error is handled by executeWithErrorHandling
    } finally {
      setLoading(false);
    }
  }

  // Create retry function
  const retryInit = createRetryFunction(
    async () => {
      await init();
    },
    { 
      maxRetries: 2,
      customContext: 'retrying mechanic dashboard load'
    }
  );

  async function handleAcceptRequest(requestId){
    await executeWithErrorHandling(
      async () => {
        await mechanicService.acceptBooking(requestId);
        
        toast({
          title: 'Success',
          description: 'Request accepted successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Refresh data
        await getData();
      },
      { 
        customContext: 'accepting booking request'
      }
    );
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

      // Refresh data
      await getData();
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

  async function handleStartJob(bookingId) {
    try {
      await mechanicService.startJob(bookingId);
      
      toast({
        title: 'Success',
        description: 'Job started successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
      await getData();
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


  useEffect(() => {
    init()
  }, []);

  if (loading){
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="lg" color="gray.600">Loading dashboard...</Text>
          </Box>
        </VStack>
      </Container>
    )
  }

  if (error && !dashboardData && !loading) {
    return (
      <Container maxW="7xl" py={8}>
        <EmptyStateError 
          error={error}
          onRetry={retryInit}
          title="Unable to load dashboard"
          description="There was a problem loading your mechanic dashboard."
        />
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      {/* Error Display */}
      {error && (
        <InlineError 
          error={error} 
          onRetry={retryInit}
          onDismiss={clearError}
          showDetails={true}
        />
      )}

      {/* Modern Header */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={2}>
          <Box>
            <Heading as="h1" size="xl" color="gray.900" mb={2}>
              Welcome back, {authUser?.first_name}
              <span role="img" aria-label="wave" style={{ marginLeft: "8px" }}>
                👋
              </span>
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Track, manage and forecast your customers and orders.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<Share2 size={16} />}
              size="md"
              variant="outline"
              colorScheme="blue"
              onClick={() => {
                const profileUrl = `${window.location.origin}/mechanic/${authUser?.slug || authUser?.id}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'My Mechanic Profile',
                    text: `Check out my mechanic services on Veyu`,
                    url: profileUrl,
                  });
                } else {
                  navigator.clipboard.writeText(profileUrl);
                  alert('Profile link copied to clipboard!');
                }
              }}
            >
              Share Profile
            </Button>
            <Button colorScheme="blue" size="lg" leftIcon={<Calendar size={20} />}>
              View Calendar
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Enhanced Metrics Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <MetricCard
          title="Total Revenue"
          value={`₦${parseInt(dashboardData?.total_revenue || 0).toLocaleString()}`}
          change={10}
          icon={DollarSign}
          color="green"
        />
        
        <MetricCard
          title="Total Hires"
          value={parseInt(dashboardData?.total_hires || 0)}
          change={-2}
          icon={Users}
          color="blue"
        />

        <MetricCard
          title="Total Bookings"
          value={parseInt(dashboardData?.total_bookings || 0)}
          change={14}
          icon={Calendar}
          color="purple"
        />

        <MetricCard
          title="Completion Rate"
          value="94%"
          change={5}
          icon={CheckCircle}
          color="teal"
        />
      </SimpleGrid>

      {/* Modern Pending Requests */}
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
            <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
              {pendingRequests.length} Pending
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          {pendingRequests.length > 0 ? (
            <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="hidden">
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
                    <Tr key={request?.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <ClientInfo customer={request?.customer} location={request?.location} />
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
            </Box>
          ) : (
            <Box textAlign="center" py={8}>
              <Clock size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg">No pending requests</Text>
              <Text color="gray.400" fontSize="sm">New requests will appear here</Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Modern Booking History */}
      <Card shadow="sm">
        <CardHeader pb={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading as="h2" size="lg" color="gray.900">
                Recent Bookings
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                Your latest booking activities
              </Text>
            </Box>
            <Button as={Link} to="/bookings" variant="outline" size="sm">
              View All
            </Button>
          </Flex>
          
          <Flex justify="space-between" flexDir={{ base: "column", sm: "row" }} gap={3}>
            <HStack>
              <Menu>
                <MenuButton as={Button} rightIcon={<FaChevronDown size={16} />} variant="outline" size="sm">
                  Last 30 days
                </MenuButton>
                <MenuList>
                  <MenuItem>Last 7 days</MenuItem>
                  <MenuItem>Last 30 days</MenuItem>
                  <MenuItem>Last 90 days</MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            <InputGroup maxW={{ base: "full", sm: "300px" }}>
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="#667085" />
              </InputLeftElement>
              <Input placeholder="Search bookings..." borderColor="gray.200" />
            </InputGroup>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          {bookingHistory?.length > 0 ? (
            <Box borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="hidden">
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
                  {bookingHistory?.slice(0, 5).map((booking) => (
                    <Tr key={booking.id} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <ClientInfo customer={booking?.customer} location={booking?.location} />
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
                          colorScheme={StatusColor[booking?.status?.toLowerCase()]}
                          px={3}
                          py={1}
                          borderRadius="full"
                          textTransform="capitalize"
                          fontSize="xs"
                        >
                          {booking?.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Flex gap={2}>
                          {booking?.status === 'accepted' && (
                            <Button 
                              size="sm" 
                              colorScheme="blue" 
                              leftIcon={<CheckCircle size={14} />}
                              onClick={() => handleStartJob(booking?.uuid || booking?.id)}
                            >
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
            </Box>
          ) : (
            <Box textAlign="center" py={8}>
              <Calendar size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg">No bookings yet</Text>
              <Text color="gray.400" fontSize="sm">Your booking history will appear here</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default MechanicOverview

