import React from 'react';
import {
  Box,
  Badge,
  HStack,
  VStack,
  Text,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

const VerificationStatusDisplay = ({ 
  verifiedBusiness = false, 
  verificationStatus = 'not_submitted',
  rejectionReason = null,
  isCompact = false 
}) => {
  // Status configuration with colors, icons, and descriptions
  const statusConfig = {
    verified: {
      label: 'Verified',
      color: 'green',
      icon: CheckCircle,
      description: 'Your business has been verified and approved'
    },
    pending: {
      label: 'Pending Review',
      color: 'yellow',
      icon: Clock,
      description: 'Your verification documents are under review'
    },
    rejected: {
      label: 'Rejected',
      color: 'red',
      icon: XCircle,
      description: 'Verification was rejected. Please check requirements and resubmit'
    },
    not_submitted: {
      label: 'Unverified',
      color: 'gray',
      icon: AlertCircle,
      description: 'Business verification has not been submitted yet'
    },
    unknown: {
      label: 'Status Unknown',
      color: 'gray',
      icon: AlertCircle,
      description: 'Unable to determine verification status'
    }
  };

  // Determine the current status based on API data
  const getCurrentStatus = () => {
    // Handle cases where data might be missing or malformed
    try {
      if (verifiedBusiness === true) {
        return 'verified';
      }
      
      // Validate verificationStatus is a string
      if (typeof verificationStatus !== 'string') {
        console.warn('VerificationStatusDisplay: Invalid verificationStatus type:', typeof verificationStatus, verificationStatus);
        return 'not_submitted';
      }
      
      // Handle different verification status values
      switch (verificationStatus.toLowerCase()) {
        case 'verified':
          return 'verified';
        case 'pending':
        case 'pending_review':
          return 'pending';
        case 'rejected':
        case 'declined':
          return 'rejected';
        case 'not_submitted':
        case 'unverified':
        case '':
        case null:
        case undefined:
        default:
          return 'not_submitted';
      }
    } catch (error) {
      console.error('VerificationStatusDisplay: Error determining status:', error);
      return 'not_submitted';
    }
  };

  const currentStatus = getCurrentStatus();
  const config = statusConfig[currentStatus] || statusConfig.unknown;

  // Compact display for sidebar/preview
  if (isCompact) {
    return (
      <Tooltip 
        label={config.description}
        placement="top"
        hasArrow
      >
        <Badge
          colorScheme={config.color}
          variant="solid"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Icon as={config.icon} boxSize={3} />
          {config.label}
        </Badge>
      </Tooltip>
    );
  }

  // Full display for main profile section
  return (
    <Box>
      <HStack spacing={3} align="start">
        <Box
          p={3}
          borderRadius="full"
          bg={`${config.color}.100`}
          color={`${config.color}.600`}
        >
          <Icon as={config.icon} boxSize={6} />
        </Box>
        
        <VStack align="start" spacing={1} flex={1}>
          <HStack spacing={2}>
            <Badge
              colorScheme={config.color}
              variant="solid"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {config.label}
            </Badge>
          </HStack>
          
          <Text fontSize="sm" color="gray.600">
            {config.description}
          </Text>
          
          {/* Show rejection reason if available */}
          {currentStatus === 'rejected' && rejectionReason && (
            <Box
              mt={2}
              p={3}
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              w="100%"
            >
              <Text fontSize="sm" color="red.700" fontWeight="medium">
                Rejection Reason:
              </Text>
              <Text fontSize="sm" color="red.600" mt={1}>
                {rejectionReason}
              </Text>
            </Box>
          )}
          
          {/* Show action hint for unverified status */}
          {currentStatus === 'not_submitted' && (
            <Text fontSize="xs" color="blue.600" mt={1}>
              Submit your business documents to get verified
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

export default VerificationStatusDisplay;