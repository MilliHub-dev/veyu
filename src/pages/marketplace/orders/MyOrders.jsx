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
          <TableContainer borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol}>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Vehicle</Th>
                  <Th>Order Type</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order.uuid}>
                    <Td>
                      <HStack spacing={3}>
                        <Image
                          src={order?.order_item?.vehicle?.images?.[0]?.url}
                          alt={order?.order_item?.vehicle?.name}
                          w="80px"
                          h="50px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <Box>
                          <Text fontWeight="600" fontSize="sm">
                            {order?.order_item?.vehicle?.name}
                          </Text>
                          <HStack spacing={2} fontSize="xs" color="gray.500">
                            <MapPin size={12} />
                            <Text>{order?.order_item?.vehicle?.dealer?.location || 'N/A'}</Text>
                          </HStack>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="blue" textTransform="capitalize">
                        {order?.order_type || 'Purchase'}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600" color="green.600">
                          ₦{commaInt(order?.sub_total)}
                        </Text>
                        {order?.paid ? (
                          <Badge colorScheme="green" size="sm">Paid</Badge>
                        ) : (
                          <Badge colorScheme="red" size="sm">Unpaid</Badge>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <HStack>
                        {getStatusIcon(order?.order_status)}
                        <Badge colorScheme={getStatusColor(order?.order_status)}>
                          {order?.order_status || 'Pending'}
                        </Badge>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm">
                          {new Date(order?.date_created).toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(order?.date_created).toLocaleTimeString()}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MoreVertical size={16} />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<Eye size={16} />}
                            onClick={() => viewOrderDetails(order.uuid)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<Download size={16} />}
                            onClick={() => downloadInvoice(order.uuid)}
                          >
                            Download Invoice
                          </MenuItem>
                          <MenuItem
                            icon={<MessageCircle size={16} />}
                            onClick={() => contactDealer(order)}
                          >
                            Contact Dealer
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
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
