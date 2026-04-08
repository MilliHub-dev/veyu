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
  useToast,
} from '@chakra-ui/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { GlobalStore } from '../../../contexts/GlobalStore';
import InspectionForm from '../../../components/InspectionForm';
import inspectionService from '../../../services/inspectionService';

/**
 * InspectionFormPage
 * Page for inspectors to conduct vehicle inspections
 */
const InspectionFormPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { notify, authUser } = useContext(GlobalStore);
  
  const [inspectionData, setInspectionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const inspectionId = searchParams.get('inspectionId');
  const slipReference = searchParams.get('reference');

  useEffect(() => {
    if (inspectionId || slipReference) {
      fetchInspectionData();
    } else {
      setError('No inspection ID or reference provided');
      setIsLoading(false);
    }
  }, [inspectionId, slipReference]);

  const fetchInspectionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch existing inspection data if available
      let response;
      if (inspectionId) {
        response = await inspectionService.getInspection(inspectionId);
      } else if (slipReference) {
        response = await inspectionService.getInspectionByReference(slipReference);
      }
      
      if (response?.success) {
        setInspectionData(response.data);
      } else {
        // If no existing data, that's okay - we're creating a new inspection
        setInspectionData({});
      }
    } catch (err) {
      console.error('Error fetching inspection:', err);
      // Don't show error if inspection doesn't exist yet
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to load inspection data');
      }
      setInspectionData({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      const response = await inspectionService.submitInspectionData(formData);
      
      if (response?.success) {
        toast({
          title: 'Inspection Submitted',
          description: 'The inspection has been submitted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          icon: <CheckCircle />,
        });

        notify({
          title: 'Success',
          body: 'Inspection submitted successfully',
          color: 'green',
        });

        // Navigate to document preview/signing page
        const documentId = response.data?.document_id;
        if (documentId) {
          navigate(`/inspection/document?documentId=${documentId}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error(response?.message || 'Failed to submit inspection');
      }
    } catch (err) {
      console.error('Error submitting inspection:', err);
      toast({
        title: 'Submission Failed',
        description: err.message || 'Failed to submit inspection. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box bg="white" minH="100vh">
        <Box bg="blue.600" py={8} mb={8}>
          <Container maxW="container.xl" textAlign="center">
            <Heading color="white" size="lg" fontWeight="400">
              Vehicle Inspection
            </Heading>
            <Text color="whiteAlpha.900" mt={2}>
              Loading inspection form...
            </Text>
          </Container>
        </Box>

        <Container maxW="container.xl" py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading inspection form...</Text>
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
              Vehicle Inspection
            </Heading>
            <Text color="whiteAlpha.900" mt={2}>
              Error loading inspection form
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
            Vehicle Inspection Form
          </Heading>
          <Text color="whiteAlpha.900" mt={2}>
            Complete the inspection form for this vehicle
          </Text>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        <Button
          leftIcon={<ArrowLeft size={20} />}
          variant="ghost"
          mb={6}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">Inspector: {authUser?.first_name} {authUser?.last_name}</Text>
            <Text fontSize="sm">
              Complete all sections and upload photos for each area of the vehicle
            </Text>
          </Box>
        </Alert>

        <InspectionForm
          inspectionId={inspectionId}
          slipReference={slipReference}
          onSubmit={handleSubmit}
          initialData={inspectionData}
          isLoading={isSubmitting}
        />
      </Container>
    </Box>
  );
};

export default InspectionFormPage;
