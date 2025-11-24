import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Badge,
  useToast,
  Divider,
} from '@chakra-ui/react';
import boostService from '../../services/boostService';

const BoostModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const toast = useToast();
  const [pricing, setPricing] = useState([]);
  const [durationType, setDurationType] = useState('weekly');
  const [durationCount, setDurationCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateCost();
  }, [durationType, durationCount, pricing]);

  const loadPricing = async () => {
    setLoadingPricing(true);
    try {
      console.log('Loading boost pricing...');
      const response = await boostService.getPricing();
      console.log('Pricing response:', response);
      
      // Check if we have valid data
      let pricingData = null;
      
      if (response?.data && Array.isArray(response.data)) {
        pricingData = response.data;
      } else if (response && Array.isArray(response)) {
        // Handle case where data is directly in response
        pricingData = response;
      }
      
      if (pricingData && pricingData.length > 0) {
        setPricing(pricingData);
        console.log('Pricing loaded:', pricingData);
        
        // Set default to first available option or weekly
        const weeklyOption = pricingData.find(p => p.duration_type === 'weekly');
        const firstOption = pricingData[0];
        setDurationType(weeklyOption ? 'weekly' : firstOption.duration_type);
      } else {
        console.error('No pricing data available:', response);
        toast({
          title: 'No pricing available',
          description: 'Boost pricing is not configured. Please contact support.',
          status: 'warning',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
      toast({
        title: 'Error loading pricing',
        description: error.message || 'Failed to load boost pricing. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoadingPricing(false);
    }
  };

  const calculateCost = () => {
    const selectedPricing = pricing.find(p => p.duration_type === durationType);
    if (selectedPricing) {
      const cost = parseFloat(selectedPricing.price) * durationCount;
      setTotalCost(cost);
    }
  };

  const handleCreateBoost = async () => {
    setLoading(true);
    try {
      const response = await boostService.createBoost(listing.uuid, {
        duration_type: durationType,
        duration_count: durationCount,
      });

      if (response?.data) {
        toast({
          title: 'Boost created',
          description: 'Please proceed with payment',
          status: 'success',
          duration: 3000,
        });
        
        // Call onSuccess with boost data for payment processing
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error creating boost',
        description: error.message || 'Failed to create boost',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPricing = pricing.find(p => p.duration_type === durationType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Boost Your Listing</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                {listing?.title || 'Your Listing'}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Boost this listing to appear in featured sections and get more visibility
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="semibold" mb={2}>
                Duration Type
              </Text>
              {loadingPricing ? (
                <Text fontSize="sm" color="gray.500">Loading pricing options...</Text>
              ) : pricing.length === 0 ? (
                <Text fontSize="sm" color="red.500">No pricing options available</Text>
              ) : (
                <Select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value)}
                  placeholder="Select duration type"
                >
                  {pricing.map((option) => (
                    <option key={option.duration_type} value={option.duration_type}>
                      {option.duration_display} - {option.formatted_price}
                    </option>
                  ))}
                </Select>
              )}
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={2}>
                Duration Count
              </Text>
              <NumberInput
                value={durationCount}
                onChange={(value) => setDurationCount(parseInt(value) || 1)}
                min={1}
                max={12}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                How many {durationType === 'daily' ? 'days' : durationType === 'weekly' ? 'weeks' : 'months'}?
              </Text>
            </Box>

            <Divider />

            <Box bg="gray.50" p={4} borderRadius="md">
              <HStack justify="space-between" mb={2}>
                <Text>Price per {durationType === 'daily' ? 'day' : durationType === 'weekly' ? 'week' : 'month'}:</Text>
                <Text fontWeight="bold">{selectedPricing?.formatted_price || '₦0.00'}</Text>
              </HStack>
              <HStack justify="space-between" mb={2}>
                <Text>Duration:</Text>
                <Text fontWeight="bold">{durationCount} {durationType === 'daily' ? 'day(s)' : durationType === 'weekly' ? 'week(s)' : 'month(s)'}</Text>
              </HStack>
              <Divider my={2} />
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">Total Cost:</Text>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  ₦{totalCost.toLocaleString()}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleCreateBoost}
            isLoading={loading}
            loadingText="Creating..."
            isDisabled={pricing.length === 0 || loadingPricing}
          >
            Proceed to Payment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BoostModal;
