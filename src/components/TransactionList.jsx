import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRepeat,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';
import TransactionFilters from './TransactionFilters';
import TransactionPagination from './TransactionPagination';

/**
 * TransactionList Component
 * Displays transaction history in card layout with filtering and pagination
 */
const TransactionList = ({ 
  transactions = [], 
  isLoading = false, 
  onFilterChange,
  showFilters = true,
  initialFilters = {},
  // Pagination props
  pagination = null,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Get transaction type icon
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'deposit':
        return FiArrowDownLeft;
      case 'withdrawal':
        return FiArrowUpRight;
      case 'transfer':
        return FiRepeat;
      default:
        return FiRepeat;
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return FiCheckCircle;
      case 'pending':
        return FiClock;
      case 'failed':
        return FiXCircle;
      default:
        return FiClock;
    }
  };

  // Get status color
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format amount with sign
  const formatAmount = (transaction) => {
    const amount = transaction.amount || 0;
    const currency = transaction.currency || 'NGN';
    const type = transaction.type?.toLowerCase();
    
    const sign = type === 'withdrawal' ? '-' : '+';
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${sign}${currency} ${formattedAmount}`;
  };

  // Handle transaction click
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  // Loading state
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4} color="gray.600">Loading transactions...</Text>
      </Box>
    );
  }

  // Empty state
  if (!transactions || transactions.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        No transactions found
      </Alert>
    );
  }

  return (
    <>
      {/* Filters */}
      {showFilters && onFilterChange && (
        <TransactionFilters
          onFilterChange={onFilterChange}
          initialFilters={initialFilters}
        />
      )}

      <VStack spacing={3} align="stretch">
        {transactions.map((transaction) => {
          const TypeIcon = getTypeIcon(transaction.type);
          const StatusIcon = getStatusIcon(transaction.status);
          const typeColor = getTypeColor(transaction.type);
          const statusColor = getStatusColor(transaction.status);

          return (
            <Card
              key={transaction.id}
              cursor="pointer"
              onClick={() => handleTransactionClick(transaction)}
              _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <CardBody>
                <HStack spacing={4} align="start">
                  {/* Type Icon */}
                  <Box
                    bg={`${typeColor}.100`}
                    p={3}
                    borderRadius="full"
                    color={`${typeColor}.600`}
                  >
                    <Icon as={TypeIcon} boxSize={5} />
                  </Box>

                  {/* Transaction Details */}
                  <VStack flex={1} align="start" spacing={1}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="md" textTransform="capitalize">
                        {transaction.type}
                      </Text>
                      <Text
                        fontWeight="bold"
                        fontSize="md"
                        color={transaction.type?.toLowerCase() === 'withdrawal' ? 'red.600' : 'green.600'}
                      >
                        {formatAmount(transaction)}
                      </Text>
                    </HStack>

                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(transaction.created_at || transaction.date)}
                        {' • '}
                        {formatTime(transaction.created_at || transaction.date)}
                      </Text>
                      <HStack spacing={2}>
                        <Icon as={StatusIcon} boxSize={4} color={`${statusColor}.500`} />
                        <Badge colorScheme={statusColor} textTransform="capitalize">
                          {transaction.status}
                        </Badge>
                      </HStack>
                    </HStack>

                    {transaction.description && (
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {transaction.description}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          );
        })}
      </VStack>

      {/* Pagination */}
      {pagination && (
        <TransactionPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}

      {/* Transaction Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transaction Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTransaction && (
              <VStack spacing={4} align="stretch">
                {/* Type and Amount */}
                <Box textAlign="center" py={4}>
                  <Box
                    bg={`${getTypeColor(selectedTransaction.type)}.100`}
                    p={4}
                    borderRadius="full"
                    display="inline-block"
                    mb={3}
                  >
                    <Icon
                      as={getTypeIcon(selectedTransaction.type)}
                      boxSize={8}
                      color={`${getTypeColor(selectedTransaction.type)}.600`}
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                    {selectedTransaction.type}
                  </Text>
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    color={selectedTransaction.type?.toLowerCase() === 'withdrawal' ? 'red.600' : 'green.600'}
                  >
                    {formatAmount(selectedTransaction)}
                  </Text>
                </Box>

                <Divider />

                {/* Transaction Info */}
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text color="gray.600">Status</Text>
                    <Badge
                      colorScheme={getStatusColor(selectedTransaction.status)}
                      textTransform="capitalize"
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {selectedTransaction.status}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.600">Reference</Text>
                    <Text fontWeight="medium" fontSize="sm">
                      {selectedTransaction.reference || 'N/A'}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.600">Date</Text>
                    <Text fontWeight="medium">
                      {formatDate(selectedTransaction.created_at || selectedTransaction.date)}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.600">Time</Text>
                    <Text fontWeight="medium">
                      {formatTime(selectedTransaction.created_at || selectedTransaction.date)}
                    </Text>
                  </HStack>

                  {selectedTransaction.description && (
                    <VStack align="stretch" spacing={1}>
                      <Text color="gray.600">Description</Text>
                      <Text fontWeight="medium">
                        {selectedTransaction.description}
                      </Text>
                    </VStack>
                  )}

                  {/* Recipient info for transfers */}
                  {selectedTransaction.type?.toLowerCase() === 'transfer' && selectedTransaction.recipient && (
                    <>
                      <Divider />
                      <VStack align="stretch" spacing={2}>
                        <Text color="gray.600" fontWeight="semibold">Recipient</Text>
                        <HStack justify="space-between">
                          <Text color="gray.600">Name</Text>
                          <Text fontWeight="medium">
                            {selectedTransaction.recipient.name || 'N/A'}
                          </Text>
                        </HStack>
                        {selectedTransaction.recipient.email && (
                          <HStack justify="space-between">
                            <Text color="gray.600">Email</Text>
                            <Text fontWeight="medium" fontSize="sm">
                              {selectedTransaction.recipient.email}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </>
                  )}

                  {/* Sender info for received transfers */}
                  {selectedTransaction.sender && (
                    <>
                      <Divider />
                      <VStack align="stretch" spacing={2}>
                        <Text color="gray.600" fontWeight="semibold">Sender</Text>
                        <HStack justify="space-between">
                          <Text color="gray.600">Name</Text>
                          <Text fontWeight="medium">
                            {selectedTransaction.sender.name || 'N/A'}
                          </Text>
                        </HStack>
                        {selectedTransaction.sender.email && (
                          <HStack justify="space-between">
                            <Text color="gray.600">Email</Text>
                            <Text fontWeight="medium" fontSize="sm">
                              {selectedTransaction.sender.email}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </>
                  )}

                  {selectedTransaction.completed_at && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Completed At</Text>
                      <Text fontWeight="medium" fontSize="sm">
                        {formatDate(selectedTransaction.completed_at)}
                        {' '}
                        {formatTime(selectedTransaction.completed_at)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransactionList;
