import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  HStack,
  Icon,
  Badge,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { ArrowLeft, CheckCircle, Calendar, Clock, User, Mail, Phone, Car, FileText, Download, Printer } from 'lucide-react';
import { GlobalStore } from '../../../App';
import InspectionSlip from '../../../components/InspectionSlip';
import inspectionService from '../../../services/inspectionService';
import { QRCodeSVG } from 'qrcode.react';

/**
 * InspectionSlipPage - Redesigned
 * Modern, clean design for displaying inspection slip
 */
const InspectionSlipPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useContext(GlobalStore);
  const { slipReference: pathSlipReference } = useParams();
  
  const [slipData, setSlipData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');

  // Support both path params and query params
  const slipReference = pathSlipReference || searchParams.get('reference');
  const listingId = searchParams.get('listingId');

  useEffect(() => {
    if (slipReference) {
      fetchSlipData();
    } else {
      setError('No slip reference provided');
      setIsLoading(false);
    }
  }, [slipReference]);

  const fetchSlipData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await inspectionService.getInspectionSlip(slipReference);
      
      if (response?.success) {
        setSlipData(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load inspection slip');
      }
    } catch (err) {
      console.error('Error fetching slip:', err);
      setError(err.message || 'Failed to load inspection slip');
      notify({
        title: 'Error',
        body: 'Failed to load inspection slip. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await inspectionService.downloadInspectionSlip(slipReference);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-slip-${slipReference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify({
        title: 'Download Complete',
        body: 'Inspection slip has been downloaded',
        color: 'green',
      });
    } catch (error) {
      notify({
        title: 'Download Failed',
        body: 'Failed to download inspection slip',
        color: 'red',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleProceed = () => {
    if (listingId) {
      navigate(`/buy/${listingId}`);
    } else {
      navigate('/home');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInspectionTypeLabel = (type) => {
    const labels = {
      pre_purchase: 'Pre-Purchase Inspection',
      pre_rental: 'Pre-Rental Inspection',
      maintenance: 'Maintenance Inspection',
      insurance: 'Insurance Inspection',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Box bgGradient={bgGradient} minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <VStack spacing={2}>
              <Heading size="lg">Loading Inspection Slip</Heading>
              <Text color="gray.600">Please wait while we fetch your details...</Text>
            </VStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bgGradient={bgGradient} minH="100vh" py={12}>
        <Container maxW="container.md">
          <VStack spacing={6}>
            <Icon as={AlertIcon} boxSize={16} color="red.500" />
            <Heading size="lg">Oops! Something went wrong</Heading>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowLeft size={20} />}
                onClick={() => navigate(-1)}
                variant="outline"
              >
                Go Back
              </Button>
              <Button
                colorScheme="blue"
                onClick={fetchSlipData}
              >
                Try Again
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!slipData) return null;

  // Normalize data
  const {
    reference,
    inspection_number,
    slip_reference,
    inspection_type,
    inspectionType,
    scheduled_date,
    scheduledDate,
    scheduled_time,
    scheduledTime,
    customer_name,
    customerName,
    customer_email,
    customerEmail,
    customer_phone,
    vehicle,
    vehicleDetails,
    payment_status,
    paymentStatus,
    inspection_fee,
    amount,
    created_at,
    createdAt,
    dealer,
    status,
  } = slipData;

  const slipRef = inspection_number || slip_reference || reference;
  const inspType = inspection_type || inspectionType;
  const schedDate = scheduled_date || scheduledDate;
  const schedTime = scheduled_time || scheduledTime;
  const custName = customer_name || customerName;
  const custEmail = customer_email || customerEmail;
  const custPhone = customer_phone;
  const vehicleInfo = vehicle || vehicleDetails;
  const payStatus = payment_status || paymentStatus;
  const paidAmount = inspection_fee || amount;
  const createdDate = created_at || createdAt;

  return (
    <Box bgGradient={bgGradient} minH="100vh" py={8} className="inspection-page">
      <Container maxW="container.xl">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8} className="no-print">
          <Button
            leftIcon={<ArrowLeft size={20} />}
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <HStack spacing={3}>
            <Button
              leftIcon={<Download size={18} />}
              colorScheme="blue"
              variant="outline"
              onClick={handleDownload}
              isLoading={isDownloading}
            >
              Download
            </Button>
            <Button
              leftIcon={<Printer size={18} />}
              colorScheme="blue"
              onClick={handlePrint}
            >
              Print
            </Button>
          </HStack>
        </Flex>

        {/* Success Banner */}
        <Card bg="green.50" borderColor="green.200" borderWidth="1px" mb={6} className="no-print">
          <CardBody>
            <HStack spacing={4}>
              <Icon as={CheckCircle} boxSize={12} color="green.500" />
              <VStack align="start" spacing={1}>
                <Heading size="md" color="green.700">
                  Inspection Scheduled Successfully!
                </Heading>
                <Text color="green.600">
                  Your inspection has been booked. Please save this slip for your records.
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Main Slip Card */}
        <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
          <Box bg="blue.600" py={8} px={6}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={2}>
                <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                  {payStatus === 'paid' ? 'PAID' : 'PENDING'}
                </Badge>
                <Heading size="xl" color="white">
                  Vehicle Inspection Slip
                </Heading>
                <Text color="whiteAlpha.900" fontSize="lg">
                  Reference: <strong>{slipRef}</strong>
                </Text>
              </VStack>
              <Box bg="white" p={4} borderRadius="xl">
                <QRCodeSVG 
                  value={`VEYU-INSPECTION:${slipRef}:${slipData.id || ''}`} 
                  size={120}
                  level="H"
                />
                <Text fontSize="xs" color="gray.600" mt={2} textAlign="center">
                  Scan to verify
                </Text>
              </Box>
            </Flex>
          </Box>

          <CardBody p={8}>
            <VStack spacing={8} align="stretch">
              {/* Inspection Details */}
              <Box>
                <Heading size="md" mb={4} color="gray.700">
                  <Icon as={FileText} mr={2} />
                  Inspection Details
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <InfoItem
                    icon={Calendar}
                    label="Inspection Type"
                    value={getInspectionTypeLabel(inspType)}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Scheduled Date"
                    value={formatDate(schedDate)}
                  />
                  <InfoItem
                    icon={Clock}
                    label="Scheduled Time"
                    value={schedTime || 'N/A'}
                  />
                  <InfoItem
                    label="Amount Paid"
                    value={`₦${paidAmount?.toLocaleString() || 'N/A'}`}
                    valueColor="green.600"
                  />
                  {status && (
                    <InfoItem
                      label="Status"
                      value={
                        <Badge colorScheme="blue" fontSize="sm">
                          {status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      }
                    />
                  )}
                  <InfoItem
                    label="Created On"
                    value={formatDate(createdDate)}
                  />
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Customer Information */}
              <Box>
                <Heading size="md" mb={4} color="gray.700">
                  <Icon as={User} mr={2} />
                  Customer Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <InfoItem
                    icon={User}
                    label="Full Name"
                    value={custName || 'N/A'}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email Address"
                    value={custEmail || 'N/A'}
                  />
                  {custPhone && (
                    <InfoItem
                      icon={Phone}
                      label="Phone Number"
                      value={custPhone}
                    />
                  )}
                </SimpleGrid>
              </Box>

              {/* Vehicle Information */}
              {vehicleInfo && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={4} color="gray.700">
                      <Icon as={Car} mr={2} />
                      Vehicle Information
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {(vehicleInfo.brand || vehicleInfo.make) && (
                        <InfoItem
                          label="Brand"
                          value={vehicleInfo.brand || vehicleInfo.make}
                        />
                      )}
                      {vehicleInfo.model && (
                        <InfoItem
                          label="Model"
                          value={vehicleInfo.model}
                        />
                      )}
                      {vehicleInfo.year && (
                        <InfoItem
                          label="Year"
                          value={vehicleInfo.year}
                        />
                      )}
                      {vehicleInfo.vin && (
                        <InfoItem
                          label="VIN"
                          value={vehicleInfo.vin}
                        />
                      )}
                      {vehicleInfo.name && (
                        <InfoItem
                          label="Vehicle Name"
                          value={vehicleInfo.name}
                        />
                      )}
                    </SimpleGrid>
                  </Box>
                </>
              )}

              {/* Dealer Information */}
              {dealer && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={4} color="gray.700">
                      Dealer Information
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      {dealer.business_name && (
                        <InfoItem
                          label="Business Name"
                          value={dealer.business_name}
                        />
                      )}
                      {dealer.location && (
                        <InfoItem
                          label="Location"
                          value={dealer.location}
                        />
                      )}
                      {dealer.phone && (
                        <InfoItem
                          label="Phone"
                          value={dealer.phone}
                        />
                      )}
                    </SimpleGrid>
                  </Box>
                </>
              )}

              {/* Important Notice */}
              <Alert status="warning" borderRadius="lg" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="semibold" mb={1}>Important Notice</Text>
                  <Text fontSize="sm">
                    Please present this slip to the inspector at the scheduled time. 
                    Keep the reference number for tracking purposes.
                  </Text>
                </Box>
              </Alert>

              {/* Action Buttons */}
              {onProceed && (
                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={handleProceed}
                  className="no-print"
                >
                  Proceed to Checkout
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .inspection-page {
            background: white !important;
          }
        }
      `}</style>
    </Box>
  );
};

// Info Item Component
const InfoItem = ({ icon, label, value, valueColor = 'gray.900' }) => (
  <Box>
    <HStack spacing={2} mb={1}>
      {icon && <Icon as={icon} boxSize={4} color="gray.500" />}
      <Text fontSize="sm" color="gray.600" fontWeight="medium">
        {label}
      </Text>
    </HStack>
    <Text fontSize="md" fontWeight="semibold" color={valueColor}>
      {value}
    </Text>
  </Box>
);

export default InspectionSlipPage;
