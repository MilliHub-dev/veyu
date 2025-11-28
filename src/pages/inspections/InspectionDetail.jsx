import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Text,
  Badge,
  Divider,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { GlobalStore } from '../../App';
import inspectionService from '../../services/inspectionService';
import InspectionPhotos from '../../components/inspections/InspectionPhotos';
import InspectionData from '../../components/inspections/InspectionData';

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { authUser } = useContext(GlobalStore);

  const [inspection, setInspection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInspectionDetail();
  }, [id]);

  const fetchInspectionDetail = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.getInspectionDetail(id);
      setInspection(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch inspection details',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = () => {
    navigate(`/inspections/${id}/pay`);
  };

  const handleGenerateDocument = async () => {
    try {
      await inspectionService.generateDocument(id, {
        template_type: 'standard',
        include_photos: true,
        include_recommendations: true,
      });
      toast({
        title: 'Success',
        description: 'Document generated successfully',
        status: 'success',
        duration: 3000,
      });
      fetchInspectionDetail();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate document',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleCompleteInspection = async () => {
    try {
      await inspectionService.completeInspection(id);
      toast({
        title: 'Success',
        description: 'Inspection marked as completed',
        status: 'success',
        duration: 3000,
      });
      fetchInspectionDetail();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete inspection',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  if (!inspection) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Inspection not found
        </Alert>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'red',
      draft: 'yellow',
      in_progress: 'blue',
      completed: 'green',
      signed: 'green',
      archived: 'gray',
    };
    return colors[status] || 'gray';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <Button leftIcon={<ArrowBackIcon />} variant="ghost" onClick={() => navigate('/inspections')}>
              Back
            </Button>
            <Heading size="lg">Inspection #{inspection.id}</Heading>
            <Badge colorScheme={getStatusColor(inspection.status)} fontSize="md">
              {inspection.status_display}
            </Badge>
          </HStack>
          <HStack>
            {inspection.status === 'pending_payment' && (
              <Button colorScheme="blue" onClick={handlePayNow}>
                Pay Now
              </Button>
            )}
            {inspection.status === 'in_progress' && authUser?.id === inspection.inspector?.id && (
              <Button colorScheme="green" onClick={handleCompleteInspection}>
                Complete Inspection
              </Button>
            )}
            {inspection.status === 'completed' && !inspection.documents?.length && (
              <Button colorScheme="purple" onClick={handleGenerateDocument}>
                Generate Document
              </Button>
            )}
            {inspection.documents?.length > 0 && (
              <Button
                colorScheme="blue"
                onClick={() => navigate(`/inspections/${id}/document/${inspection.documents[0].id}`)}
              >
                View Document
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Basic Info */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Vehicle</Text>
              <Text fontWeight="semibold">{inspection.vehicle_name}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Inspection Type</Text>
              <Text fontWeight="semibold">{inspection.inspection_type_display}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Fee</Text>
              <Text fontWeight="semibold" color="green.600">
                ₦{inspection.inspection_fee?.toLocaleString()}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Inspector</Text>
              <Text fontWeight="semibold">{inspection.inspector_name}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Customer</Text>
              <Text fontWeight="semibold">{inspection.customer_name}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Dealer</Text>
              <Text fontWeight="semibold">{inspection.dealer_name}</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Inspection Date</Text>
              <Text fontWeight="semibold">
                {new Date(inspection.inspection_date).toLocaleDateString()}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" color="gray.600">Payment Status</Text>
              <Badge colorScheme={inspection.payment_status === 'paid' ? 'green' : 'red'}>
                {inspection.payment_status_display}
              </Badge>
            </GridItem>
            {inspection.paid_at && (
              <GridItem>
                <Text fontSize="sm" color="gray.600">Paid At</Text>
                <Text fontWeight="semibold">
                  {new Date(inspection.paid_at).toLocaleString()}
                </Text>
              </GridItem>
            )}
          </Grid>
        </Box>

        {/* Tabs for Details */}
        <Box bg="white" borderRadius="lg" boxShadow="md">
          <Tabs>
            <TabList>
              <Tab>Inspection Data</Tab>
              <Tab>Photos ({inspection.photos?.length || 0})</Tab>
              <Tab>Documents ({inspection.documents?.length || 0})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <InspectionData inspection={inspection} onUpdate={fetchInspectionDetail} />
              </TabPanel>
              <TabPanel>
                <InspectionPhotos inspectionId={id} photos={inspection.photos} onUpdate={fetchInspectionDetail} />
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {inspection.documents?.length === 0 ? (
                    <Text color="gray.500">No documents generated yet</Text>
                  ) : (
                    inspection.documents?.map((doc) => (
                      <Box key={doc.id} p={4} borderWidth={1} borderRadius="md">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">Document #{doc.id}</Text>
                            <Text fontSize="sm" color="gray.600">
                              Generated: {new Date(doc.generated_at).toLocaleString()}
                            </Text>
                            <Badge>{doc.status}</Badge>
                          </VStack>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/inspections/${id}/document/${doc.id}`)}
                          >
                            View
                          </Button>
                        </HStack>
                      </Box>
                    ))
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default InspectionDetail;
