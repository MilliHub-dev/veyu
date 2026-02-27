import { useState, useEffect, useContext } from "react"
import {GlobalStore} from '../../../../App';
import {objectifyJSON, jsonifyObject} from '../../../../utils';
import {
  Box,
  Button,
  Flex,
  Heading,
  Avatar,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  TableContainer,
  Badge,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Container,
  VStack,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import {MoreVertical, Plus, Settings, TrendingUp, Users, DollarSign} from 'lucide-react';
import {Link} from 'react-router-dom';
import { mechanicService } from '../../../../services';
import { useToast } from '@chakra-ui/react';

const BookingStatusColors = {
  'accepted': 'blue',
  'completed': 'green',
  'declined': 'red',
  'requested': 'yellow',
}


// Client Info Component
const PreviewCard = ({ service, charge, images, charge_rate, description }) => (
  <Flex align="center">
    <Box mr={3} w="40px" h="40px" borderRadius="full" overflow="hidden">
      <Avatar src={image} name={name} w="100%" h="100%" objectFit="cover" />
    </Box>
    
    <Box>
      <Text fontWeight="medium">{name}</Text>
      <Flex align="center" color="gray.500" fontSize="xs">
        {/*<MapPin size={12} style={{ marginRight: "4px" }} />*/}
        {location}
      </Flex>
    </Box>
  </Flex>
)

export const ServiceOfferings = () => {
  const [serviceOfferings, setServiceOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  async function init(){
    try {
      setLoading(true);
      setError(null);
      
      const data = await mechanicService.getServices();
      console.log("Service Offerings:", data);
      
      setServiceOfferings(data.data || data || []);
    } catch (error) {
      console.error("Error fetching service offerings:", error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load service offerings. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleToggleService = async (serviceId, isActive) => {
    try {
      await mechanicService.toggleServiceStatus(serviceId, isActive);
      
      toast({
        title: 'Success',
        description: isActive ? 'Service activated successfully!' : 'Service deactivated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update local state
      setServiceOfferings(prev => 
        prev.map(service => 
          service.uuid === serviceId || service.id === serviceId 
            ? { ...service, is_active: isActive }
            : service
        )
      );
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update service status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await mechanicService.deleteServiceOffering(serviceId);
      
      toast({
        title: 'Success',
        description: 'Service deleted successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Remove from local state
      setServiceOfferings(prev => 
        prev.filter(service => 
          service.uuid !== serviceId && service.id !== serviceId
        )
      );
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete service. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="lg" color="gray.600">Loading services...</Text>
          </Box>
        </VStack>
      </Container>
    )
  }

  if (error && !serviceOfferings.length) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="lg" color="red.500" mb={4}>Failed to load services</Text>
            <Button onClick={init} colorScheme="blue">
              Try Again
            </Button>
          </Box>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      {/* Modern Header */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={2}>
          <Box>
            <Heading as="h1" size="xl" color="gray.900" mb={2}>
              Service Offerings
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Manage your services and pricing
            </Text>
          </Box>
          <Button colorScheme="blue" leftIcon={<Plus size={20} />} as={Link} to="/services/add/" size="lg">
            Add New Service
          </Button>
        </Flex>
      </Box>

      {/* Service Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card shadow="sm">
          <CardBody p={6}>
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                  Total Services
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  {serviceOfferings.length}
                </Text>
              </Box>
              <Box p={3} bg="blue.50" borderRadius="lg">
                <Settings size={20} color="var(--chakra-colors-blue-500)" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card shadow="sm">
          <CardBody p={6}>
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                  Total Hires
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  {serviceOfferings.reduce((sum, service) => sum + (service.hires || 0), 0)}
                </Text>
              </Box>
              <Box p={3} bg="green.50" borderRadius="lg">
                <Users size={20} color="var(--chakra-colors-green-500)" />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card shadow="sm">
          <CardBody p={6}>
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                  Avg. Service Price
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  ₦{serviceOfferings.length > 0 ? 
                    Math.round(serviceOfferings.reduce((sum, service) => sum + parseInt(service.charge || 0), 0) / serviceOfferings.length).toLocaleString() 
                    : 0}
                </Text>
              </Box>
              <Box p={3} bg="purple.50" borderRadius="lg">
                <DollarSign size={20} color="var(--chakra-colors-purple-500)" />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Services Table */}
      <Card shadow="sm">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" color="gray.900">Your Services</Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                Manage your service offerings and pricing
              </Text>
            </Box>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          {serviceOfferings.length > 0 ? (
            <TableContainer borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th color="gray.600" fontWeight="semibold">Service</Th>
                    <Th color="gray.600" fontWeight="semibold">Pricing</Th>
                    <Th color="gray.600" fontWeight="semibold">Hires</Th>
                    <Th color="gray.600" fontWeight="semibold">Status</Th>
                    <Th color="gray.600" fontWeight="semibold">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {serviceOfferings.map((offering) => (
                    <Tr key={offering?.uuid} _hover={{ bg: "gray.50" }}>
                      <Td>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.900">
                          {offering?.service}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            ₦{parseInt(offering?.charge || 0).toLocaleString()}
                          </Text>
                          <Badge
                            colorScheme="blue"
                            px={2}
                            py={1}
                            borderRadius="full"
                            textTransform="capitalize"
                            fontSize="xs"
                          >
                            {offering?.charge_rate}
                          </Badge>
                        </VStack>
                      </Td>
                      <Td>
                        <Flex align="center">
                          <Text fontWeight="medium" mr={2}>
                            {offering?.hires || 0}
                          </Text>
                          <TrendingUp size={14} color="var(--chakra-colors-green-500)" />
                        </Flex>
                      </Td>
                      <Td>
                        <Switch 
                          colorScheme="green"
                          isChecked={offering?.is_active !== false}
                          onChange={(e) => handleToggleService(offering?.uuid || offering?.id, e.target.checked)}
                        />
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<MoreVertical size={16} />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem>Edit service</MenuItem>
                            <MenuItem>View analytics</MenuItem>
                            <MenuItem>Duplicate service</MenuItem>
                            <MenuItem 
                              color="red.500"
                              onClick={() => handleDeleteService(offering?.uuid || offering?.id)}
                            >
                              Delete service
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={12}>
              <Settings size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg" mb={2}>No services yet</Text>
              <Text color="gray.400" fontSize="sm" mb={4}>
                Create your first service offering to start receiving bookings
              </Text>
              <Button colorScheme="blue" leftIcon={<Plus size={16} />} as={Link} to="/services/add/">
                Add Your First Service
              </Button>
            </Box>
          )}
        </CardBody>
      </Card>
    </Container>
  )
}

export default ServiceOfferings

