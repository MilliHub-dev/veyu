import { useState, useContext } from 'react';
import {
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
  Heading,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { GlobalStore } from '../contexts/GlobalStore';
import inspectionService from '../services/inspectionService';
import walletService from '../services/walletService';
import { PaystackPaymentModal } from './wallet';

/**
 * InspectionBooking Component
 * Allows customers to book inspections during checkout
 * Note: Payment is already handled in the checkout flow
 */
const InspectionBooking = ({ listingId, listingType, onBookingComplete, onCancel, alreadyPaid = true }) => {
  const { authUser } = useContext(GlobalStore);
  const toast = useToast();

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

  // Inspection pricing (could be fetched from API)
  const inspectionPrice = inspectionType === 'pre_purchase' ? 25000 : 20000;

  console.log('InspectionBooking mounted with:', { listingId, listingType, alreadyPaid });

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleBookInspection = async () => {
    console.log('handleBookInspection called');
    
    // Validation
    if (!preferredDate || !preferredTime) {
      setError('Please select both date and time for the inspection');
      toast({
        title: 'Validation Error',
        description: 'Please select both date and time for the inspection',
        status: 'warning',
        duration: 3000,
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

      console.log('Booking data:', booking);
      setBookingData(booking);

      // If already paid (from checkout), just book without payment
      if (alreadyPaid) {
        console.log('Already paid, booking directly...');
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
        // For bank transfer, book first and generate payment reference
        await processBooking(booking);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book inspection. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async (booking) => {
    try {
      // Check wallet balance first
      const balanceResponse = await walletService.getBalance();
      const balance = balanceResponse?.data?.balance || 0;

      if (balance < inspectionPrice) {
        setError(`Insufficient wallet balance. You need ₦${inspectionPrice.toLocaleString()} but have ₦${balance.toLocaleString()}`);
        setIsProcessing(false);
        return;
      }

      // Process booking with wallet payment
      await processBooking(booking, 'wallet');
    } catch (err) {
      console.error('Wallet payment error:', err);
      setError('Failed to process wallet payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaystackSuccess = async (response) => {
    console.log('Paystack payment successful:', response);
    setShowPaymentModal(false);
    setIsProcessing(true);
    
    try {
      // Process booking after successful payment
      await processBooking(bookingData, 'card', response.reference);
    } catch (err) {
      console.error('Error processing booking after payment:', err);
      setIsProcessing(false);
    }
  };

  const processBooking = async (booking, paymentMethodUsed = paymentMethod, paymentReference = null) => {
    try {
      const bookingPayload = {
        ...booking,
        payment_method: paymentMethodUsed,
        payment_reference: paymentReference,
      };

      console.log('Booking inspection with payload:', bookingPayload);
      const response = await inspectionService.bookInspection(bookingPayload);
      console.log('Inspection booking response:', response);
      
      // Handle both success formats
      const isSuccess = response?.success || response?.status === 'success' || response?.data;
      const inspectionSlip = response?.data || response;
      
      if (isSuccess && inspectionSlip) {
        toast({
          title: 'Inspection Booked Successfully',
          description: `Your inspection has been scheduled for ${preferredDate} at ${preferredTime}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Call parent callback with slip data
        if (onBookingComplete) {
          console.log('Calling onBookingComplete with:', inspectionSlip);
          onBookingComplete(inspectionSlip);
        } else {
          console.warn('No onBookingComplete callback provided');
        }
      } else {
        throw new Error(response?.message || 'Booking failed - no data returned');
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

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
      maxW="600px"
      mx="auto"
    >
      <Heading size="md" mb={4}>
        Book Vehicle Inspection
      </Heading>

      <VStack spacing={4} align="stretch">
        {/* Inspection Type */}
        <FormControl>
          <FormLabel>Inspection Type</FormLabel>
          <Select
            value={inspectionType}
            onChange={(e) => setInspectionType(e.target.value)}
          >
            <option value="pre_purchase">Pre-Purchase Inspection (₦25,000)</option>
            <option value="pre_rental">Pre-Rental Inspection (₦20,000)</option>
          </Select>
        </FormControl>

        {/* Preferred Date */}
        <FormControl isRequired>
          <FormLabel>Preferred Date</FormLabel>
          <Input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            min={getMinDate()}
          />
        </FormControl>

        {/* Preferred Time */}
        <FormControl isRequired>
          <FormLabel>Preferred Time</FormLabel>
          <Input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
        </FormControl>

        <Divider />

        {/* Payment Status or Payment Method */}
        {alreadyPaid ? (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">Payment Already Completed</Text>
              <Text fontSize="sm">Inspection fee was included in your purchase</Text>
            </VStack>
          </Alert>
        ) : (
          <>
            {/* Payment Method */}
            <FormControl>
              <FormLabel>Payment Method</FormLabel>
              <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                <Stack direction="column" spacing={2}>
                  <Radio value="card">Card Payment (Paystack)</Radio>
                  <Radio value="wallet">Wallet</Radio>
                  <Radio value="bank_transfer">Bank Transfer</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Price Summary */}
            <Box bg="blue.50" p={4} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="bold">Total Amount:</Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.600">
                  ₦{inspectionPrice.toLocaleString()}
                </Text>
              </HStack>
            </Box>
          </>
        )}

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <HStack spacing={3} pt={2}>
          <Button
            flex={1}
            colorScheme="blue"
            onClick={handleBookInspection}
            isLoading={isProcessing}
            loadingText={alreadyPaid ? "Scheduling..." : "Processing..."}
            isDisabled={!preferredDate || !preferredTime}
          >
            {isProcessing ? <Spinner size="sm" mr={2} /> : null}
            {alreadyPaid ? 'Schedule Inspection' : 'Book & Pay'}
          </Button>
          <Button
            flex={1}
            variant="outline"
            onClick={onCancel}
            isDisabled={isProcessing}
          >
            Cancel
          </Button>
        </HStack>

        {/* Info Alert */}
        <Alert status="info" borderRadius="md" fontSize="sm">
          <AlertIcon />
          {alreadyPaid 
            ? 'Select your preferred date and time for the inspection. You will receive an inspection slip with all details.'
            : 'Your inspection will be scheduled after payment confirmation. You will receive an inspection slip with all details.'
          }
        </Alert>
      </VStack>

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
            description: `${inspectionType === 'pre_purchase' ? 'Pre-Purchase' : 'Pre-Rental'} Inspection`,
            logo: '/assets/images/logo.png',
          }}
        />
      )}
    </Box>
  );
};

export default InspectionBooking;
