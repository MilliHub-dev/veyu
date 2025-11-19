import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Badge,
  useToast,
  useColorModeValue,
  Divider,
  Heading,
} from '@chakra-ui/react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import inspectionService from '../services/inspectionService';

/**
 * DocumentPreview Component
 * Displays inspection documents with preview, zoom, navigation, and signature status
 */
const DocumentPreview = ({
  documentId,
  onSign,
  onDownload,
  canSign = false,
  showSignButton = true,
}) => {
  const [document, setDocument] = useState(null);
  const [signatureStatus, setSignatureStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const previewBg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId]);

  const fetchDocumentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch document preview
      const docData = await inspectionService.getDocumentPreview(documentId);
      setDocument(docData);

      // Fetch signature status
      const statusData = await inspectionService.getSignatureStatus(documentId);
      setSignatureStatus(statusData);
    } catch (err) {
      console.error('Error fetching document:', err);
      setError(err.message || 'Failed to load document');
      toast({
        title: 'Error',
        description: 'Failed to load document preview',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (document?.total_pages) {
      setCurrentPage((prev) => Math.min(prev + 1, document.total_pages));
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await inspectionService.downloadDocument(documentId);
      
      // Create download link
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
        isClosable: true,
      });

      if (onDownload) {
        onDownload();
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getSignatureStatusBadge = (signature) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock, label: 'Pending' },
      signed: { color: 'green', icon: CheckCircle, label: 'Signed' },
      rejected: { color: 'red', icon: XCircle, label: 'Rejected' },
    };

    const config = statusConfig[signature.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <Badge colorScheme={config.color} display="flex" alignItems="center" gap={1}>
        <StatusIcon size={12} />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Loading document...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Icon as={FileText} boxSize={12} color="red.500" />
          <Text color="red.500" fontWeight="medium">
            {error}
          </Text>
          <Button onClick={fetchDocumentData} colorScheme="blue" size="sm">
            Retry
          </Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Document Header */}
      <Box bg={bgColor} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <VStack align="stretch" spacing={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FileText} boxSize={6} color="blue.500" />
              <VStack align="start" spacing={0}>
                <Heading size="sm">{document?.title || 'Inspection Document'}</Heading>
                <Text fontSize="sm" color="gray.500">
                  {document?.inspection_type || 'Standard Inspection'}
                </Text>
              </VStack>
            </HStack>
            <Badge colorScheme="blue">{document?.status || 'Ready'}</Badge>
          </Flex>

          {/* Signature Status Indicators */}
          {signatureStatus?.signatures && signatureStatus.signatures.length > 0 && (
            <>
              <Divider />
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  Signature Status
                </Text>
                {signatureStatus.signatures.map((signature) => (
                  <Flex key={signature.id} justify="space-between" align="center">
                    <HStack spacing={2}>
                      <Text fontSize="sm">{signature.signer_name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        ({signature.role})
                      </Text>
                    </HStack>
                    {getSignatureStatusBadge(signature)}
                  </Flex>
                ))}
              </VStack>
            </>
          )}
        </VStack>
      </Box>

      {/* Preview Controls */}
      <Flex justify="space-between" align="center" bg={bgColor} p={3} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <HStack spacing={2}>
          <IconButton
            icon={<ZoomOut size={18} />}
            onClick={handleZoomOut}
            isDisabled={zoom <= 50}
            size="sm"
            variant="outline"
            aria-label="Zoom out"
          />
          <Text fontSize="sm" fontWeight="medium" minW="60px" textAlign="center">
            {zoom}%
          </Text>
          <IconButton
            icon={<ZoomIn size={18} />}
            onClick={handleZoomIn}
            isDisabled={zoom >= 200}
            size="sm"
            variant="outline"
            aria-label="Zoom in"
          />
        </HStack>

        {document?.total_pages && document.total_pages > 1 && (
          <HStack spacing={2}>
            <IconButton
              icon={<ChevronLeft size={18} />}
              onClick={handlePreviousPage}
              isDisabled={currentPage <= 1}
              size="sm"
              variant="outline"
              aria-label="Previous page"
            />
            <Text fontSize="sm" fontWeight="medium" minW="80px" textAlign="center">
              Page {currentPage} of {document.total_pages}
            </Text>
            <IconButton
              icon={<ChevronRight size={18} />}
              onClick={handleNextPage}
              isDisabled={currentPage >= document.total_pages}
              size="sm"
              variant="outline"
              aria-label="Next page"
            />
          </HStack>
        )}

        <ButtonGroup size="sm" spacing={2}>
          <Button
            leftIcon={<Download size={16} />}
            onClick={handleDownload}
            isLoading={isDownloading}
            variant="outline"
            colorScheme="blue"
          >
            Download
          </Button>
          {showSignButton && canSign && (
            <Button onClick={onSign} colorScheme="green">
              Sign Document
            </Button>
          )}
        </ButtonGroup>
      </Flex>

      {/* Document Preview */}
      <Box
        bg={previewBg}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        minH="600px"
        position="relative"
      >
        {document?.preview_url ? (
          <Box
            as="iframe"
            src={`${document.preview_url}#page=${currentPage}`}
            width="100%"
            height="600px"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              border: 'none',
            }}
            title="Document Preview"
          />
        ) : (
          <Flex justify="center" align="center" h="600px">
            <VStack spacing={3}>
              <Icon as={FileText} boxSize={16} color="gray.400" />
              <Text color="gray.500">No preview available</Text>
            </VStack>
          </Flex>
        )}
      </Box>

      {/* Document Info */}
      {document && (
        <Box bg={bgColor} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" color="gray.600">
              <strong>Document ID:</strong> {document.id}
            </Text>
            {document.created_at && (
              <Text fontSize="sm" color="gray.600">
                <strong>Created:</strong> {new Date(document.created_at).toLocaleString()}
              </Text>
            )}
            {document.template_type && (
              <Text fontSize="sm" color="gray.600">
                <strong>Template:</strong> {document.template_type}
              </Text>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default DocumentPreview;
