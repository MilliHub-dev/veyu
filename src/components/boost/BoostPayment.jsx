import { useState } from 'react';
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
  Text,
  Box,
  HStack,
  Divider,
  useToast,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import boostService from '../../services/boostService';

const BoostPayment = ({ isOpen, onClose, boostData, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  const handleConfirmPayment = async () => {
    if (!paymentReference.trim()) {
      toast({
        title: 'Payment reference required',
        description: 'Please enter your payment reference',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await boostService.confirmPayment(
        boostData.boost_id,
        paymentReference
      );

      if (response?.data) {
        toast({
          title: 'Payment confirmed!',
          description: 'Your listing is now boosted',
          status: 'success',
          duration: 3000,
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Payment confirmation failed',
        description: error.message || 'Failed to confirm payment',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!boostData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete Payment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box bg="blue.50" p={4} borderRadius="md">
              <Text fontSize="sm" color="blue.800" mb={2}>
                Payment Instructions:
              </Text>
              <Text fontSize="xs" color="blue.700">
                1. Transfer {boostData.formatted_cost} to your payment gateway
              </Text>
              <Text fontSize="xs" color="blue.700">
                2. Copy the payment reference/transaction ID
              </Text>
              <Text fontSize="xs" color="blue.700">
                3. Paste it below and click confirm
              </Text>
            </Box>

            <Box bg="gray.50" p={4} borderRadius="md">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Listing:</Text>
                <Text fontSize="sm" fontWeight="bold">
                  {boostData.listing?.title}
                </Text>
              </HStack>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Duration:</Text>
                <Text fontSize="sm" fontWeight="bold">
                  {boostData.duration_count} {boostData.duration_type}
                </Text>
              </HStack>
              <Divider my={2} />
              <HStack justify="space-between">
                <Text fontWeight="bold">Total Amount:</Text>
                <Text fontWeight="bold" color="green.600" fontSize="lg">
                  {boostData.formatted_cost}
                </Text>
              </HStack>
            </Box>

            <FormControl>
              <FormLabel fontSize="sm">Payment Reference</FormLabel>
              <Input
                placeholder="Enter payment reference/transaction ID"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="green"
            onClick={handleConfirmPayment}
            isLoading={loading}
            loadingText="Confirming..."
          >
            Confirm Payment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BoostPayment;
