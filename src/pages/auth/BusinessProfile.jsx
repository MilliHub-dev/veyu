import { Search, Bell, CloudUpload, ChevronDown, ArrowRight } from "lucide-react"
import {
  Avatar,
  Box,
  Button,
  Container,
  InputGroup,
  InputLeftAddon,
  VStack,
  IconButton,
  FormErrorMessage,
  Textarea,
  Tag,
  Card,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Link,
  ButtonGroup,
  PinInput,
  PinInputField,
  Select,
  SelectField,
  Stack,
  Text,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { useContext, useRef, useState, createContext, useEffect } from "react";
import { GlobalStore } from "../../App";
import { SignupContext } from "./Signup";
import {motion} from 'framer-motion';
import { CenteredLayout, OTPField } from "../../components";
import { CustomPlacesAutocomplete } from "../../components/maps";
import { redirect, useNavigate, useParams, useSearchParams, Link as RLink } from "react-router-dom";
import { RiCircleFill, RiCircleLine, RiMailCloseFill, RiMailFill, RiMessage2Line, RiMessage3Line, RiMessageLine } from "react-icons/ri";
import { FcSms, FcVoicemail } from "react-icons/fc";
import { FaGoogle, FaFacebook, FaArrowRight } from "react-icons/fa";
import { RxChatBubble, RxEnvelopeOpen } from "react-icons/rx";
import { jsonifyObject, objectifyJSON } from "../../utils";
import { auth } from "../../firebase";
import firebase from 'firebase/compat/app';



function BusinessProfile({onSubmit, ...props }) {
  const {payload} = useContext(SignupContext);
  const {onAuthenticated, axios, logout, notify} = useContext(GlobalStore);
  const [logoPreview, setLogoPreview] = useState('')
  const [params] = useSearchParams();
  const user_type = params.get('user_type') || 'dealer'
  const [businessProfile, setBusinessProfile] = useState({
    logo: null,
    business_name: '',
    services: [],
    location: {
      lat: '',
      lng: '',
      country: '',
      state: '',
      city: '',
      zip_code: '',
      place_id: '',
      street_address: '',
    },
    business_type: 'business', // business | individual
    about: '',
    headline: '',
    contact_phone: '',
    contact_email: '',
  });

  let mechServices = [
    'Oil Change',
    'Paint Job',
    'Body Work',
    'Engine Repair',
  ]

  let dealerServices = [
    'Car Rentals',
    'Car Sales',
    'Drivers',
  ]

  const servicesOffered = payload?.business_type === 'mechanic' ? mechServices : dealerServices;
  const imageRef = useRef()
  const imagesRef = useRef()
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('#d0d5dd', 'gray.700');

  const changeValue = (key, value) => {
    const oldValue = businessProfile
    oldValue[`${key}`] = value;
    setBusinessProfile({ ...oldValue })
  }

  function removeService(service){
    const oldValue = businessProfile.services;
    oldValue.pop(service)
    changeValue('services', [...oldValue])
  }

  async function setupBusinessProfile(e){
    e.preventDefault();

    if (!businessProfile.logo){
      return notify({
        color: 'red',
        title: 'Please Upload your Logo'
      })
    }
    
    // images must be < 2mb
    if (businessProfile.logo && businessProfile.logo.size/10**6 > 2.048){
      return notify({
        color: 'red',
        title: 'Your Logo file size exceeds 2mb',
        timeout: 4500,
      })
    }

    try{
      // Check both possible localStorage keys
      const authUser = objectifyJSON(localStorage.getItem('veyu-auth-user')) 
                    || objectifyJSON(localStorage.getItem('motaa-auth-user'));
      
      console.log('Auth user for business setup:', authUser); // Debug log
      
      if (!authUser) {
        return notify({
          title: 'Error',
          body: 'Please log in first to set up your business profile',
          color: 'red'
        });
      }

      const payload = new FormData();
      payload.append('action', 'setup-business-profile')
      payload.append('user_type', user_type)
      payload.append('logo', businessProfile?.logo, businessProfile.logo?.name)
      payload.append('business_type', businessProfile.business_type)
      payload.append('about', businessProfile.about)
      payload.append('headline', businessProfile.headline)
      payload.append('business_name', businessProfile.business_name)
      payload.append('contact_phone', businessProfile.contact_phone)
      payload.append('contact_email', businessProfile.contact_email)
      payload.append('services', businessProfile.services)
      payload.append('location', JSON.stringify(businessProfile.location))
      
      // Use api_token or token field
      const token = authUser?.api_token || authUser?.token;
      console.log('Using token:', token ? 'Token found' : 'No token'); // Debug log
      
      const res = await axios.post('/accounts/register/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        }
      })
      
      console.log('Business profile response:', res); // Debug log
      console.log('Response status:', res.status); // Debug log
      console.log('Response data:', res.data); // Debug log
      
      const data = objectifyJSON(res.data);

      if (res.status === 200 || res.status === 201){
        console.log("New business data:", data);
        
        notify({
          title: 'Success',
          body: "Business profile created successfully! Redirecting to dashboard..."
        });
        
        // Update localStorage with new data if returned
        if (data.data || data.user) {
          localStorage.setItem('veyu-auth-user', JSON.stringify(data.data || data.user || data));
        }
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          redirect('/dashboard');
        }, 1500);
      }else{
        console.log('Business setup failed:', data); // Debug log
        notify({
          title: 'Error',
          timeout: 5000,
          body: data.message || 'Failed to set up business profile',
          color: 'red'
        })
      }
    }catch(error){
        console.error('Business profile error:', error); // Debug log
        console.error('Error response:', error.response?.data); // Debug log
        
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data)
          || error.message;
        
        notify({
          title: 'Error',
          timeout: 5000,
          body: errorMessage,
          color: 'red'
        })

    }
  }

  return (
    <Box minH="100vh" bg={pageBg}>
      <Container maxW="4xl" py={10} px={{ base: 4, md: 6 }}>
        <form id="profileForm" method="post" onSubmit={setupBusinessProfile} encType="multipart/form-data">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="start">
        <VStack spacing={6} align="stretch" gridColumn={{ md: 'span 2' }}>
        {/* Profile Image */}
        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl" p={{ base: 5, md: 8 }} boxShadow="md">
          <VStack align="stretch" spacing={6}>
            <Flex alignItems="center" justifyContent="center" mb={2}>
              <Avatar
               w="20" h="20"
               borderRadius="full"
               src={logoPreview}
               name={businessProfile?.business_name}
              />
            </Flex>

            <Button
             onClick={() => imageRef.current.click()}
             variant="link" color="#0460cc"
             fontSize="sm" fontWeight="medium"
             leftIcon={<CloudUpload size={16} />}
            >
              Upload your logo
            </Button>
            
            <Input
             hidden
             ref={imageRef}
             type="file"
             allow="image/*"
             isRequired
             name="logo"
             onInput={(e) => {
              const file = e.target.files[0];
              changeValue('logo', file);
              if (file) setLogoPreview(URL.createObjectURL(file))
             }}
            />

            <SimpleGrid mt={2} columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel> Business Name </FormLabel>
                <Input
                 type="text" w="100%"
                 value={businessProfile.business_name}
                 placeholder="Business Name"
                 onInput={e => changeValue('business_name', e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel> Business Headline or Motto </FormLabel>
                <Input
                 type="text" w="100%"
                 value={businessProfile.headline}
                 placeholder="Business Headline / Motto"
                 onInput={e => changeValue('headline', e.target.value)}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl mt={4} isRequired>
              <FormLabel> Business Type </FormLabel>
              <ButtonGroup isAttached w="100%">
                <Button
                  flex={1}
                  variant={businessProfile.business_type === 'business' ? 'solid' : 'outline'}
                  colorScheme={businessProfile.business_type === 'business' ? 'blue' : 'gray'}
                  onClick={() => changeValue('business_type', 'business')}
                >
                  Registered Business
                </Button>
                <Button
                  flex={1}
                  variant={businessProfile.business_type === 'individual' ? 'solid' : 'outline'}
                  colorScheme={businessProfile.business_type === 'individual' ? 'blue' : 'gray'}
                  onClick={() => changeValue('business_type', 'individual')}
                >
                  Individual
                </Button>
              </ButtonGroup>
            </FormControl>
          </VStack>
        </Box>


        {/* About Your Business */}
        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl" p={{ base: 5, md: 8 }} boxShadow="sm">
          <FormLabel fontWeight="medium" mb={2}>
            About your Business
          </FormLabel>
          <Textarea
            onInput={(e) => changeValue('about', e.target.value)}
           placeholder="Enter a brief description of your business. Minimum of 50 characters..."
           minH="100px"
           borderColor={borderCol}
          />
        </Box>

        {/* Choose Services */}
        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl" p={{ base: 5, md: 8 }} boxShadow="sm">
          <FormLabel fontWeight="medium" mb={2}> Services Offered </FormLabel>
          <Box border="1px solid" borderColor={borderCol} borderRadius="lg" overflow="hidden">
            <Box p={3} borderBottom="1px solid" borderColor={borderCol}>
              <FormLabel fontWeight="medium" mb={2}> Choose services </FormLabel>
              <Flex flexWrap="wrap" gap={2}>
              {
                servicesOffered?.map((service) => {
                  const selected = businessProfile?.services?.includes(service);
                  if (selected) return null;
                  return (
                    <Tag
                      variant={selected ? "solid" : "outline"}
                      size="lg"
                      cursor="pointer"
                      borderRadius="full"
                      fontSize="sm"
                      bg={selected ? "#f2f4f7" : cardBg}
                      color={selected ? "#101828" : useColorModeValue('#667085', 'gray.300')}
                      borderColor={borderCol}
                      _hover={{ bg: selected ? "#e4e7ec" : "gray.50" }}
                      onClick={() => changeValue('services', [...businessProfile?.services, service])}
                    >
                      {service}
                    </Tag>
                  )
                }
              )}
              </Flex>
            </Box>

            <Box p={3}>
              <Flex flexWrap="wrap" gap={2}>
                {
                  businessProfile?.services?.map((service) => 
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
                      onClick={() => removeService(service)}
                    >
                      {service}
                    </Tag>
                  )
                }
                {businessProfile?.services.length < 1 && <Text> Select at least one service you offer </Text>}
              </Flex>
            </Box>
          </Box>
        </Box>

        {/* Contact Details */}
        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl" p={{ base: 5, md: 8 }} boxShadow="sm">
          <FormLabel fontWeight="medium" mb={2}>
            Contact details
          </FormLabel>
          <Text fontSize="sm" color="#667085" mb={4}>
            This would be shown on inspection slips and transaction receipts.
          </Text>

          <FormControl isRequired mb={4}>
            <FormLabel fontSize="sm" fontWeight="medium" mb={1}>
              Email
            </FormLabel>
            <Input type="email" placeholder="info@company.com" borderColor={borderCol}
                onInput={(e) => changeValue('contact_email', e.target.value)}
             />
          </FormControl>

          <FormControl isRequired isInvalid={true}>
            <FormLabel fontSize="sm" fontWeight="medium" mb={1}>
              Phone Number
            </FormLabel>
            <InputGroup>
              <InputLeftAddon
                bg={cardBg}
                borderColor={borderCol}
                px={2}
                children={
                  <Flex alignItems="center">
                    <Box w={6} h={4} position="relative">
                      <Box position="absolute" inset={0} bg="#6da544" w="33.33%"></Box>
                      <Box position="absolute" inset={0} left="33.33%" bg="white" w="33.33%"></Box>
                      <Box position="absolute" inset={0} left="66.66%" bg="#6da544" w="33.33%"></Box>
                    </Box>
                    <ChevronDown size={16} ml={1} color="#667085" />
                  </Flex>
                }
              />
              <Input
                type="tel"
                placeholder="+2341234567890"
                value={businessProfile.contact_phone}
                onInput={(e) => changeValue('contact_phone', e.target.value)}
              />
            </InputGroup>
          </FormControl>
        </Box>

        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl" p={{ base: 5, md: 8 }} boxShadow="sm">
          <SimpleGrid columns={{ base: 1 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" mb={1}>
                Street Address
              </FormLabel>
              <Input type="address" placeholder="e.g Suite 4. Acura Plaza" borderColor={borderCol}
                  onInput={(e) => changeValue('location', {...businessProfile.location, street_address: e.target.value})}
               />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" mb={1}>
                Physical Location <small> Select a Location on Google </small>
              </FormLabel>
              <CustomPlacesAutocomplete onPlaceChange={({...data}) => changeValue('location', {...businessProfile.location, ...data})} />
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Close left column and add right preview column */}
        </VStack>

        <Box position="sticky" top={4} bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="xl" p={{ base: 5, md: 6 }}>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Avatar w="14" h="14" src={logoPreview} name={businessProfile?.business_name} />
              <Box>
                <Heading as="h3" fontSize="md" fontWeight="semibold">
                  {businessProfile?.business_name || 'Business name'}
                </Heading>
                <Text fontSize="sm" color="#667085">{businessProfile?.headline || 'Headline'}</Text>
              </Box>
            </HStack>
            <Divider />
            <Text fontSize="sm" color="#667085">{businessProfile?.about || 'Tell customers about your business...'}</Text>
            <HStack flexWrap={{base: 'wrap', md: 'nowrap'}} mt={2} fontSize="sm" color="#667085">
              <Text>{businessProfile?.contact_email || 'email@example.com'}</Text>
              <Text>•</Text>
              <Text>{businessProfile?.contact_phone || '+234 000 000 0000'}</Text>
            </HStack>
            <Box>
              <Text fontWeight="medium" mb={2}>Services</Text>
              <HStack flexWrap="wrap" gap={2}>
                {businessProfile?.services?.map((s, i) => <Tag key={i} colorScheme="blue" variant="subtle">{s}</Tag>)}
                {(!businessProfile?.services || businessProfile?.services?.length === 0) && <Text color="gray.500">No services selected</Text>}
              </HStack>
            </Box>
            <Box>
              <Text fontWeight="medium" mb={1}>Address</Text>
              <Text fontSize="sm" color="#667085">{businessProfile?.location?.street_address || 'Street address'}</Text>
            </Box>
          </VStack>
        </Box>

        </SimpleGrid>

        {/* Submit Button */}
        <Box mt={8}>
          <Button form="profileForm" type="submit" w="full" bg="#0460cc" color="white" _hover={{ bg: "#0354b4" }} boxShadow="md">
            Create your Profile
          </Button>
        </Box>
      </form>
      </Container>
    </Box>
  )
}

export default BusinessProfile;

