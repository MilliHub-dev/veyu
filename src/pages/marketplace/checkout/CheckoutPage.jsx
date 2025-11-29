import {useState, useEffect, useContext} from 'react';
import {motion} from "framer-motion";
import {useParams, useSearchParams, Link, useNavigate} from 'react-router-dom';
import {GlobalStore} from "../../../App";
import {objectifyJSON, jsonifyObject} from "../../../utils";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Tag,
  Button,
  Text,
  Image,
  HStack,
  Flex,
  Badge,
  Divider,
  IconButton,
  InputGroup,
  InputLeftAddon,
  FormErrorMessage,
  RadioGroup,
  Checkbox,
  Radio,
  Icon,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useRadio,
  useRadioGroup,
  useMediaQuery,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Progress,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react'
import { 
  Clock, 
  Gauge, 
  Zap, 
  MoreVertical, 
  PiggyBank, 
  Wallet, 
  CreditCard, 
  Warehouse, 
  BanknoteIcon,
  Shield,
  CheckCircle,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Home,
  ArrowLeft,
  Lock,
  Star,
  Truck,
  FileText
} from 'lucide-react';
import { HiMiniReceiptPercent } from 'react-icons/hi2'
import { LuMapPin } from 'react-icons/lu'
import { RxCaretLeft, RxCaretRight, RxTimer } from 'react-icons/rx';
import { RiGasStationLine } from 'react-icons/ri';
import { TbManualGearbox } from 'react-icons/tb';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import { Country, State, City }  from 'country-state-city';
import {
  FlutterwavePaymentModal,
  WalletPaymentModal,
  PaystackPaymentModal,
} from '../../../components/wallet';
import {
  CashMoneyIcon,
  CarFinancingIcon,
  CarParkingIcon,
  PayOnlineIcon,
  EmptyWalletIcon
} from '../../../components/icons';
import {CalendarPicker} from '../../../components';
import {CustomPlacesAutocomplete} from '../../../components/maps';
import InspectionBooking from '../../../components/InspectionBooking';

const MotionBox = motion(Box);
const MotionCard = motion(Card);




const PaymentOptions = [
  { 
    icon: Wallet, 
    label: 'Pay with Wallet', 
    value: 'wallet',
    description: 'Use your Veyu wallet balance',
    color: 'purple'
  },
  { 
    icon: CreditCard, 
    label: 'Pay Online', 
    value: 'online-payment',
    description: 'Card, bank transfer, or USSD',
    color: 'blue'
  },
  { 
    icon: Shield, 
    label: 'Pay After Inspection', 
    value: 'pay-after-inspection',
    description: 'Pay for inspection,then full amount',
    color: 'green'
  },
  { 
    icon: Lock, 
    label: 'Reserve Vehicle', 
    disabled: true, 
    value: 'reserve-vehicle',
    description: 'Hold the vehicle for 24 hours',
    color: 'gray'
  },
  { 
    icon: FileText, 
    label: 'Car Financing', 
    disabled: true, 
    value: 'finance-aid',
    description: 'Apply for vehicle financing',
    color: 'orange'
  },
]


const RadioCard = ({ option, onInput, ...props }) => {
  const { getInputProps, getRadioProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getRadioProps();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return(
    <Box as={'label'} cursor={option.disabled ? 'not-allowed' : 'pointer'}>
      <MotionCard
        {...checkbox}
        isDisabled={option.disabled}
        borderWidth="2px"
        borderColor={borderColor}
        bg={bgColor}
        opacity={option?.disabled ? 0.6 : 1}
        position="relative"
        minW="200px"
        h="120px"
        _checked={{
          borderColor: `${option.color}.500`,
          bg: `${option.color}.50`,
          transform: 'scale(1.02)',
        }}
        _hover={!option.disabled ? {
          borderColor: `${option.color}.300`,
          transform: 'translateY(-2px)',
          shadow: 'lg'
        } : {}}
        transition="all 0.2s"
        whileHover={!option.disabled ? { y: -4 } : {}}
        whileTap={!option.disabled ? { scale: 0.98 } : {}}
      >
        <CardBody p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Box 
            p={3} 
            borderRadius="full" 
            bg={`${option.color}.100`} 
            mb={3}
            _groupChecked={{ bg: `${option.color}.500`, color: 'white' }}
          >
            <option.icon size={24} />
          </Box>
          
          <VStack spacing={1} textAlign="center">
            <Text fontWeight="semibold" fontSize="sm" color="gray.900">
              {option.label}
            </Text>
            <Text fontSize="xs" color="gray.600" noOfLines={2}>
              {option.description}
            </Text>
          </VStack>

          {option.disabled && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme="orange"
              fontSize="xs"
              px={2}
              py={1}
            >
              Coming Soon
            </Badge>
          )}
        </CardBody>
      </MotionCard>
      <input {...input} />
    </Box>
  )
}


function CheckoutPage({ props }) {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listingId');
  const redirect = useNavigate();
  const {axios, authUser, commaInt, notify} = useContext(GlobalStore);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const [listing, setListing] = useState();
  const [order, setOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [checkoutPayload, setCheckoutPayload] = useState({
    listing: listingId,
    first_name: authUser?.first_name || '',
    last_name: authUser?.last_name || '',
    email: authUser?.email || '',
    phone_number: authUser?.phone_number || '',
    currency: 'NGN',
    location:{
      country: '', // get from phone number extension
      state: '',
      city: '', // also used as lga
      lga: '', // also used as lga
      lat: '',
      lng: '',
      address: '',
      zip_code: '',
      street_address: '',
      formatted_address: '',
      place_id: '',
    },
    payment_option: 'online-payment',
    amount: 0.0,
  });

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'payment-option',
    onChange: val => {
      let payload = checkoutPayload;
      payload.payment_option = val;
      if (val === 'pay-after-inspection'){
        payload.amount = order.inspection_fee || 0;
      } else {
        // For other payment options, use the full total
        const fullTotal = Number(listing?.price || 0) + 
                         Number(order?.service_fee || 0) + 
                         Number(order?.tax || 0) + 
                         Number(order?.inspection_fee || 0);
        payload.amount = fullTotal;
      }
      console.log('Payment option changed to:', val, 'Amount:', payload.amount);
      setCheckoutPayload({...payload})
    },
  });
  
  const groupy = getRootProps();
  const {onClose, onOpen, isOpen} = useDisclosure();
  const {
    isOpen: isInspectionOpen,
    onOpen: onInspectionOpen,
    onClose: onInspectionClose
  } = useDisclosure();

  function redeemCoupon(e){
    e.preventDefault();
  }

  function changeValue(val){
    let data = checkoutPayload;
    setCheckoutPayload({...data, ...val})
  }

  function init(){
    getData();
  }

  async function getData(){
    if (!listingId) {
      setError('No listing ID provided');
      setLoading(false);
      notify({
        title: 'Error',
        body: 'No listing selected for checkout',
        color: 'red'
      });
      setTimeout(() => redirect('/cart'), 2000);
      return;
    }

    try {
      const res = await axios.get(`/listings/checkout/${listingId}/`);
      const data = objectifyJSON(res.data);
      console.log('Checkout API Response:', data);
      console.log('Fees:', data.fees);
      if(res.status === 200){
        setListing(data.listing);
        changeValue({amount: parseInt(data.listing.price)})
        setOrder(data.fees || {});
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load checkout data:', err);
      setError(err?.response?.data?.message || 'Failed to load listing');
      notify({
        title: 'Error',
        body: 'Failed to load checkout information. Please try again.',
        color: 'red'
      });
      setTimeout(() => redirect('/cart'), 2000);
    } finally {
      setLoading(false);
    }
  }

  function onLocationChanged({ lat, lng, ...location }){
    console.log('Location', {lat, lng, ...location});
  }
  
  async function proceedToCheckout(e){
    e.preventDefault();
    console.log('🚀 proceedToCheckout called with payment option:', checkoutPayload.payment_option);
    console.log('📦 Checkout payload:', checkoutPayload);
    
    // For wallet payments, show wallet modal directly
    if (checkoutPayload.payment_option === 'wallet') {
      console.log('💰 Opening wallet payment modal');
      onOpen();
      return;
    }
    
    // For online payment and pay-after-inspection, call backend API
    try {
      console.log('📞 Calling checkout API...');
      
      const res = await axios.post(`/listings/checkout/${listingId}/`, JSON.stringify(checkoutPayload));
      const data = objectifyJSON(res.data);
      
      console.log('✅ Checkout API response:', data);
      
      if(res.status === 200 || res.status === 201){
        console.log('✅ Checkout successful! Status:', res.status);
        
        // Check if backend returned a payment URL (for Paystack)
        if (data.payment_url || data.authorization_url || data.data?.authorization_url) {
          const paymentUrl = data.payment_url || data.authorization_url || data.data?.authorization_url;
          console.log('💳 Payment URL received:', paymentUrl);
          console.log('🔄 Redirecting to Paystack...');
          
          // Redirect to Paystack payment page
          window.location.href = paymentUrl;
          return;
        }
        
        // Check if this is pay-after-inspection (order created successfully)
        if (checkoutPayload.payment_option === 'pay-after-inspection'){
          console.log("✅ Order created for pay-after-inspection");
          console.log("📋 Order data:", data.data);
          
          // Check if inspection slip reference is returned
          if (data.inspection_slip_reference || data.data?.inspection_slip_reference) {
            const slipRef = data.inspection_slip_reference || data.data.inspection_slip_reference;
            console.log("✅ Inspection slip reference received:", slipRef);
            
            notify({
              title: 'Order Created',
              body: 'Redirecting to inspection slip...',
              color: 'green'
            });
            
            // Redirect to inspection slip page
            setTimeout(() => {
              redirect(`/inspection/slip?reference=${slipRef}&listingId=${listingId}`);
            }, 1000);
            
            return;
          }
          
          notify({
            title: 'Order Created',
            body: 'Please schedule your vehicle inspection',
            color: 'green'
          });
          
          // Show inspection booking modal
          setTimeout(() => {
            console.log('Opening inspection modal now...');
            onInspectionOpen();
          }, 300);
          
          return;
        }
        
        // If no payment URL for online payment, show Paystack modal
        if (checkoutPayload.payment_option === 'online-payment') {
          console.log('💳 No payment URL from backend, showing Paystack modal');
          onOpen();
          return;
        }
        
        // If no payment URL and not pay-after-inspection, check if payment is completed
        if (data.status === 'success' || data.payment_status === 'paid' || data.error === false) {
          console.log('✅ Payment completed successfully');
          
          // For other payment options, redirect to success page or home
          notify({
            title: 'Purchase Complete',
            body: data.message || 'Your order has been placed successfully',
            color: 'green'
          });
          return redirect('/');
        }
        
        // If we get here, something unexpected happened
        console.warn('⚠️ Unexpected response format:', data);
        notify({
          title: 'Checkout Completed',
          body: 'Please check your orders',
          color: 'blue'
        });
        return redirect('/dashboard');
        
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      console.error('Error response:', error?.response?.data);
      
      notify({
        title: 'Checkout Failed',
        body: error?.response?.data?.message || error?.message || 'Failed to complete checkout. Please try again.',
        color: 'red'
      });
    }
  }
  
  const onSuccess = async (paymentResponse) => {
    console.log('💰 Payment successful:', paymentResponse);
    
    try {
      // Verify payment with backend
      const verifyPayload = {
        ...checkoutPayload,
        payment_reference: paymentResponse.reference || paymentResponse.trxref || paymentResponse.transaction,
        payment_status: 'paid'
      };
      
      const res = await axios.post(`/listings/checkout/${listingId}/verify/`, JSON.stringify(verifyPayload));
      const data = objectifyJSON(res.data);
      
      if (res.status === 200) {
        notify({
          title: 'Payment Successful',
          body: 'Your purchase has been completed',
          color: 'green'
        });
        
        onClose();
        
        // Redirect to success page or dashboard
        setTimeout(() => {
          redirect('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      notify({
        title: 'Verification Failed',
        body: 'Payment received but verification failed. Please contact support.',
        color: 'orange'
      });
    }
  };

  const handleInspectionBookingComplete = (inspectionSlip) => {
    console.log('Inspection booking completed:', inspectionSlip);
    onInspectionClose();
    
    notify({
      title: 'Inspection Booked',
      body: 'Your inspection has been scheduled successfully',
      color: 'green',
    });
    
    // Navigate to inspection slip page or dashboard
    const reference = inspectionSlip?.reference || inspectionSlip?.slip_reference || '';
    if (reference) {
      redirect(`/inspection/slip?reference=${reference}&listingId=${listingId}`);
    } else {
      // Fallback to dashboard if no reference
      redirect('/dashboard');
    }
  };

  useEffect(() => {
    setCountryList(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (checkoutPayload.country) {
      const selectedCountry = Country.getAllCountries().find(c => c.name === checkoutPayload.country);
      setStateList(selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : []);
      setCityList([]);
    }
  }, [checkoutPayload.country]);

  useEffect(() => {
    init();
  }, [listingId]);

  let total = 0.0;
  total += Number(listing?.price || 0);
  total += Number(order?.service_fee || 0);
  total += Number(order?.tax || 0);
  total += Number(order?.inspection_fee || 0);
  
  console.log('Total calculation:', {
    price: listing?.price,
    service_fee: order?.service_fee,
    tax: order?.tax,
    inspection_fee: order?.inspection_fee,
    total
  });


  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const steps = [
    { title: 'Personal Details', description: 'Your information' },
    { title: 'Payment Method', description: 'Choose how to pay' },
    { title: 'Review & Confirm', description: 'Final confirmation' }
  ];

  const { activeStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  // Show loading state
  if (loading) {
    return (
      <Box bg={bgGradient} minH="100vh">
        <Container maxW="7xl" py={20}>
          <VStack spacing={4}>
            <Progress size="xs" isIndeterminate w="100%" colorScheme="blue" />
            <Text fontSize="lg" color="gray.600">Loading checkout...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Show error state
  if (error || !listing) {
    return (
      <Box bg={bgGradient} minH="100vh">
        <Container maxW="7xl" py={20}>
          <VStack spacing={6}>
            <Alert status="error" borderRadius="lg" maxW="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Unable to load checkout</Text>
                <Text fontSize="sm">{error || 'Listing not found'}</Text>
              </Box>
            </Alert>
            <Button as={Link} to="/cart" leftIcon={<ArrowLeft />} colorScheme="blue">
              Return to Cart
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgGradient} minH="100vh">
      {/* Modern Header */}
      <Box py={8} mb={8}>
        <Container maxW="7xl">
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              leftIcon={<ArrowLeft size={20} />}
              variant="ghost"
              mb={4}
              onClick={() => window.history.back()}
            >
              Back to Listing
            </Button>
            
            <Heading size="2xl" color="gray.900" mb={2}>
              Secure Checkout
            </Heading>
            <Text color="gray.600" fontSize="lg" mb={6}>
              {listing?.listing_type === 'sale' ? 'Complete your vehicle purchase' : 'Finalize your rental booking'}
            </Text>

            {/* Progress Stepper */}
            <Box maxW="2xl">
              <Stepper index={activeStep} colorScheme="blue" size="lg">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>
                    <Box flexShrink="0" display={{ base: 'none', md: 'block' }}>
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>
                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="7xl" pb={10}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Form Section */}
          <Box gridColumn={{ base: 1, lg: "1 / 3" }}>
            <MotionCard
              shadow="xl"
              borderRadius="2xl"
              bg="white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <CardHeader>
                <Flex align="center" mb={2}>
                  <Box p={2} bg="blue.100" borderRadius="lg" mr={3}>
                    <User size={20} color="var(--chakra-colors-blue-600)" />
                  </Box>
                  <Heading size="lg" color="gray.900">Personal Information</Heading>
                </Flex>
                <Text color="gray.600">Please confirm your details for delivery and contact</Text>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid spacing={4} columns={{base: 1, md: 2}}>
                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        <Flex align="center">
                          <User size={16} style={{ marginRight: "8px" }} />
                          First Name
                        </Flex>
                      </FormLabel>
                      <Input 
                        onInput={(e) => changeValue({ first_name: e.target.value})} 
                        defaultValue={checkoutPayload?.first_name} 
                        size="lg"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.500',
                          bg: 'white',
                          shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        <Flex align="center">
                          <User size={16} style={{ marginRight: "8px" }} />
                          Last Name
                        </Flex>
                      </FormLabel>
                      <Input 
                        onInput={(e) => changeValue({ last_name: e.target.value})} 
                        defaultValue={checkoutPayload?.last_name} 
                        size="lg"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.500',
                          bg: 'white',
                          shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                        }}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid spacing={4} columns={{base: 1, md: 2}}>
                    <FormControl isRequired={!authUser?.phone_number}>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        <Flex align="center">
                          <Phone size={16} style={{ marginRight: "8px" }} />
                          Phone Number
                        </Flex>
                      </FormLabel>
                      <InputGroup>
                        <InputLeftAddon px={0} w="70px" bg="gray.100">
                          <Select
                            minW="auto"
                            flexShrink={1}
                            border="none"
                            bg="transparent"
                            onChange={(e) => {
                              const selectedCountry = countryList.find(c => c.name === e.target.value);
                              setCheckoutPayload({ ...checkoutPayload, country: e.target.value, state: '', city: '' });
                              setStateList(selectedCountry ? State.getStatesOfCountry(selectedCountry.isoCode) : []);
                              setCityList([]);
                            }}
                          >
                            {countryList.map((place) => (
                              <option key={place.isoCode} value={place.name}>
                                {place.flag} {place.name}
                              </option>
                            ))}
                          </Select>
                        </InputLeftAddon>
                        <Input 
                          placeholder="Enter phone number" 
                          flex={1} 
                          value={checkoutPayload.phone_number} 
                          onChange={(e) => setCheckoutPayload({ ...checkoutPayload, phone_number: e.target.value })}
                          size="lg"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{
                            borderColor: 'blue.500',
                            bg: 'white',
                            shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                          }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        <Flex align="center">
                          <Mail size={16} style={{ marginRight: "8px" }} />
                          Email Address
                        </Flex>
                      </FormLabel>
                      <Input 
                        onInput={(e) => changeValue({ email: e.target.value})} 
                        defaultValue={checkoutPayload?.email} 
                        type="email" 
                        size="lg"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.500',
                          bg: 'white',
                          shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                        }}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" color="gray.700">
                      <Flex align="center">
                        <MapPin size={16} style={{ marginRight: "8px" }} />
                        Delivery Location
                      </Flex>
                    </FormLabel>
                    <Box
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      bg="gray.50"
                      _hover={{ borderColor: 'blue.300' }}
                      _focusWithin={{
                        borderColor: 'blue.500',
                        bg: 'white',
                        shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                      }}
                    >
                      <CustomPlacesAutocomplete
                        value={checkoutPayload?.location?.formatted_address}
                        onPlaceChange={onLocationChanged}
                        inputProps={{
                          border: 'none', 
                          name: 'address', 
                          type: 'address',
                          size: 'lg',
                          bg: 'transparent',
                          placeholder: 'Enter delivery address'
                        }}
                      />
                    </Box>
                  </FormControl>

                  <SimpleGrid spacing={4} columns={{base: 1, md: 2}}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        <Flex align="center">
                          <Home size={16} style={{ marginRight: "8px" }} />
                          Street Address
                        </Flex>
                      </FormLabel>
                      <Input 
                        name="street-address" 
                        size="lg"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.500',
                          bg: 'white',
                          shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                        }}
                        placeholder="Enter street address"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontWeight="semibold" color="gray.700">
                        Postal Code (optional)
                      </FormLabel>
                      <Input 
                        name="postal-code" 
                        size="lg"
                        bg="gray.50"
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{
                          borderColor: 'blue.500',
                          bg: 'white',
                          shadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                        }}
                        placeholder="Enter postal code"
                      />
                    </FormControl>
                  </SimpleGrid>

                  {listing?.listing_type === 'rental' && (
                    <Card bg="blue.50" borderColor="blue.200" borderWidth="2px">
                      <CardBody>
                        <FormControl>
                          <FormLabel fontWeight="semibold" color="gray.700">
                            <Flex align="center">
                              <Calendar size={16} style={{ marginRight: "8px" }} />
                              Rental Period
                            </Flex>
                          </FormLabel>
                          <CalendarPicker
                            defaultValue={null}
                            onSelect={(val) => {
                              console.log("Rental Range", val)
                              changeValue({ start_date: val })
                            }}
                            mode='range'
                            border="2px solid"
                            borderColor="blue.300"
                            borderRadius="lg"
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>
                  )}

                  <Divider my={6} />

                  {/* Promo Code Section */}
                  <Card bg="yellow.50" borderColor="yellow.200" borderWidth="2px">
                    <CardBody>
                      <Heading size="sm" mb={3} color="gray.900">Have a Promo Code?</Heading>
                      <form method="POST" onSubmit={redeemCoupon}>
                        <HStack spacing={3}>
                          <Input 
                            placeholder="Enter promo code" 
                            size="lg"
                            bg="white"
                            border="2px solid"
                            borderColor="yellow.300"
                            _hover={{ borderColor: 'yellow.400' }}
                            _focus={{
                              borderColor: 'yellow.500',
                              shadow: '0 0 0 1px var(--chakra-colors-yellow-500)'
                            }}
                            flex={1}
                          />
                          <Button 
                            colorScheme="yellow" 
                            size="lg"
                            px={8}
                            type="submit"
                          >
                            Apply
                          </Button>
                        </HStack>
                      </form>
                    </CardBody>
                  </Card>

                  <Card bg="gray.50" borderWidth="2px" borderColor="gray.200">
                    <CardHeader>
                      <Flex align="center">
                        <Box p={2} bg="green.100" borderRadius="lg" mr={3}>
                          <CreditCard size={20} color="var(--chakra-colors-green-600)" />
                        </Box>
                        <Box>
                          <Heading size="md" color="gray.900">Payment Method</Heading>
                          <Text color="gray.600" fontSize="sm">Choose how you'd like to pay</Text>
                        </Box>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} {...groupy}>
                        {PaymentOptions.map((option, index) => {
                          const radio = getRadioProps({ value: option.value, isDisabled: option.disabled });
                          return (
                            <RadioCard key={index} option={option} value={option.value} {...radio} />
                          )}
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  <Divider my={6} />

                  {/* Payment Information */}
                  <Alert 
                    status="info" 
                    borderRadius="lg" 
                    bg="blue.50" 
                    borderColor="blue.200"
                    borderWidth="2px"
                  >
                    <AlertIcon />
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={1}>
                        Payment Information
                      </Text>
                      <Text fontSize="sm" color="blue.700">
                        {
                          checkoutPayload.payment_option === 'wallet' ?
                          "The amount will be charged from your Veyu wallet balance. Ensure you have sufficient funds." :
                          checkoutPayload.payment_option === 'online-payment' ? 
                          "You'll be redirected to a secure payment page for card or bank transfer." :
                          checkoutPayload.payment_option === 'pay-after-inspection' ?
                          "Pay the inspection fee now, then the full amount after vehicle inspection."
                          : "Please select a payment method above to continue."
                        }
                      </Text>
                    </Box>
                  </Alert>

                  {/* Escrow Protection */}
                  <Card bg="green.50" borderColor="green.200" borderWidth="2px">
                    <CardBody>
                      <HStack spacing={3} align="start">
                        <Box p={2} bg="green.100" borderRadius="lg">
                          <Shield size={20} color="var(--chakra-colors-green-600)" />
                        </Box>
                        <VStack align="start" spacing={2}>
                          <Checkbox defaultChecked colorScheme="green">
                            <Text fontWeight="semibold" color="green.800">
                              Buyer Protection Enabled
                            </Text>
                          </Checkbox>
                          <Text fontSize="sm" color="green.700">
                            Your payment is held securely in escrow until you're satisfied with the vehicle. 
                            Veyu doesn't sell cars - we protect your transaction.
                          </Text>
                          <Button variant="link" colorScheme="green" size="sm" textDecoration="underline">
                            Learn more about escrow protection
                          </Button>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>

                  {/* Action Buttons */}
                  <VStack spacing={4} pt={4}>
                    <Button 
                      onClick={proceedToCheckout} 
                      colorScheme="blue" 
                      size="xl" 
                      width="100%"
                      h="60px"
                      fontSize="lg"
                      fontWeight="bold"
                      leftIcon={<CheckCircle size={24} />}
                      _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                      transition="all 0.2s"
                      isDisabled={!checkoutPayload.payment_option}
                    >
                      Complete Purchase
                    </Button>

                    <Button 
                      variant="outline" 
                      size="lg" 
                      width="100%" 
                      as={Link} 
                      to="/"
                      leftIcon={<ArrowLeft size={20} />}
                      _hover={{ bg: 'gray.50' }}
                    >
                      Continue Shopping
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </MotionCard>
          </Box>

          {/* Modern Vehicle Details Sidebar */}
          <Box>
            <MotionCard
              shadow="xl"
              borderRadius="2xl"
              bg="white"
              position="sticky"
              top={8}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardBody p={0}>
                {/* Vehicle Image */}
                <Box position="relative" borderRadius="2xl" overflow="hidden">
                  <Image
                    src={listing?.vehicle?.images[0]?.url}
                    alt={listing?.title}
                    w="100%"
                    h="250px"
                    objectFit="cover"
                  />
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme="green"
                    px={3}
                    py={1}
                    borderRadius="full"
                    textTransform="uppercase"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {listing?.vehicle?.condition}
                  </Badge>
                </Box>

                <Box p={6}>
                  {/* Vehicle Title and Price */}
                  <VStack align="start" spacing={3} mb={4}>
                    <Heading size="md" color="gray.900" noOfLines={2}>
                      {listing?.title}
                    </Heading>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      ₦{commaInt(listing?.price)}
                    </Text>
                  </VStack>

                  {/* Vehicle Specs */}
                  <VStack spacing={3} mb={4}>
                    <HStack justify="space-between" w="full">
                      <Flex align="center" color="gray.600">
                        <Clock size={16} style={{ marginRight: "8px" }} />
                        <Text fontSize="sm">{commaInt(listing?.vehicle?.mileage) || 0} miles</Text>
                      </Flex>
                      <Flex align="center" color="gray.600">
                        <Gauge size={16} style={{ marginRight: "8px" }} />
                        <Text fontSize="sm">{listing?.vehicle?.transmission}</Text>
                      </Flex>
                    </HStack>
                    
                    <HStack justify="space-between" w="full">
                      <Flex align="center" color="gray.600">
                        <Zap size={16} style={{ marginRight: "8px" }} />
                        <Text fontSize="sm">{listing?.vehicle?.fuel_system}</Text>
                      </Flex>
                      <Flex align="center" color="gray.600">
                        <MapPin size={16} style={{ marginRight: "8px" }} />
                        <Text fontSize="sm">{listing?.vehicle?.dealer?.location}</Text>
                      </Flex>
                    </HStack>
                  </VStack>

                  <Divider mb={4} />

                  {/* Price Breakdown */}
                  <VStack spacing={3} align="stretch">
                    <Heading size="sm" color="gray.900">Order Summary</Heading>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">Vehicle Price</Text>
                      <Text fontWeight="semibold">₦{commaInt(listing?.price)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">Service Fee</Text>
                      <Text fontWeight="semibold">₦{commaInt(order?.service_fee || 0)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">Tax</Text>
                      <Text fontWeight="semibold">₦{commaInt(order?.tax || 0)}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">Inspection Fee</Text>
                      <Text fontWeight="semibold">₦{commaInt(order?.inspection_fee || 0)}</Text>
                    </HStack>

                    <Divider />
                    
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold" color="gray.900">Total</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">₦{commaInt(total)}</Text>
                    </HStack>
                  </VStack>

                  {listing?.vehicle?.custom_duty && (
                    <Alert status="info" borderRadius="lg" mt={4}>
                      <AlertIcon />
                      <Text fontSize="sm">Custom duty included</Text>
                    </Alert>
                  )}
                </Box>
              </CardBody>
            </MotionCard>
          </Box>
        </SimpleGrid>

        {/* Payment Modals */}
        {listing && checkoutPayload?.payment_option === 'online-payment' && isOpen && (
          <PaystackPaymentModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            payload={{
              email: checkoutPayload.email,
              amount: checkoutPayload.amount,
            }}
            customizations={{
              title: "Veyu Checkout",
              logo: listing?.vehicle?.dealer?.logo,
              description: `Payment for ${listing?.title}`,
            }}
          />
        )}
        
        {listing && checkoutPayload?.payment_option === 'wallet' && isOpen && (
          <WalletPaymentModal
            payload={{
              amount: checkoutPayload.amount, 
              recipient: listing?.vehicle?.dealer
            }}
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}

        {/* Inspection Booking Modal */}
        {console.log('🔍 Rendering inspection modal. isInspectionOpen:', isInspectionOpen)}
        <Modal 
          isOpen={isInspectionOpen} 
          onClose={onInspectionClose} 
          size="xl"
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Schedule Vehicle Inspection</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {console.log('🔍 Inside modal body. isInspectionOpen:', isInspectionOpen, 'listingId:', listingId)}
              {isInspectionOpen && listingId && listing ? (
                <InspectionBooking
                  listingId={listingId}
                  listingType={listing?.listing_type === 'sale' ? 'buy' : 'rent'}
                  onBookingComplete={handleInspectionBookingComplete}
                  onCancel={onInspectionClose}
                  alreadyPaid={true}
                />
              ) : (
                <Box>
                  {console.log('❌ Modal conditions not met:', { isInspectionOpen, listingId, listing: !!listing })}
                  <Text>Loading inspection form...</Text>
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
        

      </Container>
    </Box>
  )
}




export default CheckoutPage;

