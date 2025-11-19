import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { CheckCircle } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import SignaturePad from './SignaturePad';
import inspectionService from '../services/inspectionService';

/**
 * DocumentSigning Component
 * Integrates DocumentPreview and SignaturePad with signature submission API
 */
const DocumentSigning = ({
  documentId,
  signatureFieldId,
  onSigningComplete,
  onCancel,
}) => {
  const [canSign, setCanSign] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [documentStatus, setDocumentStatus] = useState(null);
  const [error, setError] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (documentId) {
      checkSigningPermission();
    }
  }, [documentId]);

  const checkSigningPermission = async () => {
    setIsCheckingPermission(true);
    setError(null);

    try {
      const permission = await inspectionService.checkSignaturePermission(documentId);
      setCanSign(permission.can_sign);

      if (!permission.can_sign) {
        setError(permission.reason || 'You do not have permission to sign this document');
      }
    } catch (err) {
      console.error('Error checking permission:', err);
      setError('Failed to verify signing permission');
      setCanSign(false);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleSignClick = () => {
    if (canSign) {
      onOpen();
    }
  };

  const handleSignatureSave = (data) => {
    setSignatureData(data);
  };

  const handleSignatureClear = () => {
    setSignatureData(null);
  };

  const handleSubmitSignature = async () => {
    if (!signatureData) {
      toast({
        title: 'No signature',
        description: 'Please provide a signature before submitting',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate signature first
      const validationResult = await inspectionService.validateSignature({
        signature_image: signatureData.signature_image,
        signature_method: signatureData.signature_method,
      });

      if (!validationResult.is_valid) {
        toast({
          title: 'Invalid signature',
          description: validationResult.message || 'Signature validation failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }

      // Submit signature
      const submissionData = {
        signature_data: {
          signature_image: signatureData.signature_image,
          signature_method: signatureData.signature_method,
          coordinates: signatureData.coordinates,
          metadata: signatureData.metadata,
        },
        signature_field_id: signatureFieldId,
      };

      const result = await inspectionService.submitSignature(documentId, submissionData);

      // Update document status
      setDocumentStatus(result.document_status);

      toast({
        title: 'Success',
        description: 'Document signed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();

      // Notify parent component
      if (onSigningComplete) {
        onSigningComplete(result);
      }
    } catch (err) {
      console.error('Error submitting signature:', err);
      toast({
        title: 'Submission failed',
        description: err.message || 'Failed to submit signature. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: 'Download started',
      description: 'Your document is being downloaded',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isCheckingPermission) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Checking permissions...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Error Alert */}
      {error && !canSign && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Cannot Sign Document</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Success Alert */}
      {documentStatus === 'signed' && (
        <Alert status="success" borderRadius="md">
          <AlertIcon as={CheckCircle} />
          <Box>
            <AlertTitle>Document Signed</AlertTitle>
            <AlertDescription>
              This document has been successfully signed and is now complete.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Document Preview */}
      <DocumentPreview
        documentId={documentId}
        onSign={handleSignClick}
        onDownload={handleDownload}
        canSign={canSign && documentStatus !== 'signed'}
        showSignButton={documentStatus !== 'signed'}
      />

      {/* Action Buttons */}
      {onCancel && (
        <HStack justify="flex-end" spacing={3}>
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        </HStack>
      )}

      {/* Signature Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Please provide your signature below. You can draw, type, or upload your signature.
              </Text>

              <Divider />

              <SignaturePad
                onSave={handleSignatureSave}
                onClear={handleSignatureClear}
                width={500}
                height={200}
                showMethodSelection={true}
                coordinates={signatureData?.coordinates}
              />

              <Alert status="info" borderRadius="md" size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  By signing this document, you agree that your electronic signature is legally
                  binding and has the same effect as a handwritten signature.
                </Text>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSubmitSignature}
                isLoading={isSubmitting}
                loadingText="Submitting..."
              >
                Submit Signature
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default DocumentSigning;
