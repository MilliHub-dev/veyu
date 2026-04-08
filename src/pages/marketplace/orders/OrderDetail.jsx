import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GlobalStore } from '../../../contexts/GlobalStore';
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
  Spinner,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  Avatar,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  Download,
  CreditCard,
} from 'lucide-react';
import { PaystackPaymentModal, WalletPaymentModal } from '../../../components/wallet';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { axios, notify, commaInt, authUser } = useContext(GlobalStore);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentMethod, setPaymentMethod] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');

  async function getOrderDetails() {
    try {
      setLoading(true);
      const res = await axios.get(`/listings/my-orders/${orderId}/`);
      const data = objectifyJSON(res.data);

      if (res.status === 200) {
        setOrder(data?.data || data);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
      notify({
        title: 'Error',
        body: error?.response?.data?.message || 'Failed to load order details',
        color: 'red',
      });
      setTimeout(() => navigate('/orders'), 2000);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    const statusLower = status?.toLowerCase();
    const colorMap = {
      pending: 'yellow',
      'awaiting-inspection': 'blue',
      'inspection-completed': 'purple',
      completed: 'green',
      cancelled: 'red',
    };
    return colorMap[statusLower] || 'gray';
  }

  function handlePayBalance(method) {
    setPaymentMethod(method);
    onOpen();
  }

  async function handleWalletPayment() {
    try {
      setPaymentLoading(true);
      const res = await axios.post(`/listings/my-orders/${orderId}/pay-with-wallet/`);
      
      if (res.status === 200) {
        notify({
          title: 'Payment Successful',
          body: 'Payment completed successfully with wallet',
          color: 'green',
        });
        onClose();
        getOrderDetails();
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      notify({
        title: 'Payment Failed',
        body: error?.response?.data?.message || 'Failed to process wallet payment',
        color: 'red',
      });
    } finally {
      setPaymentLoading(false);
    }
  }

  async function onPaymentSuccess(response) {
    console.log('Payment successful:', response);
    
    try {
      // Verify payment with backend
      const res = await axios.post(`/listings/my-orders/${orderId}/verify-payment/`, {
        reference: response.reference || response.trxref,
        payment_method: paymentMethod === 'wallet' ? 'wallet' : 'card',
      });

      if (res.status === 200) {
        notify({
          title: 'Payment Successful',
          body: 'Your payment has been completed successfully',
          color: 'green',
        });
        onClose();
        getOrderDetails(); // Refresh order details
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      notify({
        title: 'Verification Failed',
        body: error?.response?.data?.message || 'Payment received but verification failed. Please contact support.',
        color: 'orange',
      });
    }
  }

  useEffect(() => {
    getOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Box textAlign="center" py={20}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text mt={4} color="gray.600">Loading order details...</Text>
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          Order not found
        </Alert>
      </Container>
    );
  }

  const vehicle = order?.order_item?.vehicle;
  const dealer = vehicle?.dealer;
  const needsPayment = !order?.paid;

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Back Button */}
        <Button
          leftIcon={<ArrowLeft size={18} />}
          variant="ghost"
          onClick={() => navigate('/orders')}
          alignSelf="flex-start"
        >
          Back to Orders
        </Button>

        {/* Header */}
        <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
          <CardBody>
            <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
              <Box>
                <HStack spacing={2} mb={2}>
                  <Package size={20} />
                  <Heading size="md">Order #{order?.id}</Heading>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Order ID: {order?.uuid}
                </Text>
                <HStack mt={2} spacing={2}>
                  <Calendar size={14} />
                  <Text fontSize="sm" color="gray.600">
                    Placed on {new Date(order?.date_created).toLocaleDateString()}
                  </Text>
                </HStack>
              </Box>
              <Badge colorScheme={getStatusColor(order?.order_status)} fontSize="md" px={4} py={2}>
                {order?.order_status || 'Pending'}
              </Badge>
            </Flex>
          </CardBody>
        </Card>

        {/* Payment Alert */}
        {needsPayment && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box flex={1}>
              <Text fontWeight="600">Payment Required</Text>
              <Text fontSize="sm">
                Please complete payment for this vehicle to proceed with your order.
              </Text>
            </Box>
            <Button colorScheme="orange" size="sm" onClick={() => handlePayBalance('card')}>
              Pay Now
            </Button>
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Vehicle Details */}
          <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
            <CardHeader>
              <Heading size="sm">Vehicle Details</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Image
                  src={vehicle?.images?.[0]?.url}
                  alt={vehicle?.name}
                  w="100%"
                  h="200px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Box>
                  <Heading size="md" mb={2}>{vehicle?.name}</Heading>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text color="gray.600">Condition:</Text>
                      <Badge>{vehicle?.condition}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Mileage:</Text>
                      <Text>{commaInt(vehicle?.mileage)} km</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Transmission:</Text>
                      <Text>{vehicle?.transmission}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Fuel Type:</Text>
                      <Text>{vehicle?.fuel_system}</Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Order Summary */}
          <VStack spacing={6} align="stretch">
            {/* Payment Information */}
            <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
              <CardHeader>
                <Heading size="sm">Payment Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">Subtotal</Text>
                    <Text fontWeight="600">{formatCurrency(order?.sub_total, order?.currency || order?.order_item?.currency)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">Service Fee</Text>
                    <Text fontWeight="600">{formatCurrency(order?.service_fee || 0, order?.currency || order?.order_item?.currency)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">Tax</Text>
                    <Text fontWeight="600">{formatCurrency(order?.tax || 0, order?.currency || order?.order_item?.currency)}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="lg">
                      Total
                    </Text>
                    <Text fontWeight="bold" fontSize="lg" color="green.600">
                      {formatCurrency(order?.total || order?.sub_total, order?.currency || order?.order_item?.currency)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">Payment Status:</Text>
                    {order?.paid ? (
                      <Badge colorScheme="green" leftIcon={<CheckCircle size={12} />}>
                        Paid
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" leftIcon={<Clock size={12} />}>
                        Unpaid
                      </Badge>
                    )}
                  </HStack>
                </VStack>

                {needsPayment && (
                  <VStack mt={4} spacing={2}>
                    <Button
                      w="100%"
                      colorScheme="blue"
                      leftIcon={<CreditCard size={18} />}
                      onClick={() => handlePayBalance('card')}
                      isLoading={paymentLoading}
                    >
                      Pay with Card
                    </Button>
                    <Button
                      w="100%"
                      variant="outline"
                      colorScheme="purple"
                      leftIcon={<DollarSign size={18} />}
                      onClick={handleWalletPayment}
                      isLoading={paymentLoading}
                    >
                      Pay with Wallet
                    </Button>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Dealer Information */}
            <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
              <CardHeader>
                <Heading size="sm">Dealer Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack>
                    <Avatar size="sm" name={dealer?.business_name} />
                    <Box>
                      <Text fontWeight="600">{dealer?.business_name}</Text>
                      <Text fontSize="sm" color="gray.600">{dealer?.user?.email}</Text>
                    </Box>
                  </HStack>
                  <Divider />
                  <HStack>
                    <MapPin size={16} color="gray" />
                    <Text fontSize="sm">{dealer?.location || 'Location not specified'}</Text>
                  </HStack>
                  {dealer?.phone_number && (
                    <HStack>
                      <Phone size={16} color="gray" />
                      <Text fontSize="sm">{dealer?.phone_number}</Text>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </SimpleGrid>

        {/* Order Timeline */}
        <Card bg={cardBg} borderColor={borderCol} borderWidth={1}>
          <CardHeader>
            <Heading size="sm">Order Timeline</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <CheckCircle size={20} color="green" />
                <Box>
                  <Text fontWeight="600">Order Placed</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(order?.date_created).toLocaleString()}
                  </Text>
                </Box>
              </HStack>
              {order?.paid_at && (
                <HStack>
                  <CheckCircle size={20} color="green" />
                  <Box>
                    <Text fontWeight="600">Payment Received</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(order?.paid_at).toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
              )}
              {order?.completed_at && (
                <HStack>
                  <CheckCircle size={20} color="green" />
                  <Box>
                    <Text fontWeight="600">Order Completed</Text>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(order?.completed_at).toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Payment Modal */}
      {paymentMethod === 'card' && (
        <PaystackPaymentModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onPaymentSuccess}
          payload={{
            email: authUser?.email,
            amount: order?.total || order?.sub_total,
          }}
          customizations={{
            title: 'Complete Vehicle Payment',
            description: `Payment for ${vehicle?.name}`,
            logo: '/app_icon.jpg',
          }}
        />
      )}
    </Container>
  );
}

export default OrderDetail;
