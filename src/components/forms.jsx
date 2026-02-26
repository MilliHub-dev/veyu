import {
  Box,
  Container,
  VStack,
  HStack,
  Flex,
  Text,
  Tag, TagLabel,
  TagCloseButton,
  Button,
  Input,
  Select,
  Image,
  IconButton,
  ButtonGroup,
  Progress,
  Textarea,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputLeftAddon,
  InputRightAddon,
  // FadeIn,
  Badge,
  useToast,
  Link,
  Avatar,
  Heading,
  SimpleGrid,
  UnorderedList,
  ListItem,
  Icon,
} from "@chakra-ui/react";
import {CloseIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, CheckIcon} from "@chakra-ui/icons";
import {BackButton} from './nav';
import {GlobalStore} from '../App';
import { getBrandNames, getModelsForBrand } from '../data/vehicleBrands';
import {objectifyJSON, formatCurrency} from '../utils';
import { 
  ArrowLeft, DeleteIcon, Upload, AlertTriangle, Zap, Clock, Settings, 
  MessageCircle, Bell, MapPin, CheckCircle, Eye, Shield, Star, Calendar
} from "lucide-react"
import { useState, useEffect, useContext, useRef } from "react";


// Review Component
export function ListingReviewCard({ formData }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = formData?.images || formData?.vehicle?.images || [];
  
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <VStack spacing={8} align="stretch" maxW="800px" mx="auto">
      {/* Main Listing Preview Card */}
      <Box
        borderWidth={2}
        borderRadius="2xl"
        overflow="hidden"
        borderColor="#F4A950"
        bg="white"
        shadow="2xl"
        position="relative"
        _hover={{
          shadow: "3xl",
          transform: "translateY(-4px)",
          transition: "all 0.3s ease"
        }}
        transition="all 0.3s ease"
      >
        {/* Image Section with Gallery */}
        <Box position="relative" h="400px" bg="gray.100">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]?.previewUrl || images[currentImageIndex]?.url || "/placeholder.svg"}
                alt="Vehicle preview"
                w="full"
                h="full"
                objectFit="cover"
                transition="all 0.3s ease"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <IconButton
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    icon={<ChevronLeftIcon />}
                    onClick={prevImage}
                    bg="whiteAlpha.900"
                    color="gray.800"
                    _hover={{ bg: "white", transform: "translateY(-50%) scale(1.1)" }}
                    borderRadius="full"
                    size="lg"
                    shadow="lg"
                  />
                  <IconButton
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    icon={<ChevronRightIcon />}
                    onClick={nextImage}
                    bg="whiteAlpha.900"
                    color="gray.800"
                    _hover={{ bg: "white", transform: "translateY(-50%) scale(1.1)" }}
                    borderRadius="full"
                    size="lg"
                    shadow="lg"
                  />
                  
                  {/* Image Counter */}
                  <Badge
                    position="absolute"
                    bottom={4}
                    right={4}
                    bg="blackAlpha.700"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    {currentImageIndex + 1} / {images.length}
                  </Badge>
                </>
              )}
              
              {/* Condition Badge */}
              <Badge
                position="absolute"
                top={4}
                left={4}
                bg="white"
                color="gray.700"
                px={4}
                py={2}
                borderRadius="full"
                fontWeight="bold"
                fontSize="sm"
                textTransform="uppercase"
                shadow="md"
              >
                {formData?.vehicle?.condition || formData?.condition || 'New'}
              </Badge>
            </>
          ) : (
            <Flex align="center" justify="center" h="full" bg="gray.50">
              <VStack spacing={4} color="gray.400">
                <Box fontSize="4xl">📷</Box>
                <Text>No images uploaded</Text>
              </VStack>
            </Flex>
          )}
        </Box>

        {/* Content Section */}
        <Box p={8}>
          {/* Title and Price */}
          <Flex justify="space-between" align="start" mb={6}>
            <VStack align="start" spacing={2} flex={1}>
              <Heading size="lg" color="gray.800" noOfLines={2}>
                {formData?.title || `${formData?.vehicle?.make} ${formData?.vehicle?.model} ${formData?.vehicle?.year}`}
              </Heading>
              <HStack spacing={3}>
                <Badge 
                  colorScheme="orange" 
                  variant="subtle" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  fontSize="sm"
                >
                  {formData?.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </Badge>
                {formData?.vehicle?.custom_duty && (
                  <Badge 
                    colorScheme="purple" 
                    variant="solid" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontSize="sm"
                  >
                    ✓ Custom Duty
                  </Badge>
                )}
              </HStack>
            </VStack>
            
            <VStack align="end" spacing={1} ml={4}>
              <Text fontSize="3xl" fontWeight="bold" color="#F4A950">
                {formatCurrency(formData?.price || 0, formData?.currency)}
              </Text>
              {formData?.listing_type === 'rental' && (
                <Text fontSize="sm" color="gray.500">
                  per {formData?.payment_cycle || 'day'}
                </Text>
              )}
              <HStack spacing={1} fontSize="sm" color="green.600">
                <Icon as={InfoIcon} />
                <Text>+0.5% platform fee</Text>
              </HStack>
            </VStack>
          </Flex>

          {/* Vehicle Specifications */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
            <VStack spacing={2} align="center" p={4} bg="gray.50" borderRadius="xl">
              <Icon as={Clock} color="#F4A950" boxSize={6} />
              <Text fontSize="sm" color="gray.600" textAlign="center">Mileage</Text>
              <Text fontWeight="bold" fontSize="lg">
                {Number(formData?.vehicle?.mileage || formData?.mileage || 0).toLocaleString()} mi
              </Text>
            </VStack>
            
            <VStack spacing={2} align="center" p={4} bg="gray.50" borderRadius="xl">
              <Icon as={Settings} color="#F4A950" boxSize={6} />
              <Text fontSize="sm" color="gray.600" textAlign="center">Transmission</Text>
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                {formData?.vehicle?.transmission || formData?.transmission || 'Automatic'}
              </Text>
            </VStack>
            
            <VStack spacing={2} align="center" p={4} bg="gray.50" borderRadius="xl">
              <Icon as={Zap} color="#F4A950" boxSize={6} />
              <Text fontSize="sm" color="gray.600" textAlign="center">Fuel Type</Text>
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                {formData?.vehicle?.fuel_system || formData?.fuel_system || 'Petrol'}
              </Text>
            </VStack>
            
            <VStack spacing={2} align="center" p={4} bg="gray.50" borderRadius="xl">
              <Icon as={Calendar} color="#F4A950" boxSize={6} />
              <Text fontSize="sm" color="gray.600" textAlign="center">Year</Text>
              <Text fontWeight="bold" fontSize="lg">
                {formData?.vehicle?.year || formData?.year || '2020'}
              </Text>
            </VStack>
          </SimpleGrid>

          {/* Location and Additional Info */}
          <HStack justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={2} color="gray.600">
              <Icon as={MapPin} />
              <Text fontSize="sm">
                {formData?.location || 'Abuja, Nigeria'}
              </Text>
            </HStack>
            
            <HStack spacing={4}>
              <Badge 
                colorScheme="blue" 
                display="flex" 
                alignItems="center" 
                gap={1}
                px={3}
                py={1}
                borderRadius="full"
              >
                <Icon as={CheckCircle} boxSize={3} />
                <Text fontSize="xs">Verified Dealer</Text>
              </Badge>
              
              <HStack spacing={1} fontSize="sm" color="gray.500">
                <Icon as={Eye} boxSize={4} />
                <Text>Preview Mode</Text>
              </HStack>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Review Process Information */}
      <Box
        p={6}
        bg="orange.50"
        borderRadius="2xl"
        borderLeft="6px solid"
        borderLeftColor="#F4A950"
        shadow="md"
      >
        <HStack spacing={4} align="start">
          <Box
            p={3}
            bg="#F4A950"
            borderRadius="full"
            color="white"
          >
            <AlertTriangle size={24} />
          </Box>
          
          <VStack align="start" spacing={4} flex={1}>
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={2}>
                Listing Review Process
              </Text>
              <Text color="gray.600" mb={4}>
                Your listing will be reviewed by our team within 2-24 hours to ensure quality and accuracy.
              </Text>
            </Box>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
              <VStack spacing={2} align="start" p={4} bg="white" borderRadius="xl" shadow="sm">
                <Icon as={Shield} color="green.500" boxSize={5} />
                <Text fontWeight="semibold" fontSize="sm">Quality Assurance</Text>
                <Text fontSize="xs" color="gray.600">
                  Prevent duplicate and invalid listings
                </Text>
              </VStack>
              
              <VStack spacing={2} align="start" p={4} bg="white" borderRadius="xl" shadow="sm">
                <Icon as={CheckCircle} color="blue.500" boxSize={5} />
                <Text fontWeight="semibold" fontSize="sm">Vehicle Verification</Text>
                <Text fontSize="xs" color="gray.600">
                  Ensure authenticity and accuracy
                </Text>
              </VStack>
              
              <VStack spacing={2} align="start" p={4} bg="white" borderRadius="xl" shadow="sm">
                <Icon as={Star} color="#F4A950" boxSize={5} />
                <Text fontWeight="semibold" fontSize="sm">Trust Building</Text>
                <Text fontSize="xs" color="gray.600">
                  Increase customer confidence
                </Text>
              </VStack>
            </SimpleGrid>
            
            <HStack spacing={4} pt={2}>
              <Badge colorScheme="orange" variant="subtle" px={3} py={1} borderRadius="full">
                ⏱️ Review Time: 2-24 hours
              </Badge>
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                📧 Email notifications enabled
              </Badge>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Image Gallery Thumbnails */}
      {images.length > 1 && (
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
            Image Gallery ({images.length} photos)
          </Text>
          <SimpleGrid columns={{ base: 3, md: 6 }} spacing={3}>
            {images.map((image, index) => (
              <Box
                key={index}
                position="relative"
                cursor="pointer"
                onClick={() => setCurrentImageIndex(index)}
                borderRadius="lg"
                overflow="hidden"
                border="3px solid"
                borderColor={index === currentImageIndex ? "#F4A950" : "transparent"}
                _hover={{
                  borderColor: "#F4A950",
                  transform: "scale(1.05)",
                  transition: "all 0.2s"
                }}
                transition="all 0.2s"
              >
                <Image
                  src={image?.previewUrl || image?.url}
                  alt={`Vehicle image ${index + 1}`}
                  w="full"
                  h="80px"
                  objectFit="cover"
                />
                {index === currentImageIndex && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="#F4A950"
                    color="white"
                    borderRadius="full"
                    p={1}
                  >
                    <CheckIcon boxSize={3} />
                  </Box>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  )
}


// Step Indicator Component
export function StepIndicator({ steps, currentStep }) {
  
  return (
    <Box w="full" maxW="600px" mx="auto" mb={8}>
      <HStack justify="space-between" mb={2}>
        {steps.map((step, index) => (
          <VStack key={index} spacing={2}>
            <Box
             w={'25px'} h={'25px'}
             borderRadius="full"
             placeItems="center"
             placeContent="center"
             borderColor={index <= currentStep ? "primary" : "gray.200"}
             borderWidth={'2px'}
            >
              <Box
               w={3} h={3}
               borderRadius="full"
               bg={index <= currentStep ? "primary" : "gray.200"}
              />
            </Box>
            <Text
              fontSize="sm"
              color={index <= currentStep ? "black" : "gray.500"}
              fontWeight={index === currentStep ? "medium" : "normal"}
            >
              {step}
            </Text>
          </VStack>
        ))}
      </HStack>
      <Progress value={(currentStep / (steps.length - 1)) * 100} size="xs" colorScheme="blue" />
    </Box>
  )
}


// Document Upload Component
export function DocumentUploader({ title, description, data, onUpload, maxFileSize=2000 }) {
  const [uploads, setUploads] = useState([]);

  function removeItem(item) {
    let all = uploads;
    let idx = all.indexOf(item)
    all.splice(idx, 1)
    setUploads([...all]);
    onUpload([...all]);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleFileDrop(e) {
    e.preventDefault();
    if (uploads.length < 12){
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  async function uploadFile(file) {
    let previewUrl = URL.createObjectURL(file);
    const data = { file, previewUrl };
    let allUploads = [...uploads, data];
    setUploads([...allUploads]);
    onUpload([...allUploads]);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (uploads.length < 12){
      let files = Array.from(e.target.files).slice(0, (12 - uploads.length));
      const fileData = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));

      let allUploads = [...uploads, ...fileData];
      setUploads([...allUploads]);
      onUpload([...allUploads]);
    }
  }

  useEffect(() => {

  }, [uploads])

  return (
    <VStack spacing={2} align="start" w="full" mb={8}>
      <Text fontWeight="medium">{title}</Text>
      <Link color="blue.500" fontSize="sm">
        See document upload guidelines
      </Link>
      <Box
        w="full"
        h="200px"
        borderWidth={2}
        borderStyle="dashed"
        borderRadius="lg"
        borderColor="gray.200"
        bg="gray.50"
        _hover={{ borderColor: "blue.500" }}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        cursor="pointer"
        onClick={() => document.getElementById(`upload-${title}`).click()}
        boxShadow="sm"
      >
        <VStack h="full" justify="center" spacing={2}>
          <Upload size={24} className="text-gray-400" />
          <Text color="blue.500" fontWeight="medium">
            Click to upload
          </Text>
          <Text fontSize="sm" color="gray.500">
            or drag and drop
          </Text>
          <Text fontSize="xs" color="gray.500">
            PDF, DOCX, XLSX, TXT, or JPG (max. {maxFileSize})
          </Text>
        </VStack>
        <Input multiple id={`upload-${title}`} type="file" hidden onChange={handleUpload} accept=".pdf,.docx,.txt" />
      </Box>
      <Box my={10} w="100%">
        {uploads?.map((file) => (
          <Box key={file.file.name || file.previewUrl} my={2} px={3} as={Flex} justifyContent="space-between" alignItems={'center'} py={2} width={'full'} borderWidth="1px" borderRadius="10px" borderColor="gray.200" bg="white" boxShadow="sm">
            <Text> {file.file.name} </Text>
            <IconButton onClick={() => removeItem(file)} colorScheme="red" variant="outline" borderRadius="full" icon={<DeleteIcon />} />
          </Box>
        ))}
      </Box>
    </VStack>
  );
}


// Image Upload Component
export function ImageUploader({ title, description, data, onUpload, limit=12 }) {
  const [uploads, setUploads] = useState(data || []);

  function removeItem(item) {
    let all = uploads;
    let idx = all.indexOf(item)
    all.splice(idx, 1)
    setUploads([...all]);
    onUpload([...all]);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleFileDrop(e) {
    e.preventDefault();
    if (uploads.length < limit){
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  async function uploadFile(file) {
    let previewUrl = URL.createObjectURL(file);
    const data = { file, previewUrl };
    let allUploads = [...uploads, data];
    setUploads([...allUploads]);
    onUpload([...allUploads]);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (uploads.length < 12){
      let files = Array.from(e.target.files).slice(0, (limit - uploads.length));
      const fileData = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));

      let allUploads = [...uploads, ...fileData];
      setUploads([...allUploads]);
      onUpload([...allUploads]);
    }
  }

  useEffect(() => {

  }, [uploads])

  return (
    <VStack spacing={2} align="start" w="full" mb={8}>
      <Text fontWeight="medium">Upload up to {limit} images {title} </Text>
      <Link color="blue.500" fontSize="sm">
        See image upload guidelines
      </Link>
      <Box
        w="full"
        h="200px"
        borderWidth={2}
        borderStyle="dashed"
        borderRadius="lg"
        borderColor="gray.200"
        bg="gray.50"
        _hover={{ borderColor: "blue.500" }}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        cursor="pointer"
        onClick={() => document.getElementById(`upload-${title}`).click()}
      >
        <VStack h="full" justify="center" spacing={2}>
          <Upload size={24} className="text-gray-400" />
          <Text color="blue.500" fontWeight="medium">
            Click to upload
          </Text>
          <Text fontSize="sm" color="gray.500">
            or drag and drop
          </Text>
          <Text fontSize="xs" color="gray.500">
            SVG, PNG, JPG or GIF (max. 800x400px)
          </Text>
        </VStack>
        <Input multiple id={`upload-${title}`} type="file" hidden onChange={handleUpload} accept="image/*" />
      </Box>
      
      <Flex gap={4} overflowX="auto" w="100%" flexWrap="nowrap" placeItems="center" py={1}>
        {uploads?.map((image, idx) => (
          <Box key={image.previewUrl} rounded={"lg"} minW={'200px'} maxW="200px" position="relative" bg="white" borderWidth="1px" borderColor="gray.200" boxShadow="sm">
            <Image h="140px" w={'100%'} mb={2} src={image?.previewUrl} borderRadius="10px" objectFit="cover" bg="gray.100" />
            <Badge bg="gray.200" color="primary" size="md" py="5px" px="12px" placeItems="center" position="absolute" top="5px" right="5px" borderRadius="full">{`${idx+1}`}</Badge>
            <IconButton onClick={() => removeItem(image)} colorScheme="red" position="absolute" bottom="15px" right="5px" borderRadius="full" size="sm" icon={<CloseIcon />} />
          </Box>
        ))}
      </Flex>
    </VStack>
  );
}

const CarFeatures = [
  'Air Conditioning', 'Keyless Entry', 'Car Play', 
  'Parking Camera', 'Android Auto', 'Baby Seat',
  'USB-C charging', 'Lane Assist', 'Auto-Drive', 'Sun Roof'
]

const CarBrands = [
  "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Buick",
  "Cadillac", "Chevrolet", "Chrysler", "Citroën", "Dodge", "Ferrari", "Fiat", "Ford",
  "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Innoson", "Jaguar", "Jeep", "Kia", "Lamborghini",
  "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz",
  "Mini", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "Ram", "Renault", "Rolls-Royce",
  "Saab", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"
]

// Car Details Form Component
export function CreateRentalForm({ formData, setFormData, vehicleCategory = 'car' }) {
  const [availableModels, setAvailableModels] = useState([]);
  const labelProps = { fontWeight: '600', color: 'gray.700' };
  const fieldProps = {
    bg: 'white',
    color: 'black',
    variant: 'outline',
    borderWidth: '1px',
    borderColor: 'gray.400',
    _placeholder: { color: 'gray.600', opacity: 1 },
    _hover: { borderColor: 'gray.500' },
    focusBorderColor: 'blue.400',
    _focusVisible: { borderColor: 'blue.400', boxShadow: '0 0 0 1px rgba(49,130,206,0.6)' },
  };
  const selectProps = { ...fieldProps, sx: { option: { backgroundColor: 'white', color: 'black' } } };

  const vehicleLabels = {
    car: { brand: 'Car Brand', model: 'Car Model', placeholder: 'eg Ford Focus Mini Edition' },
    bike: { brand: 'Bike Brand', model: 'Bike Model', placeholder: 'eg Yamaha R15 V3' },
    boat: { brand: 'Boat Brand', model: 'Boat Model', placeholder: 'eg Sea Ray Sundancer' },
    aircraft: { brand: 'Aircraft Brand', model: 'Aircraft Model', placeholder: 'eg Cessna 172' },
    uav: { brand: 'UAV Brand', model: 'UAV Model', placeholder: 'eg DJI Mavic 3' },
  };

  const labels = vehicleLabels[vehicleCategory] || vehicleLabels.car;
  const brandNames = getBrandNames(vehicleCategory);

  // Update available models when brand changes
  useEffect(() => {
    if (formData.brand) {
      const models = getModelsForBrand(vehicleCategory, formData.brand);
      setAvailableModels(models);
      if (formData.model && !models.includes(formData.model)) {
        setFormData({ ...formData, model: '' });
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.brand, vehicleCategory]);

  return (
    <VStack spacing={6} align="stretch" w="full">
      <FormControl isRequired>
        <FormLabel {...labelProps}>Listing Title</FormLabel>
        <Input
          placeholder={labels.placeholder}
          isRequired={true}
          name="title"
          value={formData.title}
          onInput={(e) => setFormData({ ...formData, title: e.target.value })}
          {...fieldProps}
        />
      </FormControl>

      <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>{labels.brand}</FormLabel>
          <Select
            placeholder={`Select ${labels.brand.toLowerCase()}`}
            isRequired={true}
            name="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
            {...selectProps}
          >
            {brandNames.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>{labels.model}</FormLabel>
          <Select
            placeholder={formData.brand ? `Select ${labels.model.toLowerCase()}` : `Select brand first`}
            isRequired={true}
            name="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            isDisabled={!formData.brand}
            {...selectProps}
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Rental Price</FormLabel>
          <InputGroup>
            <InputLeftAddon p={0} overflow="hidden" width="100px">
              <Select
                border="none"
                borderRadius={0}
                value={formData.currency || 'NGN'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                _focus={{ boxShadow: 'none' }}
                height="100%"
              >
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
              </Select>
            </InputLeftAddon>
            <Input
              type="number"
              isRequired={true}
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              {...fieldProps}
              borderTopLeftRadius={0}
              borderBottomLeftRadius={0}
            />
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Payment Cycle</FormLabel>
          <Select
           name="payment-cycle"
           isRequired
           value={formData.payment_cycle}
           onChange={(e) => setFormData({ ...formData, payment_cycle: e.target.value })}
           {...selectProps}
          >
            <option value='day'>Daily</option>
            <option value='week'>Weekly</option>
            <option value='month'>Monthly</option>
            <option value='year'>Annually</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>Condition</FormLabel>
          <Select
            placeholder="Choose condition"
            name="condition"
            isRequired={true}
            value={formData.condition || formData.usage}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value, usage: e.target.value })}
            {...selectProps}
          >
            <option value="new">New</option>
            <option value="local-used">Used (Local)</option>
            <option value="uk-used">Used (UK)</option>
            <option value="us-used">Used (US)</option>
            <option value="china-used">Used (China)</option>
          </Select>
        </FormControl>

        {vehicleCategory === 'car' && (
          <FormControl isRequired>
            <FormLabel {...labelProps}>VIN/Chassis Number</FormLabel>
            <Input
              placeholder="Enter Number..."
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              {...fieldProps}
            />
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel {...labelProps}>Year of Manufacture</FormLabel>
          <Select
            placeholder="Select year"
            isRequired={true}
            name="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            {...selectProps}
          >
            {Array.from({ length: 30 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Car-specific fields */}
        {vehicleCategory === 'car' && (
          <>
            <FormControl>
              <FormLabel {...labelProps}>Body Type <small>(optional)</small></FormLabel>
              <Select
                placeholder="Select Body Type"
                value={formData.body_type}
                name="body_type"
                onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                {...selectProps}
              >
                <option value="suv">SUV</option>
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="pickup">Pickup</option>
                <option value="van">Van/Minivan</option>
                <option value="wagon">Wagon</option>
                <option value="luxury">Luxury</option>
                <option value="sport">Sports Car</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Fuel System</FormLabel>
              <Select
                placeholder="Select fuel type"
                value={formData.fuel_system || formData.fuel}
                name="fuel_system"
                onChange={(e) => setFormData({ ...formData, fuel_system: e.target.value, fuel: e.target.value })}
                {...selectProps}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Transmission</FormLabel>
              <Select
                name="transmission"
                isRequired={true}
                placeholder="Select transmission"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                {...selectProps}
              >
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Mileage</FormLabel>
              <InputGroup>
                <Input
                  name="mileage"
                  isRequired={true}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  {...fieldProps}
                />
                <InputRightAddon>mi</InputRightAddon>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel {...labelProps}>Registration</FormLabel>
              <Select
                placeholder="Select registration"
                value={formData.registration}
                name="registration"
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                {...selectProps}
              >
                <option>Registered</option>
                <option>Unregistered</option>
              </Select>
            </FormControl>
          </>
        )}

        {/* Bike-specific fields */}
        {vehicleCategory === 'bike' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Capacity (cc)</FormLabel>
              <Input
                placeholder="eg 150cc"
                value={formData.engine_capacity}
                onChange={(e) => setFormData({ ...formData, engine_capacity: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Bike Type</FormLabel>
              <Select
                placeholder="Select bike type"
                value={formData.bike_type}
                onChange={(e) => setFormData({ ...formData, bike_type: e.target.value })}
                {...selectProps}
              >
                <option value="sport">Sport</option>
                <option value="cruiser">Cruiser</option>
                <option value="touring">Touring</option>
                <option value="off-road">Off-Road</option>
                <option value="scooter">Scooter</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Fuel System</FormLabel>
              <Select
                placeholder="Select fuel type"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel_system: e.target.value, fuel: e.target.value })}
                {...selectProps}
              >
                <option value="petrol">Petrol</option>
                <option value="electric">Electric</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Transmission</FormLabel>
              <Select
                placeholder="Select transmission"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                {...selectProps}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Mileage</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="0 km"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Saddle Height (inches)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 32.5"
                value={formData.saddle_height}
                onChange={(e) => setFormData({ ...formData, saddle_height: e.target.value })}
                {...fieldProps}
              />
            </FormControl>
          </>
        )}

        {/* Boat-specific fields */}
        {vehicleCategory === 'boat' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Boat Type</FormLabel>
              <Select
                placeholder="Select boat type"
                value={formData.boat_type}
                onChange={(e) => setFormData({ ...formData, boat_type: e.target.value })}
                {...selectProps}
              >
                <option value="sailboat">Sailboat</option>
                <option value="motorboat">Motorboat</option>
                <option value="yacht">Yacht</option>
                <option value="fishing">Fishing Boat</option>
                <option value="speedboat">Speedboat</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Length (feet)</FormLabel>
              <Input
                type="number"
                placeholder="eg 25"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Type</FormLabel>
              <Select
                placeholder="Select engine type"
                value={formData.engine_type}
                onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })}
                {...selectProps}
              >
                <option value="outboard">Outboard</option>
                <option value="inboard">Inboard</option>
                <option value="sterndrive">Sterndrive</option>
                <option value="jet">Jet Drive</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Hull Material</FormLabel>
              <Select
                placeholder="Select hull material"
                value={formData.hull_material}
                onChange={(e) => setFormData({ ...formData, hull_material: e.target.value })}
                {...selectProps}
              >
                <option value="fiberglass">Fiberglass</option>
                <option value="aluminum">Aluminum</option>
                <option value="wood">Wood</option>
                <option value="steel">Steel</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Passenger Capacity</FormLabel>
              <Input
                type="number"
                min={1}
                placeholder="eg 8"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Count</FormLabel>
              <Input
                type="number"
                min={1}
                placeholder="eg 2"
                value={formData.engine_count}
                onChange={(e) => setFormData({ ...formData, engine_count: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Propeller Type</FormLabel>
              <Input
                placeholder="eg Outboard"
                value={formData.propeller_type}
                onChange={(e) => setFormData({ ...formData, propeller_type: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Beam Width (feet)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 10.0"
                value={formData.beam_width}
                onChange={(e) => setFormData({ ...formData, beam_width: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Draft (feet)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 3.2"
                value={formData.draft}
                onChange={(e) => setFormData({ ...formData, draft: e.target.value })}
                {...fieldProps}
              />
            </FormControl>
          </>
        )}

        {/* Aircraft-specific fields */}
        {vehicleCategory === 'aircraft' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Aircraft Type</FormLabel>
              <Select
                placeholder="Select aircraft type"
                value={formData.aircraft_type}
                onChange={(e) => setFormData({ ...formData, aircraft_type: e.target.value })}
                {...selectProps}
              >
                <option value="single-engine">Single Engine</option>
                <option value="multi-engine">Multi Engine</option>
                <option value="jet">Jet</option>
                <option value="helicopter">Helicopter</option>
                <option value="ultralight">Ultralight</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Type</FormLabel>
              <Select
                placeholder="Select engine type"
                value={formData.engine_type}
                onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })}
                {...selectProps}
              >
                <option value="piston">Piston</option>
                <option value="turboprop">Turboprop</option>
                <option value="turbojet">Turbojet</option>
                <option value="turbofan">Turbofan</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Total Flight Hours</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 1500"
                value={formData.total_hours}
                onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Passenger Capacity</FormLabel>
              <Input
                type="number"
                min={1}
                placeholder="eg 4"
                value={formData.passenger_capacity}
                onChange={(e) => setFormData({ ...formData, passenger_capacity: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl>
              <FormLabel {...labelProps}>Registration Number</FormLabel>
              <Input
                placeholder="eg N12345"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Wing Span (feet)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 117.0"
                value={formData.wing_span}
                onChange={(e) => setFormData({ ...formData, wing_span: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Range (miles)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 3000"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                {...fieldProps}
              />
            </FormControl>
          </>
        )}

        {/* UAV-specific fields */}
        {vehicleCategory === 'uav' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>UAV Type</FormLabel>
              <Select
                placeholder="Select UAV type"
                value={formData.uav_type}
                onChange={(e) => setFormData({ ...formData, uav_type: e.target.value })}
                {...selectProps}
              >
                <option value="quadcopter">Quadcopter</option>
                <option value="fixed-wing">Fixed Wing</option>
                <option value="hexacopter">Hexacopter</option>
                <option value="octocopter">Octocopter</option>
                <option value="vtol">VTOL</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Purpose</FormLabel>
              <Select
                placeholder="Select purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                {...selectProps}
              >
                <option value="photography">Photography</option>
                <option value="surveillance">Surveillance</option>
                <option value="mapping">Mapping</option>
                <option value="agriculture">Agriculture</option>
                <option value="inspection">Inspection</option>
                <option value="racing">Racing</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Max Flight Time (minutes)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 30"
                value={formData.max_flight_time}
                onChange={(e) => setFormData({ ...formData, max_flight_time: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Max Range (meters)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 5000"
                value={formData.max_range}
                onChange={(e) => setFormData({ ...formData, max_range: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Camera Resolution</FormLabel>
              <Input
                placeholder="eg 4K"
                value={formData.camera_resolution}
                onChange={(e) => setFormData({ ...formData, camera_resolution: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Obstacle Avoidance</FormLabel>
              <Select
                placeholder="Select option"
                value={formData.has_obstacle_avoidance}
                onChange={(e) => setFormData({ ...formData, has_obstacle_avoidance: e.target.value === 'true' })}
                {...selectProps}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>GPS</FormLabel>
              <Select
                placeholder="Select option"
                value={formData.has_gps}
                onChange={(e) => setFormData({ ...formData, has_gps: e.target.value === 'true' })}
                {...selectProps}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Return to Home</FormLabel>
              <Select
                placeholder="Select option"
                value={formData.has_return_to_home}
                onChange={(e) => setFormData({ ...formData, has_return_to_home: e.target.value === 'true' })}
                {...selectProps}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormControl>
          </>
        )}

        {/* UAV-specific fields */}
        {vehicleCategory === 'uav' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>UAV Type</FormLabel>
              <Select
                placeholder="Select UAV type"
                value={formData.uav_type}
                onChange={(e) => setFormData({ ...formData, uav_type: e.target.value })}
                {...selectProps}
              >
                <option value="quadcopter">Quadcopter</option>
                <option value="fixed-wing">Fixed Wing</option>
                <option value="hexacopter">Hexacopter</option>
                <option value="octocopter">Octocopter</option>
                <option value="vtol">VTOL</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Purpose</FormLabel>
              <Select
                placeholder="Select purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                {...selectProps}
              >
                <option value="photography">Photography</option>
                <option value="surveillance">Surveillance</option>
                <option value="mapping">Mapping</option>
                <option value="agriculture">Agriculture</option>
                <option value="inspection">Inspection</option>
                <option value="racing">Racing</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Max Flight Time (minutes)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 30"
                value={formData.max_flight_time}
                onChange={(e) => setFormData({ ...formData, max_flight_time: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Max Range (meters)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 5000"
                value={formData.max_range}
                onChange={(e) => setFormData({ ...formData, max_range: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Camera Resolution</FormLabel>
              <Input
                placeholder="eg 4K"
                value={formData.camera_resolution}
                onChange={(e) => setFormData({ ...formData, camera_resolution: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Obstacle Avoidance</FormLabel>
              <Select
                placeholder="Select option"
                value={formData.has_obstacle_avoidance}
                onChange={(e) => setFormData({ ...formData, has_obstacle_avoidance: e.target.value === 'true' })}
                {...selectProps}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>GPS</FormLabel>
              <Select
                placeholder="Select option"
                value={formData.has_gps}
                onChange={(e) => setFormData({ ...formData, has_gps: e.target.value === 'true' })}
                {...selectProps}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Return to Home</FormLabel>
              <Select
                placeholder="Select option"
                value={formData.has_return_to_home}
                onChange={(e) => setFormData({ ...formData, has_return_to_home: e.target.value === 'true' })}
                {...selectProps}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </FormControl>
          </>
        )}

        {/* Car-specific additional fields */}
        {vehicleCategory === 'car' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Drivetrain</FormLabel>
              <Select
                placeholder="Choose drivetrain"
                value={formData.drivetrain}
                name="drivetrain"
                onChange={(e) => setFormData({ ...formData, drivetrain: e.target.value })}
                {...selectProps}
              >
                <option value="FWD">FWD (Front Wheel Drive)</option>
                <option value="RWD">RWD (Rear Wheel Drive)</option>
                <option value="AWD">AWD (All Wheel Drive)</option>
                <option value="4WD">4WD (Four Wheel Drive)</option>
              </Select>
            </FormControl>
          
            <FormControl isRequired>
              <FormLabel {...labelProps}>Doors</FormLabel>
              <Select
                placeholder="Select number of doors"
                value={formData.doors}
                name="doors"
                onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                {...selectProps}
              >
                <option value="2">2 Doors</option>
                <option value="3">3 Doors</option>
                <option value="4">4 Doors</option>
                <option value="5">5 Doors</option>
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel {...labelProps}>Seating Capacity</FormLabel>
              <Select
                placeholder="Select seating capacity"
                value={formData.seats}
                name="seats"
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                {...selectProps}
              >
                <option value="2">2 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="6">6 Seats</option>
                <option value="7">7 Seats</option>
                <option value="8">8 Seats</option>
                <option value="9+">9+ Seats</option>
              </Select>
            </FormControl>
          </>
        )}
      </SimpleGrid>

      <FormControl isRequired>
        <FormLabel {...labelProps}>Features</FormLabel>
        <Flex gap={3} w="full" flexWrap="wrap">
          {
            CarFeatures?.map((feature) => 
              <Tag
               borderWidth={2}
               key={feature}
               size="lg"
               minW="120px"
               maxW="max-content"
               borderRadius="5px"
               borderColor={formData?.features?.includes(feature) && "white"}
               color={formData?.features?.includes(feature) && "white"}
               bgColor={formData?.features?.includes(feature) ? "primary" : "white"}
               px={4} py={3}
               cursor="pointer"
               transition="0.5s"
               gapRight={10}
               onClick={() => {
                  const features = [...formData?.features]
                  if (!features.includes(feature)){
                    features.push(feature)
                    setFormData({ ...formData, features: [...features]})
                  }
               }
              }
              >
                <TagLabel flex={1}> {feature} </TagLabel>
                {formData?.features?.includes(feature) &&
                  <TagCloseButton opacity={1} color="white" onClick={() => {
                    const features = [...formData?.features]
                    if (features.includes(feature)){
                      features.splice(features.indexOf(feature), 1)
                      setFormData({ ...formData, features: [...features]})
                    }
                  }} />
                }
              </Tag>
            )
          }
        </Flex>
      </FormControl>

      <FormControl>
        <FormLabel {...labelProps}>Seller Notes <small>(optional)</small></FormLabel>
        <Textarea
          placeholder="Enter a description or any information that might be relevant to the customer..."
          value={formData.notes}
          name="notes"
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          maxLength={700}
          {...fieldProps}
        />
        <Text fontSize="xs" color="gray.500" mt={1}>
          Maximum of 700 characters
        </Text>
      </FormControl>
    </VStack>
  )
}


// Car Details Form Component
export function EditListingForm({ formData, setFormData }) {
  const labelProps = { fontWeight: '600', color: 'gray.700' };
  const fieldProps = {
    bg: 'white',
    color: 'black',
    variant: 'outline',
    borderWidth: '1px',
    borderColor: 'gray.400',
    _placeholder: { color: 'gray.600', opacity: 1 },
    _hover: { borderColor: 'gray.500' },
    focusBorderColor: 'blue.400',
    _focusVisible: { borderColor: 'blue.400', boxShadow: '0 0 0 1px rgba(49,130,206,0.6)' },
  };
  const selectProps = { ...fieldProps, sx: { option: { backgroundColor: 'white', color: 'black' } } };

  return (
    <VStack spacing={6} align="stretch" w="full">
      <FormControl isRequired>
        <FormLabel {...labelProps}>Listing Title</FormLabel>
        <Input
          placeholder="eg Ford Focus Mini Edition"
          isRequired={true}
          name="title"
          value={formData?.title}
          onInput={(e) => setFormData({ ...formData, title: e.target.value })}
          {...fieldProps}
        />
      </FormControl>

      <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>Car Brand</FormLabel>
          <Select
            placeholder="Select brand"
            isRequired={true}
            name="brand"
            value={formData?.vehicle?.brand}
            onChange={
              (e) => setFormData(
                { ...formData, vehicle: {...formData?.vehicle, brand: e.target.value}
              })
            }
            {...selectProps}
          >
            {CarBrands?.map(brand => <option value={brand}>{brand}</option>)}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Model</FormLabel>
          <Input
            placeholder="Car model"
            isRequired={true}
            value={formData?.vehicle?.model}
            onInput={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, model: e.target.value} })}
            {...fieldProps}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Rental Price</FormLabel>
          <InputGroup>
            <InputLeftAddon p={0} overflow="hidden" width="100px">
              <Select
                border="none"
                borderRadius={0}
                value={formData.currency || 'NGN'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                _focus={{ boxShadow: 'none' }}
                height="100%"
              >
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
              </Select>
            </InputLeftAddon>
            <Input
              type="number"
              isRequired={true}
              placeholder="Enter price"
              value={formData?.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              {...fieldProps}
              borderTopLeftRadius={0}
              borderBottomLeftRadius={0}
            />
          </InputGroup>
        </FormControl>

        {
          formData?.listing_type === 'rental' &&
          <FormControl isRequired>
            <FormLabel {...labelProps}>Payment Cycle</FormLabel>
            <Select
             name="payment-cycle"
             isRequired
             value={formData?.payment_cycle}
             onChange={(e) => setFormData({ ...formData, payment_cycle: e.target.value })}
             {...selectProps}
            >
              <option value='day'>Daily</option>
              <option value='week'>Weekly</option>
              <option value='month'>Monthly</option>
              <option value='year'>Annually</option>
            </Select>
          </FormControl>
        }
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>Condition</FormLabel>
          <Select
            placeholder="Choose condition"
            name="condition"
            isRequired={true}
            value={formData?.vehicle?.condition}
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, condition: e.target.value} })}
            {...selectProps}
          >
            <option value="new">New</option>
            <option value="used-local">Local Used</option>
            <option value="used-foreign">Foreign Used</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>VIN/Chassis Number</FormLabel>
          <Input
            placeholder="Enter Number..."
            value={formData?.vehicle?.vin}
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, vin: e.target.value} })}
            {...fieldProps}
          />
        </FormControl>

        <FormControl>
          <FormLabel {...labelProps}>Body Type <small>(optional)</small></FormLabel>
          <Select
            placeholder="Select Body Type"
            value={formData?.vehicle?.body_type}
            name="body_type"
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, body_type: e.target.value} })}
            {...selectProps}
          >
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="hatchback">Hatchback</option>
            <option value="coupe">Coupe</option>
            <option value="convertible">Convertible</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van/Minivan</option>
            <option value="wagon">Wagon</option>
            <option value="luxury">Luxury</option>
            <option value="sport">Sports Car</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Fuel System</FormLabel>
          <Select
            placeholder="Select fuel type"
            value={formData?.vehicle?.fuel_system}
            name="fuel_system"
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, fuel_system: e.target.value} })}
            {...selectProps}
          >
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Hybrid</option>
            <option>Electric</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Transmission</FormLabel>
          <Select
            name="transmission"
            isRequired={true}
            placeholder="Select transmission"
            value={formData?.vehicle?.transmission}
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, transmission: e.target.value} })}
            {...selectProps}
          >
            <option>Automatic</option>
            <option>Manual</option>
          </Select>
        </FormControl>
      
        <FormControl isRequired>
          <FormLabel {...labelProps}>Doors</FormLabel>
          <Select
            placeholder="Select Door number"
            value={formData?.vehicle?.doors}
            name="doors"
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, doors: e.target.value} })}
            {...selectProps}
          >
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>Seats</FormLabel>
          <Select
            placeholder="Select seats number"
            value={formData?.vehicle?.seats}
            name="seats"
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, seats: e.target.value} })}
            {...selectProps}
          >
            <option>2</option>
            <option>4</option>
            <option>5</option>
            <option>7</option>
          </Select>
        </FormControl>
      
        <FormControl isRequired>
          <FormLabel {...labelProps}>Mileage</FormLabel>
          <Input
            name="mileage"
            isRequired={true}
            type="number"
            min={0}
            placeholder="0 miles"
            value={formData?.vehicle?.mileage}
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, mileage: e.target.value} })}
            {...fieldProps}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>Drive train</FormLabel>
          <Select
            placeholder="Choose an option"
            value={formData?.vehicle?.drivetrain}
            name="drivetrain"
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, drivetrain: e.target.value} })}
            {...selectProps}
          >
            <option value="4WD">4WD (4 Wheel drive)</option>
            <option value="AWD">AWD (All Wheel drive)</option>
            <option value="FWD">FWD (Front Wheel drive)</option>
          </Select>
        </FormControl>
      </SimpleGrid>

      <FormControl isRequired>
        <FormLabel {...labelProps}>Features</FormLabel>
        <Flex gap={3} w="full" flexWrap="wrap">
          {
            CarFeatures?.map((feature) => 
              <Tag
               borderWidth={2}
               key={feature}
               size="lg"
               minW="120px"
               maxW="max-content"
               borderRadius="5px"
               borderColor={formData?.vehicle?.features?.includes(feature) && "white"}
               color={formData?.vehicle?.features?.includes(feature) && "white"}
               bgColor={formData?.vehicle?.features?.includes(feature) ? "primary" : "white"}
               px={4} py={3}
               cursor="pointer"
               transition="0.5s"
               gapRight={10}
               onClick={() => {
                  const features = [...formData?.vehicle?.features]
                  if (!features?.includes(feature)){
                    features?.push(feature);
                    console.log("features:", features)
                    setFormData({ ...formData, vehicle: {...formData.vehicle, features }})
                  }
                  console.log("Set features:", formData.vehicle.features)
               }
              }
              >
                <TagLabel flex={1}> {feature} </TagLabel>
                {formData?.vehicle?.features?.includes(feature) &&
                  <TagCloseButton opacity={1} color="white" onClick={() => {
                    const features = [...formData.vehicle.features]
                    if (features.includes(feature)){
                      features.splice(features.indexOf(feature), 1)
                      setFormData({ ...formData, vehicle: {...formData.vehicle, features: [...features]}})
                    }
                  }} />
                }
              </Tag>
            )
          }
        </Flex>
      </FormControl>

      <FormControl>
        <FormLabel {...labelProps}>Seller Notes <small>(optional)</small></FormLabel>
        <Textarea
          placeholder="Enter a description or any information that might be relevant to the customer..."
          value={formData?.notes}
          name="notes"
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          maxLength={700}
          {...fieldProps}
        />
        <Text fontSize="xs" color="gray.500" mt={1}>
          Maximum of 700 characters
        </Text>
      </FormControl>
    </VStack>
  )
}

// Car Details Form Component
export function CreateSaleForm({ formData, setFormData, vehicleCategory = 'car' }) {
  const [availableModels, setAvailableModels] = useState([]);
  const labelProps = { fontWeight: '600', color: 'gray.700' };
  const fieldProps = {
    bg: 'white',
    color: 'black',
    variant: 'outline',
    borderWidth: '1px',
    borderColor: 'gray.400',
    _placeholder: { color: 'gray.600', opacity: 1 },
    _hover: { borderColor: 'gray.500' },
    focusBorderColor: 'blue.400',
    _focusVisible: { borderColor: 'blue.400', boxShadow: '0 0 0 1px rgba(49,130,206,0.6)' },
  };
  const selectProps = { ...fieldProps, sx: { option: { backgroundColor: 'white', color: 'black' } } };

  const vehicleLabels = {
    car: { brand: 'Car Brand', model: 'Car Model', placeholder: 'eg Ford Focus Mini Edition' },
    bike: { brand: 'Bike Brand', model: 'Bike Model', placeholder: 'eg Yamaha R15 V3' },
    boat: { brand: 'Boat Brand', model: 'Boat Model', placeholder: 'eg Sea Ray Sundancer' },
    aircraft: { brand: 'Aircraft Brand', model: 'Aircraft Model', placeholder: 'eg Cessna 172' },
  };

  const labels = vehicleLabels[vehicleCategory] || vehicleLabels.car;
  const brandNames = getBrandNames(vehicleCategory);

  // Update available models when brand changes
  useEffect(() => {
    if (formData.brand) {
      const models = getModelsForBrand(vehicleCategory, formData.brand);
      setAvailableModels(models);
      // Clear model if it's not in the new brand's models
      if (formData.model && !models.includes(formData.model)) {
        setFormData({ ...formData, model: '' });
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.brand, vehicleCategory]);

  return (
    <VStack spacing={6} align="stretch" w="full">
      <FormControl isRequired>
        <FormLabel {...labelProps}>Listing Title</FormLabel>
        <Input
          placeholder={labels.placeholder}
          isRequired={true}
          name="title"
          value={formData.title}
          onInput={(e) => setFormData({ ...formData, title: e.target.value })}
          {...fieldProps}
        />
      </FormControl>

      <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>{labels.brand}</FormLabel>
          <Select
            placeholder={`Select ${labels.brand.toLowerCase()}`}
            isRequired={true}
            name="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
            {...selectProps}
          >
            {brandNames.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel {...labelProps}>{labels.model}</FormLabel>
          <Select
            placeholder={formData.brand ? `Select ${labels.model.toLowerCase()}` : `Select brand first`}
            isRequired={true}
            name="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            isDisabled={!formData.brand}
            {...selectProps}
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </Select>
        </FormControl>

        {vehicleCategory === 'car' && (
          <FormControl isRequired>
            <FormLabel {...labelProps}>VIN/Chassis Number</FormLabel>
            <Input
              placeholder="Enter Number..."
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              {...fieldProps}
            />
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel {...labelProps}>Year of Manufacture</FormLabel>
          <Select
            placeholder="Select year"
            isRequired={true}
            name="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            {...selectProps}
          >
            {Array.from({ length: 30 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>Price</FormLabel>
          <InputGroup>
            <InputLeftAddon p={0} overflow="hidden" width="100px">
              <Select
                border="none"
                borderRadius={0}
                value={formData.currency || 'NGN'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                _focus={{ boxShadow: 'none' }}
                height="100%"
              >
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
              </Select>
            </InputLeftAddon>
            <Input
              type="number"
              isRequired={true}
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              {...fieldProps}
              borderTopLeftRadius={0}
              borderBottomLeftRadius={0}
            />
          </InputGroup>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel {...labelProps}>Condition</FormLabel>
          <Select
            placeholder="Choose condition"
            name="condition"
            isRequired={true}
            value={formData.usage}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value, usage: e.target.value })}
            {...selectProps}
          >
            <option value="new">New</option>
            <option value="local-used">Used (Local)</option>
            <option value="uk-used">Used (UK)</option>
            <option value="us-used">Used (US)</option>
            <option value="china-used">Used (China)</option>
          </Select>
        </FormControl>
      
        {/* Car-specific fields */}
        {vehicleCategory === 'car' && (
          <>
            <FormControl>
              <FormLabel {...labelProps}>Body Type <small>(optional)</small></FormLabel>
              <Select
                placeholder="Select Body Type"
                value={formData.body_type}
                name="body_type"
                onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                {...selectProps}
              >
                <option value="suv">SUV</option>
                <option value="sedan">Sedan</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="pickup">Pickup</option>
                <option value="van">Van/Minivan</option>
                <option value="wagon">Wagon</option>
                <option value="luxury">Luxury</option>
                <option value="sport">Sports Car</option>
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel {...labelProps}>Fuel System</FormLabel>
              <Select
                placeholder="Select fuel type"
                value={formData.fuel}
                name="fuel_system"
                onChange={(e) => setFormData({ ...formData, fuel_system: e.target.value, fuel: e.target.value })}
                {...selectProps}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </Select>
            </FormControl>
          
            <FormControl isRequired>
              <FormLabel {...labelProps}>Transmission</FormLabel>
              <Select
                name="transmission"
                isRequired={true}
                placeholder="Select transmission"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                {...selectProps}
              >
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel {...labelProps}>Mileage</FormLabel>
              <Input
                name="mileage"
                isRequired={true}
                type="number"
                min={0}
                placeholder="0 miles"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl>
              <FormLabel {...labelProps}>Registration</FormLabel>
              <Select
                placeholder="Select registration"
                value={formData.registration}
                name="registration"
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                {...selectProps}
              >
                <option>Registered</option>
                <option>Unregistered</option>
              </Select>
            </FormControl>
          </>
        )}

        {/* Bike-specific fields */}
        {vehicleCategory === 'bike' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Capacity (cc)</FormLabel>
              <Input
                placeholder="eg 150cc"
                value={formData.engine_capacity}
                onChange={(e) => setFormData({ ...formData, engine_capacity: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Bike Type</FormLabel>
              <Select
                placeholder="Select bike type"
                value={formData.bike_type}
                onChange={(e) => setFormData({ ...formData, bike_type: e.target.value })}
                {...selectProps}
              >
                <option value="sport">Sport</option>
                <option value="cruiser">Cruiser</option>
                <option value="touring">Touring</option>
                <option value="off-road">Off-Road</option>
                <option value="scooter">Scooter</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Fuel System</FormLabel>
              <Select
                placeholder="Select fuel type"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel_system: e.target.value, fuel: e.target.value })}
                {...selectProps}
              >
                <option value="petrol">Petrol</option>
                <option value="electric">Electric</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Transmission</FormLabel>
              <Select
                placeholder="Select transmission"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                {...selectProps}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Mileage</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="0 km"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Saddle Height (inches)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 32.5"
                value={formData.saddle_height}
                onChange={(e) => setFormData({ ...formData, saddle_height: e.target.value })}
                {...fieldProps}
              />
            </FormControl>
          </>
        )}

        {/* Boat-specific fields */}
        {vehicleCategory === 'boat' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Boat Type</FormLabel>
              <Select
                placeholder="Select boat type"
                value={formData.boat_type}
                onChange={(e) => setFormData({ ...formData, boat_type: e.target.value })}
                {...selectProps}
              >
                <option value="sailboat">Sailboat</option>
                <option value="motorboat">Motorboat</option>
                <option value="yacht">Yacht</option>
                <option value="fishing">Fishing Boat</option>
                <option value="speedboat">Speedboat</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Length (feet)</FormLabel>
              <Input
                type="number"
                placeholder="eg 25"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Type</FormLabel>
              <Select
                placeholder="Select engine type"
                value={formData.engine_type}
                onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })}
                {...selectProps}
              >
                <option value="outboard">Outboard</option>
                <option value="inboard">Inboard</option>
                <option value="sterndrive">Sterndrive</option>
                <option value="jet">Jet Drive</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Hull Material</FormLabel>
              <Select
                placeholder="Select hull material"
                value={formData.hull_material}
                onChange={(e) => setFormData({ ...formData, hull_material: e.target.value })}
                {...selectProps}
              >
                <option value="fiberglass">Fiberglass</option>
                <option value="aluminum">Aluminum</option>
                <option value="wood">Wood</option>
                <option value="steel">Steel</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Passenger Capacity</FormLabel>
              <Input
                type="number"
                min={1}
                placeholder="eg 8"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Count</FormLabel>
              <Input
                type="number"
                min={1}
                placeholder="eg 2"
                value={formData.engine_count}
                onChange={(e) => setFormData({ ...formData, engine_count: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Propeller Type</FormLabel>
              <Input
                placeholder="eg Outboard"
                value={formData.propeller_type}
                onChange={(e) => setFormData({ ...formData, propeller_type: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Beam Width (feet)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 10.0"
                value={formData.beam_width}
                onChange={(e) => setFormData({ ...formData, beam_width: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Draft (feet)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 3.2"
                value={formData.draft}
                onChange={(e) => setFormData({ ...formData, draft: e.target.value })}
                {...fieldProps}
              />
            </FormControl>
          </>
        )}

        {/* Aircraft-specific fields */}
        {vehicleCategory === 'aircraft' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Aircraft Type</FormLabel>
              <Select
                placeholder="Select aircraft type"
                value={formData.aircraft_type}
                onChange={(e) => setFormData({ ...formData, aircraft_type: e.target.value })}
                {...selectProps}
              >
                <option value="single-engine">Single Engine</option>
                <option value="multi-engine">Multi Engine</option>
                <option value="jet">Jet</option>
                <option value="helicopter">Helicopter</option>
                <option value="ultralight">Ultralight</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Engine Type</FormLabel>
              <Select
                placeholder="Select engine type"
                value={formData.engine_type}
                onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })}
                {...selectProps}
              >
                <option value="piston">Piston</option>
                <option value="turboprop">Turboprop</option>
                <option value="turbojet">Turbojet</option>
                <option value="turbofan">Turbofan</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Total Flight Hours</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 1500"
                value={formData.total_hours}
                onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Passenger Capacity</FormLabel>
              <Input
                type="number"
                min={1}
                placeholder="eg 4"
                value={formData.passenger_capacity}
                onChange={(e) => setFormData({ ...formData, passenger_capacity: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl>
              <FormLabel {...labelProps}>Registration Number</FormLabel>
              <Input
                placeholder="eg N12345"
                value={formData.registration}
                onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Wing Span (feet)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 117.0"
                value={formData.wing_span}
                onChange={(e) => setFormData({ ...formData, wing_span: e.target.value })}
                {...fieldProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel {...labelProps}>Range (miles)</FormLabel>
              <Input
                type="number"
                min={0}
                placeholder="eg 3000"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                {...fieldProps}
              />
            </FormControl>
          </>
        )}
        
        {/* Car-specific additional fields */}
        {vehicleCategory === 'car' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Drivetrain</FormLabel>
              <Select
                placeholder="Choose drivetrain"
                value={formData.drivetrain}
                name="drivetrain"
                onChange={(e) => setFormData({ ...formData, drivetrain: e.target.value })}
                {...selectProps}
              >
                <option value="FWD">FWD (Front Wheel Drive)</option>
                <option value="RWD">RWD (Rear Wheel Drive)</option>
                <option value="AWD">AWD (All Wheel Drive)</option>
                <option value="4WD">4WD (Four Wheel Drive)</option>
              </Select>
            </FormControl>
          
            <FormControl isRequired>
              <FormLabel {...labelProps}>Doors</FormLabel>
              <Select
                placeholder="Select number of doors"
                value={formData.doors}
                name="doors"
                onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                {...selectProps}
              >
                <option value="2">2 Doors</option>
                <option value="3">3 Doors</option>
                <option value="4">4 Doors</option>
                <option value="5">5 Doors</option>
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel {...labelProps}>Seating Capacity</FormLabel>
              <Select
                placeholder="Select seating capacity"
                value={formData.seats}
                name="seats"
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                {...selectProps}
              >
                <option value="2">2 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="6">6 Seats</option>
                <option value="7">7 Seats</option>
                <option value="8">8 Seats</option>
                <option value="9+">9+ Seats</option>
              </Select>
            </FormControl>
          </>
        )}
      </SimpleGrid>

      <FormControl>
        <FormLabel {...labelProps}>Seller Notes <small>(optional)</small></FormLabel>
        <Textarea
          placeholder="Enter a description or any information that might be relevant to the customer..."
          value={formData.notes}
          name="notes"
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          maxLength={400}
          {...fieldProps}
        />
        <Text fontSize="xs" color="gray.500" mt={1}>
          Maximum of 400 characters
        </Text>
      </FormControl>
    </VStack>
  )
}
