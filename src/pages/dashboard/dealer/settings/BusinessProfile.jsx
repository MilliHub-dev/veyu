import { 
  Box, Button, Checkbox, FormControl, FormLabel,
  Input, Stack, Switch, Textarea, VStack, Heading,
  Image, Tabs, TabList, TabPanels, Tab, TabPanel,
  IconButton, Select, Avatar, Flex, HStack, Text,
  Divider, Tag, SimpleGrid, Badge, useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import {GlobalStore} from '../../../../App'
import {objectifyJSON, jsonifyObject} from '../../../../utils'
import { Search, Bell, CloudUpload, ChevronDown, ArrowRight } from "lucide-react";



export const BusinessProfile = ({  }) => {
  const {axios, notify, authUser} = useContext(GlobalStore);
  const imageRef = useRef();
  const [dealership, setDealership] = useState({
    logo: "", // Placeholder for logo
    business_name: "",
    headline: "",
    about: "",
    owner: {},
    cac_number: "",
    tin_number: "",
    services: [],
    offers_rental: false,
    offers_purchase: true,
    offers_drivers: false,
    offers_trade_in: false,
    contact_email: '',
    contact_phone: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDealership({
      ...dealership,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const slugify = (text) => {
    if (text){
      return text.toLocaleLowerCase().replace(/['#@*()!"$%&]*/g, '').replaceAll(' ', '-')
    }else{
      return ''
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file)
    setDealership({ ...dealership, logo: {file, preview}});
  }

  async function getDealership() {
    const res = await axios.get('/admin/dealership/settings/');
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      // console.log("My settings:", data.data);
      setDealership(data.data)
    }
  }

  async function handleSubmit() {
    const payload = new FormData();
    const keys = Object.keys(dealership);

    for (let key of keys){
      if (key === 'logo' && typeof dealership[key] !== 'string'){
        const logo = dealership['logo'];
        if(logo){
          console.log('new-logo', logo.file.name, logo.file)
          payload.append('new-logo', logo.file, logo.file.name)
        }
      }else{
        payload.append(key, dealership[key])
      }
    }

    console.log("Payload", payload)
    const res = await axios.post('/admin/dealership/settings/', payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      notify({
        title: 'Settings saved!',
        color: 'green'
      })
      setDealership(data.data)
    }
  }

  let dealerServices = [
    'Car Leasing',
    'Car Sale',
    'Drivers',
  ]

  useEffect(() => {
    getDealership();
  }, [])

  return (
    <VStack spacing={6} align="stretch" py={6} maxW="container.xl" w="100%">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="start">
        <VStack spacing={6} align="stretch" gridColumn={{ md: 'span 2' }}>
          {/* Logo Upload Card */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <VStack>
              {
                dealership?.logo?.file ? (
                  <Image src={dealership?.logo?.preview} w="80px"  />
                ): (
                  <Image src={dealership?.logo} w="80px"  />
                )
              }
              <Button onClick={e => imageRef.current.click()} variant="link" color="#0460cc" fontSize="sm" fontWeight="medium" leftIcon={<CloudUpload size={16} />}>
                Upload image
              </Button>
              <Input type="file" hidden ref={imageRef} accept="image/*" onInput={handleImageUpload} />
            </VStack>
          </Box>

          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>Business Info</Heading>
            <FormControl mb={4}>
              <FormLabel>Business Name</FormLabel>
              <Input name="business_name" value={dealership?.business_name} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              <Text size="xs" color="gray.500" mt={2}> @{slugify(dealership?.business_name)} </Text>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Headline</FormLabel>
              <Input name="headline" value={dealership?.headline} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
            </FormControl>
            <FormControl>
              <FormLabel>About</FormLabel>
              <Textarea name="about" value={dealership?.about} onChange={handleChange} maxLength={400} bg="white" color="#101828" borderColor="#d0d5dd" />
              <Text mt={1} fontSize="xs" color="gray.500">{(dealership?.about || '').length}/400</Text>
            </FormControl>
          </Box>

          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>Registration</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>CAC Number</FormLabel>
                <Input name="cac_number" disabled value={dealership?.cac_number} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              </FormControl>
              <FormControl>
                <FormLabel>TIN Number</FormLabel>
                <Input name="tin_number" disabled value={dealership?.tin_number} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* Services List Selector */}
          <Box border="1px solid" borderColor="#d0d5dd" borderRadius="xl" bg="white" overflow="hidden">
            <Box p={4} borderBottom="1px solid" borderColor="#d0d5dd">
              <FormLabel fontWeight="medium" mb={2}> Choose services </FormLabel>
              <Flex flexWrap="wrap" gap={2}>
              {
                dealerServices?.map((service) => {
                  const selected = dealership?.services?.includes(service);
                  if (selected) return null;
                  return (
                    <Tag
                      variant={selected ? "solid" : "outline"}
                      size="lg"
                      cursor="pointer"
                      borderRadius="full"
                      fontSize="sm"
                      bg={selected ? "#f2f4f7" : "white"}
                      color={selected ? "#101828" : "#667085"}
                      borderColor="#d0d5dd"
                      _hover={{ bg: selected ? "#e4e7ec" : "gray.50" }}
                      onClick={() => 
                        setDealership({
                          ...dealership,
                          services: [...dealership?.services, service]
                        })
                      }
                    >
                      {service}
                    </Tag>
                  )
                }
              )}
              </Flex>
            </Box>

            <Box p={4}>
              <Flex flexWrap="wrap" gap={2}>
                {
                  dealership?.services?.map((service) => 
                    <Tag
                      variant={"solid"}
                      cursor="pointer"
                      size="lg"
                      borderRadius="full"
                      fontSize="sm"
                      bg={"#0460cc"}
                      color={"white"}
                      borderColor={"#0460cc"}
                      _hover={{ bg: "#0354b4"}}
                      // onClick={() => removeService(service)}
                      onClick={() => {
                        const deals = dealership.services;
                        deals.splice(deals.indexOf(service), 1);
                        setDealership({ ...dealership, services:[...deals] })
                      }}
                    >
                      {service}
                    </Tag>
                  )
                }
                {dealership?.services.length < 1 && <Text> Select at least one service you offer </Text>}
              </Flex>
            </Box>
          </Box>

          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Heading size="md" mb={4}>Contact Details</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="contact_email" value={dealership?.contact_email} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              </FormControl>
              <FormControl>
                <FormLabel>Customer Care Phone Number</FormLabel>
                <Input type="tel" name="contact_phone" value={dealership?.contact_phone} onChange={handleChange} bg="white" color="#101828" borderColor="#d0d5dd" />
              </FormControl>
            </SimpleGrid>
          </Box>

          <HStack>
            <Button colorScheme="blue" onClick={handleSubmit}>Save Changes</Button>
          </HStack>
        </VStack>

        <Box position="sticky" top={4} bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
          <VStack spacing={3} align="stretch">
            <HStack>
              {
                dealership?.logo?.file ? (
                  <Image src={dealership?.logo?.preview} w="60px"  />
                ): (
                  <Image src={dealership?.logo} w="60px"  />
                )
              }
              <Box>
                <Heading as="h3" fontSize="md" fontWeight="semibold" color="#101828">
                  {dealership?.business_name || 'Business name'}
                </Heading>
                <Text fontSize="xs" color="#667085">{dealership?.headline || 'Headline'}</Text>
              </Box>
            </HStack>
            <Divider />
            <Text fontSize="sm" color="#667085">{dealership?.about || 'Tell customers about your business...'}</Text>
            <HStack flexWrap={{base: 'wrap', md: 'nowrap'}} mt={2} fontSize="sm" color="#667085">
              <Text>{dealership?.contact_email || 'email@example.com'}</Text>
              <Text>•</Text>
              <Text>{dealership?.contact_phone || '+234 000 000 0000'}</Text>
            </HStack>
            <HStack flexWrap="wrap" gap={2}>
              {dealership?.services?.map((s, i) => <Badge key={i} colorScheme="blue" variant="subtle">{s}</Badge>)}
              {(!dealership?.services || dealership?.services?.length === 0) && <Text color="gray.500">No services selected</Text>}
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

export default BusinessProfile;