import {
  Box, Button, Checkbox, FormControl, FormLabel,
  Input, Stack, Switch, Textarea, VStack, Heading,
  Image, Tabs, TabList, TabPanels, Tab, TabPanel,
  IconButton, Select, Avatar, Flex, HStack, Text,
  Divider, Tag, SimpleGrid, Badge, useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect, useContext, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import { GlobalStore } from '../../../../App'
import { objectifyJSON, jsonifyObject } from '../../../../utils'
import { Search, Bell, CloudUpload, ChevronDown, ArrowRight } from "lucide-react";
import { apiClient } from '../../../../services/api';
import authService from '../../../../services/authService';



export const BusinessProfile = ({ }) => {
  const { axios, notify, authUser } = useContext(GlobalStore);
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
    if (text) {
      return text.toLocaleLowerCase().replace(/['#@*()!"$%&]*/g, '').replaceAll(' ', '-')
    } else {
      return ''
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file)
    setDealership({ ...dealership, logo: { file, preview } });
  }

  async function getDealership() {
    try {
      // Try the dealership-specific endpoint first
      const response = await apiClient.get('/admin/dealership/');
      const data = response.data;
      console.log('Fetched dealership data:', data);
      setDealership(prev => ({
        ...prev,
        ...data,
        // Preserve any existing file preview
        logo: prev.logo?.preview ? prev.logo : data.logo
      }));
    } catch (error) {
      console.error('Error fetching dealership data:', error);

      if (error.response?.status === 500 && error.response?.data?.includes('DoesNotExist')) {
        // Dealership profile doesn't exist yet - this is normal for new users
        console.log('Dealership profile not found - will be created on first save');
        notify({
          title: 'New Profile',
          description: 'This appears to be your first time setting up your dealership profile.',
          status: 'info',
          duration: 3000,
          isClosable: true
        });
      } else {
        // Other errors
        notify({
          title: 'Info',
          description: 'Could not load existing profile data. You can still update your settings.',
          status: 'info',
          duration: 3000,
          isClosable: true
        });
      }
    }
  }

  async function handleSubmit() {
    try {
      const payload = new FormData();

      // Add all form fields to FormData
      Object.entries(dealership).forEach(([key, value]) => {
        // Skip logo for now (handle it separately)
        if (key === 'logo' && value && typeof value === 'object' && value.file) {
          // Skip, we'll handle the file upload separately
          return;
        }

        // Handle nested objects (like services array)
        if (value && typeof value === 'object' && !(value instanceof File)) {
          payload.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      // Handle logo upload separately if it's a new file
      if (dealership.logo && typeof dealership.logo === 'object' && dealership.logo.file) {
        payload.append('logo', dealership.logo.file);
      }

      console.log(`🔄 NEW CODE [${new Date().toISOString()}]: Saving dealership settings with authService.updateProfile...`);

      // Convert FormData to regular object for authService
      const profileData = {};
      for (let [key, value] of payload.entries()) {
        if (key === 'services' || key === 'location') {
          try {
            profileData[key] = JSON.parse(value);
          } catch {
            profileData[key] = value;
          }
        } else {
          profileData[key] = value;
        }
      }

      console.log('🔄 NEW CODE: Profile data:', profileData);

      // Handle file upload separately if there's a logo
      if (dealership.logo && typeof dealership.logo === 'object' && dealership.logo.file) {
        console.log('Logo upload temporarily disabled due to API issues');
        notify({
          title: 'Logo Upload Skipped',
          description: 'Logo upload is temporarily unavailable. Other settings will be saved.',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        // Skip logo upload for now due to API issues
        // try {
        //   await authService.uploadProfilePhoto(dealership.logo.file);
        // } catch (logoError) {
        //   console.error('Logo upload failed:', logoError);
        //   // Continue with profile update even if logo fails
        // }
      }

      const data = await authService.updateProfile(profileData);

      if (data) {
        notify({
          title: 'Success!',
          description: 'Dealership settings saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        // Update local state with the saved data
        setDealership(prev => ({
          ...prev,
          ...data,
          // Preserve the local file preview if it exists
          logo: prev.logo?.preview ? prev.logo : data.logo
        }));

        return true;
      }
    } catch (error) {
      console.error('Error saving dealership settings:', error);

      let errorMessage = 'Failed to save settings. Please try again.';
      if (error.response?.data) {
        // Handle field-specific errors
        const errors = [];
        Object.entries(error.response.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errors.push(...messages);
          } else {
            errors.push(`${field}: ${messages}`);
          }
        });
        errorMessage = errors.join('\n');
      }

      notify({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
    return false;
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
                  <Image src={dealership?.logo?.preview} w="80px" />
                ) : (
                  <Image src={dealership?.logo} w="80px" />
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
                      _hover={{ bg: "#0354b4" }}
                      // onClick={() => removeService(service)}
                      onClick={() => {
                        const deals = dealership.services;
                        deals.splice(deals.indexOf(service), 1);
                        setDealership({ ...dealership, services: [...deals] })
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
                  <Image src={dealership?.logo?.preview} w="60px" />
                ) : (
                  <Image src={dealership?.logo} w="60px" />
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
            <HStack flexWrap={{ base: 'wrap', md: 'nowrap' }} mt={2} fontSize="sm" color="#667085">
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