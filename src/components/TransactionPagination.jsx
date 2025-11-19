import {
  HStack,
  Button,
  Text,
  IconButton,
  Select,
  Box,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * TransactionPagination Component
 * Provides pagination controls for transaction list
 */
const TransactionPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) => {
  // Calculate displayed items range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if at the beginning or end
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Don't render if no items
  if (totalItems === 0) {
    return null;
  }

  return (
    <Box
      mt={6}
      p={4}
      bg="gray.50"
      borderRadius="md"
      border="1px"
      borderColor="gray.200"
    >
      <HStack justify="space-between" flexWrap="wrap" spacing={4}>
        {/* Items info and per-page selector */}
        <HStack spacing={3}>
          <Text fontSize="sm" color="gray.600">
            Showing {startItem}-{endItem} of {totalItems}
          </Text>
          
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Per page:
            </Text>
            <Select
              size="sm"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              w="70px"
              bg="white"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </HStack>
        </HStack>

        {/* Pagination controls */}
        <HStack spacing={2}>
          {/* First page */}
          <IconButton
            icon={<FiChevronsLeft />}
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(1)}
            isDisabled={currentPage === 1}
            aria-label="First page"
          />

          {/* Previous page */}
          <IconButton
            icon={<FiChevronLeft />}
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            aria-label="Previous page"
          />

          {/* Page numbers */}
          {pageNumbers[0] > 1 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>
              {pageNumbers[0] > 2 && (
                <Text fontSize="sm" color="gray.500">...</Text>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              size="sm"
              variant={currentPage === pageNum ? 'solid' : 'outline'}
              colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <Text fontSize="sm" color="gray.500">...</Text>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          {/* Next page */}
          <IconButton
            icon={<FiChevronRight />}
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            aria-label="Next page"
          />

          {/* Last page */}
          <IconButton
            icon={<FiChevronsRight />}
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(totalPages)}
            isDisabled={currentPage === totalPages}
            aria-label="Last page"
          />
        </HStack>
      </HStack>
    </Box>
  );
};

export default TransactionPagination;
