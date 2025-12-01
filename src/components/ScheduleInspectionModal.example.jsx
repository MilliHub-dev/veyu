import { useState } from 'react';
import { Button, VStack, useDisclosure } from '@chakra-ui/react';
import ScheduleInspectionModal from './ScheduleInspectionModal';

/**
 * Example usage of ScheduleInspectionModal
 */
const ScheduleInspectionExample = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSuccess = (inspectionSlip) => {
    console.log('Inspection scheduled successfully:', inspectionSlip);
    // Handle success - e.g., navigate to inspection details, show slip, etc.
  };

  return (
    <VStack spacing={4}>
      {/* Example 1: Basic usage with listing */}
      <Button onClick={onOpen} colorScheme="blue">
        Schedule Inspection
      </Button>

      <ScheduleInspectionModal
        isOpen={isOpen}
        onClose={onClose}
        listingId={123}
        listingType="buy"
        vehicleInfo={{
          name: '2020 Toyota Camry',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
        }}
        alreadyPaid={false}
        onSuccess={handleSuccess}
      />

      {/* Example 2: Already paid scenario (from checkout) */}
      <Button onClick={onOpen} colorScheme="green">
        Schedule Inspection (Already Paid)
      </Button>

      <ScheduleInspectionModal
        isOpen={isOpen}
        onClose={onClose}
        listingId={456}
        listingType="buy"
        vehicleInfo={{
          name: '2019 Honda Accord',
        }}
        alreadyPaid={true}
        onSuccess={handleSuccess}
      />

      {/* Example 3: Rental inspection */}
      <Button onClick={onOpen} colorScheme="purple">
        Schedule Rental Inspection
      </Button>

      <ScheduleInspectionModal
        isOpen={isOpen}
        onClose={onClose}
        listingId={789}
        listingType="rent"
        vehicleInfo={{
          name: '2021 Ford Explorer',
        }}
        alreadyPaid={false}
        onSuccess={handleSuccess}
      />
    </VStack>
  );
};

export default ScheduleInspectionExample;
