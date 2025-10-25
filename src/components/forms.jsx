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
} from "@chakra-ui/react";
import {CloseIcon} from "@chakra-ui/icons";
import {BackButton} from './nav';
import {GlobalStore} from '../App';
import { getBrandNames, getModelsForBrand } from '../data/vehicleBrands';
import {objectifyJSON} from '../utils';
import { ArrowLeft, DeleteIcon, Upload, AlertTriangle, Zap, Clock, Settings, MessageCircle, Bell } from "lucide-react"
import { useState, useEffect, useContext, useRef } from "react";


// Review Component
export function ListingReviewCard({ formData }) {
  return (
    <VStack spacing={6} align="stretch" maxW="600px" mx="auto">
      <Box borderWidth={1} borderRadius="lg" overflow="hidden" borderColor="gray.200" bg="white" boxShadow="sm">
        <Image
          src={formData?.images[0]?.previewUrl || "/placeholder.svg"}
          alt="Car preview"
          w="full"
          h="300px"
          objectFit="cover"
        />
        <Box p={6}>
          <HStack justify="space-between" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold">
                {formData.title}
              </Text>
              <Badge colorScheme="gray">{formData?.usage}</Badge>
            </VStack>
            <VStack align="end" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                ₦{Number(formData.price).toLocaleString()}
              </Text>
              <Text color="green.500" fontSize="sm">
                +0.5% added fees
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={6} mb={4}>
            <HStack>
              <Clock size={16} />
              <Text>{formData.mileage || "800"} miles</Text>
            </HStack>
            <HStack>
              <Settings size={16} />
              <Text>{formData.transmission}</Text>
            </HStack>
            <HStack>
              <Zap size={16} />
              <Text>{formData.fuel_system}</Text>
            </HStack>
          </HStack>

          <HStack>
            <Text color="gray.600">FCT, AMAC</Text>
            <Badge colorScheme="purple"> CUSTOM DUTY ✓</Badge>
          </HStack>
        </Box>
      </Box>

      <Box p={4} bg="orange.50" borderRadius="md" borderLeftWidth={4} borderLeftColor="orange.400">
        <HStack>
          <AlertTriangle className="text-orange-500" />
          <Box>
            <Text fontWeight="medium">Reviews normally take 2-24 hours.</Text>
            <Text fontSize="sm" color="gray.600">
              Why we do reviews?
            </Text>
            <UnorderedList fontSize="sm" color="gray.600" mt={2}>
              <ListItem>To avoid duplicate listings.</ListItem>
              <ListItem>To ensure validity of vehicle.</ListItem>
              <ListItem>To increase customer trust in your listings.</ListItem>
            </UnorderedList>
          </Box>
        </HStack>
      </Box>
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
            <InputLeftElement pointerEvents="none" color="gray.500">₦</InputLeftElement>
            <Input
              type="number"
              isRequired={true}
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              {...fieldProps}
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
            <FormControl isRequired>
              <FormLabel {...labelProps}>Vehicle Type</FormLabel>
              <Select
                placeholder="Select Vehicle Type"
                value={formData.vehicle_type || formData.body}
                name="vehicle_type"
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value, body: e.target.value })}
                {...selectProps}
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="truck">Truck</option>
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
            <InputLeftElement pointerEvents="none" color="gray.500">₦</InputLeftElement>
            <Input
              type="number"
              isRequired={true}
              placeholder="Enter price"
              value={formData?.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              {...fieldProps}
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

        <FormControl isRequired>
          <FormLabel {...labelProps}>Vehicle Type</FormLabel>
          <Select
            placeholder="Select Vehicle Type"
            value={formData?.vehicle?.type}
            name="vehicle_type"
            onChange={(e) => setFormData({ ...formData, vehicle: {...formData.vehicle, vehicle_type: e.target.value} })}
            {...selectProps}
          >
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="coupe">Coupe</option>
            <option value="convertible">Convertible</option>
            <option value="truck">Truck</option>
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
            <InputLeftElement pointerEvents="none" color="gray.500">₦</InputLeftElement>
            <Input
              type="number"
              isRequired={true}
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              {...fieldProps}
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
          </Select>
        </FormControl>
      
        {/* Car-specific fields */}
        {vehicleCategory === 'car' && (
          <>
            <FormControl isRequired>
              <FormLabel {...labelProps}>Vehicle Type</FormLabel>
              <Select
                placeholder="Select Vehicle Type"
                value={formData.body}
                name="vehicle_type"
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value, body: e.target.value })}
                {...selectProps}
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="truck">Truck</option>
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
