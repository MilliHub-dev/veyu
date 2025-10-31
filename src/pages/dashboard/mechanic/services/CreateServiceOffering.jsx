import { useState, useEffect, useContext } from "react"
import {GlobalStore} from '../../../../App';
import {objectifyJSON, jsonifyObject} from '../../../../utils';
import {ComboBox} from '../../../../components';
import {
  Box,
  Button,
  Flex,
  Heading,
  Avatar,
  HStack,
  Stack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  Select,
  FormControl,
  FormLabel,
  MenuButton,
  MenuItem,
  MenuList,
  Badge,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Container,
  VStack,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react"
import {ArrowLeft, Plus, DollarSign, Clock} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom'


export const CreateServiceOffering = () => {
  const [services, setServices] = useState([]);
  const [serviceOffering, setServiceOffering] = useState({
    service: '',
    charge: '',
    charge_rate: 'flat',
    description: '',
  });
  const {axios, notify, authUser } = useContext(GlobalStore);
  const redirect = useNavigate()

  async function init(){
    const res = await axios.get('/admin/mechanics/services/add/');
    const data = await objectifyJSON(res.data);

    if (res.status === 200){
      setServices(data?.data);
    }

  }


  async function handleCreate(e){
    e.preventDefault();
    const payload = {
      ...serviceOffering
    }
    const res = await axios.post('/admin/mechanics/services/add/', jsonifyObject(payload));
    const data = await objectifyJSON(res.data);

    if (res.status === 201){
      console.log("Bookings:", data);
      notify({
        'title': 'Successfully created new service'
      })
      return redirect('/services');
    }
  }

  useEffect(() => {
    init();
  }, [])

  return (
    <Container maxW="4xl" py={8}>
      {/* Modern Header */}
      <Box mb={8}>
        <Flex align="center" mb={4}>
          <Button 
            as={Link} 
            to="/services" 
            variant="ghost" 
            leftIcon={<ArrowLeft size={16} />} 
            mr={4}
          >
            Back to Services
          </Button>
        </Flex>
        <Heading as="h1" size="xl" color="gray.900" mb={2}>
          Create New Service
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Add a new service offering to your portfolio
        </Text>
      </Box>

      {/* Service Creation Form */}
      <Card shadow="sm" maxW="2xl" mx="auto">
        <CardHeader>
          <Heading size="md" color="gray.900">Service Details</Heading>
          <Text color="gray.600" fontSize="sm" mt={1}>
            Fill in the information about your service
          </Text>
        </CardHeader>
        <CardBody>
          <form method="POST" onSubmit={handleCreate}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Service Title
                </FormLabel>
                <ComboBox 
                  defaultOptions={[...services?.map(service => service.title)]} 
                  onSelect={value => setServiceOffering({ ...serviceOffering, title: value })}
                  placeholder="Select or type a service..."
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Choose from existing services or create a new one
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Service Description
                </FormLabel>
                <Textarea 
                  placeholder="Describe what this service includes..."
                  value={serviceOffering?.description}
                  onChange={e => setServiceOffering({ ...serviceOffering, description: e.target.value })}
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4} align="flex-start">
                <FormControl isRequired flex={2}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    <Flex align="center">
                      <DollarSign size={16} style={{ marginRight: "8px" }} />
                      Service Charge
                    </Flex>
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      ₦
                    </InputLeftElement>
                    <Input 
                      value={serviceOffering?.charge} 
                      onChange={e => setServiceOffering({ ...serviceOffering, charge: e.target.value })} 
                      type="number" 
                      placeholder="0.00"
                      pl={8}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontWeight="semibold" color="gray.700">
                    <Flex align="center">
                      <Clock size={16} style={{ marginRight: "8px" }} />
                      Rate Type
                    </Flex>
                  </FormLabel>
                  <Select 
                    value={serviceOffering?.charge_rate} 
                    onChange={e => setServiceOffering({ ...serviceOffering, charge_rate: e.target.value })}
                    placeholder="Choose rate type"
                  >
                    <option value="flat">Flat Rate</option>
                    <option value="hourly">Hourly Rate</option>
                  </Select>
                </FormControl>
              </HStack>

              {/* Preview Card */}
              <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Service Preview
                </Text>
                <Box p={4} bg="white" borderRadius="md" border="1px solid" borderColor="gray.200">
                  <Text fontWeight="semibold" fontSize="md" mb={1}>
                    {serviceOffering?.title || "Service Title"}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {serviceOffering?.description || "Service description will appear here..."}
                  </Text>
                  <Flex justify="space-between" align="center">
                    <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                      {serviceOffering?.charge_rate || "Rate Type"}
                    </Badge>
                    <Text fontWeight="bold" color="green.600">
                      ₦{serviceOffering?.charge ? parseInt(serviceOffering.charge).toLocaleString() : "0"}
                    </Text>
                  </Flex>
                </Box>
              </Box>

              <VStack spacing={3}>
                <Button 
                  w="full" 
                  colorScheme="blue" 
                  size="lg" 
                  type="submit"
                  leftIcon={<Plus size={20} />}
                  isDisabled={!serviceOffering?.title || !serviceOffering?.charge || !serviceOffering?.charge_rate}
                >
                  Create Service
                </Button>
                <Button 
                  w="full" 
                  variant="outline" 
                  size="lg" 
                  as={Link} 
                  to="/services"
                >
                  Cancel
                </Button>
              </VStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  )
}

export default CreateServiceOffering

