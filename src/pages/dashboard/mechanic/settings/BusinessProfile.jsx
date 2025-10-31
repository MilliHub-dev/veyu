import { 
  Box, Button, Checkbox, FormControl, FormLabel,
  Input, Stack, Switch, Textarea, VStack, Heading,
  Image, Tabs, TabList, TabPanels, Tab, TabPanel,
  IconButton, Select, Avatar, Flex, HStack, Text,
  Divider, Tag, Card, CardBody, CardHeader, Container,
  useColorModeValue, SimpleGrid,
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import {GlobalStore} from '../../../../App'
import {objectifyJSON, jsonifyObject} from '../../../../utils'
import { Search, Bell, CloudUpload, ChevronDown, ArrowRight, User, Building, Phone, Mail, FileText } from "lucide-react";


let mechServices = [
  'Oil Change',
  'Paint Job',
  'Body Work',
  'Engine Repair',
]

export const BusinessProfile = ({  }) => {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const imageRef = useRef();
  const [mechanic, setMechanic] = useState({
    logo: "", // Placeholder for logo
    business_name: "",
    headline: "",
    about: "",
    owner: {},
    cac_number: "",
    tin_number: "",
    services: [],
    contact_email: '',
    contact_phone: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMechanic({
      ...mechanic,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const slugify = (text) => {
    return text.toLocaleLowerCase().replace(/['#@*()!"$%&]*/g, '').replaceAll(' ', '-')
  }

  const changeValue = (key, value) => {
    const oldValue = mechanic
    oldValue[`${key}`] = value;
    setMechanic({ ...oldValue })
  }

  function removeService(service){
    const oldValue = mechanic?.services;
    oldValue.pop(service)
    changeValue('services', [...oldValue])
  }


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file)
    setMechanic({ ...mechanic, logo: {file, preview}});
  }

  async function getMechanicSettings() {
    const res = await axios.get('/admin/mechanics/settings/');
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      setMechanic(data.data)
    }
  }


  async function handleSubmit() {
    const payload = new FormData();
    const keys = Object.keys(mechanic);


    for (let key of keys){
      if (key === 'logo' && typeof mechanic['logo'] !== 'string'){
        const file = mechanic['logo'].file;
        payload.append('new-logo', file, file.name)
      }else{
        console.log("New setting")
        payload.append(key, mechanic[key])
      }
    }

    const res = await axios.post('/admin/mechanics/settings/', payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      console.log("My new settings:", data.data)
      setMechanic(data.data)
    }
  }



  useEffect(() => {
    getMechanicSettings();
  }, [])

  return (
    <Container maxW="4xl" py={8}>
      {/* Modern Header */}
      <Box mb={8}>
        <Heading as="h1" size="xl" color="gray.900" mb={2}>
          Business Profile
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Manage your business information and settings
        </Text>
      </Box>

      <VStack spacing={8} align="stretch">
        {/* Profile Overview Card */}
        <Card shadow="sm">
          <CardHeader>
            <Heading size="md" color="gray.900">Profile Overview</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Logo Upload Section */}
              <Box textAlign="center">
                <Avatar
                  size="2xl"
                  src={mechanic?.logo?.file ? mechanic?.logo?.preview : mechanic?.logo}
                  name={mechanic?.business_name}
                  mb={4}
                />
                <Button 
                  onClick={e => imageRef.current.click()} 
                  variant="outline" 
                  leftIcon={<CloudUpload size={16} />}
                  size="sm"
                >
                  Upload Logo
                </Button>
                <Input type="file" hidden ref={imageRef} accept="image/*" onInput={handleImageUpload} />
                
                <VStack mt={4} spacing={1}>
                  <Heading as="h3" fontSize="lg" fontWeight="semibold" color="gray.900">
                    {mechanic?.business_name || "Business Name"}
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    @{slugify(mechanic?.business_name || "")}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {mechanic?.location}
                  </Text>
                  <HStack spacing={4} mt={2} fontSize="sm" color="gray.500">
                    <Flex align="center">
                      <Mail size={14} style={{ marginRight: "4px" }} />
                      <Text>{mechanic?.contact_email}</Text>
                    </Flex>
                    <Flex align="center">
                      <Phone size={14} style={{ marginRight: "4px" }} />
                      <Text>{mechanic?.contact_phone}</Text>
                    </Flex>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Business Information */}
        <Card shadow="sm">
          <CardHeader>
            <Flex align="center">
              <Building size={20} style={{ marginRight: "8px" }} />
              <Heading size="md" color="gray.900">Business Information</Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">Business Name</FormLabel>
                <Input 
                  name="business_name" 
                  value={mechanic?.business_name} 
                  onChange={handleChange}
                  placeholder="Enter your business name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">Headline</FormLabel>
                <Input 
                  name="headline" 
                  value={mechanic?.headline} 
                  onInput={handleChange}
                  placeholder="Brief description of your business"
                />
              </FormControl>

              <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                <FormLabel fontWeight="semibold" color="gray.700">About Your Business</FormLabel>
                <Textarea 
                  name="about" 
                  value={mechanic?.about} 
                  onInput={handleChange} 
                  maxLength={400}
                  rows={4}
                  placeholder="Tell customers about your business, experience, and what makes you special..."
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {mechanic?.about?.length || 0}/400 characters
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">CAC Number</FormLabel>
                <Input name="cac_number" disabled value={mechanic?.cac_number} bg="gray.50" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">TIN Number</FormLabel>
                <Input name="tin_number" disabled value={mechanic?.tin_number} bg="gray.50" />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Services Offered */}
        <Card shadow="sm">
          <CardHeader>
            <Flex align="center">
              <FileText size={20} style={{ marginRight: "8px" }} />
              <Box>
                <Heading size="md" color="gray.900">Services Offered</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Select the services you provide to customers
                </Text>
              </Box>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
              <Box p={4} borderBottom="1px solid" borderColor="gray.200" bg="gray.50">
                <Text fontWeight="semibold" mb={3} color="gray.700">Available Services</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {mechServices?.map((service) => {
                    const selected = mechanic?.services?.includes(service);
                    if (selected) return null;
                    return (
                      <Tag
                        key={service}
                        variant="outline"
                        size="lg"
                        cursor="pointer"
                        borderRadius="full"
                        fontSize="sm"
                        bg="white"
                        color="gray.700"
                        borderColor="gray.300"
                        _hover={{ bg: "blue.50", borderColor: "blue.300", color: "blue.700" }}
                        onClick={() => changeValue('services', [...mechanic?.services, service])}
                      >
                        + {service}
                      </Tag>
                    );
                  })}
                </Flex>
              </Box>

              <Box p={4}>
                <Text fontWeight="semibold" mb={3} color="gray.700">Selected Services</Text>
                <Flex flexWrap="wrap" gap={2}>
                  {mechanic?.services?.map((service, index) => (
                    <Tag
                      key={index}
                      variant="solid"
                      cursor="pointer"
                      size="lg"
                      borderRadius="full"
                      fontSize="sm"
                      colorScheme="blue"
                      _hover={{ bg: "blue.600" }}
                      onClick={() => removeService(service)}
                    >
                      {service?.service} @ ₦{commaInt(service?.charge)} ✕
                    </Tag>
                  ))}
                  {mechanic?.services?.length < 1 && (
                    <Text color="gray.500" fontSize="sm">
                      Select at least one service you offer from the available services above
                    </Text>
                  )}
                </Flex>
              </Box>
            </Box>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <Card shadow="sm">
          <CardHeader>
            <Flex align="center">
              <Phone size={20} style={{ marginRight: "8px" }} />
              <Box>
                <Heading size="md" color="gray.900">Contact Information</Heading>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Customer care contact details
                </Text>
              </Box>
            </Flex>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">
                  <Flex align="center">
                    <Mail size={16} style={{ marginRight: "8px" }} />
                    Email Address
                  </Flex>
                </FormLabel>
                <Input 
                  type="email" 
                  name="contact_email" 
                  value={mechanic?.contact_email} 
                  onInput={handleChange}
                  placeholder="business@example.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="gray.700">
                  <Flex align="center">
                    <Phone size={16} style={{ marginRight: "8px" }} />
                    Phone Number
                  </Flex>
                </FormLabel>
                <Input 
                  type="tel" 
                  name="contact_phone" 
                  value={mechanic?.contact_phone} 
                  onInput={handleChange}
                  placeholder="+234 xxx xxx xxxx"
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Save Button */}
        <Flex justify="flex-end">
          <Button colorScheme="blue" size="lg" onClick={handleSubmit} px={8}>
            Save Changes
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
}


export default BusinessProfile;