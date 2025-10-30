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
} from '@chakra-ui/react';
import {useState, useEffect, useContext} from 'react';
import {useParams, } from 'react-router-dom';
import {GlobalStore} from '../../App';
import {BackButton} from '../../components/nav';
import {objectifyJSON, jsonifyObject} from '../../utils';
import { 
  MessageCircle, MapPin, Clock, Star,
  MessageSquare,  Bell, ShoppingCart, User,
  MoreVertical, Building2, CheckCircle, Share2,
  ThumbsUp, ThumbsDown, Filter, TrendingUp,
  Calendar, Award, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';


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
            <Avatar
              size="lg"
              name={dealer?.business_name}
              src={dealer?.logo}
              border="3px solid"
              borderColor="#F4A950"
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
                  {dealer?.rating || '4.8'}
                </Text>
                <VStack spacing={0} align="start">
                  <HStack spacing={1}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(dealer?.rating || 4.8) ? "#F4A950" : "none"}
                        color={i < Math.floor(dealer?.rating || 4.8) ? "#F4A950" : "gray.300"}
                      />
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    {dealer?.reviews?.length || 127} reviews
                  </Text>
                </VStack>
              </HStack>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                <TrendingUp size={12} style={{ marginRight: '4px' }} />
                Trending
              </Badge>
            </HStack>

            {/* Rating Breakdown */}
            <VStack spacing={2} align="stretch">
              {[5, 4, 3, 2, 1].map((rating) => (
                <HStack key={rating} spacing={3} fontSize="sm">
                  <Text minW="20px">{rating}</Text>
                  <Star size={12} fill="#F4A950" color="#F4A950" />
                  <Progress
                    value={rating === 5 ? 75 : rating === 4 ? 20 : rating === 3 ? 3 : rating === 2 ? 1 : 1}
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
                    {rating === 5 ? '95' : rating === 4 ? '25' : rating === 3 ? '4' : rating === 2 ? '2 ' : '1'}
                  </Text>
                </HStack>
              ))}
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
                ~15 min
              </Text>
            </VStack>
            <VStack spacing={1}>
              <HStack spacing={1} color="gray.600" fontSize="sm">
                <Award size={14} />
                <Text fontSize="xs">Experience</Text>
              </HStack>
              <Text fontWeight="bold" fontSize="sm" color="#F4A950">
                5+ years
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
  const [helpfulCount, setHelpfulCount] = useState(review?.helpful_count || Math.floor(Math.random() * 20));

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
                  name={review?.reviewer?.name || 'John Doe'}
                  src={review?.reviewer?.image}
                  border="2px solid"
                  borderColor="gray.200"
                />
                <VStack spacing={0} align="start">
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="md">
                      {review?.reviewer?.name || 'John Doe'}
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
                          fill={i < (review?.rating || 5) ? "#F4A950" : "none"}
                          color={i < (review?.rating || 5) ? "#F4A950" : "gray.300"}
                        />
                      ))}
                    </HStack>
                    <Text>•</Text>
                    <HStack spacing={1}>
                      <Calendar size={12} />
                      <Text>{review?.date || '2 weeks ago'}</Text>
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
                {review?.comment || "Excellent service! The team was professional and delivered exactly what was promised. The car was in perfect condition and the process was smooth from start to finish. Highly recommend this dealer to anyone looking for quality vehicles."}
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
                {review?.vehicle_type || 'Toyota Camry 2020'}
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
              <Avatar size="sm" name={dealer?.business_name} src={dealer?.logo} />
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
  const {axios, authUser, notify} = useContext(GlobalStore);
  const [dealer, setDealer] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {dealerId} = useParams();

  async function getData(){
    const res = await axios.get(`/listings/dealer/${dealerId}/`);
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      setDealer(data.data);
      console.table(data.data)
    }

    // Mock reviews data - replace with actual API call
    const mockReviews = [
      {
        id: 1,
        reviewer: { name: 'Sarah Johnson', image: null },
        rating: 5,
        title: 'Excellent Service and Quality Cars',
        comment: 'Outstanding experience from start to finish. The team was professional, knowledgeable, and helped me find the perfect car within my budget. The vehicle was exactly as described and in excellent condition.',
        date: '2 weeks ago',
        helpful_count: 15,
        verified_purchase: true,
        vehicle_type: 'Toyota Camry 2021',
        tags: ['Professional', 'Quality', 'Honest Pricing']
      },
      {
        id: 2,
        reviewer: { name: 'Michael Chen', image: null },
        rating: 5,
        title: 'Highly Recommended Dealer',
        comment: 'Bought my second car from this dealer and the experience was just as great as the first time. They have a wide selection of quality vehicles and their customer service is top-notch.',
        date: '1 month ago',
        helpful_count: 12,
        verified_purchase: true,
        vehicle_type: 'Honda Accord 2020',
        tags: ['Repeat Customer', 'Great Selection']
      },
      {
        id: 3,
        reviewer: { name: 'Aisha Mohammed', image: null },
        rating: 4,
        title: 'Good Experience Overall',
        comment: 'The car buying process was smooth and the staff was helpful. The only minor issue was the wait time, but the quality of service made up for it. Would definitely consider buying from them again.',
        date: '3 weeks ago',
        helpful_count: 8,
        verified_purchase: true,
        vehicle_type: 'Nissan Altima 2019',
        tags: ['Good Service', 'Minor Wait']
      },
      {
        id: 4,
        reviewer: { name: 'David Okafor', image: null },
        rating: 5,
        title: 'Transparent and Trustworthy',
        comment: 'What I appreciated most was their transparency about the vehicle history and condition. No hidden fees, no surprises. The car has been running perfectly for 6 months now.',
        date: '6 months ago',
        helpful_count: 20,
        verified_purchase: true,
        vehicle_type: 'Hyundai Elantra 2020',
        tags: ['Transparent', 'No Hidden Fees', 'Reliable']
      }
    ];

    setReviews(mockReviews);
    setFilteredReviews(mockReviews);
  }

  function init(){
    getData();
    setTimeout(() => setLoading(false), 2500)
  }

  useEffect(() => {
    init();
  }, [])


  if (loading){
    return null;
  }

  return (
    <Box minH="100vh">
      {/* Cover Image */}
      <Box position="relative" h="300px">
        <Image
          src="/assets/images/features-image-1.png"
          alt="Dealer cars"
          w="full"
          h="full"
          objectFit="cover"
        />

        <BackButton
          position={'absolute'}
          left={'30px'}
          top={'10%'}
          variant="solid"
          color="white"
        />
      </Box>

      <Container maxW={'1100px'} py={0}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} as={Flex} alignItems="self-start">
          {/* Main Content */}
          <Box gridColumn="span 2">
            {/* Profile Header */}
            <HStack spacing={4} mb={6}>
              
              <Box
                mt={'-20px'}
                bg="white"
                borderRadius={'50%'}
                zIndex={'1'}
                p={2}
              >
                <Avatar
                  size="xl"
                  name={dealer?.business_name}
                  src={dealer?.logo}
                />
              </Box>

              <Box flex={1}>
                <HStack py={2}>
                  <Text fontSize="lg" fontWeight="bold">
                    {dealer?.business_name}
                  </Text>
                  <Badge colorScheme="blue">
                    <CheckCircle size={16} />
                  </Badge>
                </HStack>
                <HStack spacing={2}>
                  <Badge variant="subtle" colorScheme="blue">
                    Car Dealership
                  </Badge>
                  <HStack spacing={1}>
                    <MapPin size={16} />
                    <Text>Abuja, Nigeria</Text>
                  </HStack>
                </HStack>
              </Box>


              <HStack>
                <Button leftIcon={<MessageCircle size={20} />} colorScheme="gray" variant="outline" borderRadius="30px"> Message </Button>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<MoreVertical size={20} />}
                    variant="ghost"
                  />
                  <MenuList placement="left">
                    <MenuItem icon={<Share2 size={16} />}>Share Profile</MenuItem>
                    <MenuItem>Report Dealer</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>

            {/* Stats */}
            <HStack spacing={8} mb={6}>
              <Stats number={dealer?.listings?.length} label="Listings" />
              <Stats number={dealer?.listings?.length} label="Deals" />
              {/*<Stats number="180.2K" label="Followers" />
              <Stats number="78" label="Following" />*/}
            </HStack>

            {/* Bio */}
            <Box mb={6}>
              <Heading size="md" my={2}>Bio </Heading>
              <Text color="gray.600">{dealer?.about}</Text>
            </Box>

            {/* Services */}
            <Box mb={6}>
              <Heading size="md" my={2}>Services </Heading>
              <Flex gap={2} flexWrap="wrap">
                {dealer?.services?.map(service => 
                  <ServiceTag key={service}>{service}</ServiceTag>
                )}
              </Flex>
            </Box>

            <Divider mb={6} />
          </Box>

          {/* Sidebar */}
          <Box position="relative" top={'10px'}>
            <RatingCard dealer={dealer} />
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

