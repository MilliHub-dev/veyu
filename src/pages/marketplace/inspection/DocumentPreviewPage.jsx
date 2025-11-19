import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { GlobalStore } from '../../../App';
import DocumentPreview from '../../../components/DocumentPreview';
import SignaturePad from '../../../components/SignaturePad';
import inspectionService from '../../../services/inspectionService';

/**
 * DocumentPreviewPage
 * Page for previewing and signing inspection documents
 */
const DocumentPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify, authUser } = useContext(GlobalStore);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);
  const [error, setError] = useState(null);
  const [canSign, setCanSign] = useState(false);

  const documentId = searchParams.get('documentId');
  const inspectionId = searchParams.get('inspectionId');

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    } else {
      setError('No document ID provided');
      setIsLoading(false);
    }
  }, [documentId]);

  const fetchDocumentData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await inspectionService.getDocumentPreview(documentId);
      
      if (response?.success) {
        setDocumentData(response.data);
        
        // Check if current user can sign
        const statusResponse = await inspectionService.getSignatureStatus(documentId);
        if (statusResponse?.success) {
          const userSignature = statusResponse.data?.signatures?.find(
            sig => sig.signer_id === authUser?.id && sig.status === 'pending'
          );
          setCanSign(!!userSignature);
        }
      } else {
        throw new Error(response?.message || 'Failed to load document');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError(err.message || 'Failed to load document');
      notify({
        title: 'Error',
        body: 'Failed to load document. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignDocument = () => {
    onOpen();
  };

  const handleSignatureSubmit = async (signatureData) => {
    try {
      setIsSubmittingSignature(true);
      
      const response = await inspectionService.submitSignature(documentId, {
        signature_image: signatureData.signatureImage,
        signature_method: signatureData.method || 'drawn',
        coordinates: signatureData.coordinates,
      });
      
      if (response?.success) {
        notify({
          title: 'Signature Submitted',
          body: 'Your signature has been submitted successfully',
          color: 'green',
        });

        onClose();
        
        // Refresh document data to show updated signature status
        await fetchDocumentData();
        
        // Navigate to success page or back to listing
        setTimeout(() => {
          if (inspectionId) {
            navigate(`/inspection/complete?inspectionId=${inspectionId}`);
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        throw new Error(response?.message || 'Failed to submit signature');
      }
    } catch (err) {
      console.error('Error submitting signature:', err);
      notify({
        title: 'Signature Failed',
        body: err.message || 'Failed to submit signature. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmittingSignature(false);
    }
  };

  const handleDownload = () => {
    notify({
      title: 'Download Complete',
      body: 'Document has been downloaded',
      color: 'green',
    });
  };

  if (isLoading) {
    return (
      <Box bg="white" minH="100vh">
        <Box bg="blue.600" py={8} mb={8}>
          <Container maxW="container.xl" textAlign="center">
            <Heading color="white" size="lg" fontWeight="400">
              Document Preview
            </Heading>
            <Text color="whiteAlpha.900" mt={2}>
              Loading document...
            </Text>
          </Container>
        </Box>

        <Container maxW="container.xl" py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading document...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="white" minH="100vh">
        <Box bg="blue.600" py={8} mb={8}>
          <Container maxW="container.xl" textAlign="center">
            <Heading color="white" size="lg" fontWeight="400">
              Document Preview
            </Heading>
            <Text color="whiteAlpha.900" mt={2}>
              Error loading document
            </Text>
          </Container>
        </Box>

        <Container maxW="container.md" py={10}>
          <VStack spacing={6}>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
            <Button
              leftIcon={<ArrowLeft size={20} />}
              onClick={() => navigate(-1)}
              colorScheme="blue"
            >
              Go Back
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="white" minH="100vh">
      <Box bg="blue.600" py={8} mb={8}>
        <Container maxW="container.xl" textAlign="center">
          <Heading color="white" size="lg" fontWeight="400">
            Inspection Document
          </Heading>
          <Text color="whiteAlpha.900" mt={2}>
            Review and sign the inspection document
          </Text>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        <Button
          leftIcon={<ArrowLeft size={20} />}
          variant="ghost"
          mb={6}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        {canSign && (
          <Alert status="info" mb={6} borderRadius="md">
            <AlertIcon />
            <Text>
              Please review the document carefully before signing. Your signature confirms the accuracy of the inspection.
            </Text>
          </Alert>
        )}

        <DocumentPreview
          documentId={documentId}
          onSign={handleSignDocument}
          onDownload={handleDownload}
          canSign={canSign}
          showSignButton={canSign}
        />
      </Container>

      {/* Signature Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Draw your signature below. This will be added to the inspection document.
                </Text>
              </Alert>

              <SignaturePad
                onSave={handleSignatureSubmit}
                isSubmitting={isSubmittingSignature}
                showMethodSelection={true}
              />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DocumentPreviewPage;
