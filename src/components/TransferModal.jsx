import { useState, useContext } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  useToast,
  Box,
  Divider,
  Alert,
  AlertIcon,
  Textarea,
} from '@chakra-ui/react';
import { GlobalStore } from '../contexts/GlobalStore';
import walletService from '../services/walletService';
import { PinField } from './index';

/**
 * TransferModal Component
 * Handles wallet transfers to other platform users
 */
const TransferModal = ({ isOpen, onClose, currentBalance, recipientId, onSuccess }) => {
  const { authUser } = useContext(GlobalStore);
  const toast = useToast();

  // State
  const [recipient, setRecipient] = useState(recipientId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const amountNum = parseFloat(amount);

    // Recipient validation
    if (!recipient || recipient.trim() === '') {
      newErrors.recipient = 'Recipient ID or email is required';
    }

    // Amount validation
    if (!amount || amount === '') {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amountNum < 100) {
      newErrors.amount = 'Minimum transfer amount is ₦100';
    } else if (amountNum > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate PIN
  const validatePin = () => {
    const newErrors = {};

    if (!pin || pin.length !== 4) {
      newErrors.pin = 'Please enter your 4-digit PIN';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle proceed to confirmation
  const handleProceed = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  // Handle transfer submission
  const handleTransfer = async () => {
    if (!validatePin()) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await walletService.transfer(
        recipient.trim(),
        parseFloat(amount),
        description.trim(),
        pin
      );

      if (response?.success) {
        toast({
          title: 'Transfer Successful',
          description: `₦${parseFloat(amount).toLocaleString()} has been transferred`,
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
        throw new Error(response?.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      
      // Check for specific error types
      let errorMessage = 'Failed to process transfer';
      if (error.message?.toLowerCase().includes('pin')) {
        errorMessage = 'Invalid PIN. Please try again.';
        setErrors({ ...errors, pin: errorMessage });
      } else if (error.message?.toLowerCase().includes('recipient')) {
        errorMessage = 'Recipient not found. Please check the ID/email.';
        setErrors({ ...errors, recipient: errorMessage });
      } else if (error.message?.toLowerCase().includes('balance')) {
        errorMessage = 'Insufficient balance';
        setErrors({ ...errors, amount: errorMessage });
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: 'Transfer Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle back from confirmation
  const handleBack = () => {
    setPin('');
    setErrors({ ...errors, pin: null });
    setShowConfirmation(false);
  };

  // Handle modal close
  const handleClose = () => {
    setRecipient(recipientId || '');
    setAmount('');
    setDescription('');
    setPin('');
    setErrors({});
    setShowConfirmation(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {showConfirmation ? 'Confirm Transfer' : 'Transfer Funds'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {!showConfirmation ? (
            // Form View
            <VStack spacing={4}>
              {/* Current Balance Display */}
              <Box w="full" p={4} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Available Balance
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  ₦{currentBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </Box>

              {/* Recipient Input */}
              <FormControl isInvalid={!!errors.recipient} isRequired>
                <FormLabel>Recipient</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter recipient ID or email"
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setErrors({ ...errors, recipient: null });
                  }}
                  isDisabled={!!recipientId}
                />
                <FormErrorMessage>{errors.recipient}</FormErrorMessage>
              </FormControl>

              {/* Amount Input */}
              <FormControl isInvalid={!!errors.amount} isRequired>
                <FormLabel>Transfer Amount</FormLabel>
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
                  />
                </InputGroup>
                <FormErrorMessage>{errors.amount}</FormErrorMessage>
              </FormControl>

              {/* Description Input */}
              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  placeholder="Enter transfer description or note"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  resize="none"
                />
              </FormControl>

              {/* Info Alert */}
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                You will be required to enter your PIN to complete this transfer
              </Alert>

              {/* Action Buttons */}
              <HStack w="full" spacing={3} pt={2}>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  flex={1}
                  isDisabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleProceed}
                  flex={1}
                >
                  Continue
                </Button>
              </HStack>
            </VStack>
          ) : (
            // Confirmation View with PIN
            <VStack spacing={4}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Please review your transfer details and enter your PIN
              </Alert>

              {/* Transfer Summary */}
              <Box w="full" p={4} bg="gray.50" borderRadius="md">
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">Recipient</Text>
                    <Text fontWeight="medium" isTruncated maxW="200px">
                      {recipient}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.600">Amount</Text>
                    <Text fontWeight="bold" fontSize="lg">
                      ₦{parseFloat(amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </HStack>

                  {description && (
                    <HStack justify="space-between" align="start">
                      <Text color="gray.600">Description</Text>
                      <Text fontWeight="medium" textAlign="right" maxW="200px">
                        {description}
                      </Text>
                    </HStack>
                  )}

                  <Divider />

                  <HStack justify="space-between">
                    <Text color="gray.600">New Balance</Text>
                    <Text fontWeight="bold" color="blue.600">
                      ₦{(currentBalance - parseFloat(amount)).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              {/* PIN Input */}
              <FormControl isInvalid={!!errors.pin} isRequired>
                <FormLabel textAlign="center">Enter Your PIN</FormLabel>
                <PinField value={pin} onChange={setPin} />
                <FormErrorMessage textAlign="center">{errors.pin}</FormErrorMessage>
              </FormControl>

              {/* Action Buttons */}
              <HStack w="full" spacing={3} pt={2}>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  flex={1}
                  isDisabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleTransfer}
                  flex={1}
                  isLoading={isProcessing}
                  loadingText="Processing..."
                  isDisabled={pin.length !== 4}
                >
                  Confirm Transfer
                </Button>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TransferModal;
