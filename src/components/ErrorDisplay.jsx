import React from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
  Flex,
  useColorModeValue,
  Collapse,
  Code,
  Divider
} from '@chakra-ui/react';
import {
  AlertTriangle,
  Wifi,
  Server,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { ERROR_TYPES, ERROR_SEVERITY } from '../utils/errorHandler';

// Error type icons
const ERROR_ICONS = {
  [ERROR_TYPES.NETWORK]: Wifi,
  [ERROR_TYPES.AUTH]: Shield,
  [ERROR_TYPES.SERVER]: Server,
  [ERROR_TYPES.VALIDATION]: AlertTriangle,
  [ERROR_TYPES.UNKNOWN]: AlertTriangle
};

// Error severity colors
const SEVERITY_COLORS = {
  [ERROR_SEVERITY.LOW]: 'blue',
  [ERROR_SEVERITY.MEDIUM]: 'orange',
  [ERROR_SEVERITY.HIGH]: 'red',
  [ERROR_SEVERITY.CRITICAL]: 'red'
};

/**
 * Inline error display component for dashboard sections
 */
export const InlineError = ({ 
  error, 
  onRetry, 
  onDismiss,
  showDetails = false,
  size = 'md'
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!error) return null;

  const severity = error.severity || ERROR_SEVERITY.MEDIUM;
  const errorType = error.type || ERROR_TYPES.UNKNOWN;
  const IconComponent = ERROR_ICONS[errorType];
  const colorScheme = SEVERITY_COLORS[severity];

  return (
    <Alert
      status="error"
      variant="left-accent"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      mb={4}
    >
      <AlertIcon as={IconComponent} />
      <Box flex="1">
        <AlertTitle fontSize={size === 'sm' ? 'sm' : 'md'} mb={1}>
          {error.title || 'Error'}
        </AlertTitle>
        <AlertDescription fontSize={size === 'sm' ? 'xs' : 'sm'} mb={3}>
          {error.message || 'An unexpected error occurred'}
        </AlertDescription>
        
        <HStack spacing={3}>
          {error.canRetry && onRetry && (
            <Button
              size="sm"
              colorScheme={colorScheme}
              leftIcon={<RefreshCw size={14} />}
              onClick={onRetry}
            >
              {error.action || 'Retry'}
            </Button>
          )}
          
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          
          {showDetails && error.originalError && (
            <Button
              size="sm"
              variant="ghost"
              rightIcon={showErrorDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              onClick={() => setShowErrorDetails(!showErrorDetails)}
            >
              Details
            </Button>
          )}
        </HStack>

        <Collapse in={showErrorDetails} animateOpacity>
          <Box mt={4} p={3} bg="gray.50" borderRadius="md">
            <Text fontSize="xs" fontWeight="semibold" mb={2}>Error Details:</Text>
            <Code fontSize="xs" p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
              {JSON.stringify({
                message: error.originalError?.message,
                status: error.originalError?.response?.status,
                data: error.originalError?.response?.data
              }, null, 2)}
            </Code>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
};

/**
 * Empty state with error display
 */
export const EmptyStateError = ({ 
  error, 
  onRetry,
  title = "Unable to load data",
  description = "Something went wrong while loading this section.",
  icon: CustomIcon = AlertTriangle
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={8}
      textAlign="center"
    >
      <VStack spacing={4}>
        <Icon as={CustomIcon} w={12} h={12} color="red.400" />
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
            {title}
          </Text>
          <Text color="gray.600" mb={4}>
            {description}
          </Text>
        </Box>
        
        {error && (
          <Box w="full" maxW="md">
            <InlineError 
              error={error} 
              onRetry={onRetry}
              size="sm"
            />
          </Box>
        )}
        
        {!error && onRetry && (
          <Button
            colorScheme="blue"
            leftIcon={<RefreshCw size={16} />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </VStack>
    </Box>
  );
};

/**
 * Full page error display
 */
export const FullPageError = ({ 
  error,
  onRetry,
  onGoHome,
  title = "Something went wrong",
  showSupportLink = true
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box
        bg={cardBg}
        borderRadius="xl"
        boxShadow="xl"
        p={8}
        maxW="md"
        w="full"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Icon as={AlertTriangle} w={16} h={16} color="red.400" />
          
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900" mb={2}>
              {title}
            </Text>
            <Text color="gray.600">
              We're sorry for the inconvenience. Please try again or contact support if the problem persists.
            </Text>
          </Box>

          {error && (
            <Box w="full">
              <Divider mb={4} />
              <InlineError 
                error={error} 
                onRetry={onRetry}
                showDetails={true}
              />
            </Box>
          )}

          <VStack spacing={3} w="full">
            {onRetry && (
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                leftIcon={<RefreshCw size={20} />}
                onClick={onRetry}
              >
                Try Again
              </Button>
            )}
            
            {onGoHome && (
              <Button
                variant="outline"
                size="lg"
                w="full"
                onClick={onGoHome}
              >
                Go to Dashboard
              </Button>
            )}
            
            {showSupportLink && (
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ExternalLink size={14} />}
                onClick={() => window.open('/contact', '_blank')}
              >
                Contact Support
              </Button>
            )}
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

/**
 * Toast-style error notification (for use with Chakra UI toast)
 */
export const ErrorToast = ({ error, onRetry }) => {
  return (
    <Box>
      <Flex align="center" mb={2}>
        <Icon as={AlertTriangle} color="red.400" mr={2} />
        <Text fontWeight="semibold">{error.title}</Text>
      </Flex>
      <Text fontSize="sm" mb={3}>{error.message}</Text>
      {error.canRetry && onRetry && (
        <Button size="sm" colorScheme="red" onClick={onRetry}>
          {error.action || 'Retry'}
        </Button>
      )}
    </Box>
  );
};

export default {
  InlineError,
  EmptyStateError,
  FullPageError,
  ErrorToast
};