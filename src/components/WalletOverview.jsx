import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { GlobalStore } from '../App';
import walletService from '../services/walletService';

/**
 * WalletOverview Component
 * Displays wallet balance and recent transactions with action buttons
 */
const WalletOverview = ({ onDeposit, onWithdraw, onTransfer }) => {
  const { authUser } = useContext(GlobalStore);
  const toast = useToast();

  // State
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('NGN');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data
  const fetchWalletData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await walletService.getWalletOverview();
      
      if (response?.success && response?.data) {
        setBalance(response.data.balance || 0);
        setCurrency(response.data.currency || 'NGN');
        setRecentTransactions(response.data.recent_transactions || []);
      } else {
        throw new Error('Failed to fetch wallet data');
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
      setError(err.message || 'Failed to load wallet information');
      toast({
        title: 'Error',
        description: 'Failed to load wallet information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Auto-refresh handler
  const handleRefresh = () => {
    fetchWalletData();
  };

  // Get transaction status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get transaction type color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return 'green';
      case 'withdrawal':
        return 'orange';
      case 'transfer':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading wallet information...</Text>
      </Box>
    );
  }

  // Error state
  if (error && !isLoading) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} colorScheme="blue" onClick={handleRefresh}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        {/* Balance Section */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Wallet Balance</Heading>
            <Button size="sm" variant="ghost" onClick={handleRefresh}>
              Refresh
            </Button>
          </HStack>
          
          <Box
            bg="blue.50"
            p={6}
            borderRadius="lg"
            textAlign="center"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>
              Available Balance
            </Text>
            <Heading size="2xl" color="blue.600">
              {currency} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Heading>
          </Box>
        </Box>

        {/* Action Buttons */}
        <HStack spacing={3}>
          <Button
            flex={1}
            colorScheme="green"
            onClick={onDeposit}
          >
            Deposit
          </Button>
          <Button
            flex={1}
            colorScheme="orange"
            onClick={onWithdraw}
          >
            Withdraw
          </Button>
          <Button
            flex={1}
            colorScheme="blue"
            onClick={onTransfer}
          >
            Transfer
          </Button>
        </HStack>

        <Divider />

        {/* Recent Transactions Section */}
        <Box>
          <Heading size="md" mb={4}>
            Recent Transactions
          </Heading>

          {recentTransactions.length === 0 ? (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              No recent transactions
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentTransactions.map((transaction, index) => (
                    <Tr key={transaction.id || index}>
                      <Td fontSize="xs">
                        {formatDate(transaction.created_at || transaction.date)}
                      </Td>
                      <Td>
                        <Badge colorScheme={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                      </Td>
                      <Td fontWeight="bold">
                        {transaction.type?.toLowerCase() === 'withdrawal' ? '-' : '+'}
                        {currency} {(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </Td>
                      <Td fontSize="xs" maxW="200px" isTruncated>
                        {transaction.description || transaction.reference || 'N/A'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default WalletOverview;
