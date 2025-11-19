import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Badge,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Radio,
  RadioGroup,
  Stack,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  IconButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, Camera, Trash2 } from 'lucide-react';
import { CONDITION_RATINGS, inspectionService } from '../services';
import PhotoUpload from './PhotoUpload';

/**
 * InspectionForm Component
 * Dynamic form for vehicle inspections based on form schema
 */
const InspectionForm = ({ 
  inspectionId,
  slipReference,
  onSubmit, 
  initialData = {}, 
  isLoading = false 
}) => {
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const toast = useToast();

  // Fetch form schema on component mount
  useEffect(() => {
    const fetchFormSchema = async () => {
      try {
        setIsLoadingSchema(true);
        setSchemaError(null);
        const schema = await inspectionService.getFormSchema();
        setFormSchema(schema);
        
        // Initialize form data based on schema
        const initialFormData = {};
        schema.sections.forEach(section => {
          initialFormData[section.name] = {};
          section.fields.forEach(field => {
            initialFormData[section.name][field.name] = 
              initialData?.[section.name]?.[field.name] || '';
          });
        });
        
        // Add notes and recommendations
        initialFormData.notes = initialData?.notes || '';
        initialFormData.recommendations = initialData?.recommendations || '';
        
        setFormData(initialFormData);
      } catch (error) {
        console.error('Failed to fetch form schema:', error);
        setSchemaError(error.message || 'Failed to load inspection form. Please try again.');
        toast({
          title: 'Error Loading Form',
          description: 'Failed to load inspection form schema. Please refresh the page.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingSchema(false);
      }
    };

    fetchFormSchema();
  }, [initialData, toast]);

  // Fetch uploaded photos
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!inspectionId) return;
      
      try {
        setIsLoadingPhotos(true);
        const photos = await inspectionService.getPhotos(inspectionId);
        setUploadedPhotos(photos || []);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        // Don't show error toast for photos, just log it
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [inspectionId]);

  // Get sections from schema or use default
  const sections = formSchema?.sections || [];

  const conditionOptions = [
    { value: CONDITION_RATINGS.EXCELLENT, label: 'Excellent', color: 'green' },
    { value: CONDITION_RATINGS.GOOD, label: 'Good', color: 'blue' },
    { value: CONDITION_RATINGS.FAIR, label: 'Fair', color: 'orange' },
    { value: CONDITION_RATINGS.POOR, label: 'Poor', color: 'red' },
  ];

  const handleFieldChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUploadComplete = (photo) => {
    setUploadedPhotos(prev => [...prev, photo]);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await inspectionService.deletePhoto(inspectionId, photoId);
      setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
      toast({
        title: 'Photo Deleted',
        description: 'Photo deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete photo. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getPhotosByCategory = (category) => {
    return uploadedPhotos.filter(photo => photo.category === category);
  };

  const validateSection = (sectionName) => {
    const section = sections.find(s => s.name === sectionName);
    if (!section) return true;
    
    const errors = {};
    section.fields.forEach(field => {
      if (field.required && (!formData[sectionName]?.[field.name] || formData[sectionName][field.name] === '')) {
        errors[field.name] = `${field.label} is required`;
      }
      
      // Additional validation rules
      if (field.validation && formData[sectionName]?.[field.name]) {
        field.validation.forEach(rule => {
          if (rule.type === 'minLength' && formData[sectionName][field.name].length < rule.value) {
            errors[field.name] = `${field.label} must be at least ${rule.value} characters`;
          }
          if (rule.type === 'maxLength' && formData[sectionName][field.name].length > rule.value) {
            errors[field.name] = `${field.label} must be at most ${rule.value} characters`;
          }
        });
      }
    });
    
    setValidationErrors(prev => ({
      ...prev,
      [sectionName]: errors
    }));
    
    return Object.keys(errors).length === 0;
  };

  const isSectionComplete = (sectionName) => {
    const section = sections.find(s => s.name === sectionName);
    if (!section) return false;
    
    return section.fields.every(field => {
      if (!field.required) return true;
      return formData[sectionName]?.[field.name] && formData[sectionName][field.name] !== '';
    });
  };

  const getProgress = () => {
    const completedSections = sections.filter(s => isSectionComplete(s.key)).length;
    return (completedSections / sections.length) * 100;
  };

  const handleNext = () => {
    const currentSectionData = sections[currentSection];
    if (currentSectionData && !validateSection(currentSectionData.name)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields before proceeding.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    // Validate all sections
    let hasErrors = false;
    sections.forEach(section => {
      if (!validateSection(section.name)) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields before submitting.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (onSubmit) {
      const submissionData = {
        inspection_id: inspectionId,
        slip_reference: slipReference,
        ...formData,
      };
      onSubmit(submissionData);
    }
  };

  const renderField = (section, field) => {
    const fieldValue = formData[section.name]?.[field.name] || '';
    const fieldError = validationErrors[section.name]?.[field.name];
    
    switch (field.type) {
      case 'select':
        return (
          <FormControl key={field.name} isRequired={field.required} isInvalid={!!fieldError}>
            <FormLabel>{field.label}</FormLabel>
            <Select
              value={fieldValue}
              onChange={(e) => handleFieldChange(section.name, field.name, e.target.value)}
              placeholder={`Select ${field.label.toLowerCase()}`}
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {fieldError && <Text color="red.500" fontSize="sm" mt={1}>{fieldError}</Text>}
          </FormControl>
        );
      
      case 'textarea':
        return (
          <FormControl key={field.name} isRequired={field.required} isInvalid={!!fieldError}>
            <FormLabel>{field.label}</FormLabel>
            <Textarea
              value={fieldValue}
              onChange={(e) => handleFieldChange(section.name, field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={4}
            />
            {fieldError && <Text color="red.500" fontSize="sm" mt={1}>{fieldError}</Text>}
          </FormControl>
        );
      
      case 'radio':
        return (
          <FormControl key={field.name} isRequired={field.required} isInvalid={!!fieldError}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={fieldValue}
              onChange={(value) => handleFieldChange(section.name, field.name, value)}
            >
              <Stack direction="row" spacing={4}>
                {field.options?.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            {fieldError && <Text color="red.500" fontSize="sm" mt={1}>{fieldError}</Text>}
          </FormControl>
        );
      
      case 'text':
      default:
        return (
          <FormControl key={field.name} isRequired={field.required} isInvalid={!!fieldError}>
            <FormLabel>{field.label}</FormLabel>
            <Input
              value={fieldValue}
              onChange={(e) => handleFieldChange(section.name, field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {fieldError && <Text color="red.500" fontSize="sm" mt={1}>{fieldError}</Text>}
          </FormControl>
        );
    }
  };

  // Show loading state
  if (isLoadingSchema) {
    return (
      <VStack spacing={4} align="center" py={10}>
        <Spinner size="xl" color="blue.500" />
        <Text>Loading inspection form...</Text>
      </VStack>
    );
  }

  // Show error state
  if (schemaError) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Error Loading Form</AlertTitle>
          <AlertDescription>{schemaError}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  // Show empty state if no sections
  if (!sections || sections.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>No Form Available</AlertTitle>
          <AlertDescription>No inspection form schema is available.</AlertDescription>
        </Box>
      </Alert>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <VStack spacing={6} align="stretch">
      {/* Progress Bar */}
      <Box>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            Inspection Progress
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="blue.500">
            {Math.round(getProgress())}%
          </Text>
        </HStack>
        <Progress value={getProgress()} colorScheme="blue" size="sm" borderRadius="full" />
      </Box>

      {/* Section Navigation */}
      <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2}>
        {sections.map((section, index) => (
          <Button
            key={section.name}
            size="sm"
            variant={currentSection === index ? 'solid' : 'outline'}
            colorScheme={isSectionComplete(section.name) ? 'green' : 'gray'}
            onClick={() => setCurrentSection(index)}
            leftIcon={isSectionComplete(section.name) ? <CheckCircle size={14} /> : null}
          >
            {section.label}
          </Button>
        ))}
      </SimpleGrid>

      {/* Current Section Form */}
      <Card>
        <CardHeader>
          <Heading size="md">
            {currentSectionData.label}
          </Heading>
        </CardHeader>
        <CardBody>
          <Tabs colorScheme="blue">
            <TabList>
              <Tab>Form Fields</Tab>
              <Tab>
                <HStack spacing={2}>
                  <Camera size={16} />
                  <Text>Photos</Text>
                  {getPhotosByCategory(currentSectionData.name).length > 0 && (
                    <Badge colorScheme="blue" borderRadius="full">
                      {getPhotosByCategory(currentSectionData.name).length}
                    </Badge>
                  )}
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Form Fields Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {currentSectionData.fields.map((field) => renderField(currentSectionData, field))}
                </SimpleGrid>
              </TabPanel>

              {/* Photos Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Photo Upload */}
                  <Box>
                    <Heading size="sm" mb={4}>Upload Photos</Heading>
                    <PhotoUpload
                      inspectionId={inspectionId}
                      category={currentSectionData.name}
                      onUploadComplete={handlePhotoUploadComplete}
                    />
                  </Box>

                  {/* Uploaded Photos Display */}
                  {getPhotosByCategory(currentSectionData.name).length > 0 && (
                    <Box>
                      <Heading size="sm" mb={4}>
                        Uploaded Photos ({getPhotosByCategory(currentSectionData.name).length})
                      </Heading>
                      <Wrap spacing={4}>
                        {getPhotosByCategory(currentSectionData.name).map((photo) => (
                          <WrapItem key={photo.id}>
                            <Card maxW="200px">
                              <CardBody p={2}>
                                <VStack spacing={2}>
                                  <Image
                                    src={photo.thumbnail || photo.url}
                                    alt={photo.description || 'Inspection photo'}
                                    borderRadius="md"
                                    objectFit="cover"
                                    w="full"
                                    h="150px"
                                  />
                                  {photo.description && (
                                    <Text fontSize="xs" noOfLines={2}>
                                      {photo.description}
                                    </Text>
                                  )}
                                  <IconButton
                                    icon={<Trash2 size={16} />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    aria-label="Delete photo"
                                    w="full"
                                  />
                                </VStack>
                              </CardBody>
                            </Card>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}

                  {getPhotosByCategory(currentSectionData.name).length === 0 && (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text>No photos uploaded for this section yet.</Text>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Navigation Buttons */}
      <HStack justify="space-between">
        <Button
          onClick={handlePrevious}
          isDisabled={currentSection === 0}
          variant="outline"
        >
          Previous
        </Button>

        <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
          Section {currentSection + 1} of {sections.length}
        </Badge>

        {currentSection < sections.length - 1 ? (
          <Button onClick={handleNext} colorScheme="blue">
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            colorScheme="green"
            isLoading={isLoading}
            loadingText="Submitting..."
          >
            Submit Inspection
          </Button>
        )}
      </HStack>
    </VStack>
  );
};

export default InspectionForm;
