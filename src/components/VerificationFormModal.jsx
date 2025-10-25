import { useState, useContext, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  SimpleGrid,
  Text,
  Box,
  Icon,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloudUpload, FileText, X } from 'lucide-react';
import { GlobalStore } from '../App';

const VerificationFormModal = ({ isOpen, onClose, businessType, onSuccess }) => {
  const { axios, notify } = useContext(GlobalStore);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_type: businessType === 'dealer' ? 'dealership' : 'mechanic',
    business_name: '',
    business_address: '',
    business_email: '',
    business_phone: '',
    cac_number: '',
    tin_number: ''
  });

  const [files, setFiles] = useState({
    cac_document: null,
    tin_document: null,
    proof_of_address: null,
    business_license: null
  });

  const fileInputRefs = {
    cac_document: useRef(),
    tin_document: useRef(),
    proof_of_address: useRef(),
    business_license: useRef()
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('#d0d5dd', 'gray.700');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      notify({
        title: 'File Too Large',
        body: 'File size must be less than 5MB',
        color: 'red'
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      notify({
        title: 'Invalid File Type',
        body: 'Only PDF, JPG, and PNG files are allowed',
        color: 'red'
      });
      return;
    }

    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const removeFile = (field) => {
    setFiles(prev => ({ ...prev, [field]: null }));
    if (fileInputRefs[field].current) {
      fileInputRefs[field].current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      const res = await axios.post('/accounts/verify-business/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      notify({
        title: 'Success!',
        body: res.data.message || 'Business verification submitted successfully',
        color: 'green'
      });

      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Submission failed. Please try again.';
      
      notify({
        title: 'Error',
        body: errorMessage,
        color: 'red',
        timeout: 5000
      });

      // Show field-specific errors if available
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          notify({
            title: `${field} Error`,
            body: errors[field][0],
            color: 'red',
            timeout: 4000
          });
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ field, label, description }) => {
    const file = files[field];
    
    return (
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="medium">{label}</FormLabel>
        {description && (
          <Text fontSize="xs" color="gray.600" mb={2}>{description}</Text>
        )}
        
        {!file ? (
          <Box
            border="2px dashed"
            borderColor={borderCol}
            borderRadius="lg"
            p={6}
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
            onClick={() => fileInputRefs[field].current?.click()}
          >
            <Icon as={CloudUpload} w={8} h={8} color="gray.400" mb={2} />
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Click to upload or drag and drop
            </Text>
            <Text fontSize="xs" color="gray.500">
              PDF, JPG or PNG (max 5MB)
            </Text>
            <Input
              ref={fileInputRefs[field]}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              hidden
              onChange={(e) => handleFileChange(field, e.target.files[0])}
            />
          </Box>
        ) : (
          <Flex
            align="center"
            justify="space-between"
            p={3}
            border="1px solid"
            borderColor="green.200"
            bg="green.50"
            borderRadius="lg"
          >
            <Flex align="center" gap={2}>
              <Icon as={FileText} color="green.600" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">{file.name}</Text>
                <Text fontSize="xs" color="gray.600">
                  {(file.size / 1024).toFixed(1)} KB
                </Text>
              </Box>
            </Flex>
            <Icon
              as={X}
              cursor="pointer"
              color="red.500"
              _hover={{ color: 'red.700' }}
              onClick={() => removeFile(field)}
            />
          </Flex>
        )}
      </FormControl>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Business Verification</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Alert status="info" borderRadius="lg" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Verification Process</AlertTitle>
              <AlertDescription fontSize="xs">
                Submit your business details and documents for admin review. 
                You'll be notified once your verification is approved.
              </AlertDescription>
            </Box>
          </Alert>

          <form id="verification-form" onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {/* Business Information */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={4}>
                  Business Information
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Business Name</FormLabel>
                    <Input
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="ABC Motors Limited"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Business Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => handleInputChange('business_email', e.target.value)}
                      placeholder="info@abcmotors.com"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Business Phone</FormLabel>
                    <Input
                      type="tel"
                      value={formData.business_phone}
                      onChange={(e) => handleInputChange('business_phone', e.target.value)}
                      placeholder="+2348012345678"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Business Address</FormLabel>
                    <Input
                      value={formData.business_address}
                      onChange={(e) => handleInputChange('business_address', e.target.value)}
                      placeholder="123 Main Street, Lagos"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">CAC Number (Optional)</FormLabel>
                    <Input
                      value={formData.cac_number}
                      onChange={(e) => handleInputChange('cac_number', e.target.value)}
                      placeholder="RC123456"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">TIN Number (Optional)</FormLabel>
                    <Input
                      value={formData.tin_number}
                      onChange={(e) => handleInputChange('tin_number', e.target.value)}
                      placeholder="12345678-0001"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Document Uploads */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={4}>
                  Supporting Documents (Optional but Recommended)
                </Text>
                <VStack spacing={4}>
                  <FileUploadBox
                    field="cac_document"
                    label="CAC Registration Certificate"
                    description="Upload your Corporate Affairs Commission certificate"
                  />
                  
                  <FileUploadBox
                    field="tin_document"
                    label="TIN Certificate"
                    description="Upload your Tax Identification Number certificate"
                  />
                  
                  <FileUploadBox
                    field="proof_of_address"
                    label="Proof of Address"
                    description="Upload utility bill or lease agreement"
                  />
                  
                  <FileUploadBox
                    field="business_license"
                    label="Business License"
                    description="Upload your business operating license"
                  />
                </VStack>
              </Box>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="verification-form"
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Submitting..."
          >
            Submit Verification
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VerificationFormModal;
