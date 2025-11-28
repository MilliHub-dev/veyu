import { useState } from 'react';
import {
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  SimpleGrid,
  Box,
  Image,
  Text,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import inspectionService from '../../services/inspectionService';

const PHOTO_CATEGORIES = [
  { value: 'exterior_front', label: 'Exterior - Front View' },
  { value: 'exterior_rear', label: 'Exterior - Rear View' },
  { value: 'exterior_left', label: 'Exterior - Left Side' },
  { value: 'exterior_right', label: 'Exterior - Right Side' },
  { value: 'interior_dashboard', label: 'Interior - Dashboard' },
  { value: 'interior_seats', label: 'Interior - Seats' },
  { value: 'engine_bay', label: 'Engine Bay' },
  { value: 'tires_wheels', label: 'Tires and Wheels' },
  { value: 'damage_detail', label: 'Damage Detail' },
  { value: 'documents', label: 'Vehicle Documents' },
  { value: 'other', label: 'Other' },
];

const InspectionPhotos = ({ inspectionId, photos = [], onUpdate }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('exterior_front');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a photo to upload',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    try {
      await inspectionService.uploadPhoto(inspectionId, {
        category,
        image: selectedFile,
        description,
      });

      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setSelectedFile(null);
      setCategory('exterior_front');
      setDescription('');
      document.getElementById('photo-upload').value = '';

      // Refresh photos
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await inspectionService.deletePhoto(inspectionId, photoId);
      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
        status: 'success',
        duration: 3000,
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete photo',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handlePreview = (photo) => {
    setPreviewPhoto(photo);
    onOpen();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Upload Form */}
      <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Category</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {PHOTO_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Photo</FormLabel>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              p={1}
            />
            <Text fontSize="xs" color="gray.600" mt={1}>
              Max file size: 5MB
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>Description (Optional)</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this photo"
              rows={2}
            />
          </FormControl>

          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading..."
            isDisabled={!selectedFile}
          >
            Upload Photo
          </Button>
        </VStack>
      </Box>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={8}>
          No photos uploaded yet
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {photos.map((photo) => (
            <Box
              key={photo.id}
              borderWidth={1}
              borderRadius="md"
              overflow="hidden"
              position="relative"
            >
              <Image
                src={photo.image}
                alt={photo.description || photo.category}
                objectFit="cover"
                h="200px"
                w="100%"
              />
              <Box p={3}>
                <Text fontWeight="semibold" fontSize="sm">
                  {PHOTO_CATEGORIES.find((c) => c.value === photo.category)?.label || photo.category}
                </Text>
                {photo.description && (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    {photo.description}
                  </Text>
                )}
                <HStack mt={2} spacing={2}>
                  <IconButton
                    icon={<ViewIcon />}
                    size="sm"
                    onClick={() => handlePreview(photo)}
                    aria-label="View photo"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(photo.id)}
                    aria-label="Delete photo"
                  />
                </HStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {previewPhoto && (
              PHOTO_CATEGORIES.find((c) => c.value === previewPhoto.category)?.label || previewPhoto.category
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {previewPhoto && (
              <VStack spacing={4}>
                <Image src={previewPhoto.image} alt={previewPhoto.description} w="100%" />
                {previewPhoto.description && (
                  <Text fontSize="sm" color="gray.600">
                    {previewPhoto.description}
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default InspectionPhotos;
