import {
  Box,
  Container,
  HStack,
  VStack,
  Text,
  Button,
  Avatar,
  Badge,
  Image,
  SimpleGrid,
  Heading,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Divider,
  Progress,
  Card,
  CardBody,
  CardHeader,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Wrap,
  WrapItem,
  Tag,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { BusinessLogo } from '../../components/BusinessLogo';
import { ListingItemCard } from '../../components';
import {useState, useEffect, useContext} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {GlobalStore} from '../../App';
import {BackButton} from '../../components/nav';
import {objectifyJSON, jsonifyObject} from '../../utils';
import { 
  MessageCircle, MapPin, Clock, Star,
  MessageSquare,  Bell, ShoppingCart, User,
  MoreVertical, Building2, CheckCircle, Share2,
  ThumbsUp, ThumbsDown, Filter, TrendingUp,
  Calendar, Award, Shield, Phone, Mail, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../../services/api';
import ChatService from '../../services/chatService';


function Stats({ number, label }) {
  return (
    <VStack spacing={1}>
      <Text fontWeight="bold" fontSize="lg">
        {number}
      </Text>
      <Text color="gray.600" fontSize="sm">
        {label}
      </Text>
    </VStack>
  )
}

function ServiceTag({ children }) {
  return (
    <Badge
      px={4}
      py={2}
      bg="gray.200"
      color="gray.800"
      rounded="full"
      textTransform="capitalize"
      fontSize="md"
    >
      {children}
    </Badge>
  )
}

const MotionBox = motion(Box);

function RatingCard({ dealer }) {
  return (
    <Card
      borderRadius="2xl"
      p={6}
      bg="white"
      shadow="xl"
      border="1px solid"
      borderColor="gray.100"
    >
      <CardBody p={0}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={3}>
            <BusinessLogo
              logoUrl={dealer?.logo}
              businessName={dealer?.business_name}
              size="lg"
              borderRadius="50%"
            />
            <Box flex={1}>
              <HStack spacing={2} mb={1}>
                <Text fontWeight="bold" fontSize="lg">{dealer?.business_name}</Text>
                <Badge 
                  colorScheme="blue" 
                  display="flex" 
                  alignItems="center" 
                  gap={1}
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  <CheckCircle size={12} />
                  <Text fontSize="xs">Verified</Text>
                </Badge>
              </HStack>
              <HStack spacing={1} color="gray.600" fontSize="sm">
                <MapPin size={14} />
                <Text>{dealer?.location || 'Abuja, Nigeria'}</Text>
              </HStack>
            </Box>
          </HStack>

          <Divider />

          {/* Rating Overview */}
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="2xl" color="#F4A950">
                  {dealer?.rating || 'N/A'}
                </Text>
                <VStack spacing={0} align="start">
                  <HStack spacing={1}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(dealer?.rating || 0) ? "#F4A950" : "none"}
                        color={i < Math.floor(dealer?.rating || 0) ? "#F4A950" : "gray.300"}
                      />
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    {dealer?.reviews?.length || 0} reviews
                  </Text>
                </VStack>
              </HStack>
              {dealer?.rating > 4.5 && (
                <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                  <TrendingUp size={12} style={{ marginRight: '4px' }} />
                  Top Rated
                </Badge>
              )}
            </HStack>

            {/* Rating Breakdown */}
            <VStack spacing={2} align="stretch">
              {[5, 4, 3, 2, 1].map((rating) => {
                 // Calculate percentage based on real data if available, else 0
                 // Assuming dealer.rating_breakdown exists or we just show empty progress for now
                 // For now, let's just avoid showing fake data.
                 // If we don't have breakdown data, we can't show it accurately.
                 // But we can try to be defensive.
                 const count = dealer?.rating_breakdown?.[rating] || 0;
                 const total = dealer?.reviews?.length || 1; // avoid divide by zero
                 const percentage = (count / total) * 100;
                 
                 return (
                  <HStack key={rating} spacing={3} fontSize="sm">
                    <Text minW="20px">{rating}</Text>
                    <Star size={12} fill="#F4A950" color="#F4A950" />
                    <Progress
                      value={percentage}
                      size="sm"
                      flex={1}
                      bg="gray.100"
                      sx={{
                        '& > div': {
                          bg: '#F4A950'
                        }
                      }}
                    />
                    <Text minW="30px" color="gray.500" fontSize="xs">
                      {count}
                    </Text>
                  </HStack>
                )
              })}
            </VStack>
          </VStack>

          <Divider />

          {/* Quick Stats */}
          <SimpleGrid columns={2} spacing={4}>
            <VStack spacing={1}>
              <HStack spacing={1} color="gray.600" fontSize="sm">
                <MessageSquare size={14} />
                <Text fontSize="xs">Response</Text>
              </HStack>
              <Text fontWeight="bold" fontSize="sm" color="#F4A950">
                {dealer?.response_time || 'N/A'}
              </Text>
            </VStack>
            <VStack spacing={1}>
              <HStack spacing={1} color="gray.600" fontSize="sm">
                <Award size={14} />
                <Text fontSize="xs">Experience</Text>
              </HStack>
              <Text fontWeight="bold" fontSize="sm" color="#F4A950">
                {dealer?.experience || 'N/A'}
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  )
}

// Enhanced Review Card Component
function ReviewCard({ review, isHighlighted = false }) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review?.helpful_count || 0);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        borderRadius="xl"
        p={6}
        bg={isHighlighted ? "orange.50" : "white"}
        shadow="md"
        border="1px solid"
        borderColor={isHighlighted ? "#F4A950" : "gray.100"}
        _hover={{
          shadow: "lg",
          transform: "translateY(-2px)",
          transition: "all 0.2s"
        }}
      >
        <CardBody p={0}>
          <VStack spacing={4} align="stretch">
            {/* Reviewer Info */}
            <HStack spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Avatar
                  size="md"
                  name={review?.reviewer?.name || 'Anonymous'}
                  src={review?.reviewer?.image}
                  border="2px solid"
                  borderColor="gray.200"
                />
                <VStack spacing={0} align="start">
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="md">
                      {review?.reviewer?.name || 'Anonymous'}
                    </Text>
                    {review?.verified_purchase && (
                      <Badge colorScheme="green" variant="subtle" fontSize="xs">
                        <Shield size={10} style={{ marginRight: '2px' }} />
                        Verified Purchase
                      </Badge>
                    )}
                  </HStack>
                  <HStack spacing={2} fontSize="sm" color="gray.500">
                    <HStack spacing={1}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < (review?.rating || 0) ? "#F4A950" : "none"}
                          color={i < (review?.rating || 0) ? "#F4A950" : "gray.300"}
                        />
                      ))}
                    </HStack>
                    <Text>•</Text>
                    <HStack spacing={1}>
                      <Calendar size={12} />
                      <Text>{review?.date || 'Recently'}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
              
              {isHighlighted && (
                <Badge colorScheme="orange" variant="solid" px={3} py={1} borderRadius="full">
                  Featured
                </Badge>
              )}
            </HStack>

            {/* Review Content */}
            <Box>
              {review?.title && (
                <Text fontWeight="semibold" mb={2} color="gray.800">
                  {review.title}
                </Text>
              )}
              <Text color="gray.600" lineHeight="1.6">
                {review?.comment || "No comment provided."}
              </Text>
            </Box>

            {/* Review Tags */}
            {review?.tags && (
              <Wrap spacing={2}>
                {review.tags.map((tag, index) => (
                  <WrapItem key={index}>
                    <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="full">
                      {tag}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}

            {/* Review Actions */}
            <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.100">
              <HStack spacing={4}>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<ThumbsUp size={14} />}
                  color={isHelpful ? "#F4A950" : "gray.500"}
                  _hover={{ color: "#F4A950", bg: "orange.50" }}
                  onClick={() => {
                    setIsHelpful(!isHelpful);
                    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
                  }}
                >
                  Helpful ({helpfulCount})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<MessageSquare size={14} />}
                  color="gray.500"
                  _hover={{ color: "#F4A950", bg: "orange.50" }}
                >
                  Reply
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.400">
                {review?.vehicle_type || ''}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
}

// Write Review Modal Component
function WriteReviewModal({ isOpen, onClose, dealer }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a rating and comment',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback',
        status: 'success',
        duration: 3000,
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>
          <VStack spacing={2} align="start">
            <Text>Write a Review</Text>
            <HStack spacing={2}>
              <BusinessLogo 
                logoUrl={dealer?.logo}
                businessName={dealer?.business_name}
                size="sm"
                borderRadius="50%"
              />
              <Text fontSize="sm" color="gray.600">{dealer?.business_name}</Text>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Rating */}
            <FormControl>
              <FormLabel>Overall Rating</FormLabel>
              <HStack spacing={2}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconButton
                    key={i}
                    icon={
                      <Star
                        size={24}
                        fill={i < rating ? "#F4A950" : "none"}
                        color={i < rating ? "#F4A950" : "gray.300"}
                      />
                    }
                    variant="ghost"
                    size="sm"
                    onClick={() => setRating(i + 1)}
                    _hover={{ transform: "scale(1.1)" }}
                  />
                ))}
                <Text ml={2} color="gray.600">
                  {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
                </Text>
              </HStack>
            </FormControl>

            {/* Title */}
            <FormControl>
              <FormLabel>Review Title (Optional)</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience..."
                borderColor="gray.300"
                _focus={{ borderColor: "#F4A950", shadow: "0 0 0 1px #F4A950" }}
              />
            </FormControl>

            {/* Comment */}
            <FormControl>
              <FormLabel>Your Review</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience with this dealer..."
                rows={5}
                borderColor="gray.300"
                _focus={{ borderColor: "#F4A950", shadow: "0 0 0 1px #F4A950" }}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {comment.length}/500 characters
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg="#F4A950"
              color="white"
              _hover={{ bg: "orange.600" }}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting..."
            >
              Submit Review
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function DealerProfile() {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { authUser } = useContext(GlobalStore);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        // Fetch dealer profile
        const response = await apiClient.get(`/marketplace/dealership/${dealerId}/`);
        
        if (response.data) {
          const dealerData = response.data;
          
          // Fetch dealer listings
          const listingsResponse = await apiClient.get(`/marketplace/dealership/${dealerId}/listings/`);
          const dealerListings = listingsResponse.data || [];
          
          // Combine data
          setDealer({
            ...dealerData,
            listings: dealerListings,
            reviews: dealerData.reviews || [], // Ensure reviews array exists
            rating_breakdown: dealerData.rating_breakdown || {}
          });
        }
      } catch (error) {
        console.error("Error fetching dealer data:", error);
        toast({
          title: "Error",
          description: "Could not load dealership profile.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      getData();
    }
  }, [dealerId, toast]);

  const handleMessage = async () => {
    try {
      const chatResponse = await ChatService.createNewChat(dealer?.id);
      if (chatResponse?.data?.room_id) {
        navigate(`/chat/${chatResponse.data.room_id}`);
      } else {
        toast({
          title: "Error",
          description: "Failed to start chat with dealer.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat with dealer.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading){
    return (
      <Box minH="100vh" bg="gray.50">
        <Box h="250px" bg="gray.200" />
        <Container maxW="container.xl" mt="-100px" pb={20}>
           <HStack spacing={8} align="start">
              <Skeleton height="300px" width="300px" borderRadius="xl" />
              <VStack flex={1} spacing={4} align="stretch">
                <Skeleton height="150px" borderRadius="xl" />
                <Skeleton height="400px" borderRadius="xl" />
              </VStack>
           </HStack>
        </Container>
      </Box>
    );
  }

  const listings = dealer?.listings || [];

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Cover Image */}
      <Box position="relative" h="250px" bgGradient="linear(to-r, gray.800, gray.900)">
        <Image
          src={dealer?.cover_image || "/assets/images/features-image-1.png"}
          alt="Cover"
          w="full"
          h="full"
          objectFit="cover"
          opacity={0.6}
        />
        <Box 
            position="absolute" 
            top={0} 
            left={0} 
            w="full" 
            h="full" 
            bgGradient="linear(to-t, rgba(0,0,0,0.7), transparent)" 
        />

        <BackButton
          position={'absolute'}
          left={{ base: '4', md: '8' }}
          top={'24px'}
          variant="solid"
          colorScheme="whiteAlpha"
          color="white"
        />
      </Box>

      <Container maxW={'container.xl'} py={0}>
        <Flex 
            direction={{ base: 'column', lg: 'row' }} 
            gap={8} 
            mt="-80px" 
            position="relative" 
            zIndex={2}
            alignItems="flex-start"
        >
          {/* Left Sidebar: Profile Card */}
          <Box w={{ base: '100%', lg: '350px' }} flexShrink={0}>
             <Card 
                borderRadius="2xl" 
                overflow="hidden" 
                shadow="xl" 
                bg="white"
                mb={6}
             >
                <CardBody p={6} textAlign="center">
                    <Box 
                        mx="auto" 
                        mt="-50px" 
                        p={1} 
                        bg="white" 
                        borderRadius="full" 
                        w="fit-content"
                        shadow="md"
                        mb={4}
                    >
                        <BusinessLogo
                          logoUrl={dealer?.logo}
                          businessName={dealer?.business_name}
                          size="2xl"
                          borderRadius="full"
                        />
                    </Box>
                    
                    <HStack justify="center" spacing={2} mb={1}>
                        <Heading size="lg" color="gray.800">{dealer?.business_name}</Heading>
                        {dealer?.is_verified && (
                            <Badge colorScheme="blue" borderRadius="full" p={1}>
                                <CheckCircle size={14} />
                            </Badge>
                        )}
                    </HStack>
                    
                    <Text color="gray.500" mb={4} fontSize="sm">
                        {dealer?.tagline || "Your trusted car partner"}
                    </Text>

                    <HStack justify="center" spacing={6} mb={6}>
                         <Stats number={listings.length} label="Vehicles" />
                         <Divider orientation="vertical" h="40px" />
                         <Stats number={dealer?.reviews?.length || 0} label="Reviews" />
                    </HStack>
                    
                    <VStack spacing={3} align="stretch" mb={6}>
                        {dealer?.location && (
                            <HStack color="gray.600" fontSize="sm">
                                <MapPin size={16} />
                                <Text>{dealer.location}</Text>
                            </HStack>
                        )}
                        {dealer?.phone && (
                            <HStack color="gray.600" fontSize="sm">
                                <Phone size={16} />
                                <Text>{dealer.phone}</Text>
                            </HStack>
                        )}
                        {dealer?.email && (
                             <HStack color="gray.600" fontSize="sm">
                                <Mail size={16} />
                                <Text>{dealer.email}</Text>
                             </HStack>
                        )}
                        {dealer?.website && (
                             <HStack color="gray.600" fontSize="sm">
                                <Globe size={16} />
                                <Text as="a" href={dealer.website} target="_blank" color="blue.500">
                                    Visit Website
                                </Text>
                             </HStack>
                        )}
                    </VStack>

                    <HStack spacing={3}>
                        <Button 
                            flex={1} 
                            colorScheme="orange" 
                            bg="#F4A950" 
                            _hover={{ bg: 'orange.600' }}
                            leftIcon={<MessageCircle size={18} />}
                            borderRadius="full"
                            onClick={handleMessage}
                        >
                            Message
                        </Button>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<MoreVertical size={20} />}
                            variant="outline"
                            borderRadius="full"
                            aria-label="More options"
                          />
                          <MenuList>
                            <MenuItem icon={<Share2 size={16} />}>Share Profile</MenuItem>
                            <MenuItem icon={<Shield size={16} />}>Report Dealer</MenuItem>
                          </MenuList>
                        </Menu>
                    </HStack>
                </CardBody>
             </Card>

             <RatingCard dealer={dealer} />
          </Box>

          {/* Main Content Area */}
          <Box flex={1} pt={{ base: 0, lg: '80px' }} w="full">
            <Tabs colorScheme="orange" size="lg" variant="enclosed-colored">
                <TabList mb={6} borderBottom="1px solid" borderColor="gray.200">
                    <Tab _selected={{ color: '#F4A950', borderColor: 'gray.200', borderBottomColor: 'white', fontWeight: 'bold' }}>Inventory ({listings.length})</Tab>
                    <Tab _selected={{ color: '#F4A950', borderColor: 'gray.200', borderBottomColor: 'white', fontWeight: 'bold' }}>About</Tab>
                    <Tab _selected={{ color: '#F4A950', borderColor: 'gray.200', borderBottomColor: 'white', fontWeight: 'bold' }}>Reviews</Tab>
                </TabList>

                <TabPanels>
                    {/* Inventory Tab */}
                    <TabPanel p={0}>
                        {listings.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                                {listings.map(listing => (
                                    <ListingItemCard key={listing.id || listing.uuid} listing={listing} />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Alert status="info" borderRadius="lg" variant="subtle">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>No vehicles listed yet</AlertTitle>
                                    <AlertDescription display="block">
                                        This dealership hasn't listed any vehicles for sale or rent yet.
                                    </AlertDescription>
                                </Box>
                            </Alert>
                        )}
                    </TabPanel>

                    {/* About Tab */}
                    <TabPanel p={0}>
                        <Card shadow="sm" borderRadius="xl" mb={6}>
                            <CardBody>
                                <Heading size="md" mb={4}>About Us</Heading>
                                <Text color="gray.600" lineHeight="tall" mb={6}>
                                    {dealer?.about || "No description provided."}
                                </Text>
                                
                                <Divider mb={6} />
                                
                                <Heading size="md" mb={4}>Services</Heading>
                                <Wrap spacing={3}>
                                    {dealer?.services?.map(service => (
                                        <WrapItem key={service}>
                                            <ServiceTag>{service}</ServiceTag>
                                        </WrapItem>
                                    )) || <Text color="gray.500">No services listed.</Text>}
                                </Wrap>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Reviews Tab */}
                    <TabPanel p={0}>
                        <VStack spacing={4} align="stretch">
                             <HStack justify="space-between" mb={2}>
                                <Heading size="md">Customer Reviews</Heading>
                                <Button size="sm" colorScheme="orange" variant="outline" onClick={onOpen}>
                                    Write a Review
                                </Button>
                             </HStack>
                             
                             {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))
                             ) : (
                                <Alert status="info" borderRadius="lg">
                                    <AlertIcon />
                                    No reviews yet. Be the first to write one!
                                </Alert>
                             )}
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Container>
      
      <WriteReviewModal isOpen={isOpen} onClose={onClose} dealer={dealer} />
    </Box>
  )
}

