import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Icon,
  Box,
  SimpleGrid,
} from '@chakra-ui/react';
import { Star } from 'lucide-react';
import { reviewService } from '../../services';

const RATING_CATEGORIES = {
  dealer: [
    { key: 'communication', label: 'Communication' },
    { key: 'support', label: 'Support' },
    { key: 'service-delivery', label: 'Service Delivery' },
    { key: 'car-quality', label: 'Car Quality' },
    { key: 'car-cleanliness', label: 'Car Cleanliness' },
  ],
  mechanic: [
    { key: 'communication', label: 'Communication' },
    { key: 'support', label: 'Support' },
    { key: 'service-delivery', label: 'Service Delivery' },
  ],
  default: [
    { key: 'communication', label: 'Communication' },
    { key: 'support', label: 'Support' },
    { key: 'service-delivery', label: 'Service Delivery' },
  ]
};

const StarRating = ({ rating, setRating, size = 24 }) => {
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          as={Star}
          size={size}
          fill={star <= rating ? "#F4A950" : "none"}
          color={star <= rating ? "#F4A950" : "gray.300"}
          cursor="pointer"
          onClick={() => setRating(star)}
          _hover={{ transform: "scale(1.1)" }}
          transition="all 0.2s"
        />
      ))}
    </HStack>
  );
};

export const CreateReviewModal = ({ 
  isOpen, 
  onClose, 
  objectType, 
  relatedObject, 
  relatedOrder, 
  onSuccess 
}) => {
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const categories = RATING_CATEGORIES[objectType] || RATING_CATEGORIES.default;

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate ratings
    const missingRatings = categories.filter(cat => !ratings[cat.key]);
    if (missingRatings.length > 0) {
      toast({
        title: 'Missing Ratings',
        description: `Please rate: ${missingRatings.map(c => c.label).join(', ')}`,
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please provide a comment for your review.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        object_type: objectType,
        related_object: relatedObject,
        comment: comment,
        ratings: ratings,
      };

      if (relatedOrder) {
        payload.related_order = relatedOrder;
      }

      await reviewService.createReview(payload);

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 3000,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      // Reset form
      setComment('');
      setRatings({});
    } catch (error) {
      console.error('Review submission error:', error);
      // Error is handled by service/api interceptor usually, but we can show toast if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>Write a Review</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontWeight="medium" mb={4}>Rate your experience</Text>
              <SimpleGrid columns={1} spacing={4}>
                {categories.map((category) => (
                  <HStack key={category.key} justify="space-between">
                    <Text fontSize="sm" color="gray.600">{category.label}</Text>
                    <StarRating
                      rating={ratings[category.key] || 0}
                      setRating={(val) => handleRatingChange(category.key, val)}
                      size={20}
                    />
                  </HStack>
                ))}
              </SimpleGrid>
            </Box>

            <FormControl>
              <FormLabel>Your Review</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                resize="none"
                focusBorderColor="#F4A950"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            bg="#F4A950"
            _hover={{ bg: "#E09940" }}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!comment.trim() || Object.keys(ratings).length < categories.length}
          >
            Submit Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
