import { useState, useEffect, useContext } from "react"
import {
  Box, Button, Container, Flex, Heading, Text, Avatar, HStack, VStack, Alert, Wrap,
  Menu, MenuButton, MenuList, MenuItem, WrapItem, Tag, TagLabel, TagCloseButton, AlertIcon,
  Textarea, Card, CardBody, CardHeader, Icon, Divider, SimpleGrid, Stat, StatLabel, StatNumber,
  useColorModeValue, Badge, Progress, useToast, Tooltip
} from "@chakra-ui/react"
import { BusinessLogo } from "../../../components/BusinessLogo";
import {
  DollarSign, MapPin, Wrench, CreditCard, Info, Star, ChevronDown, Send, Award,
  Shield, Clock, CheckCircle, Phone, MessageCircle, Calendar, User
} from "lucide-react"
import { MapComponent } from "../../../components/maps";
import { BackButton } from "../../../components/nav";
import { ChatPopup } from "../../../components/chat";
import { objectifyJSON, jsonifyObject, formatCurrency } from "../../../utils";
import { GlobalStore } from "../../../App";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { usePaystackPayment, PaystackButton } from 'react-paystack';
import { CashMoneyIcon, EmptyWalletIcon, TopRatedBadgeIcon } from "../../../components/icons";

const PAYSTACK_LIVE_KEY = (import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY);

const PaymentButton = ({ config, onSuccess, onClose }) => {
  const handlePayment = usePaystackPayment(config);
  const componentProps = {
    ...config,
    text: 'Confirm Booking',
    onSuccess: (reference) => onSuccess(reference),
    onClose: () => onClose(),
  }

  return (
    <Button
      as={PaystackButton}
      bg="#F4A950"
      color="white"
      _hover={{ bg: "#E09940" }}
      size="lg"
      w="full"
      borderRadius="lg"
      fontWeight="bold"
      leftIcon={<CheckCircle />}
      {...componentProps}
    />
  )
}

const ConfirmBooking = () => {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [description, setDescription] = useState("")
  const [services, setServices] = useState([])
  const [location, setLocation] = useState({ lat: 10, lng: 8, name: 'Current Location' });
  const [mechanic, setMechanic] = useState()
  const [loading, setLoading] = useState(true)
  const [showChatPopup, setChatPopupState] = useState(false)
  const { axios, notify, authUser } = useContext(GlobalStore);
  const redirect = useNavigate();
  const toast = useToast();

  const { mechId } = useParams();
  const [params] = useSearchParams();
  const address = params.get('address');
  const lat = params.get('lat')
  const lng = params.get('lng')

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getFinalAmount = (amt) => {
    return (amt * 100)
  }

  const onModalClose = (ev) => {
    console.log("modal closed", ev)
  }

  const onPaymentComplete = async (response) => {
    if (response && response.status === 'success') {
      const payload = {
        services,
        transaction_id: response.reference,
        problem_description: description,
      }

      try {
        const res = await axios.post(`/mechanics/${mechId}/`, jsonifyObject(payload));
        const data = objectifyJSON(res.data);

        if (res.status === 200) {
          toast({
            title: 'Booking Confirmed!',
            description: 'Your mechanic will contact you shortly.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          setTimeout(() => redirect('/home'), 1000);
          return;
        }

        return notify({
          title: "Error",
          body: data.message,
          color: 'red'
        });
      } catch (error) {
        return notify({
          title: "Booking failed",
          body: "Please try again or contact support",
          color: 'red'
        });
      }
    }

    return notify({
      title: "Payment failed",
      body: response?.message || "Payment was not completed",
      color: 'red'
    });
  }

  function init() {
    getData();
    setTimeout(() => setLoading(false), 2000)
  }

  async function getData() {
    try {
      const res = await axios.get(`/mechanics/${mechId}`);
      const data = objectifyJSON(res.data);
      if (res.status === 200) {
        setMechanic(data?.data);
        // Set location from URL params
        if (lat && lng) {
          setLocation({ lat: parseFloat(lat), lng: parseFloat(lng), name: address });
        }
      }
    } catch (error) {
      console.error("Error fetching mechanic:", error);
      notify({
        title: "Error",
        body: "Failed to load mechanic details",
        color: 'red'
      });
    }
  }

  const config = {
    publicKey: PAYSTACK_LIVE_KEY,
    reference: 'mch-bk-'.concat((new Date()).getTime().toString()),
    amount: getFinalAmount(5000), // ₦5,000 booking fee
    email: authUser?.email,
    onSuccess: onPaymentComplete,
    metadata: {
      display_name: 'Transaction Type',
      variable_name: 'Transaction_Type',
      value: 'Mechanic Booking Fee',
    }
  };

  useEffect(() => {
    init();
  }, [])

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Progress size="xs" isIndeterminate w="100%" colorScheme="orange" />
          <Text>Loading booking details...</Text>
        </VStack>
      </Container>
    );
  }

  if (!mechanic) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          Failed to load mechanic details. Please try again.
        </Alert>
      </Container>
    );
  }

  const rating = mechanic?.rating || 4.5;
  const reviewCount = mechanic?.reviews?.length || 0;

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" p={0}>
        <Flex direction={{ base: "column", lg: "row" }} minH="100vh">
          {/* Left Side - Booking Details */}
          <Box 
            w={{ base: "100%", lg: "45%" }} 
            p={{ base: 4, md: 8 }} 
            bg={bgColor}
            borderRight={{ lg: "1px solid" }}
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={6} maxW="500px" mx="auto">
              <Box>
                <BackButton />
              </Box>

              {/* Header */}
              <Box textAlign="center">
                <Heading size="2xl" fontWeight="bold" mb={2} color="gray.800">
                  Confirm Booking
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Review your booking details and complete payment
                </Text>
              </Box>

              {/* Mechanic Profile Card */}
              <Card bg="gray.50" border="2px" borderColor="#F4A950" borderRadius="xl">
                <CardBody p={6}>
                  <Flex align="center" gap={4}>
                    <BusinessLogo
                      logoUrl={mechanic?.logo}
                      businessName={mechanic?.business_name || mechanic?.user?.name}
                      size="xl"
                      borderRadius="50%"
                    />
                    <Box flex={1}>
                      <Heading size="lg" mb={2} color="gray.800">
                        {mechanic?.business_name || mechanic?.user?.name}
                      </Heading>
                      
                      <HStack spacing={3} mb={3} flexWrap="wrap">
                        <Badge 
                          bg="#F4A950" 
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                          fontWeight="bold"
                          display="flex"
                          alignItems="center"
                          gap={1}
                        >
                          <TopRatedBadgeIcon viewBox="0 0 27 28" w="14px" h="14px" />
                          {mechanic?.level || 'Professional'}
                        </Badge>

                        <HStack spacing={1}>
                          <Icon as={Star} color="#F4A950" fill="#F4A950" boxSize={4} />
                          <Text fontWeight="bold" fontSize="sm">
                            {rating.toFixed(1)}
                          </Text>
                          <Text color="gray.500" fontSize="sm">
                            ({reviewCount} reviews)
                          </Text>
                        </HStack>
                      </HStack>

                      <Text color="gray.600" fontSize="sm">
                        {mechanic?.headline || "Professional automotive service"}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              {/* Booking Details */}
              <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl">
                <CardHeader pb={3}>
                  <Heading size="md" color="#F4A950">Booking Details</Heading>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    {/* Location */}
                    <HStack spacing={3}>
                      <Icon as={MapPin} color="#F4A950" boxSize={5} />
                      <Box flex={1}>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.700">Service Location</Text>
                        <Text fontSize="sm" color="gray.600">{address}</Text>
                      </Box>
                    </HStack>

                    {/* Booking Fee */}
                    <HStack spacing={3}>
                      <Icon as={CreditCard} color="#F4A950" boxSize={5} />
                      <Box flex={1}>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.700">Booking Fee</Text>
                        <Text fontSize="lg" fontWeight="bold" color="#F4A950">{formatCurrency(5000, 'NGN')}</Text>
                      </Box>
                    </HStack>

                    {/* Date & Time */}
                    <HStack spacing={3}>
                      <Icon as={Calendar} color="#F4A950" boxSize={5} />
                      <Box flex={1}>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.700">Scheduled</Text>
                        <Text fontSize="sm" color="gray.600">As soon as possible</Text>
                      </Box>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Problem Description */}
              <Box>
                <Text mb={3} fontWeight="semibold" color="gray.700">
                  Describe Your Problem
                </Text>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue with your vehicle in detail..."
                  rows={4}
                  borderColor={borderColor}
                  _focus={{ borderColor: "#F4A950", boxShadow: "0 0 0 1px #F4A950" }}
                  bg="gray.50"
                  borderRadius="lg"
                />
              </Box>

              {/* Services Selection */}
              <MultiSelectPills 
                options={mechanic?.services?.map(service => service?.service) || []} 
                onChange={setServices}  
              />

              {/* Important Info */}
              <Alert status="info" borderRadius="lg" bg="blue.50" border="1px" borderColor="blue.200">
                <AlertIcon />
                <Box fontSize="sm">
                  <Text fontWeight="semibold" mb={1}>Important Information:</Text>
                  <Text>• The {formatCurrency(5000, 'NGN')} booking fee is a consultation charge</Text>
                  <Text>• This fee does not cover actual service costs</Text>
                  <Text>• Service pricing will be discussed on-site</Text>
                  <Text>• Refundable if mechanic doesn't show up</Text>
                </Box>
              </Alert>

              {/* Payment Method */}
              <Box>
                <Text fontWeight="semibold" mb={3} color="gray.700">
                  Payment Method
                </Text>
                <Menu>
                  <MenuButton 
                    as={Button} 
                    w="100%" 
                    size="lg"
                    rightIcon={<ChevronDown />}
                    borderColor={borderColor}
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                    borderRadius="lg"
                    justifyContent="space-between"
                  >
                    <HStack>
                      {paymentMethod === 'cash' ? (
                        <>
                          <CashMoneyIcon size={20} />
                          <Text>Cash Payment</Text>
                        </>
                      ) : (
                        <>
                          <EmptyWalletIcon size={20} />
                          <Text>Wallet Payment</Text>
                        </>
                      )}
                    </HStack>
                  </MenuButton>

                  <MenuList>
                    <MenuItem onClick={() => setPaymentMethod('wallet')}>
                      <HStack>
                        <EmptyWalletIcon size={16} />
                        <Text>Wallet Payment</Text>
                      </HStack>
                    </MenuItem>
                    <MenuItem onClick={() => setPaymentMethod('cash')}>
                      <HStack>
                        <CashMoneyIcon size={16} />
                        <Text>Cash Payment</Text>
                      </HStack>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>

              {/* Action Buttons */}
              <VStack spacing={3}>
                <PaymentButton 
                  onSuccess={onPaymentComplete} 
                  onClose={onModalClose} 
                  config={config} 
                />
                
                <Button
                  w="full"
                  variant="outline"
                  size="lg"
                  borderColor="#F4A950"
                  color="#F4A950"
                  _hover={{ bg: "orange.50" }}
                  borderRadius="lg"
                  leftIcon={<MessageCircle />}
                  onClick={() => setChatPopupState(true)}
                >
                  Message Mechanic
                </Button>

                <Button
                  w="full"
                  variant="ghost"
                  size="md"
                  color="gray.600"
                  leftIcon={<Phone />}
                >
                  Call Support: +234 800 VEYU
                </Button>
              </VStack>

              {/* Trust Indicators */}
              <Card bg="gray.50" border="1px" borderColor={borderColor} borderRadius="lg">
                <CardBody p={4}>
                  <VStack spacing={3}>
                    <HStack spacing={2} w="100%">
                      <Icon as={Shield} color="green.500" />
                      <Text fontSize="sm" color="gray.600">Secure payment processing</Text>
                    </HStack>
                    <HStack spacing={2} w="100%">
                      <Icon as={CheckCircle} color="blue.500" />
                      <Text fontSize="sm" color="gray.600">Verified mechanic</Text>
                    </HStack>
                    <HStack spacing={2} w="100%">
                      <Icon as={Clock} color="#F4A950" />
                      <Text fontSize="sm" color="gray.600">Quick response guarantee</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>

          {/* Right Side - Map */}
          <Box w={{ base: "100%", lg: "55%" }} position="relative" minH={{ base: "300px", lg: "100vh" }}>
            <MapComponent
              location={location}
              style={{ width: "100%", height: "100%" }}
            />
            
            {/* Map Overlay Info */}
            <Card
              position="absolute"
              top={4}
              left={4}
              right={4}
              bg="whiteAlpha.900"
              backdropFilter="blur(10px)"
              border="1px"
              borderColor="whiteAlpha.300"
              borderRadius="xl"
            >
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Icon as={MapPin} color="#F4A950" boxSize={5} />
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">Service Location</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>{address}</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Container>

      <ChatPopup
        isOpen={showChatPopup}
        onClose={() => setChatPopupState(false)}
        recipient_type="mechanic" 
        recipient_id={mechanic?.uuid}
      />
    </Box>
  )
}

const MultiSelectPills = ({ options = [], onChange }) => {
  const [selected, setSelected] = useState([]);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSelect = (option) => {
    if (!selected.includes(option)) {
      const updated = [...selected, option];
      setSelected(updated);
      onChange(updated);
    }
  };

  const handleUnselect = (option) => {
    const updated = selected.filter((item) => item !== option);
    setSelected(updated);
    onChange(updated);
  };

  const availableOptions = options.filter((opt) => !selected.includes(opt));

  return (
    <Card bg={bgColor} border="1px" borderColor={borderColor} borderRadius="xl">
      <CardHeader pb={3}>
        <Heading size="md" color="#F4A950">Select Services Needed</Heading>
      </CardHeader>
      <CardBody pt={0}>
        <VStack align="stretch" spacing={4}>
          {/* Available Services */}
          <Box>
            <Text fontWeight="semibold" mb={3} fontSize="sm" color="gray.700">
              Available Services:
            </Text>
            <Wrap spacing={2}>
              {availableOptions.length === 0 ? (
                <Text fontSize="sm" color="gray.500">All services selected</Text>
              ) : (
                availableOptions.map((option, idx) => (
                  <WrapItem key={idx}>
                    <Tag
                      size="md"
                      variant="outline"
                      colorScheme="gray"
                      cursor="pointer"
                      onClick={() => handleSelect(option)}
                      borderRadius="full"
                      _hover={{ bg: "gray.50", borderColor: "#F4A950" }}
                      transition="all 0.2s"
                    >
                      <TagLabel>{option}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))
              )}
            </Wrap>
          </Box>

          <Divider />

          {/* Selected Services */}
          <Box>
            <Text fontWeight="semibold" mb={3} fontSize="sm" color="gray.700">
              Selected Services:
            </Text>
            <Wrap spacing={2}>
              {selected.length === 0 ? (
                <Text fontSize="sm" color="gray.500">Select at least one service you need</Text>
              ) : (
                selected.map((option, idx) => (
                  <WrapItem key={idx}>
                    <Tag
                      size="md"
                      bg="#F4A950"
                      color="white"
                      borderRadius="full"
                    >
                      <TagLabel>{option}</TagLabel>
                      <TagCloseButton onClick={() => handleUnselect(option)} />
                    </Tag>
                  </WrapItem>
                ))
              )}
            </Wrap>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ConfirmBooking