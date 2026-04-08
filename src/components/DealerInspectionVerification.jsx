import { useState, useContext } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Badge,
  Divider,
  Grid,
  GridItem,
  Icon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  QrCode, 
  Car, 
  User, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { GlobalStore } from '../contexts/GlobalStore';
import inspectionService from '../services/inspectionService';

/**
 * DealerInspectionVerification Component
 * Allows dealers to verify inspection slips by slip number or QR code
 */
const DealerInspectionVerification = () => {
  const { notify } = useContext(GlobalStore);
  const toast = useToast();
  
  const [slipNumber, setSlipNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!slipNumber.trim()) {
      setError('Please enter a slip number');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await inspectionService.verifyInspectionSlip({
        slip_number: slipNumber.trim(),
      });

      if (response?.success && response?.data?.valid) {
        setVerificationResult(response.data);
        toast({
          title: 'Verification Successful',
          description: 'Inspection slip is valid and verified',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setError(response?.data?.message || 'Invalid inspection slip');
        toast({
          title: 'Verification Failed',
          description: response?.data?.message || 'Invalid inspection slip',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to verify slip';
      setError(errorMessage);
      toast({
        title: 'Verification Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setSlipNumber('');
    setVerificationResult(null);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Verify Inspection Slip
          </Heading>
          <Text color="gray.600">
            Enter the slip number to verify customer's inspection payment
          </Text>
        </Box>

        {/* Verification Form */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontWeight="semibold">
                  <HStack spacing={2}>
                    <Icon as={FileText} boxSize={4} />
                    <Text>Slip Number</Text>
                  </HStack>
                </FormLabel>
                <Input
                  placeholder="Enter slip number (e.g., INSP-7)"
                  value={slipNumber}
                  onChange={(e) => setSlipNumber(e.target.value.toUpperCase())}
                  size="lg"
                  isDisabled={isVerifying}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleVerify();
                    }
                  }}
                />
              </FormControl>

              <HStack spacing={3} w="100%">
                <Button
                  leftIcon={<Icon as={Search} />}
                  colorScheme="blue"
                  onClick={handleVerify}
                  isLoading={isVerifying}
                  loadingText="Verifying..."
                  flex={1}
                  size="lg"
                >
                  Verify Slip
                </Button>
                {(verificationResult || error) && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    size="lg"
                  >
                    Reset
                  </Button>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="semibold">Verification Failed</Text>
              <Text fontSize="sm">{error}</Text>
            </VStack>
          </Alert>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <Card borderWidth="2px" borderColor="green.500" bg="green.50">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Success Header */}
                <HStack spacing={3} justify="center">
                  <Icon as={CheckCircle} boxSize={8} color="green.500" />
                  <Heading size="md" color="green.700">
                    Valid Inspection Slip
                  </Heading>
                </HStack>

                <Divider />

                {/* Slip Details */}
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Slip Number
                    </Text>
                    <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
                      {verificationResult.inspection_number}
                    </Badge>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Payment Status
                    </Text>
                    <Badge 
                      colorScheme={verificationResult.payment_status === 'paid' ? 'green' : 'yellow'} 
                      fontSize="md" 
                      px={2} 
                      py={1}
                    >
                      {verificationResult.payment_status?.toUpperCase()}
                    </Badge>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Inspection Status
                    </Text>
                    <Badge colorScheme="purple" fontSize="md" px={2} py={1}>
                      {verificationResult.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </GridItem>

                  <GridItem>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Inspection Type
                    </Text>
                    <Text fontWeight="semibold">
                      {verificationResult.inspection_type?.replace('_', ' ')}
                    </Text>
                  </GridItem>
                </Grid>

                <Divider />

                {/* Customer Information */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={User} boxSize={5} color="blue.600" />
                    <Heading size="sm" color="gray.700">
                      Customer Information
                    </Heading>
                  </HStack>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Name</Text>
                      <Text fontWeight="semibold">
                        {verificationResult.customer_name || 'N/A'}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Email</Text>
                      <Text fontWeight="semibold">
                        {verificationResult.customer_email || 'N/A'}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Phone</Text>
                      <Text fontWeight="semibold">
                        {verificationResult.customer_phone || 'N/A'}
                      </Text>
                    </GridItem>
                  </Grid>
                </Box>

                <Divider />

                {/* Vehicle Information */}
                {verificationResult.vehicle && (
                  <>
                    <Box>
                      <HStack spacing={2} mb={3}>
                        <Icon as={Car} boxSize={5} color="blue.600" />
                        <Heading size="sm" color="gray.700">
                          Vehicle Information
                        </Heading>
                      </HStack>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <GridItem>
                          <Text fontSize="sm" color="gray.600">Vehicle</Text>
                          <Text fontWeight="semibold">
                            {verificationResult.vehicle.name || 'N/A'}
                          </Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="sm" color="gray.600">Year</Text>
                          <Text fontWeight="semibold">
                            {verificationResult.vehicle.year || 'N/A'}
                          </Text>
                        </GridItem>
                        {verificationResult.vehicle.vin && (
                          <GridItem colSpan={2}>
                            <Text fontSize="sm" color="gray.600">VIN</Text>
                            <Text fontWeight="semibold">
                              {verificationResult.vehicle.vin}
                            </Text>
                          </GridItem>
                        )}
                      </Grid>
                    </Box>
                    <Divider />
                  </>
                )}

                {/* Schedule Information */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={Calendar} boxSize={5} color="blue.600" />
                    <Heading size="sm" color="gray.700">
                      Schedule Information
                    </Heading>
                  </HStack>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Scheduled Date</Text>
                      <Text fontWeight="semibold">
                        {formatDate(verificationResult.scheduled_date)}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Scheduled Time</Text>
                      <Text fontWeight="semibold">
                        {verificationResult.scheduled_time || 'N/A'}
                      </Text>
                    </GridItem>
                  </Grid>
                </Box>

                <Divider />

                {/* Payment Information */}
                <Box>
                  <HStack spacing={2} mb={3}>
                    <Icon as={DollarSign} boxSize={5} color="green.600" />
                    <Heading size="sm" color="gray.700">
                      Payment Information
                    </Heading>
                  </HStack>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Amount Paid</Text>
                      <Text fontWeight="bold" color="green.600" fontSize="lg">
                        ₦{verificationResult.inspection_fee?.toLocaleString() || 'N/A'}
                      </Text>
                    </GridItem>
                    <GridItem>
                      <Text fontSize="sm" color="gray.600">Payment Method</Text>
                      <Text fontWeight="semibold">
                        {verificationResult.payment_method || 'N/A'}
                      </Text>
                    </GridItem>
                    {verificationResult.payment_reference && (
                      <GridItem colSpan={2}>
                        <Text fontSize="sm" color="gray.600">Payment Reference</Text>
                        <Text fontWeight="semibold" fontSize="sm">
                          {verificationResult.payment_reference}
                        </Text>
                      </GridItem>
                    )}
                  </Grid>
                </Box>

                {/* Action Notice */}
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    This slip is valid. You can proceed with the vehicle inspection.
                  </Text>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Instructions */}
        <Card bg="blue.50" borderWidth="1px" borderColor="blue.200">
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack spacing={2}>
                <Icon as={AlertCircle} color="blue.600" />
                <Heading size="sm" color="blue.900">
                  How to Verify
                </Heading>
              </HStack>
              <VStack align="start" spacing={2} pl={6}>
                <Text fontSize="sm" color="gray.700">
                  1. Ask the customer for their inspection slip number (e.g., INSP-7)
                </Text>
                <Text fontSize="sm" color="gray.700">
                  2. Enter the slip number in the field above
                </Text>
                <Text fontSize="sm" color="gray.700">
                  3. Click "Verify Slip" to check payment status
                </Text>
                <Text fontSize="sm" color="gray.700">
                  4. If valid, proceed with the vehicle inspection
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default DealerInspectionVerification;
