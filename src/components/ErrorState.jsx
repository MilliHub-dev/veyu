import {
  Box, VStack, Text, Button, Alert, AlertIcon, AlertTitle, AlertDescription
} from "@chakra-ui/react";
import { RefreshCw, AlertTriangle, Wifi, Lock } from "lucide-react";

export const ErrorState = ({ error, onRetry }) => {
  if (!error) return null;

  // Determine icon and color scheme based on error type
  const getErrorConfig = (errorType) => {
    switch (errorType) {
      case 'network':
        return {
          icon: Wifi,
          colorScheme: 'orange',
          status: 'warning'
        };
      case 'auth':
        return {
          icon: Lock,
          colorScheme: 'red',
          status: 'error'
        };
      case 'general':
      default:
        return {
          icon: AlertTriangle,
          colorScheme: 'red',
          status: 'error'
        };
    }
  };

  const config = getErrorConfig(error.type);
  const IconComponent = config.icon;

  return (
    <Box 
      bg="white" 
      border="1px solid" 
      borderColor="#d0d5dd" 
      borderRadius="xl" 
      p={6}
      maxW="container.xl" 
      w="100%"
    >
      <Alert 
        status={config.status} 
        variant="subtle" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        borderRadius="lg"
        py={8}
      >
        <Box mb={4}>
          <IconComponent size={48} color={config.colorScheme === 'orange' ? '#f56500' : '#e53e3e'} />
        </Box>
        
        <AlertTitle mt={4} mb={2} fontSize="lg" fontWeight="semibold">
          {error.type === 'network' && 'Connection Problem'}
          {error.type === 'auth' && 'Authentication Required'}
          {error.type === 'general' && 'Loading Error'}
          {!error.type && 'Something went wrong'}
        </AlertTitle>
        
        <AlertDescription maxWidth="md" fontSize="md" color="gray.600" mb={6}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </AlertDescription>

        <VStack spacing={3}>
          {error.retryable && onRetry && (
            <Button 
              colorScheme={config.colorScheme} 
              variant="solid"
              leftIcon={<RefreshCw size={16} />}
              onClick={onRetry}
              size="lg"
            >
              Try Again
            </Button>
          )}
          
          {error.type === 'auth' && (
            <Button 
              colorScheme="blue" 
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
          )}
          
          {!error.retryable && error.type !== 'auth' && (
            <Text fontSize="sm" color="gray.500">
              If this problem persists, please contact support.
            </Text>
          )}
        </VStack>
      </Alert>
    </Box>
  );
};

export default ErrorState;