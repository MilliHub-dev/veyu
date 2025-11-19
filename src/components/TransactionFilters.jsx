import { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Select,
  Button,
  Input,
  FormControl,
  FormLabel,
  Collapse,
  useDisclosure,
  Icon,
  Text,
} from '@chakra-ui/react';
import { FiFilter, FiX } from 'react-icons/fi';

/**
 * TransactionFilters Component
 * Provides filtering controls for transaction list
 */
const TransactionFilters = ({ onFilterChange, initialFilters = {} }) => {
  const { isOpen, onToggle } = useDisclosure();
  
  // Filter state
  const [filters, setFilters] = useState({
    type: initialFilters.type || '',
    status: initialFilters.status || '',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
  });

  // Handle filter change
  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Remove empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <Box>
      {/* Filter Toggle Button */}
      <HStack justify="space-between" mb={3}>
        <Button
          leftIcon={<Icon as={FiFilter} />}
          onClick={onToggle}
          variant="outline"
          size="sm"
          colorScheme={hasActiveFilters ? 'blue' : 'gray'}
        >
          {hasActiveFilters ? 'Filters Active' : 'Filter Transactions'}
        </Button>
        
        {hasActiveFilters && (
          <Button
            leftIcon={<Icon as={FiX} />}
            onClick={handleClearFilters}
            variant="ghost"
            size="sm"
            colorScheme="red"
          >
            Clear Filters
          </Button>
        )}
      </HStack>

      {/* Filter Controls */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          p={4}
          bg="gray.50"
          borderRadius="md"
          border="1px"
          borderColor="gray.200"
          mb={4}
        >
          <VStack spacing={4} align="stretch">
            <HStack spacing={4} align="end">
              {/* Transaction Type Filter */}
              <FormControl flex={1}>
                <FormLabel fontSize="sm" mb={1}>Transaction Type</FormLabel>
                <Select
                  placeholder="All Types"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  size="sm"
                  bg="white"
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </FormControl>

              {/* Status Filter */}
              <FormControl flex={1}>
                <FormLabel fontSize="sm" mb={1}>Status</FormLabel>
                <Select
                  placeholder="All Statuses"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="sm"
                  bg="white"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Select>
              </FormControl>
            </HStack>

            {/* Date Range Filter */}
            <HStack spacing={4} align="end">
              <FormControl flex={1}>
                <FormLabel fontSize="sm" mb={1}>From Date</FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  size="sm"
                  bg="white"
                  max={filters.dateTo || undefined}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel fontSize="sm" mb={1}>To Date</FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  size="sm"
                  bg="white"
                  min={filters.dateFrom || undefined}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
            </HStack>

            {/* Action Buttons */}
            <HStack spacing={3} justify="flex-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
                isDisabled={!hasActiveFilters}
              >
                Reset
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </HStack>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <Box pt={2} borderTop="1px" borderColor="gray.300">
                <Text fontSize="xs" color="gray.600" mb={2}>Active Filters:</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {filters.type && (
                    <Box
                      px={2}
                      py={1}
                      bg="blue.100"
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      Type: {filters.type}
                    </Box>
                  )}
                  {filters.status && (
                    <Box
                      px={2}
                      py={1}
                      bg="blue.100"
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      Status: {filters.status}
                    </Box>
                  )}
                  {filters.dateFrom && (
                    <Box
                      px={2}
                      py={1}
                      bg="blue.100"
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      From: {new Date(filters.dateFrom).toLocaleDateString()}
                    </Box>
                  )}
                  {filters.dateTo && (
                    <Box
                      px={2}
                      py={1}
                      bg="blue.100"
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      To: {new Date(filters.dateTo).toLocaleDateString()}
                    </Box>
                  )}
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default TransactionFilters;
