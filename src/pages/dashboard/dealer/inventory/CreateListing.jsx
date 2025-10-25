import {
  Box,
  Container,
  VStack,
  HStack,
  Flex,
  Text,
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
import {BackButton} from '../../../../components/nav';
import {
  StepIndicator,
  DocumentUploader,
  ImageUploader,
  CreateRentalForm,
  ListingReviewCard,
  CreateSaleForm,
} from '../../../../components/forms';
import {GlobalStore} from '../../../../App';
import {objectifyJSON, jsonifyObject} from '../../../../utils';
import { ArrowLeft, DeleteIcon, Upload, AlertTriangle, Zap, Clock, Settings, MessageCircle, Bell } from "lucide-react"
import { useState, useEffect, useContext, useRef } from "react";


export default function AddListing() {
  const [currentStep, setCurrentStep] = useState(0);
  const {axios, notify, authUser, redirect} = useContext(GlobalStore); 
  const [formData, setFormData] = useState({
    uuid: null,
    listing_type: 'sale',
    vehicle_category: 'car', // car, bike, boat, aircraft
    features: [],
  });
  const [form, setForm] = useState(null);
  const steps = ["Enter details", "Upload Images", "Review", "Publish"]
  const toast = useToast();
  const formRef = useRef();
  window.formRef = formRef;

  const handleContinue = () => {
    if (currentStep < 3) {
      try{
        switch(currentStep){
          case 1: {
            return handleImageUpload()
          }
          case 2: {
            return handlePublish()
          }
          default:{
            const inputs = formRef.current.querySelectorAll('[required]');
            for (let input of inputs){
              if (!input.value.trim()){
                 notify({
                  title: "Not so fast!",
                  body: "Hey! You gotta fill all the required fields with, they're marked with a red *",
                  color: "red",
                  duration: 5000,
                  isClosable: false,
                });

                 return
              }
            }
            return handleCreate();
          }
        }
      }catch(error){
        console.log("Oops:", error)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleImageUpload(){
    const payload = new FormData(formRef.current);
    payload.append('action',  'upload-images');
    payload.append('listing',  formData?.uuid);
    for(var i=0; i < formData?.images?.length; i++){
      payload.append(
        'image',
        formData?.images[i]?.file,
        formData?.images[i]?.file.name
      );
    }

    const res = await axios.post('/admin/dealership/listings/create/', payload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.status === 200){
      setCurrentStep(currentStep+1)
    }
  }

  const handleCreate = async () => {
    try{
      // Validate required fields
      if (!formData?.brand || !formData?.model) {
        notify({
          title: "Missing Required Fields",
          body: "Please select both brand and model for your vehicle",
          color: "red",
          duration: 5000,
        });
        return;
      }

      const condition = formData?.condition || formData?.usage;
      const vehicleType = formData?.vehicle_type || formData?.body;
      const fuel = formData?.fuel_system || formData?.fuel;

      // Create FormData with individual fields (not nested JSON)
      const form = new FormData();
      form.append('action', 'create-listing');
      
      // Top-level listing fields
      form.append('listing_type', formData?.listing_type === 'rental' ? 'rental' : 'sale');
      if (formData?.title) form.append('title', formData.title);
      if (formData?.price) form.append('price', formData.price.toString());
      form.append('payment_cycle', formData?.listing_type === 'rental' ? (formData?.payment_cycle || 'daily') : 'single');
      if (formData?.notes) form.append('notes', formData.notes);
      
      // Vehicle category (car, bike, boat, aircraft)
      form.append('vehicle_category', formData?.vehicle_category || 'car');
      
      // Vehicle fields (flattened)
      if (formData?.title) form.append('name', formData.title);
      form.append('brand', formData?.brand);
      form.append('model', formData?.model);
      form.append('condition', condition || 'used');
      if (formData?.year) form.append('year', formData.year);
      if (formData?.color) form.append('color', formData.color);
      
      // Category-specific fields
      const category = formData?.vehicle_category || 'car';
      
      if (category === 'car') {
        // Required car fields
        if (fuel) form.append('fuel_system', fuel);
        if (formData?.transmission) form.append('transmission', formData.transmission);
        form.append('mileage', (formData?.mileage ?? '0').toString());
        if (vehicleType) {
          form.append('body', vehicleType);
          form.append('vehicle_type', vehicleType); // Backend requires this
        }
        
        // Required car-specific fields (backend expects these)
        form.append('vin', formData?.vin || '');
        form.append('drivetrain', formData?.drivetrain || '');
        form.append('doors', formData?.doors || '');
        form.append('seats', formData?.seats || '');
        
        // Optional car fields
        if (formData?.registration) form.append('registration', formData.registration);
      } else if (category === 'bike' || category === 'motorcycle') {
        form.append('engine_capacity', formData?.engine_capacity || '');
        form.append('fuel_system', fuel || '');
        form.append('transmission', formData?.transmission || '');
        form.append('mileage', (formData?.mileage ?? '0').toString());
        if (formData?.bike_type) form.append('bike_type', formData.bike_type);
      } else if (category === 'boat') {
        form.append('length', formData?.length || '');
        form.append('engine_type', formData?.engine_type || '');
        form.append('hull_material', formData?.hull_material || '');
        form.append('capacity', formData?.capacity || '');
        if (formData?.boat_type) form.append('boat_type', formData.boat_type);
      } else if (category === 'aircraft') {
        form.append('aircraft_type', formData?.aircraft_type || '');
        form.append('engine_type', formData?.engine_type || '');
        form.append('total_hours', formData?.total_hours || '0');
        form.append('passenger_capacity', formData?.passenger_capacity || '');
        if (formData?.registration) form.append('registration', formData.registration);
      }
      
      // Features as comma-separated string
      if (Array.isArray(formData?.features) && formData.features.length > 0) {
        form.append('features', formData.features.join(', '));
      }

      // Debug: Log all FormData entries
      console.log('=== LISTING CREATION DEBUG ===');
      console.log('FormData state:', formData);
      console.log('FormData entries:');
      for (let [key, value] of form.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      console.log('=== END DEBUG ===');

      const res = await axios.post(
        '/admin/dealership/listings/create/',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const data = objectifyJSON(res.data)

      if (res.status === 200 || res.status === 201){
        const newUuid = data?.data?.uuid || data?.uuid || data?.data?.vehicle?.uuid;
        setFormData({ ...formData, uuid: newUuid})
        toast({
          title: "Listing created successfully",
          description: "Now upload images for your listing.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        return setCurrentStep(currentStep+1);
      }
    }catch(error){
      const raw = error?.response?.data;
      try { console.error('Create listing failed RAW:', typeof raw === 'string' ? raw.slice(0, 1000) : raw); } catch {}
      console.error('Create listing failed:', error);
      
      // Better error message extraction
      let errorMessage = 'Server error while creating listing';
      let errorTitle = 'Unable to create listing';
      
      // Handle CORS/Network errors
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        errorTitle = 'Request Timeout';
        errorMessage = 'The request took too long. Please try again.';
      } else if (typeof raw === 'object' && raw?.message) {
        errorMessage = raw.message;
      } else if (typeof raw === 'string' && !raw.includes('<!DOCTYPE')) {
        errorMessage = raw.slice(0, 220);
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      notify({
        title: errorTitle,
        body: errorMessage,
        color: 'red',
        duration: 7000
      })
    }
  }
  
  const handlePublish = async () => {
    const res = await axios.post('/admin/dealership/listings/create/', jsonifyObject({
        listing: formData?.uuid,
        action: 'publish-listing'
      })
    )

    if (res.status === 200){
      toast({
        title: "Listing submitted for review",
        description: "We'll notify you once the review is complete.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      return redirect('/inventory');
    }
  }

  return (
    <Box bg="gray.50" color="black">
      <Container maxW="9xl" pb={16}>
        <BackButton
          onClick={currentStep > 0 ? () => setCurrentStep(currentStep -1) : undefined}
        />

        <VStack spacing={8}>
          <Box
            bg="white"
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="xl"
            boxShadow="sm"
            p={{ base: 4, md: 6 }}
          >
            <Box textAlign="center">
              <Heading size="lg" className="bold">Add a Listing</Heading>
              <Text color="gray.600">Upload your vehicle in 3 easy steps!</Text>
            </Box>
          </Box>

          <Box bg="white" borderWidth={1} borderColor="gray.200" borderRadius="xl" boxShadow="sm" p={{ base: 4, md: 6 }} w="full">
            <StepIndicator currentStep={currentStep} steps={steps} />
          </Box>

          <Container maxW={{sm: '100%', lg: "85%"}}>
            <Box bg="white" borderWidth={1} borderColor="gray.200" borderRadius="xl" boxShadow="sm" p={{ base: 4, md: 6 }}>
            <form style={{width:"100%", placeItems: 'center', placeContent: 'center'}} encType="multipart/form-data" ref={formRef} id="details-form" onSubmit={e => e.preventDefault()} method='post'>
              {currentStep === 0 && (
                  <VStack spacing={8} w="full">
                    <FormControl isRequired mx={'auto'} width="100%">
                      <FormLabel fontWeight="600" color="gray.700">Vehicle Category</FormLabel>
                      <SimpleGrid columns={{base: 2, md: 4}} gap={3} mt={3}>
                        <Button onClick={() => setFormData({...formData, vehicle_category: 'car'})} 
                         bgColor={formData?.vehicle_category === 'car' ? 'primary' : 'white'}
                         color={formData?.vehicle_category === 'car' ? 'white' : 'primary'}
                         borderWidth={2}
                         colorScheme={'blue'}
                         borderColor="cornflowerblue"
                         borderRadius="10px" py={5}
                        >🚗 Car</Button>

                        <Button onClick={() => setFormData({...formData, vehicle_category: 'bike'})}
                         bgColor={formData?.vehicle_category === 'bike' ? 'primary' : 'white'}
                         color={formData?.vehicle_category === 'bike' ? 'white' : 'primary'}
                         borderWidth={2}
                         colorScheme={'blue'}
                         borderColor="cornflowerblue"
                         borderRadius="10px" py={5}
                        >🏍️ Bike</Button>

                        <Button onClick={() => setFormData({...formData, vehicle_category: 'boat'})}
                         bgColor={formData?.vehicle_category === 'boat' ? 'primary' : 'white'}
                         color={formData?.vehicle_category === 'boat' ? 'white' : 'primary'}
                         borderWidth={2}
                         colorScheme={'blue'}
                         borderColor="cornflowerblue"
                         borderRadius="10px" py={5}
                        >⛵ Boat</Button>

                        <Button onClick={() => setFormData({...formData, vehicle_category: 'aircraft'})}
                         bgColor={formData?.vehicle_category === 'aircraft' ? 'primary' : 'white'}
                         color={formData?.vehicle_category === 'aircraft' ? 'white' : 'primary'}
                         borderWidth={2}
                         colorScheme={'blue'}
                         borderColor="cornflowerblue"
                         borderRadius="10px" py={5}
                        >✈️ Aircraft</Button>
                      </SimpleGrid>
                    </FormControl>

                    <FormControl isRequired mx={'auto'} width="100%">
                      <FormLabel fontWeight="600" color="gray.700">Listing Type</FormLabel>
                      <ButtonGroup size='md' isAttached variant='outline' mt={3} width="full">
                        <Button onClick={() => setFormData({...formData, listing_type: 'sale'})} 
                         bgColor={formData?.listing_type === 'sale' ? 'primary' : 'transparent'}
                         color={formData?.listing_type === 'sale' ? 'white' : 'primary'}
                         borderTopWidth={2} borderBottomWidth={2}
                         borderLeftWidth={2} flex={1}
                         colorScheme={'blue'}
                         borderColor="cornflowerblue"
                         borderRadius="10px" py={5}
                        >Direct Sale</Button>

                        <Button onClick={() => setFormData({...formData, listing_type: 'rental'})}
                         bgColor={formData?.listing_type === 'rental' ? 'primary' : 'transparent'}
                         color={formData?.listing_type === 'rental' ? 'white' : 'primary'}
                         borderTopWidth={2} borderBottomWidth={2}
                         borderRightWidth={2} flex={1}
                         colorScheme={'blue'}
                         borderColor="cornflowerblue"
                         borderRadius="10px" py={5}
                        >Rental</Button>
                      </ButtonGroup>
                    </FormControl>

                    { formData?.listing_type === 'rental' ?
                      <CreateRentalForm formData={formData} setFormData={setFormData} vehicleCategory={formData?.vehicle_category} />
                      :
                      <CreateSaleForm formData={formData} setFormData={setFormData} vehicleCategory={formData?.vehicle_category} />
                    }
                    <Button colorScheme="blue" form="details-form" type="submit" size="lg" w="full" maxW="600px" onClick={handleContinue}>
                      Continue
                    </Button>
                  </VStack>
              )}

              {currentStep === 1 && (
                <VStack spacing={8} w="full">
                  <ImageUploader
                    title="of your car"
                    limit={12}
                    description="See image upload guidelines"
                    onUpload={(files) => {
                      console.log("Uploads:", files)
                      setFormData({ ...formData, images: [...files] });
                    }}
                    data={formData?.images}
                  />
                  <Button disabled={formData?.images?.length > 0 ? false : true} colorScheme="blue" size="lg" w="full" onClick={handleContinue}>
                    Continue
                  </Button>
                </VStack>
              )}

              {currentStep === 2 && (
                <VStack spacing={8} w="full">
                  <ListingReviewCard formData={formData} />
                  <HStack spacing={4}>
                    <Button colorScheme="blue" size="md" onClick={handlePublish}>
                      Publish
                    </Button>

                    <Button variant="outline" size="md" onClick={() => setCurrentStep(0)}>
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              )}
            </form>
            </Box>
          </Container>
        </VStack>
      </Container>
    </Box>
  )
}

