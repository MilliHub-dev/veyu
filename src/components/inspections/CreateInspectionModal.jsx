import { useState, useContext } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  Text,
  Box,
} from '@chakra-ui/react';
import { GlobalStore } from '../../App';
import inspectionService from '../../services/inspectionService';

const CreateInspectionModal = ({ onSuccess, onCancel }) => {
  const { authUser } = useContext(GlobalStore);
  const toast = useToast();

  const [formData, setFormData] = useState({
    vehicle: '',
    inspector: '',
    customer: authUser?.id || '',
    dealer: '',
    inspection_type: 'pre_purchase',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState(null);

  const handleGetQuote = async () => {
    if (!formData.inspection_type) {
      toast({
        title: 'Error',
        description: 'Please select an inspection type',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const quoteData = await inspectionService.getInspectionQuote({
        inspection_type: formData.inspection_type,
        vehicle_id: formData.vehicle || null,
      });
      setQuote(quoteData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get quote',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicle || !formData.inspector || !formData.dealer) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const inspection = await inspectionService.createInspection(formData);
      toast({
        title: 'Success',
        description: 'Inspection created successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess(inspection);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create inspection',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Inspection Type</FormLabel>
          <Select
            value={formData.inspection_type}
            onChange={(e) => {
              setFormData({ ...formData, inspection_type: e.target.value });
              setQuote(null);
            }}
          >
            <option value="pre_purchase">Pre-Purchase Inspection</option>
            <option value="pre_rental">Pre-Rental Inspection</option>
            <option value="maintenance">Maintenance Inspection</option>
            <option value="insurance">Insurance Inspection</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Vehicle ID</FormLabel>
          <Input
            type="number"
            value={formData.vehicle}
            onChange={(e) => {
              setFormData({ ...formData, vehicle: e.target.value });
              setQuote(null);
            }}
            placeholder="Enter vehicle ID"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Inspector ID</FormLabel>
          <Input
            type="number"
            value={formData.inspector}
            onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
            placeholder="Enter inspector ID"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Dealer ID</FormLabel>
          <Input
            type="number"
            value={formData.dealer}
            onChange={(e) => setFormData({ ...formData, dealer: e.target.value })}
            placeholder="Enter dealer ID"
          />
        </FormControl>

        <Button
          variant="outline"
          onClick={handleGetQuote}
          isLoading={isLoading}
          loadingText="Getting quote..."
        >
          Get Fee Quote
        </Button>

        {quote && (
          <Box bg="blue.50" p={4} borderRadius="md">
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="semibold">Fee Quote</Text>
              <HStack justify="space-between">
                <Text>Base Fee:</Text>
                <Text fontWeight="bold" color="blue.600">
                  ₦{quote.base_fee?.toLocaleString()}
                </Text>
              </HStack>
              {quote.vehicle_info && (
                <Text fontSize="sm" color="gray.600">
                  Vehicle: {quote.vehicle_info.name}
                </Text>
              )}
            </VStack>
          </Box>
        )}

        <Alert status="info" fontSize="sm">
          <AlertIcon />
          After creating the inspection, you'll need to pay before it can begin.
        </Alert>

        <HStack spacing={3} pt={2}>
          <Button
            type="submit"
            colorScheme="blue"
            flex={1}
            isLoading={isLoading}
            loadingText="Creating..."
          >
            Create Inspection
          </Button>
          <Button variant="outline" flex={1} onClick={onCancel} isDisabled={isLoading}>
            Cancel
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default CreateInspectionModal;
