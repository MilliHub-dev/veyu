import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalStore } from '../../../App';
import { objectifyJSON } from '../../../utils';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Download,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  ClipboardCheck,
  AlertCircle,
  ExternalLink,
  Car,
} from 'lucide-react';

function MyOrders() {
  const { axios, notify, commaInt } = useContext(GlobalStore);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');

  async function getMyOrders() {
    try {
      setLoading(true);
      const res = await axios.get('/listings/my-orders/');
      const data = objectifyJSON(res.data);

      if (res.status === 200) {
        const orderData = data?.data || [];
        setOrders(orderData);

        // Calculate stats
        const stats = {
          total: orderData.length,
          pending: orderData.filter(o => o.order_status?.toLowerCase() === 'pending').length,
          completed: orderData.filter(o => o.order_status?.toLowerCase() === 'completed').length,
          cancelled: orderData.filter(o => o.order_status?.toLowerCase() === 'cancelled').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      notify({
        title: 'Error',
        body: error?.response?.data?.message || 'Failed to load orders',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    const statusLower = status?.toLowerCase();
    const colorMap = {
      pending: 'yellow',
      'awaiting-inspection': 'blue',
      'inspection-scheduled': 'cyan',
      'inspection-completed': 'purple',
      completed: 'green',
      cancelled: 'red',
      refunded: 'orange',
    };
    return colorMap[statusLower] || 'gray';
  }

  function getStatusIcon(status) {
    const statusLower = status?.toLowerCase();
    const iconMap = {
      pending: <Clock size={16} />,
      'awaiting-inspection': <FileText size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <XCircle size={16} />,
    };
    return iconMap[statusLower] || <Package size={16} />;
  }

  function viewOrderDetails(orderId) {
    navigate(`/orders/${orderId}`);
  }

  function downloadInvoice(orderId) {
    // TODO: Implement invoice download
    notify({
      title: 'Coming Soon',
      body: 'Invoice download will be available soon',
      color: 'blue',
    });
  }

  function contactDealer(order) {
    // TODO: Implement dealer contact
    notify({
      title: 'Coming Soon',
      body: 'Direct messaging will be available soon',
      color: 'blue',
    });
  }

  useEffect(() => {
    getMyOrders();
  }, []);

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={20}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text mt={4} color="gray.600">Loading your orders...</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>My Orders</Heading>
          <Text color="gray.600">Track and manage your vehicle orders</Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Total Orders</StatLabel>
                <StatNumber fontSize="2xl">{stats.total}</StatNumber>
                <StatHelpText>
                  <Package size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  All time
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Pending</StatLabel>
                <StatNumber fontSize="2xl" color="yellow.500">{stats.pending}</StatNumber>
                <StatHelpText>
                  <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  In progress
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Completed</StatLabel>
                <StatNumber fontSize="2xl" color="green.500">{stats.completed}</StatNumber>
                <StatHelpText>
                  <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Successful
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Cancelled</StatLabel>
                <StatNumber fontSize="2xl" color="red.500">{stats.cancelled}</StatNumber>
                <StatHelpText>
                  <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Not completed
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
            <CardBody>
              <VStack spacing={4} py={8}>
                <ShoppingCart size={48} color="gray" />
                <Heading size="md" color="gray.600">No orders yet</Heading>
                <Text color="gray.500" textAlign="center">
                  You haven't placed any orders yet. Start shopping for your dream vehicle!
                </Text>
                <Button as={Link} to="/buy" colorScheme="blue" leftIcon={<ShoppingCart size={18} />}>
                  Browse Vehicles
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {orders.map((order) => {
              const vehicle = order?.order_item?.vehicle;
              const dealer = vehicle?.dealer;
              const hasInspection = order?.includes_inspection;
              const inspectionScheduled = order?.inspection_scheduled;
              const inspectionSlipRef = order?.inspection_slip_reference;
              const purchaseType = order?.purchase_type || (hasInspection ? 'With Inspection' : 'Direct Purchase');

              return (
                <Card
                  key={order.uuid}
                  bg={cardBg}
                  borderColor={borderCol}
                  borderWidth={1}
                  _hover={{ shadow: 'md', borderColor: 'blue.300' }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => viewOrderDetails(order.uuid)}
                >
                  <CardBody>
                    <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                      {/* Vehicle Image */}
                      <Box flexShrink={0}>
                        <Image
                          src={vehicle?.images?.[0]?.url}
                          alt={vehicle?.name}
                          w={{ base: '100%', lg: '200px' }}
                          h="150px"
                          objectFit="cover"
                          borderRadius="lg"
                        />
                      </Box>

                      {/* Order Details */}
                      <Flex flex={1} direction="column" gap={3}>
                        {/* Header Row */}
                        <Flex justify="space-between" align="start" flexWrap="wrap" gap={2}>
                          <Box>
                            <HStack spacing={2} mb={1}>
                              <Car size={18} />
                              <Heading size="md">{vehicle?.name}</Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              Order #{order?.id} • {order?.uuid}
                            </Text>
                          </Box>
                          <Badge
                            colorScheme={getStatusColor(order?.order_status)}
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {getStatusIcon(order?.order_status)}
                            <Text as="span" ml={1}>
                              {order?.order_status || 'Pending'}
                            </Text>
                          </Badge>
                        </Flex>

                        {/* Info Grid */}
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                          {/* Purchase Type */}
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              Purchase Type
                            </Text>
                            <HStack spacing={1}>
                              {hasInspection ? (
                                <ClipboardCheck size={14} color="blue" />
                              ) : (
                                <Package size={14} color="green" />
                              )}
                              <Text fontSize="sm" fontWeight="600">
                                {purchaseType}
                              </Text>
                            </HStack>
                          </Box>

                          {/* Amount */}
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              Total Amount
                            </Text>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="700" color="green.600">
                                {formatCurrency(order?.total || order?.sub_total, order?.currency || order?.order_item?.currency)}
                              </Text>
                              {order?.paid ? (
                                <Badge colorScheme="green" size="xs">
                                  Paid
                                </Badge>
                              ) : (
                                <Badge colorScheme="red" size="xs">
                                  Unpaid
                                </Badge>
                              )}
                            </VStack>
                          </Box>

                          {/* Order Date */}
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              Order Date
                            </Text>
                            <HStack spacing={1}>
                              <Calendar size={14} />
                              <Text fontSize="sm" fontWeight="600">
                                {new Date(order?.date_created).toLocaleDateString()}
                              </Text>
                            </HStack>
                          </Box>

                          {/* Dealer */}
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              Dealer
                            </Text>
                            <HStack spacing={1}>
                              <MapPin size={14} />
                              <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                {dealer?.business_name || 'N/A'}
                              </Text>
                            </HStack>
                          </Box>
                        </SimpleGrid>

                        <Divider />

                        {/* Inspection Info & Actions */}
                        <Flex
                          justify="space-between"
                          align="center"
                          flexWrap="wrap"
                          gap={3}
                        >
                          {/* Inspection Status */}
                          {hasInspection && (
                            <Box flex={1}>
                              {inspectionScheduled && inspectionSlipRef ? (
                                <HStack spacing={2}>
                                  <CheckCircle size={16} color="green" />
                                  <Text fontSize="sm" color="green.600" fontWeight="600">
                                    Inspection Scheduled
                                  </Text>
                                  <Button
                                    as={Link}
                                    to={`/inspections/slip/${inspectionSlipRef}`}
                                    size="xs"
                                    colorScheme="blue"
                                    variant="link"
                                    rightIcon={<ExternalLink size={12} />}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View Slip
                                  </Button>
                                </HStack>
                              ) : (
                                <HStack spacing={2}>
                                  <AlertCircle size={16} color="orange" />
                                  <Text fontSize="sm" color="orange.600" fontWeight="600">
                                    Inspection Pending
                                  </Text>
                                  <Button
                                    as={Link}
                                    to={`/orders/${order.uuid}`}
                                    size="xs"
                                    colorScheme="orange"
                                    variant="link"
                                    rightIcon={<ExternalLink size={12} />}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Schedule Now
                                  </Button>
                                </HStack>
                              )}
                            </Box>
                          )}

                          {/* Action Buttons */}
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Eye size={16} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                viewOrderDetails(order.uuid);
                              }}
                            >
                              View Details
                            </Button>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<MoreVertical size={16} />}
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<Download size={16} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadInvoice(order.uuid);
                                  }}
                                >
                                  Download Invoice
                                </MenuItem>
                                <MenuItem
                                  icon={<MessageCircle size={16} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    contactDealer(order);
                                  }}
                                >
                                  Contact Dealer
                                </MenuItem>
                                {hasInspection && inspectionSlipRef && (
                                  <MenuItem
                                    as={Link}
                                    to={`/inspections/slip/${inspectionSlipRef}`}
                                    icon={<FileText size={16} />}
                                  >
                                    View Inspection Slip
                                  </MenuItem>
                                )}
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Flex>
                      </Flex>
                    </Flex>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        )}

        {/* Help Section */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="600" mb={1}>Need Help?</Text>
            <Text fontSize="sm">
              If you have any questions about your orders, please contact our support team.
            </Text>
          </Box>
        </Alert>
      </VStack>
    </Container>
  );
}

export default MyOrders;
