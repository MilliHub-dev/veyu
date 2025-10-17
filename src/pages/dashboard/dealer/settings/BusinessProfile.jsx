import { 
  Box, Button, Checkbox, FormControl, FormLabel,
  Input, Stack, Switch, Textarea, VStack, Heading,
  Image, Tabs, TabList, TabPanels, Tab, TabPanel,
  IconButton, Select, Avatar, Flex, HStack, Text,
  Divider, Tag,
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

  const labelProps = { fontWeight: '600', color: 'gray.700' };
  const fieldProps = {
    bg: 'white',
    color: 'black',
    variant: 'outline',
    borderWidth: '1px',
    borderColor: 'gray.300',
    _placeholder: { color: 'gray.600', opacity: 1 },
    _hover: { borderColor: 'gray.500' },
    focusBorderColor: 'blue.400',
    _focusVisible: { borderColor: 'blue.400', boxShadow: '0 0 0 1px rgba(49,130,206,0.6)' },
  };

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
    try{
      const payload = new FormData();
      const keys = Object.keys(dealership);

      for (let key of keys){
        if (key === 'logo'){
          const logo = dealership['logo'];
          if (logo && typeof logo !== 'string' && logo?.file){
            payload.append('new-logo', logo.file, logo.file.name);
          }
        } else if (typeof dealership[key] === 'object' && !('append' in dealership[key])) {
          payload.append(key, JSON.stringify(dealership[key]));
        } else {
          payload.append(key, dealership[key] ?? '');
        }
      }

      const res = await axios.post('/admin/dealership/settings/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = objectifyJSON(res.data);

      if (res.status === 200){
        notify({ title: 'Settings saved!', color: 'green' })
        setDealership(data.data)
      }
    }catch(error){
      notify({ title: error?.message || 'Failed to save settings', color: 'red' })
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
      {/* Brand Card */}
      <Box bg="white" borderWidth={1} borderColor="gray.200" borderRadius="xl" p={6}>
        <VStack>
          {
            dealership?.logo?.file ? (
              <Image src={dealership?.logo?.preview} w="88px" borderRadius="lg" />
            ): (
              <Image src={dealership?.logo} w="88px" borderRadius="lg" />
            )
          }

          <Button onClick={e => imageRef.current.click()} variant="link" color="#0460cc" fontSize="sm" fontWeight="medium" leftIcon={<CloudUpload size={16} />}>
            Upload logo
          </Button>
          <Input type="file" hidden ref={imageRef} accept="image/*" onInput={handleImageUpload} />
          <VStack mt={4} spacing={0}>
            <Heading as="h3" fontSize="md" fontWeight="semibold" color="#101828">
              {dealership?.business_name || 'Your Business Name'}
            </Heading>
            <Text fontSize="xs" color="#667085">
              {dealership?.location || 'Your location'}
            </Text>
            <HStack flexWrap={{base: 'wrap', md: 'nowrap'}} justifyContent="center" mt={2} fontSize="sm" color="#667085">
              <Text>{dealership?.contact_email || 'email@company.com'}</Text>
              <Text>•</Text>
              <Text>{dealership?.contact_phone || '+234 800 000 0000'}</Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      {/* Company Info */}
      <Box bg="white" borderWidth={1} borderColor="gray.200" borderRadius="xl" p={6}>
        <Heading size="sm" mb={4}>Company Information</Heading>
        <Stack spacing={5}>
          <FormControl>
            <FormLabel {...labelProps}>Business Name</FormLabel>
            <Input name="business_name" value={dealership?.business_name} onChange={handleChange} placeholder="Your registered business name" {...fieldProps} />
            <Text size="xs" color="gray.500" mt={2}> @{slugify(dealership?.business_name)} </Text>
          </FormControl>

          <FormControl>
            <FormLabel {...labelProps}>Headline</FormLabel>
            <Input name="headline" value={dealership?.headline} onChange={handleChange} placeholder="Short tagline customers see" {...fieldProps} />
          </FormControl>

          <FormControl>
            <FormLabel {...labelProps}>About</FormLabel>
            <Textarea name="about" value={dealership?.about} onChange={handleChange} maxLength={400} placeholder="Describe your business, services, and what makes you stand out" {...fieldProps} />
          </FormControl>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={5}>
            <FormControl>
              <FormLabel {...labelProps}>CAC Number</FormLabel>
              <Input name="cac_number" disabled value={dealership?.cac_number} onChange={handleChange} placeholder="CAC" {...fieldProps} />
            </FormControl>

            <FormControl>
              <FormLabel {...labelProps}>TIN Number</FormLabel>
              <Input name="tin_number" disabled value={dealership?.tin_number} onChange={handleChange} placeholder="TIN" {...fieldProps} />
            </FormControl>
          </Stack>
        </Stack>
      </Box>

      {/* Services List Selector */}
      <Box bg="white" borderWidth={1} borderColor="gray.200" borderRadius="xl" overflow="hidden">
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
                      services: [...(dealership?.services || []), service]
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
              (dealership?.services || [])?.map((service) => 
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
                  onClick={() => {
                    const deals = [...(dealership?.services || [])];
                    deals.splice(deals.indexOf(service), 1);
                    setDealership({ ...dealership, services:[...deals] })
                  }}
                >
                  {service}
                </Tag>
              )
            }
            {(!dealership?.services || dealership?.services.length < 1) && <Text> Select at least one service you offer </Text>}
          </Flex>
        </Box>
      </Box>

      {/* Contact Details */}
      <Box bg="white" borderWidth={1} borderColor="gray.200" borderRadius="xl" p={6}>
        <Heading size="sm" mb={4}>Contact Details</Heading>
        <Stack spacing={5}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={5}>
            <FormControl>
              <FormLabel {...labelProps}>Email</FormLabel>
              <Input type="email" name="contact_email" value={dealership?.contact_email} onChange={handleChange} placeholder="support@company.com" {...fieldProps} />
            </FormControl>

            <FormControl>
              <FormLabel {...labelProps}>Customer Care Phone Number</FormLabel>
              <Input type="tel" name="contact_phone" value={dealership?.contact_phone} onChange={handleChange} placeholder="e.g. +234 800 000 0000" {...fieldProps} />
            </FormControl>
          </Stack>

          <HStack justify="flex-end">
            <Button colorScheme="blue" onClick={handleSubmit}>Save Changes</Button>
          </HStack>
        </Stack>
      </Box>
    </VStack>
  );
}

export default BusinessProfile;