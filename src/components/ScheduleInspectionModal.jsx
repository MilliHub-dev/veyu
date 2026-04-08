import { useState, useContext, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Icon,
  Flex,
  Badge,
  Card,
  CardBody,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { Calendar, Clock, CreditCard, Wallet, Building2, CheckCircle2, Info, CheckCircle, FileText, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlobalStore } from '../contexts/GlobalStore';
import inspectionService from '../services/inspectionService';
import walletService from '../services/walletService';
import { PaystackPaymentModal } from './wallet';

/**
 * ScheduleInspectionModal Component
 * Modern redesigned modal for scheduling vehicle inspections
 */
const ScheduleInspectionModal = ({ 
  isOpen, 
  onClose, 
  listingId, 
  listingType = 'buy',
  vehicleInfo = {},
  alreadyPaid = false,
  onSuccess 
}) => {
  const { authUser } = useContext(GlobalStore);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: showDetails, onToggle: toggleDetails } = useDisclosure({ defaultIsOpen: true });

  // Form state
  const [inspectionType, setInspectionType] = useState(
    listingType === 'buy' ? 'pre_purchase' : 'pre_rental'
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Inspection pricing
  const INSPECTION_FEES = {
    pre_purchase: 25000,
    pre_rental: 20000,
    maintenance: 15000,
    insurance: 20000,
  };

  const inspectionPrice = INSPECTION_FEES[inspectionType] || 25000;

  // Fetch wallet balance when payment method is wallet
  useEffect(() => {
    const fetchBalance = async () => {
      if (paymentMethod === 'wallet' && !alreadyPaid) {
        setLoadingBalance(true);
        try {
          const response = await walletService.getBalance();
          setWalletBalance(response?.data?.balance || 0);
        } catch (err) {
          console.error('Failed to fetch wallet balance:', err);
        } finally {
          setLoadingBalance(false);
        }
      }
    };

    fetchBalance();
  }, [paymentMethod, alreadyPaid]);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSchedule = async () => {
    // Validation
    if (!preferredDate || !preferredTime) {
      setError('Please select both date and time for the inspection');
      toast({
        title: 'Missing Information',
        description: 'Please select both date and time for the inspection',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const booking = {
        listing_id: listingId,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        inspection_type: inspectionType,
      };

      setBookingData(booking);

      // If already paid (from checkout), just book without payment
      if (alreadyPaid) {
        await processBooking(booking, 'prepaid', null);
        return;
      }

      // Handle payment based on selected method
      if (paymentMethod === 'wallet') {
        await handleWalletPayment(booking);
      } else if (paymentMethod === 'card') {
        setShowPaymentModal(true);
        setIsProcessing(false);
      } else if (paymentMethod === 'bank_transfer') {
        await processBooking(booking);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to schedule inspection. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async (booking) => {
    try {
      if (walletBalance < inspectionPrice) {
        setError(`Insufficient wallet balance. You need ₦${inspectionPrice.toLocaleString()} but have ₦${walletBalance.toLocaleString()}`);
        setIsProcessing(false);
        return;
      }

      await processBooking(booking, 'wallet');
    } catch (err) {
      console.error('Wallet payment error:', err);
      setError('Failed to process wallet payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaystackSuccess = async (response) => {
    setShowPaymentModal(false);
    setIsProcessing(true);
    
    try {
      await processBooking(bookingData, 'card', response.reference);
    } catch (err) {
      console.error('Error processing booking after payment:', err);
      setIsProcessing(false);
    }
  };

  const processBooking = async (booking, paymentMethodUsed = paymentMethod, paymentReference = null) => {
    try {
      // Convert date from YYYY-MM-DD to DD/MM/YYYY format
      const convertDateFormat = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      // API expects separate date and time fields in DD/MM/YYYY format
      const bookingPayload = {
        listing_id: booking.listing_id,
        inspection_type: booking.inspection_type,
        scheduled_date: convertDateFormat(booking.preferred_date),
        scheduled_time: booking.preferred_time,
        payment_method: paymentMethodUsed,
        payment_reference: paymentReference,
      };

      console.log('📤 Booking payload:', bookingPayload);
      const response = await inspectionService.bookInspection(bookingPayload);
      console.log('📥 Booking response:', response);
      
      // More flexible response handling
      const inspectionSlip = response?.data || response?.inspection_slip || response;
      const slipReference = response?.slip_reference || response?.inspection_slip_reference || response?.reference;
      const isSuccess = response?.success !== false && response?.status !== 'error';
      
      if (isSuccess) {
        // Show success message with action button
        const toastId = toast({
          title: 'Inspection Scheduled Successfully',
          description: slipReference 
            ? `Your inspection has been scheduled for ${preferredDate} at ${preferredTime}. Click to view your inspection slip.`
            : `Your inspection has been scheduled for ${preferredDate} at ${preferredTime}. Check your orders page for details.`,
          status: 'success',
          duration: 8000,
          isClosable: true,
          position: 'top',
          render: ({ onClose: closeToast }) => (
            <Box
              bg="green.500"
              color="white"
              p={4}
              borderRadius="md"
              boxShadow="lg"
            >
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={CheckCircle} boxSize={5} />
                  <Text fontWeight="bold">Inspection Scheduled Successfully</Text>
                </HStack>
                <Text fontSize="sm">
                  Your inspection has been scheduled for {preferredDate} at {preferredTime}
                </Text>
                <HStack spacing={2} pt={2}>
                  {slipReference ? (
                    <Button
                      onClick={() => {
                        closeToast();
                        navigate(`/inspections/slip/${slipReference}`);
                      }}
                      size="sm"
                      colorScheme="whiteAlpha"
                      leftIcon={<Icon as={FileText} />}
                    >
                      View Inspection Slip
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        closeToast();
                        navigate('/orders');
                      }}
                      size="sm"
                      colorScheme="whiteAlpha"
                      leftIcon={<Icon as={Package} />}
                    >
                      View My Orders
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={closeToast}>
                    Close
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ),
        });

        if (onSuccess) {
          onSuccess({
            ...inspectionSlip,
            slip_reference: slipReference,
          });
        }
        
        onClose();
      } else {
        throw new Error(response?.message || 'Booking failed - please try again');
      }
    } catch (err) {
      console.error('Process booking error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to complete booking. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Booking Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getInspectionTypeInfo = (type) => {
    const info = {
      pre_purchase: {
        title: 'Pre-Purchase Inspection',
        description: 'Comprehensive inspection before buying a vehicle',
        duration: '2-3 hours',
        includes: ['Engine check', 'Body inspection', 'Test drive', 'Full report'],
      },
      pre_rental: {
        title: 'Pre-Rental Inspection',
        description: 'Quick inspection before renting a vehicle',
        duration: '1-2 hours',
        includes: ['Basic check', 'Safety inspection', 'Documentation', 'Condition report'],
      },
      maintenance: {
        title: 'Maintenance Inspection',
        description: 'Regular maintenance and service check',
        duration: '1-2 hours',
        includes: ['Service check', 'Fluid levels', 'Tire inspection', 'Basic diagnostics'],
      },
      insurance: {
        title: 'Insurance Inspection',
        description: 'Inspection for insurance purposes',
        duration: '1-2 hours',
        includes: ['Damage assessment', 'Value estimation', 'Photo documentation', 'Report'],
      },
    };
    return info[type] || info.pre_purchase;
  };

  const currentInspectionInfo = getInspectionTypeInfo(inspectionType);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent maxW="600px" mx={4}>
          <ModalHeader
            bg="blue.500"
            color="white"
            borderTopRadius="md"
            py={4}
          >
            <HStack spacing={3}>
              <Icon as={Calendar} boxSize={6} />
              <Text fontSize="xl" fontWeight="bold">
                Schedule Vehicle Inspection
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              {/* Vehicle Info Card */}
              {vehicleInfo?.name && (
                <Card bg="gray.50" borderWidth="1px" borderColor="gray.200">
                  <CardBody py={3}>
                    <HStack spacing={3}>
                      <Icon as={Info} color="blue.500" boxSize={5} />
                      <Box>
                        <Text fontSize="sm" color="gray.600">Vehicle</Text>
                        <Text fontWeight="semibold">{vehicleInfo.name}</Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              )}

              {/* Inspection Type */}
              <FormControl>
                <FormLabel fontWeight="semibold" mb={3}>
                  Inspection Type
                </FormLabel>
                <Select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  size="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: 'blue.400' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                >
                  <option value="pre_purchase">
                    Pre-Purchase Inspection - ₦{INSPECTION_FEES.pre_purchase.toLocaleString()}
                  </option>
                  <option value="pre_rental">
                    Pre-Rental Inspection - ₦{INSPECTION_FEES.pre_rental.toLocaleString()}
                  </option>
                  <option value="maintenance">
                    Maintenance Inspection - ₦{INSPECTION_FEES.maintenance.toLocaleString()}
                  </option>
                  <option value="insurance">
                    Insurance Inspection - ₦{INSPECTION_FEES.insurance.toLocaleString()}
                  </option>
                </Select>
              </FormControl>

              {/* Inspection Details */}
              <Card bg="blue.50" borderWidth="1px" borderColor="blue.200">
                <CardBody py={3}>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="semibold" color="blue.900">
                        {currentInspectionInfo.title}
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={toggleDetails}
                      >
                        {showDetails ? 'Hide' : 'Show'} Details
                      </Button>
                    </HStack>
                    
                    <Collapse in={showDetails}>
                      <VStack align="stretch" spacing={2} pt={2}>
                        <Text fontSize="sm" color="gray.700">
                          {currentInspectionInfo.description}
                        </Text>
                        <HStack spacing={2}>
                          <Icon as={Clock} boxSize={4} color="blue.600" />
                          <Text fontSize="sm" color="gray.700">
                            Duration: {currentInspectionInfo.duration}
                          </Text>
                        </HStack>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                            Includes:
                          </Text>
                          <Flex wrap="wrap" gap={2}>
                            {currentInspectionInfo.includes.map((item, idx) => (
                              <Badge key={idx} colorScheme="blue" fontSize="xs">
                                {item}
                              </Badge>
                            ))}
                          </Flex>
                        </Box>
                      </VStack>
                    </Collapse>
                  </VStack>
                </CardBody>
              </Card>

              {/* Date and Time Selection */}
              <HStack spacing={4} align="start">
                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="semibold" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={Calendar} boxSize={4} color="gray.600" />
                      <Text>Preferred Date</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    size="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="semibold" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={Clock} boxSize={4} color="gray.600" />
                      <Text>Preferred Time</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    size="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'blue.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  />
                </FormControl>
              </HStack>

              <Divider />

              {/* Payment Section */}
              {alreadyPaid ? (
                <Alert status="success" borderRadius="md" bg="green.50" borderWidth="1px" borderColor="green.200">
                  <AlertIcon color="green.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" color="green.900">
                      Payment Completed
                    </Text>
                    <Text fontSize="sm" color="green.700">
                      Inspection fee was included in your purchase
                    </Text>
                  </VStack>
                </Alert>
              ) : (
                <>
                  <FormControl>
                    <FormLabel fontWeight="semibold" mb={3}>
                      Payment Method
                    </FormLabel>
                    <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                      <Stack spacing={3}>
                        <Card
                          borderWidth="2px"
                          borderColor={paymentMethod === 'card' ? 'blue.500' : 'gray.200'}
                          bg={paymentMethod === 'card' ? 'blue.50' : 'white'}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ borderColor: 'blue.400', transform: 'translateY(-2px)' }}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <CardBody py={3}>
                            <HStack spacing={3}>
                              <Radio value="card" colorScheme="blue" />
                              <Icon as={CreditCard} boxSize={5} color="blue.600" />
                              <Box flex={1}>
                                <Text fontWeight="medium">Card Payment</Text>
                                <Text fontSize="sm" color="gray.600">Pay securely with Paystack</Text>
                              </Box>
                              {paymentMethod === 'card' && (
                                <Icon as={CheckCircle2} color="blue.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>

                        <Card
                          borderWidth="2px"
                          borderColor={paymentMethod === 'wallet' ? 'blue.500' : 'gray.200'}
                          bg={paymentMethod === 'wallet' ? 'blue.50' : 'white'}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ borderColor: 'blue.400', transform: 'translateY(-2px)' }}
                          onClick={() => setPaymentMethod('wallet')}
                        >
                          <CardBody py={3}>
                            <HStack spacing={3}>
                              <Radio value="wallet" colorScheme="blue" />
                              <Icon as={Wallet} boxSize={5} color="green.600" />
                              <Box flex={1}>
                                <Text fontWeight="medium">Wallet</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {loadingBalance ? (
                                    <Spinner size="xs" />
                                  ) : (
                                    `Balance: ₦${walletBalance.toLocaleString()}`
                                  )}
                                </Text>
                              </Box>
                              {paymentMethod === 'wallet' && (
                                <Icon as={CheckCircle2} color="blue.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>

                        <Card
                          borderWidth="2px"
                          borderColor={paymentMethod === 'bank_transfer' ? 'blue.500' : 'gray.200'}
                          bg={paymentMethod === 'bank_transfer' ? 'blue.50' : 'white'}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ borderColor: 'blue.400', transform: 'translateY(-2px)' }}
                          onClick={() => setPaymentMethod('bank_transfer')}
                        >
                          <CardBody py={3}>
                            <HStack spacing={3}>
                              <Radio value="bank_transfer" colorScheme="blue" />
                              <Icon as={Building2} boxSize={5} color="purple.600" />
                              <Box flex={1}>
                                <Text fontWeight="medium">Bank Transfer</Text>
                                <Text fontSize="sm" color="gray.600">Transfer to our account</Text>
                              </Box>
                              {paymentMethod === 'bank_transfer' && (
                                <Icon as={CheckCircle2} color="blue.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {/* Price Summary */}
                  <Card bg="gradient" bgGradient="linear(to-r, blue.500, blue.600)" color="white">
                    <CardBody py={4}>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="semibold">
                          Total Amount
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₦{inspectionPrice.toLocaleString()}
                        </Text>
                      </HStack>
                    </CardBody>
                  </Card>
                </>
              )}

              {/* Error Alert */}
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}

              {/* Action Buttons */}
              <HStack spacing={3} pt={2}>
                <Button
                  flex={1}
                  size="lg"
                  colorScheme="blue"
                  onClick={handleSchedule}
                  isLoading={isProcessing}
                  loadingText={alreadyPaid ? "Scheduling..." : "Processing..."}
                  isDisabled={!preferredDate || !preferredTime}
                  leftIcon={isProcessing ? <Spinner size="sm" /> : <Icon as={Calendar} />}
                >
                  {alreadyPaid ? 'Schedule Inspection' : 'Confirm & Pay'}
                </Button>
                <Button
                  flex={1}
                  size="lg"
                  variant="outline"
                  onClick={onClose}
                  isDisabled={isProcessing}
                >
                  Cancel
                </Button>
              </HStack>

              {/* Info Alert */}
              <Alert status="info" borderRadius="md" fontSize="sm" bg="blue.50" borderWidth="1px" borderColor="blue.200">
                <AlertIcon color="blue.500" />
                <Text color="blue.900">
                  {alreadyPaid 
                    ? 'You will receive an inspection slip with all details via email and SMS.'
                    : 'After payment confirmation, you will receive an inspection slip with all details.'
                  }
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Paystack Payment Modal */}
      {showPaymentModal && (
        <PaystackPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setIsProcessing(false);
          }}
          onSuccess={handlePaystackSuccess}
          payload={{
            amount: inspectionPrice,
            email: authUser?.email || '',
          }}
          customizations={{
            title: 'Pay for Vehicle Inspection',
            description: currentInspectionInfo.title,
            logo: '/assets/images/logo.png',
          }}
        />
      )}
    </>
  );
};

export default ScheduleInspectionModal;
