import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { GlobalStore } from '../../App';
import inspectionService from '../../services/inspectionService';
import walletService from '../../services/walletService';
import { PaystackPaymentModal } from '../../components/wallet';

const InspectionPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { authUser } = useContext(GlobalStore);

  const [inspection, setInspection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [paystackReference, setPaystackReference] = useState(null);

  useEffect(() => {
    fetchInspectionDetail();
    fetchWalletBalance();
  }, [id]);

  const fetchInspectionDetail = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.getInspectionDetail(id);
      setInspection(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch inspection details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getBalance();
      setWalletBalance(response?.data?.balance || 0);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < inspection.inspection_fee) {
      toast({
        title: 'Insufficient Balance',
        description: `You need ₦${inspection.inspection_fee.toLocaleString()} but have ₦${walletBalance.toLocaleString()}`,
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await inspectionService.payForInspection(id, {
        payment_method: 'wallet',
        amount: inspection.inspection_fee,
      });

      toast({
        title: 'Payment Successful',
        description: 'Inspection payment completed successfully',
        status: 'success',
        duration: 3000,
      });

      navigate(`/inspections/${id}`);
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await inspectionService.payForInspection(id, {
        payment_method: 'bank',
        amount: inspection.inspection_fee,
      });

      // Response contains Paystack initialization data
      setPaystackReference(response.reference);
      setShowPaystackModal(true);
    } catch (error) {
      toast({
        title: 'Payment Initialization Failed',
        description: error.message || 'Failed to initialize payment',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackSuccess = async (response) => {
    console.log('Paystack payment successful:', response);
    setShowPaystackModal(false);
    setIsProcessing(true);

    try {
      await inspectionService.verifyInspectionPayment(id, {
        reference: response.reference,
      });

      toast({
        title: 'Payment Verified',
        description: 'Your payment has been verified successfully',
        status: 'success',
        duration: 3000,
      });

      navigate(`/inspections/${id}`);
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify payment',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'wallet') {
      handleWalletPayment();
    } else if (paymentMethod === 'bank') {
      handleBankPayment();
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  if (!inspection) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          Inspection not found
        </Alert>
      </Container>
    );
  }

  if (inspection.payment_status === 'paid') {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="info">
          <AlertIcon />
          This inspection has already been paid for
        </Alert>
        <Button mt={4} onClick={() => navigate(`/inspections/${id}`)}>
          View Inspection
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Button leftIcon={<ArrowBackIcon />} variant="ghost" onClick={() => navigate(`/inspections/${id}`)}>
            Back
          </Button>
          <Heading size="lg">Pay for Inspection</Heading>
        </HStack>

        {/* Inspection Details */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <Heading size="md">Inspection Details</Heading>
            <Divider />
            <HStack justify="space-between">
              <Text>Vehicle:</Text>
              <Text fontWeight="semibold">{inspection.vehicle_name}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Type:</Text>
              <Text fontWeight="semibold">{inspection.inspection_type_display}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Inspector:</Text>
              <Text fontWeight="semibold">{inspection.inspector_name}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="bold">Amount to Pay:</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                ₦{inspection.inspection_fee?.toLocaleString()}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Payment Method */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <Heading size="md">Payment Method</Heading>
            <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
              <Stack direction="column" spacing={3}>
                <Radio value="wallet">
                  <HStack>
                    <Text>Wallet</Text>
                    <Text fontSize="sm" color="gray.600">
                      (Balance: ₦{walletBalance.toLocaleString()})
                    </Text>
                  </HStack>
                </Radio>
                <Radio value="bank">Bank (Card, Transfer, USSD)</Radio>
              </Stack>
            </RadioGroup>

            {paymentMethod === 'wallet' && walletBalance < inspection.inspection_fee && (
              <Alert status="warning">
                <AlertIcon />
                Insufficient wallet balance. Please top up your wallet or use bank payment.
              </Alert>
            )}
          </VStack>
        </Box>

        {/* Action Buttons */}
        <HStack spacing={4}>
          <Button
            flex={1}
            colorScheme="blue"
            size="lg"
            onClick={handlePayment}
            isLoading={isProcessing}
            loadingText="Processing..."
            isDisabled={paymentMethod === 'wallet' && walletBalance < inspection.inspection_fee}
          >
            Pay ₦{inspection.inspection_fee?.toLocaleString()}
          </Button>
          <Button
            flex={1}
            variant="outline"
            size="lg"
            onClick={() => navigate(`/inspections/${id}`)}
            isDisabled={isProcessing}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>

      {/* Paystack Payment Modal */}
      {showPaystackModal && paystackReference && (
        <PaystackPaymentModal
          isOpen={showPaystackModal}
          onClose={() => {
            setShowPaystackModal(false);
            setIsProcessing(false);
          }}
          onSuccess={handlePaystackSuccess}
          payload={{
            amount: inspection.inspection_fee,
            email: authUser?.email || '',
            reference: paystackReference,
          }}
          customizations={{
            title: 'Pay for Vehicle Inspection',
            description: `${inspection.inspection_type_display} - ${inspection.vehicle_name}`,
            logo: '/assets/images/logo.png',
          }}
        />
      )}
    </Container>
  );
};

export default InspectionPayment;
