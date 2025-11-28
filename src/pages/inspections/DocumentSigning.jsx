import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import SignatureCanvas from 'react-signature-canvas';
import inspectionService from '../../services/inspectionService';

const DocumentSigning = () => {
  const { id, documentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const signaturePadRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [signatureStatus, setSignatureStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchDocumentPreview();
    fetchSignatureStatus();
  }, [documentId]);

  const fetchDocumentPreview = async () => {
    try {
      const data = await inspectionService.getDocumentPreview(documentId);
      setDocument(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch document',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const fetchSignatureStatus = async () => {
    setIsLoading(true);
    try {
      const data = await inspectionService.getSignatureStatus(documentId);
      setSignatureStatus(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch signature status',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSignDocument = async () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast({
        title: 'Signature Required',
        description: 'Please provide your signature',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSigning(true);
    try {
      const signatureImage = signaturePadRef.current.toDataURL('image/png');
      
      // Find the current user's signature field
      const mySignatureField = document?.signature_fields?.find(
        (field) => field.status === 'pending'
      );

      if (!mySignatureField) {
        throw new Error('No pending signature field found for you');
      }

      await inspectionService.signDocument(documentId, {
        signature_data: {
          signature_image: signatureImage,
          signature_method: 'drawn',
          coordinates: mySignatureField.coordinates,
        },
        signature_field_id: mySignatureField.field_id,
        signature_method: 'drawn',
      });

      toast({
        title: 'Success',
        description: 'Document signed successfully',
        status: 'success',
        duration: 3000,
      });

      // Refresh status
      await fetchSignatureStatus();
      handleClearSignature();
    } catch (error) {
      toast({
        title: 'Signing Failed',
        description: error.message || 'Failed to sign document',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await inspectionService.downloadDocument(documentId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-document-${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download document',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  const allSignaturesComplete = signatureStatus?.status?.status === 'Fully Signed';
  const mySignaturePending = document?.signature_fields?.some(
    (field) => field.status === 'pending'
  );

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(`/inspections/${id}`)}
            >
              Back
            </Button>
            <Heading size="lg">Inspection Document</Heading>
          </HStack>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={handleDownload}
            isLoading={isDownloading}
            loadingText="Downloading..."
          >
            Download PDF
          </Button>
        </HStack>

        {/* Document Info */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="semibold">Document Status:</Text>
              <Badge colorScheme={allSignaturesComplete ? 'green' : 'yellow'} fontSize="md">
                {signatureStatus?.status?.status || 'Unknown'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="semibold">Signatures:</Text>
              <Text>
                {signatureStatus?.status?.completed_signatures || 0} of{' '}
                {signatureStatus?.status?.total_signatures || 0} completed
              </Text>
            </HStack>
            {document?.metadata && (
              <>
                <Divider />
                <Text fontSize="sm" color="gray.600">
                  {document.metadata.title}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Generated: {new Date(document.metadata.created_at).toLocaleString()}
                </Text>
              </>
            )}
          </VStack>
        </Box>

        {/* Document Preview */}
        {document?.preview_url && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={4}>Document Preview</Heading>
            <Box
              as="iframe"
              src={document.preview_url}
              w="100%"
              h="600px"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            />
          </Box>
        )}

        {/* Signature Section */}
        {mySignaturePending && !allSignaturesComplete && (
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <VStack spacing={4} align="stretch">
              <Heading size="md">Your Signature Required</Heading>
              <Alert status="info">
                <AlertIcon />
                Please sign below to approve this inspection document
              </Alert>

              <Box
                border="2px solid"
                borderColor="gray.300"
                borderRadius="md"
                bg="white"
                p={2}
              >
                <SignatureCanvas
                  ref={signaturePadRef}
                  canvasProps={{
                    width: 600,
                    height: 200,
                    className: 'signature-canvas',
                    style: { width: '100%', height: '200px' },
                  }}
                />
              </Box>

              <HStack spacing={4}>
                <Button
                  flex={1}
                  colorScheme="blue"
                  onClick={handleSignDocument}
                  isLoading={isSigning}
                  loadingText="Signing..."
                >
                  Sign Document
                </Button>
                <Button flex={1} variant="outline" onClick={handleClearSignature}>
                  Clear Signature
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Signature Status */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Signature Status</Heading>
          <VStack spacing={3} align="stretch">
            {document?.signature_fields?.map((field) => (
              <HStack key={field.field_id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold">{field.role_display}</Text>
                  <Text fontSize="sm" color="gray.600">{field.signer_name}</Text>
                </VStack>
                <Badge colorScheme={field.status === 'signed' ? 'green' : 'yellow'}>
                  {field.status === 'signed' ? 'Signed' : 'Pending'}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>

        {allSignaturesComplete && (
          <Alert status="success">
            <AlertIcon />
            All signatures have been collected. The document is now complete and can be downloaded.
          </Alert>
        )}
      </VStack>
    </Container>
  );
};

export default DocumentSigning;
