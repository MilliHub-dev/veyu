import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Grid,
  GridItem,
  Badge,
  useToast,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { DownloadIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FiPrinter } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import inspectionService from '../services/inspectionService';

/**
 * InspectionSlip Component
 * Displays generated inspection slip with download and print options
 */
const InspectionSlip = ({ slipData, onDownload, onProceed }) => {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    reference,
    listingId,
    inspectionType,
    scheduledDate,
    scheduledTime,
    customerName,
    customerEmail,
    vehicleDetails,
    paymentStatus,
    amount,
    createdAt,
  } = slipData;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await inspectionService.downloadInspectionSlip(reference);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-slip-${reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Successful',
        description: 'Inspection slip has been downloaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download inspection slip. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <Box
      bg="white"
      p={8}
      borderRadius="lg"
      boxShadow="lg"
      maxW="800px"
      mx="auto"
      className="inspection-slip"
    >
      {/* Header */}
      <VStack spacing={4} mb={6}>
        <Heading size="lg" color="blue.600">
          Vehicle Inspection Slip
        </Heading>
        <Badge
          colorScheme={paymentStatus === 'paid' ? 'green' : 'yellow'}
          fontSize="md"
          px={3}
          py={1}
          borderRadius="full"
        >
          <Icon as={CheckCircleIcon} mr={1} />
          {paymentStatus === 'paid' ? 'Payment Confirmed' : 'Payment Pending'}
        </Badge>
      </VStack>

      <Divider mb={6} />

      {/* Reference and QR Code */}
      <Flex justify="space-between" align="start" mb={6} flexWrap="wrap" gap={4}>
        <Box flex={1}>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Reference Number
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.600">
            {reference}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={2}>
            Generated on {formatDate(createdAt)}
          </Text>
        </Box>
        <Box textAlign="center">
          <QRCodeSVG value={reference} size={120} />
          <Text fontSize="xs" color="gray.500" mt={2}>
            Scan for verification
          </Text>
        </Box>
      </Flex>

      <Divider mb={6} />

      {/* Inspection Details */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Heading size="md" color="gray.700">
          Inspection Details
        </Heading>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <Text fontSize="sm" color="gray.600">
              Inspection Type
            </Text>
            <Text fontWeight="semibold">
              {getInspectionTypeLabel(inspectionType)}
            </Text>
          </GridItem>
          
          <GridItem>
            <Text fontSize="sm" color="gray.600">
              Amount Paid
            </Text>
            <Text fontWeight="semibold" color="green.600">
              ₦{amount?.toLocaleString() || 'N/A'}
            </Text>
          </GridItem>
          
          <GridItem>
            <Text fontSize="sm" color="gray.600">
              Scheduled Date
            </Text>
            <Text fontWeight="semibold">{formatDate(scheduledDate)}</Text>
          </GridItem>
          
          <GridItem>
            <Text fontSize="sm" color="gray.600">
              Scheduled Time
            </Text>
            <Text fontWeight="semibold">{scheduledTime || 'N/A'}</Text>
          </GridItem>
        </Grid>
      </VStack>

      <Divider mb={6} />

      {/* Customer Details */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Heading size="md" color="gray.700">
          Customer Information
        </Heading>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <Text fontSize="sm" color="gray.600">
              Customer Name
            </Text>
            <Text fontWeight="semibold">{customerName || 'N/A'}</Text>
          </GridItem>
          
          <GridItem>
            <Text fontSize="sm" color="gray.600">
              Email Address
            </Text>
            <Text fontWeight="semibold">{customerEmail || 'N/A'}</Text>
          </GridItem>
        </Grid>
      </VStack>

      <Divider mb={6} />

      {/* Vehicle Details */}
      {vehicleDetails && (
        <>
          <VStack spacing={4} align="stretch" mb={6}>
            <Heading size="md" color="gray.700">
              Vehicle Information
            </Heading>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {vehicleDetails.brand && (
                <GridItem>
                  <Text fontSize="sm" color="gray.600">
                    Brand
                  </Text>
                  <Text fontWeight="semibold">{vehicleDetails.brand}</Text>
                </GridItem>
              )}
              
              {vehicleDetails.model && (
                <GridItem>
                  <Text fontSize="sm" color="gray.600">
                    Model
                  </Text>
                  <Text fontWeight="semibold">{vehicleDetails.model}</Text>
                </GridItem>
              )}
              
              {vehicleDetails.year && (
                <GridItem>
                  <Text fontSize="sm" color="gray.600">
                    Year
                  </Text>
                  <Text fontWeight="semibold">{vehicleDetails.year}</Text>
                </GridItem>
              )}
              
              {vehicleDetails.vin && (
                <GridItem>
                  <Text fontSize="sm" color="gray.600">
                    VIN
                  </Text>
                  <Text fontWeight="semibold">{vehicleDetails.vin}</Text>
                </GridItem>
              )}
            </Grid>
          </VStack>
          
          <Divider mb={6} />
        </>
      )}

      {/* Important Notice */}
      <Box bg="yellow.50" p={4} borderRadius="md" mb={6}>
        <Text fontSize="sm" color="gray.700">
          <strong>Important:</strong> Please present this slip to the inspector at the scheduled time. 
          Keep the reference number for tracking purposes.
        </Text>
      </Box>

      {/* Action Buttons */}
      <HStack spacing={3} className="no-print">
        <Button
          leftIcon={<DownloadIcon />}
          colorScheme="blue"
          onClick={handleDownload}
          isLoading={isDownloading}
          loadingText="Downloading..."
          flex={1}
        >
          Download PDF
        </Button>
        <Button
          leftIcon={<Icon as={FiPrinter} />}
          variant="outline"
          colorScheme="blue"
          onClick={handlePrint}
          flex={1}
        >
          Print
        </Button>
      </HStack>

      {onProceed && (
        <Button
          colorScheme="green"
          size="lg"
          w="100%"
          mt={4}
          onClick={onProceed}
          className="no-print"
        >
          Proceed to Checkout
        </Button>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .inspection-slip {
            box-shadow: none !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default InspectionSlip;
