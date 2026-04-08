import { useState, useEffect, useContext } from 'react';
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
  Select,
  useToast,
  Box,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { GlobalStore } from '../contexts/GlobalStore';
import walletService from '../services/walletService';
import { objectifyJSON } from '../utils';

/**
 * WithdrawModal Component
 * Handles wallet withdrawals to bank accounts
 */
const WithdrawModal = ({ isOpen, onClose, currentBalance, onSuccess }) => {
  const { axios, authUser } = useContext(GlobalStore);
  const toast = useToast();

  // State
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [banks, setBanks] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch banks on mount
  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen]);

  // Fetch banks list
  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const res = await axios.get('/wallet/banks/');
      const data = objectifyJSON(res.data);
      setBanks(data.data || []);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banks list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const amountNum = parseFloat(amount);

    // Amount validation
    if (!amount || amount === '') {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amountNum < 100) {
      newErrors.amount = 'Minimum withdrawal amount is ₦100';
    } else if (amountNum > currentBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    // Bank validation
    if (!bankCode) {
      newErrors.bankCode = 'Please select a bank';
    }

    // Account number validation
    if (!accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10}$/.test(accountNumber)) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }

    // Account name validation
    if (!accountName || accountName.trim() === '') {
      newErrors.accountName = 'Account name is required';
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

  // Handle withdrawal submission
  const handleWithdraw = async () => {
    setIsProcessing(true);

    try {
      const response = await walletService.withdraw(parseFloat(amount), {
        account_number: accountNumber,
        bank_code: bankCode,
        account_name: accountName.trim(),
      });

      if (response?.success) {
        toast({
          title: 'Withdrawal Successful',
          description: `₦${parseFloat(amount).toLocaleString()} withdrawal has been initiated`,
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
        throw new Error(response?.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal',
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
    setShowConfirmation(false);
  };

  // Handle modal close
  const handleClose = () => {
    setAmount('');
    setAccountNumber('');
    setBankCode('');
    setAccountName('');
    setErrors({});
    setShowConfirmation(false);
    setIsProcessing(false);
    onClose();
  };

  // Get selected bank name
  const getSelectedBankName = () => {
    const bank = banks.find((b) => b.code === bankCode);
    return bank?.name || '';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {showConfirmation ? 'Confirm Withdrawal' : 'Withdraw Funds'}
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

              {/* Amount Input */}
              <FormControl isInvalid={!!errors.amount} isRequired>
                <FormLabel>Withdrawal Amount</FormLabel>
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

              {/* Bank Selection */}
              <FormControl isInvalid={!!errors.bankCode} isRequired>
                <FormLabel>Bank</FormLabel>
                <Select
                  placeholder="Select your bank"
                  value={bankCode}
                  onChange={(e) => {
                    setBankCode(e.target.value);
                    setErrors({ ...errors, bankCode: null });
                  }}
                  isDisabled={isLoadingBanks}
                >
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.bankCode}</FormErrorMessage>
              </FormControl>

              {/* Account Number */}
              <FormControl isInvalid={!!errors.accountNumber} isRequired>
                <FormLabel>Account Number</FormLabel>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setAccountNumber(value);
                    setErrors({ ...errors, accountNumber: null });
                  }}
                />
                <FormErrorMessage>{errors.accountNumber}</FormErrorMessage>
              </FormControl>

              {/* Account Name */}
              <FormControl isInvalid={!!errors.accountName} isRequired>
                <FormLabel>Account Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value);
                    setErrors({ ...errors, accountName: null });
                  }}
                />
                <FormErrorMessage>{errors.accountName}</FormErrorMessage>
              </FormControl>

              {/* Info Alert */}
              <Alert status="info" borderRadius="md" fontSize="sm">
                <AlertIcon />
                Ensure your account details are correct to avoid failed transfers
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
                  colorScheme="orange"
                  onClick={handleProceed}
                  flex={1}
                  isDisabled={isLoadingBanks}
                >
                  Continue
                </Button>
              </HStack>
            </VStack>
          ) : (
            // Confirmation View
            <VStack spacing={4}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Please review your withdrawal details carefully
              </Alert>

              {/* Withdrawal Summary */}
              <Box w="full" p={4} bg="gray.50" borderRadius="md">
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">Amount</Text>
                    <Text fontWeight="bold" fontSize="lg">
                      ₦{parseFloat(amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </HStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Text color="gray.600">Bank</Text>
                    <Text fontWeight="medium">{getSelectedBankName()}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.600">Account Number</Text>
                    <Text fontWeight="medium">{accountNumber}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.600">Account Name</Text>
                    <Text fontWeight="medium">{accountName}</Text>
                  </HStack>

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
                  colorScheme="orange"
                  onClick={handleWithdraw}
                  flex={1}
                  isLoading={isProcessing}
                  loadingText="Processing..."
                >
                  Confirm Withdrawal
                </Button>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WithdrawModal;
