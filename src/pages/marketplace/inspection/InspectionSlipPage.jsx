import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { GlobalStore } from '../../../App';
import InspectionSlip from '../../../components/InspectionSlip';
import inspectionService from '../../../services/inspectionService';

/**
 * InspectionSlipPage
 * Displays the inspection slip after booking
 */
const InspectionSlipPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useContext(GlobalStore);
  
  const [slipData, setSlipData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const slipReference = searchParams.get('reference');
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

  const handleDownload = () => {
    notify({
      title: 'Download Complete',
      body: 'Inspection slip has been downloaded',
      color: 'green',
    });
  };

  const handleProceed = () => {
    // Navigate back to checkout or listing
    if (listingId) {
      navigate(`/buy/${listingId}`);
    } else {
      navigate('/home');
    }
  };

  if (isLoading) {
    return (
      <Box bg="white" minH="100vh">
        <Box bg="blue.600" py={8} mb={8}>
          <Container maxW="container.xl" textAlign="center">
            <Heading color="white" size="lg" fontWeight="400">
              Inspection Slip
            </Heading>
            <Text color="whiteAlpha.900" mt={2}>
              Loading your inspection details...
            </Text>
          </Container>
        </Box>

        <Container maxW="container.md" py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading inspection slip...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="white" minH="100vh">
        <Box bg="blue.600" py={8} mb={8}>
          <Container maxW="container.xl" textAlign="center">
            <Heading color="white" size="lg" fontWeight="400">
              Inspection Slip
            </Heading>
            <Text color="whiteAlpha.900" mt={2}>
              Error loading inspection slip
            </Text>
          </Container>
        </Box>

        <Container maxW="container.md" py={10}>
          <VStack spacing={6}>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
            <Button
              leftIcon={<ArrowLeft size={20} />}
              onClick={() => navigate(-1)}
              colorScheme="blue"
            >
              Go Back
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh">
      <Box bg="blue.600" py={8} mb={8}>
        <Container maxW="container.xl" textAlign="center">
          <Heading color="white" size="lg" fontWeight="400">
            Inspection Slip
          </Heading>
          <Text color="whiteAlpha.900" mt={2}>
            Your inspection has been scheduled successfully
          </Text>
        </Container>
      </Box>

      <Container maxW="container.lg" py={10}>
        <Button
          leftIcon={<ArrowLeft size={20} />}
          variant="ghost"
          mb={6}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        {slipData && (
          <InspectionSlip
            slipData={slipData}
            onDownload={handleDownload}
            onProceed={handleProceed}
          />
        )}
      </Container>
    </Box>
  );
};

export default InspectionSlipPage;
