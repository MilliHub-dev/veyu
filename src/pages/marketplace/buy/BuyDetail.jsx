import {
  Avatar, Badge, Box, Button, Container,
  Divider, Flex, Heading, Icon, Image, List,
  ListItem, Stack, Text, IconButton, SimpleGrid,
  useMediaQuery, Tag, LinkBox, Grid, GridItem,
  LinkOverlay, HStack, VStack, Card, CardBody,
  Stat, StatLabel, StatNumber, StatHelpText,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  useColorModeValue, Tooltip, Alert, AlertIcon,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlobalStore } from "../../../App";
import { ImageCarousel, LocationBreadcrumb, ListingItemCard } from "../../../components";
import { ListingDetailSkeleton } from "../../../components/loaders";
import { ChatPopup } from "../../../components/chat";
import { objectifyJSON } from "../../../utils";
import { HiMiniReceiptPercent, HiShieldCheck, HiTruck, HiClock, HiPhone } from 'react-icons/hi2';
import { FaCartPlus, FaHeart, FaShare, FaEye, FaStar, FaCheckCircle } from 'react-icons/fa';
import { MdVerified, MdLocationOn, MdSpeed, MdLocalGasStation } from 'react-icons/md';
import { BsCalendar3, BsGearFill } from 'react-icons/bs';



export const BuyDetail = ({ }) => {
  const { listingId } = useParams();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoadingState] = useState(true);
  const [showPopup, setPopupState] = useState(false);
  const [listing, setListing] = useState({});
  const [isFavorited, setIsFavorited] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const { axios, notify, commaInt } = useContext(GlobalStore);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  async function getData() {
    const res = await axios.get(`/listings/buy/${listingId}/`);
    if (res.status === 200) {
      let data = objectifyJSON(res.data);
      setListing(data.data.listing);
      setRecommended(data.data.recommended);
      setViewCount(Math.floor(Math.random() * 500) + 50); // Mock view count
    }
  }

  async function addToCart() {
    const res = await axios.post(`/listings/buy/${listingId}/`, JSON.stringify({
      action: 'add-to-cart',
      item_type: 'sale',
    })
    )

    if (res.status === 200) {
      notify({
        title: 'Success!',
        body: `${listing?.vehicle?.name} was added to your cart!`
      })
    } else {
      const data = await objectifyJSON(res.data)
      notify({
        title: 'An error occurred!',
        body: `${data?.message}`
      })
    }
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    notify({
      title: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      body: `${listing?.title} ${isFavorited ? 'removed from' : 'added to'} your favorites!`
    });
  };

  const shareVehicle = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this ${listing?.vehicle?.name} on Veyu`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      notify({
        title: 'Link copied!',
        body: 'Vehicle link copied to clipboard'
      });
    }
  };

  function init() {
    setLoadingState(true)
    getData();
    setTimeout(() => setLoadingState(false), 2500)
  }

  useEffect(() => {
    init();
  }, [listingId]);

  if (loading) {
    return <ListingDetailSkeleton />
  }

  return (
    <Container display={'block'} w={'100%'} maxW={'container.xl'} py={'2rem'}>
      <LocationBreadcrumb label={listing?.title} />

      {/* Header Section */}
      <Box my={6}>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box flex={1}>
            <Heading size={'xl'} color="gray.800" mb={2}>
              {listing?.title}
            </Heading>
            <HStack spacing={4} mb={3}>
              <HStack spacing={1}>
                <Icon as={MdLocationOn} color="#F4A950" />
                <Text color="gray.600" fontSize="md">
                  {listing?.vehicle?.dealer?.location}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaEye} color="gray.500" />
                <Text color="gray.600" fontSize="sm">
                  {viewCount} views
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={BsCalendar3} color="gray.500" />
                <Text color="gray.600" fontSize="sm">
                  Listed 3 days ago
                </Text>
              </HStack>
            </HStack>

            {/* Vehicle Badges */}
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme="green" variant="solid" px={3} py={1}>
                <Icon as={MdVerified} mr={1} />
                Verified
              </Badge>
              <Badge colorScheme="blue" variant="outline" px={3} py={1}>
                {listing?.vehicle?.condition}
              </Badge>
              <Badge colorScheme="purple" variant="outline" px={3} py={1}>
                {listing?.vehicle?.type}
              </Badge>
            </HStack>
          </Box>

          {/* Action Buttons */}
          <HStack spacing={2}>
            <Tooltip label={isFavorited ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                icon={<FaHeart />}
                colorScheme={isFavorited ? "red" : "gray"}
                variant={isFavorited ? "solid" : "outline"}
                onClick={toggleFavorite}
                size="lg"
              />
            </Tooltip>
            <Tooltip label="Share vehicle">
              <IconButton
                icon={<FaShare />}
                colorScheme="gray"
                variant="outline"
                onClick={shareVehicle}
                size="lg"
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} my={6}>
        {/* Left Column - Images and Details */}
        <GridItem>
          {/* Image Carousel */}
          <Box mb={6}>
            <ImageCarousel
              w={'100%'}
              height={{ base: '300px', md: '400px', lg: '450px' }}
              images={listing?.vehicle?.images}
            />
          </Box>

          {/* Vehicle Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={MdSpeed} size="24px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.mileage || "0"}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Miles</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={BsGearFill} size="20px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.transmission}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Transmission</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={MdLocalGasStation} size="20px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {listing?.vehicle?.fuel_system}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Fuel Type</StatLabel>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center" py={4}>
                <Icon as={BsCalendar3} size="20px" color="#F4A950" mb={2} />
                <Stat>
                  <StatNumber fontSize="lg" fontWeight="bold">
                    {new Date().getFullYear() - 5}
                  </StatNumber>
                  <StatLabel fontSize="sm" color="gray.600">Year</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </GridItem>

        {/* Right Column - Purchase Card */}
        <GridItem>
          <Card
            bg={bgColor}
            border="2px"
            borderColor="#F4A950"
            borderRadius="xl"
            position="sticky"
            top="20px"
            shadow="xl"
          >
            <CardBody p={6}>
              {/* Dealer Info */}
              <LinkBox mb={6}>
                <LinkOverlay as={Link} to={`/dealership/${listing?.vehicle?.dealer?.uuid}`}>
                  <Flex gap={3} align="center" p={4} bg="gray.50" borderRadius="lg">
                    <Avatar
                      name={listing?.vehicle?.dealer?.business_name}
                      src={listing?.vehicle?.dealer?.logo}
                      size="md"
                    />
                    <Box flex={1}>
                      <Heading size={'sm'} color="gray.800">
                        {listing?.vehicle?.dealer?.business_name}
                      </Heading>
                      <HStack spacing={1} mt={1}>
                        <Icon as={MdLocationOn} color="gray.500" size="14px" />
                        <Text fontSize={'sm'} color="gray.600">
                          {listing?.vehicle?.dealer?.location || 'N/A'}
                        </Text>
                      </HStack>
                      <HStack spacing={1} mt={1}>
                        <Icon as={FaStar} color="#F4A950" size="14px" />
                        <Text fontSize={'sm'} color="gray.600">
                          4.8 (127 reviews)
                        </Text>
                      </HStack>
                    </Box>
                    <Icon as={MdVerified} color="green.500" size="20px" />
                  </Flex>
                </LinkOverlay>
              </LinkBox>

              {/* Price Section */}
              <Box mb={6}>
                <Flex alignItems="baseline" gap={2} mb={2}>
                  <Heading size={'2xl'} color="#F4A950">
                    ₦{commaInt(listing?.price)}
                  </Heading>
                  <Text color="gray.500" textDecoration="line-through" fontSize="lg">
                    ₦{commaInt(listing?.price * 1.15)}
                  </Text>
                </Flex>

                <Alert status="info" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box fontSize="sm">
                    <Text fontWeight="semibold">Price includes:</Text>
                    <Text>• Documentation fees</Text>
                    <Text>• Basic inspection</Text>
                    <Text>• 30-day warranty</Text>
                  </Box>
                </Alert>

                <Tag
                  as={Flex}
                  alignItems="center"
                  gap={2}
                  bg="orange.50"
                  color="orange.700"
                  p={2}
                  borderRadius="md"
                >
                  <Icon as={HiMiniReceiptPercent} />
                  <Text fontSize="sm">+0.5% processing fee applies</Text>
                </Tag>
              </Box>

              <Divider mb={6} />

              {/* Action Buttons */}
              <VStack spacing={3}>
                <Button
                  as={Link}
                  to={`/checkout/?listingId=${listingId}`}
                  bg={'#F4A950'}
                  color="white"
                  size="lg"
                  w={'100%'}
                  _hover={{ bg: '#E09940' }}
                  leftIcon={<FaCheckCircle />}
                >
                  Buy Now
                </Button>

                <Flex gap={2} w="100%">
                  <Button
                    variant="outline"
                    colorScheme="orange"
                    flex={1}
                    leftIcon={<FaCartPlus />}
                    onClick={addToCart}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => setPopupState(true)}
                    variant={'outline'}
                    colorScheme="blue"
                    flex={1}
                    leftIcon={<HiPhone />}
                  >
                    Message
                  </Button>
                </Flex>
              </VStack>

              {/* Trust Indicators */}
              <VStack spacing={3} mt={6} pt={6} borderTop="1px" borderColor={borderColor}>
                <HStack spacing={2} w="100%">
                  <Icon as={HiShieldCheck} color="green.500" />
                  <Text fontSize="sm" color="gray.600">Secure payment</Text>
                </HStack>
                <HStack spacing={2} w="100%">
                  <Icon as={HiTruck} color="blue.500" />
                  <Text fontSize="sm" color="gray.600">Free delivery available</Text>
                </HStack>
                <HStack spacing={2} w="100%">
                  <Icon as={HiClock} color="orange.500" />
                  <Text fontSize="sm" color="gray.600">14-day return policy</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <ChatPopup
        isOpen={showPopup}
        onClose={() => setPopupState(false)}
        recipient_type="dealer"
        recipient_id={listing?.vehicle?.dealer?.uuid}
      />

      {/* Detailed Information Tabs */}
      <Box my={8}>
        <Tabs variant="enclosed" colorScheme="orange">
          <TabList>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Overview</Tab>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Specifications</Tab>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Performance</Tab>
            <Tab _selected={{ color: '#F4A950', borderColor: '#F4A950' }}>Description</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Basic Information</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between">
                        <Text color="gray.600">Condition:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.condition}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Mileage:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.mileage || "0"} miles</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Color:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.color || "N/A"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Vehicle Type:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.type || "N/A"}</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Engine & Performance</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between">
                        <Text color="gray.600">Transmission:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.transmission}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Fuel Type:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.fuel_system}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Engine Size:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.engine_size || "N/A"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Power:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.power || "N/A"}</Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Features & Comfort</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between">
                        <Text color="gray.600">Doors:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.doors || "N/A"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Seats:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.seats || "N/A"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Drivetrain:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.drivetrain || "N/A"}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.600">Custom Duty:</Text>
                        <Badge colorScheme={listing?.vehicle?.custom_duty ? "green" : "red"}>
                          {listing?.vehicle?.custom_duty ? 'Paid' : 'Not Paid'}
                        </Badge>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Specifications Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Technical Specifications</Heading>
                    <List spacing={3}>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Engine Size:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.engine_size || "N/A"}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Transmission:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.transmission}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Fuel System:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.fuel_system}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Drivetrain:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.drivetrain || "N/A"}</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={4} color="#F4A950">Dimensions & Capacity</Heading>
                    <List spacing={3}>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Doors:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.doors || "N/A"}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Seats:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.seats || "N/A"}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Color:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.color || "N/A"}</Text>
                      </ListItem>
                      <ListItem display="flex" justifyContent="space-between" py={2} borderBottom="1px" borderColor={borderColor}>
                        <Text color="gray.600">Vehicle Type:</Text>
                        <Text fontWeight="semibold">{listing?.vehicle?.type || "N/A"}</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Performance Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card bg={bgColor} border="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <Icon as={MdSpeed} size="40px" color="#F4A950" mb={3} />
                    <Stat>
                      <StatNumber fontSize="2xl" color="#F4A950">
                        {listing?.vehicle?.top_speed || "N/A"}
                      </StatNumber>
                      <StatLabel>Top Speed</StatLabel>
                      <StatHelpText>Maximum velocity</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <Icon as={BsGearFill} size="32px" color="#F4A950" mb={3} />
                    <Stat>
                      <StatNumber fontSize="2xl" color="#F4A950">
                        {listing?.vehicle?.horse_power || "N/A"}
                      </StatNumber>
                      <StatLabel>Horsepower</StatLabel>
                      <StatHelpText>Engine power output</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={bgColor} border="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <Icon as={MdLocalGasStation} size="32px" color="#F4A950" mb={3} />
                    <Stat>
                      <StatNumber fontSize="2xl" color="#F4A950">
                        {listing?.vehicle?.mileage || "0"}
                      </StatNumber>
                      <StatLabel>Mileage</StatLabel>
                      <StatHelpText>Total miles driven</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Description Tab */}
            <TabPanel px={0}>
              <Card bg={bgColor} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Heading size="sm" mb={4} color="#F4A950">Seller Notes</Heading>
                  <Box
                    dangerouslySetInnerHTML={{ __html: listing?.notes || "No additional information provided by the seller." }}
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    minH="200px"
                  />
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <WhyBuyOnVeyu />

      {/* Recommended Vehicles Section */}
      <Box my={12}>
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading size="xl" mb={3} color="gray.800">
              You Might Also Like
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Similar vehicles that match your preferences
            </Text>
          </Box>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
            spacing={6}
            w="100%"
            placeItems="center"
          >
            {recommended && recommended?.map((listing, idx) =>
              <ListingItemCard
                listing={listing}
                key={idx}
                w="100%"
                maxW={'320px'}
              />
            )}
          </SimpleGrid>

          {recommended?.length === 0 && (
            <Card bg={bgColor} border="1px" borderColor={borderColor} w="100%" maxW="400px">
              <CardBody textAlign="center" py={8}>
                <Icon as={FaEye} size="40px" color="gray.400" mb={4} />
                <Text color="gray.600" fontSize="lg" mb={2}>No recommendations yet</Text>
                <Text color="gray.500" fontSize="sm">
                  Check back later for similar vehicles
                </Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Container>
  )
}


const FeatureItem = ({ icon, text, description }) => (
  <Card bg="white" border="1px" borderColor="gray.200" _hover={{ shadow: "md", borderColor: "#F4A950" }} transition="all 0.2s">
    <CardBody textAlign="center" py={6}>
      <Flex w="60px" h="60px" borderRadius="full" bg="#FFF7ED" alignItems="center" justifyContent="center" mx="auto" mb={4}>
        {icon}
      </Flex>
      <Text fontWeight="semibold" fontSize="md" mb={2}>
        {text}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {description}
      </Text>
    </CardBody>
  </Card>
)

const WhyBuyOnVeyu = () => {
  return (
    <Box py={12} px={4} mb={6} bg="gray.50" borderRadius="xl">
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4} color="gray.800">
              Why buy on Veyu?
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px" mx="auto">
              Experience the future of vehicle purchasing with our secure, transparent, and customer-focused platform
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
            <FeatureItem
              icon={<Icon as={HiShieldCheck} size="24px" color="#F4A950" />}
              text="Secure Payments"
              description="Protected transactions with escrow service and fraud protection"
            />
            <FeatureItem
              icon={<Icon as={HiTruck} size="24px" color="#F4A950" />}
              text="Free Delivery"
              description="Complimentary home delivery for all verified vehicles"
            />
            <FeatureItem
              icon={<Icon as={MdVerified} size="24px" color="#F4A950" />}
              text="Verified Vehicles"
              description="Every vehicle undergoes thorough inspection and verification"
            />
            <FeatureItem
              icon={<Icon as={HiClock} size="24px" color="#F4A950" />}
              text="14-Day Returns"
              description="Not satisfied? Return within 14 days for full refund"
            />
          </SimpleGrid>

          {/* Contact Support Card */}
          <Card
            bg="white"
            border="2px"
            borderColor="#F4A950"
            borderRadius="xl"
            shadow="lg"
            maxW="400px"
            w="100%"
          >
            <CardBody p={6}>
              <Flex align="center" gap={4}>
                <Box flex={1}>
                  <Heading size="md" mb={2} color="gray.800">
                    Need Help?
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Our sales team is here to assist you with any questions
                  </Text>
                  <Button
                    bg="#F4A950"
                    color="white"
                    size="md"
                    borderRadius="md"
                    _hover={{ bg: "#E09940" }}
                    leftIcon={<Icon as={HiPhone} />}
                    w="100%"
                  >
                    Contact Sales
                  </Button>
                </Box>
                <Box>
                  <Flex
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    bg="#FFF7ED"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={HiPhone} size="32px" color="#F4A950" />
                  </Flex>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}



export default BuyDetail;