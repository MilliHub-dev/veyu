import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import walletService from '../services/walletService';
import TransactionList from './TransactionList';

/**
 * TransactionHistory Component
 * Complete transaction history page with filtering and pagination
 */
const TransactionHistory = () => {
  const toast = useToast();

  // State
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Fetch transactions
  const fetchTransactions = async (page = 1, limit = 10, filterParams = {}) => {
    setIsLoading(true);

    try {
      const params = {
        page,
        limit,
        ...filterParams,
      };

      const response = await walletService.getTransactions(params);

      if (response?.success && response?.data) {
        // Handle paginated response
        if (response.data.results) {
          setTransactions(response.data.results);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(response.data.count / limit),
            totalItems: response.data.count,
            itemsPerPage: limit,
          });
        } else {
          // Handle non-paginated response
          setTransactions(response.data);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: response.data.length,
            itemsPerPage: response.data.length,
          });
        }
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Transaction fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTransactions(1, pagination.itemsPerPage, filters);
  }, []);

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTransactions(1, pagination.itemsPerPage, newFilters);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchTransactions(newPage, pagination.itemsPerPage, filters);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    fetchTransactions(1, newItemsPerPage, filters);
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Transaction History</Heading>

        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
          showFilters={true}
          initialFilters={filters}
          pagination={pagination}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};

export default TransactionHistory;
