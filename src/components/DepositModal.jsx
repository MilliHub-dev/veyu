import { useState, useContext } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  RadioGroup,
  Radio,
  Stack,
  Text,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { GlobalStore } from '../App';
import walletService from '../services/walletService';
import { PaystackPaymentModal } from './wallet';

/**
 * DepositModal Component
 * Handles wallet deposits via Paystack payment gateway
 */
const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const { authUser } = useContext(GlobalStore);
  const toast = useToast();

  // State
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate amount
  const validateAmount = () => {
    const newErrors = {};
    const amountNum = parseFloat(amount);

    if (!amount || amount === '') {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amountNum < 100) {
      newErrors.amount = 'Minimum deposit amount is ₦100';
    } else if (amountNum > 10000000) {
      newErrors.amount = 'Maximum deposit amount is ₦10,000,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle deposit initiation
  const handleDeposit = async () => {
    if (!validateAmount()) {
      return;
    }

    setIsProcessing(true);

    try {
      // For card payment, show Paystack modal
      if (paymentMethod === 'card') {
        setShowPaystackModal(true);
        setIsProcessing(false);
      } else {
        // For bank transfer, call API directly
        const response = await walletService.deposit(
          parseFloat(amount),
          paymentMethod
        );

        if (response?.success) {
          toast({
            title: 'Deposit Initiated',
            description: response.message || 'Your deposit request has been submitted',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Call success callback
          if (onSuccess) {
            onSuccess(response.data);
          }

          // Reset and close
          handleClose();
        } else {
          throw new Error(response?.message || 'Deposit failed');
        }
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: 'Deposit Failed',
        description: error.message || 'Failed to process deposit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsProcessing(false);
    }
  };

  // Handle Paystack payment success
  const handlePaystackSuccess = async (response) => {
    setShowPaystackModal(false);
    setIsProcessing(true);

    try {
      // Submit deposit with payment reference
      const depositResponse = await walletService.deposit(
        parseFloat(amount),
        'card',
        response.reference
      );

      if (depositResponse?.success) {
        toast({
          title: 'Deposit Successful',
          description: `₦${parseFloat(amount).toLocaleString()} has been added to your wallet`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(depositResponse.data);
        }

        // Reset and close
        handleClose();
      } else {
        throw new Error(depositResponse?.message || 'Deposit verification failed');
      }
    } catch (error) {
      console.error('Deposit verification error:', error);
      toast({
        title: 'Deposit Verification Failed',
        description: error.message || 'Payment was successful but verification failed. Please contact support.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setAmount('');
    setPaymentMethod('card');
    setErrors({});
    setIsProcessing(false);
    setShowPaystackModal(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deposit Funds</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              {/* Amount Input */}
              <FormControl isInvalid={!!errors.amount} isRequired>
                <FormLabel>Amount</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.500">
                    ₦
                  </InputLeftElement>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrors({ ...errors, amount: null });
                    }}
                    onBlur={validateAmount}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.amount}</FormErrorMessage>
              </FormControl>

              {/* Payment Method Selection */}
              <FormControl isRequired>
                <FormLabel>Payment Method</FormLabel>
                <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
                  <Stack direction="column" spacing={3}>
                    <Radio value="card" colorScheme="blue">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Card Payment</Text>
                        <Text fontSize="sm" color="gray.600">
                          Pay instantly with your debit/credit card
                        </Text>
                      </VStack>
                    </Radio>
                    <Radio value="bank_transfer" colorScheme="blue">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Bank Transfer</Text>
                        <Text fontSize="sm" color="gray.600">
                          Transfer from your bank account
                        </Text>
                      </VStack>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Summary */}
              {amount && !errors.amount && (
                <VStack
                  w="full"
                  p={4}
                  bg="blue.50"
                  borderRadius="md"
                  align="start"
                  spacing={2}
                >
                  <Text fontSize="sm" color="gray.600">
                    You will deposit
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    ₦{parseFloat(amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </VStack>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={3} w="full" pt={2}>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  flex={1}
                  isDisabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleDeposit}
                  flex={1}
                  isLoading={isProcessing}
                  loadingText="Processing..."
                  isDisabled={!amount || !!errors.amount}
                >
                  Proceed
                </Button>
              </Stack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Paystack Payment Modal */}
      {showPaystackModal && (
        <PaystackPaymentModal
          isOpen={showPaystackModal}
          onClose={() => {
            setShowPaystackModal(false);
            setIsProcessing(false);
          }}
          onSuccess={handlePaystackSuccess}
          payload={{
            amount: parseFloat(amount),
            email: authUser?.email || '',
          }}
          customizations={{
            title: 'Wallet Deposit',
            description: `Deposit ₦${parseFloat(amount).toLocaleString()} to your wallet`,
          }}
        />
      )}
    </>
  );
};

export default DepositModal;
