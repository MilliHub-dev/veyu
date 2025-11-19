import { useState, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  SimpleGrid,
  Card,
  CardBody,
  Progress,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { inspectionService, PHOTO_CATEGORIES } from '../services';

/**
 * PhotoUpload Component
 * Handles drag-and-drop photo uploads for inspections
 */
const PhotoUpload = ({ 
  inspectionId, 
  category = '', 
  onUploadComplete,
  maxPhotos = 10 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Photo category options
  const categoryOptions = [
    { value: PHOTO_CATEGORIES.EXTERIOR_FRONT, label: 'Exterior - Front' },
    { value: PHOTO_CATEGORIES.EXTERIOR_REAR, label: 'Exterior - Rear' },
    { value: PHOTO_CATEGORIES.EXTERIOR_LEFT, label: 'Exterior - Left' },
    { value: PHOTO_CATEGORIES.EXTERIOR_RIGHT, label: 'Exterior - Right' },
    { value: PHOTO_CATEGORIES.INTERIOR_DASHBOARD, label: 'Interior - Dashboard' },
    { value: PHOTO_CATEGORIES.INTERIOR_SEATS, label: 'Interior - Seats' },
    { value: PHOTO_CATEGORIES.ENGINE_BAY, label: 'Engine Bay' },
    { value: PHOTO_CATEGORIES.TRUNK, label: 'Trunk' },
    { value: PHOTO_CATEGORIES.WHEELS, label: 'Wheels' },
    { value: PHOTO_CATEGORIES.UNDERCARRIAGE, label: 'Undercarriage' },
    { value: PHOTO_CATEGORIES.DAMAGE, label: 'Damage' },
    { value: PHOTO_CATEGORIES.OTHER, label: 'Other' },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file (JPG, PNG, GIF)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a photo to upload',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: 'Category Required',
        description: 'Please select a photo category',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('category', selectedCategory);
      if (description) {
        formData.append('description', description);
      }

      const result = await inspectionService.uploadPhotoFrontend(inspectionId, formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: 'Photo Uploaded',
        description: 'Photo uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      handleClearSelection();
      setDescription('');
      setSelectedCategory(category);

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload photo. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Category Selection */}
      <FormControl isRequired>
        <FormLabel>Photo Category</FormLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          placeholder="Select category"
          isDisabled={isUploading}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Drag and Drop Area */}
      <Box
        border="2px dashed"
        borderColor={isDragging ? 'blue.500' : 'gray.300'}
        borderRadius="md"
        p={8}
        textAlign="center"
        bg={isDragging ? 'blue.50' : 'gray.50'}
        cursor="pointer"
        transition="all 0.2s"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {previewUrl ? (
          <VStack spacing={3}>
            <Image
              src={previewUrl}
              alt="Preview"
              maxH="200px"
              borderRadius="md"
              objectFit="contain"
            />
            <HStack>
              <Badge colorScheme="green">{selectedFile?.name}</Badge>
              <IconButton
                icon={<X size={16} />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
                aria-label="Remove photo"
              />
            </HStack>
          </VStack>
        ) : (
          <VStack spacing={3}>
            <ImageIcon size={48} color="gray" />
            <Text fontWeight="medium" color="gray.600">
              Drag and drop a photo here, or click to select
            </Text>
            <Text fontSize="sm" color="gray.500">
              Supports: JPG, PNG, GIF (Max 5MB)
            </Text>
          </VStack>
        )}
      </Box>

      {/* Description Input */}
      <FormControl>
        <FormLabel>Photo Description (Optional)</FormLabel>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this photo"
          isDisabled={isUploading}
        />
      </FormControl>

      {/* Upload Progress */}
      {isUploading && (
        <Box>
          <Text fontSize="sm" mb={2} color="gray.600">
            Uploading... {uploadProgress}%
          </Text>
          <Progress value={uploadProgress} colorScheme="blue" size="sm" borderRadius="full" />
        </Box>
      )}

      {/* Upload Button */}
      <Button
        leftIcon={<Upload size={18} />}
        colorScheme="blue"
        onClick={handleUpload}
        isLoading={isUploading}
        loadingText="Uploading..."
        isDisabled={!selectedFile || !selectedCategory}
      >
        Upload Photo
      </Button>
    </VStack>
  );
};

export default PhotoUpload;
