import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Select,
  Input,
  useToast,
  Spinner,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon, ViewIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons';
import { FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { GlobalStore } from '../../contexts/GlobalStore';
import inspectionService from '../../services/inspectionService';
import CreateInspectionModal from '../../components/inspections/CreateInspectionModal';

const InspectionList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { authUser } = useContext(GlobalStore);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    fetchInspections();
  }, [filters]);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.listInspections(filters);
      setInspections(data.results || data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch inspections',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'red',
      paid: 'green',
      refunded: 'orange',
      failed: 'red',
    };
    return colors[status] || 'gray';
  };

  const handleViewInspection = (inspectionId) => {
    navigate(`/inspections/${inspectionId}`);
  };

  const handleCreateSuccess = () => {
    onClose();
    fetchInspections();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg">Vehicle Inspections</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
            New Inspection
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4} flexWrap="wrap">
          <Select
            placeholder="All Statuses"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            maxW="200px"
          >
            <option value="pending_payment">Pending Payment</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="signed">Signed</option>
            <option value="archived">Archived</option>
          </Select>

          <Select
            placeholder="All Types"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            maxW="200px"
          >
            <option value="pre_purchase">Pre-Purchase</option>
            <option value="pre_rental">Pre-Rental</option>
            <option value="maintenance">Maintenance</option>
            <option value="insurance">Insurance</option>
          </Select>

          <Input
            type="date"
            placeholder="From Date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            maxW="200px"
          />

          <Input
            type="date"
            placeholder="To Date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            maxW="200px"
          />

          <Button onClick={() => setFilters({ status: '', type: '', date_from: '', date_to: '' })}>
            Clear Filters
          </Button>
        </HStack>

        {/* Table */}
        <Box overflowX="auto" bg="white" borderRadius="lg" boxShadow="md">
          {isLoading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" />
            </Box>
          ) : inspections.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">No inspections found</Text>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Vehicle</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Fee</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {inspections.map((inspection) => (
                  <Tr key={inspection.id}>
                    <Td>{inspection.id}</Td>
                    <Td>{inspection.vehicle_name}</Td>
                    <Td>{inspection.inspection_type_display}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(inspection.status)}>
                        {inspection.status_display}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getPaymentStatusColor(inspection.payment_status)}>
                        {inspection.payment_status_display}
                      </Badge>
                    </Td>
                    <Td>₦{inspection.inspection_fee?.toLocaleString()}</Td>
                    <Td>{new Date(inspection.inspection_date).toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<ViewIcon />}
                          size="sm"
                          onClick={() => handleViewInspection(inspection.id)}
                          aria-label="View inspection"
                        />
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                          />
                          <MenuList>
                            <MenuItem onClick={() => handleViewInspection(inspection.id)}>
                              View Details
                            </MenuItem>
                            {inspection.status === 'pending_payment' && (
                              <MenuItem onClick={() => navigate(`/inspections/${inspection.id}/pay`)}>
                                Pay Now
                              </MenuItem>
                            )}
                            {inspection.status === 'completed' && (
                              <MenuItem onClick={() => navigate(`/inspections/${inspection.id}/document`)}>
                                View Document
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>

      {/* Create Inspection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Inspection</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <CreateInspectionModal onSuccess={handleCreateSuccess} onCancel={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default InspectionList;
