import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Badge,
    Button,
    Image,
    Grid,
    GridItem,
    Divider,
    Stack,
    Flex,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { GlobalStore } from "../../contexts/GlobalStore";
import { objectifyJSON } from "../../utils";
import {
    ClipboardCheck,
    Calendar,
    User,
    Car,
    FileText,
    Download,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";

export const InspectionDetailPage = () => {
    const { inspectionId } = useParams();
    const navigate = useNavigate();
    const { axios, notify } = useContext(GlobalStore);
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchInspectionDetail() {
        try {
            setLoading(true);
            const res = await axios.get(`/inspections/${inspectionId}/`);
            const data = objectifyJSON(res.data);

            if (res.status === 200) {
                console.log("Inspection Detail:", data.data);
                setInspection(data?.data);
            }
        } catch (error) {
            console.error('Fetch inspection error:', error);
            notify({
                title: 'Error',
                body: error?.response?.data?.message || 'Failed to fetch inspection details',
                color: 'red'
            });
        } finally {
            setLoading(false);
        }
    }

    async function downloadReport() {
        try {
            const response = await axios.get(
                `/inspections/${inspectionId}/generate-document/`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inspection-${inspectionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            notify({
                title: 'Success',
                body: 'Inspection report downloaded successfully',
                color: 'green'
            });
        } catch (error) {
            notify({
                title: 'Error',
                body: 'Failed to download inspection report',
                color: 'red'
            });
        }
    }

    useEffect(() => {
        fetchInspectionDetail();
    }, [inspectionId]);

    if (loading) {
        return (
            <Container maxW="container.xl" py={8}>
                <VStack spacing={4} py={20}>
                    <Spinner size="xl" color="blue.500" />
                    <Text>Loading inspection details...</Text>
                </VStack>
            </Container>
        );
    }

    if (!inspection) {
        return (
            <Container maxW="container.xl" py={8}>
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Inspection Not Found</AlertTitle>
                        <AlertDescription>
                            The inspection you're looking for doesn't exist or you don't have access to it.
                        </AlertDescription>
                    </Box>
                </Alert>
                <Button mt={4} leftIcon={<ArrowLeft size={18} />} onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Container>
        );
    }

    const vehicle = inspection?.vehicle;
    const statusColors = {
        draft: 'gray',
        in_progress: 'blue',
        completed: 'green',
        signed: 'purple',
        archived: 'orange'
    };
    const typeLabels = {
        pre_purchase: 'Pre-Purchase',
        pre_rental: 'Pre-Rental',
        maintenance: 'Maintenance',
        insurance: 'Insurance'
    };

    return (
        <Box py={8}>
            <Container maxW="container.xl">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                    <HStack spacing={4}>
                        <Button
                            leftIcon={<ArrowLeft size={18} />}
                            variant="ghost"
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                        <Box>
                            <Heading size="lg">Inspection Details</Heading>
                            <Text color="gray.600" fontSize="sm">
                                Inspection #{inspection?.id || inspection?.reference_number}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack spacing={2}>
                        <Badge
                            colorScheme={statusColors[inspection?.status] || 'gray'}
                            fontSize="md"
                            px={4}
                            py={2}
                            borderRadius="full"
                        >
                            {inspection?.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {inspection?.status === 'completed' && (
                            <Button
                                colorScheme="green"
                                leftIcon={<Download size={18} />}
                                onClick={downloadReport}
                            >
                                Download Report
                            </Button>
                        )}
                    </HStack>
                </Flex>

                <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
                    {/* Main Content */}
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <VStack spacing={6} align="stretch">
                            {/* Vehicle Info */}
                            <Card>
                                <CardBody>
                                    <Heading size="md" mb={4}>
                                        <HStack spacing={2}>
                                            <Car size={20} />
                                            <Text>Vehicle Information</Text>
                                        </HStack>
                                    </Heading>
                                    <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                                        {vehicle?.images?.[0]?.url && (
                                            <Image
                                                src={vehicle.images[0].url}
                                                alt={vehicle?.name}
                                                w={{ base: '100%', md: '200px' }}
                                                h="150px"
                                                objectFit="cover"
                                                borderRadius="lg"
                                            />
                                        )}
                                        <VStack align="start" spacing={2} flex={1}>
                                            <Heading size="sm">{vehicle?.name || 'N/A'}</Heading>
                                            {vehicle?.condition && (
                                                <Badge colorScheme="purple">{vehicle.condition}</Badge>
                                            )}
                                            <Text fontSize="sm" color="gray.600">
                                                VIN: {vehicle?.vin || 'N/A'}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                Year: {vehicle?.year || 'N/A'}
                                            </Text>
                                        </VStack>
                                    </Flex>
                                </CardBody>
                            </Card>

                            {/* Inspection Details */}
                            <Card>
                                <CardBody>
                                    <Heading size="md" mb={4}>
                                        <HStack spacing={2}>
                                            <ClipboardCheck size={20} />
                                            <Text>Inspection Details</Text>
                                        </HStack>
                                    </Heading>
                                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                                        <Box>
                                            <Text fontSize="sm" color="gray.500" mb={1}>
                                                Inspection Type
                                            </Text>
                                            <Text fontWeight="600">
                                                {typeLabels[inspection?.inspection_type] || inspection?.inspection_type || 'N/A'}
                                            </Text>
                                        </Box>
                                        {inspection?.scheduled_date && (
                                            <Box>
                                                <Text fontSize="sm" color="gray.500" mb={1}>
                                                    Scheduled Date
                                                </Text>
                                                <HStack spacing={1}>
                                                    <Calendar size={16} />
                                                    <Text fontWeight="600">
                                                        {new Date(inspection.scheduled_date).toLocaleDateString()}
                                                    </Text>
                                                </HStack>
                                            </Box>
                                        )}
                                        {inspection?.inspector_name && (
                                            <Box>
                                                <Text fontSize="sm" color="gray.500" mb={1}>
                                                    Inspector
                                                </Text>
                                                <HStack spacing={1}>
                                                    <User size={16} />
                                                    <Text fontWeight="600">{inspection.inspector_name}</Text>
                                                </HStack>
                                            </Box>
                                        )}
                                        {inspection?.overall_condition && (
                                            <Box>
                                                <Text fontSize="sm" color="gray.500" mb={1}>
                                                    Overall Condition
                                                </Text>
                                                <Badge
                                                    colorScheme={
                                                        inspection.overall_condition === 'excellent' ? 'green' :
                                                        inspection.overall_condition === 'good' ? 'blue' :
                                                        inspection.overall_condition === 'fair' ? 'yellow' : 'red'
                                                    }
                                                    fontSize="md"
                                                    px={3}
                                                    py={1}
                                                >
                                                    {inspection.overall_condition.toUpperCase()}
                                                </Badge>
                                            </Box>
                                        )}
                                    </Grid>
                                </CardBody>
                            </Card>

                            {/* Inspection Sections */}
                            {inspection?.exterior_data && Object.keys(inspection.exterior_data).length > 0 && (
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Exterior</Heading>
                                        <VStack align="stretch" spacing={2}>
                                            {Object.entries(inspection.exterior_data).map(([key, value]) => (
                                                <Flex key={key} justify="space-between">
                                                    <Text fontSize="sm" color="gray.600">{key.replace(/_/g, ' ').toUpperCase()}</Text>
                                                    <Text fontSize="sm" fontWeight="600">{value}</Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}

                            {inspection?.interior_data && Object.keys(inspection.interior_data).length > 0 && (
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Interior</Heading>
                                        <VStack align="stretch" spacing={2}>
                                            {Object.entries(inspection.interior_data).map(([key, value]) => (
                                                <Flex key={key} justify="space-between">
                                                    <Text fontSize="sm" color="gray.600">{key.replace(/_/g, ' ').toUpperCase()}</Text>
                                                    <Text fontSize="sm" fontWeight="600">{value}</Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}

                            {inspection?.engine_data && Object.keys(inspection.engine_data).length > 0 && (
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Engine & Mechanical</Heading>
                                        <VStack align="stretch" spacing={2}>
                                            {Object.entries(inspection.engine_data).map(([key, value]) => (
                                                <Flex key={key} justify="space-between">
                                                    <Text fontSize="sm" color="gray.600">{key.replace(/_/g, ' ').toUpperCase()}</Text>
                                                    <Text fontSize="sm" fontWeight="600">{value}</Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Inspector Notes */}
                            {inspection?.inspector_notes && (
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Inspector Notes</Heading>
                                        <Text fontSize="sm" whiteSpace="pre-wrap">
                                            {inspection.inspector_notes}
                                        </Text>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Recommendations */}
                            {inspection?.recommended_actions && inspection.recommended_actions.length > 0 && (
                                <Card>
                                    <CardBody>
                                        <Heading size="md" mb={4}>Recommended Actions</Heading>
                                        <VStack align="stretch" spacing={2}>
                                            {inspection.recommended_actions.map((action, idx) => (
                                                <HStack key={idx} spacing={2} align="start">
                                                    <AlertCircle size={16} color="orange" />
                                                    <Text fontSize="sm">{action}</Text>
                                                </HStack>
                                            ))}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>
                    </GridItem>

                    {/* Sidebar */}
                    <GridItem colSpan={{ base: 1, lg: 1 }}>
                        <VStack spacing={4} align="stretch" position="sticky" top="20px">
                            {/* Quick Actions */}
                            <Card>
                                <CardBody>
                                    <Heading size="sm" mb={4}>Quick Actions</Heading>
                                    <VStack spacing={2} align="stretch">
                                        {inspection?.status === 'completed' && (
                                            <Button
                                                colorScheme="green"
                                                leftIcon={<Download size={18} />}
                                                onClick={downloadReport}
                                                w="full"
                                            >
                                                Download Report
                                            </Button>
                                        )}
                                        <Button
                                            as={Link}
                                            to="/cart"
                                            variant="outline"
                                            w="full"
                                        >
                                            Back to Cart
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Timeline */}
                            {inspection?.created_at && (
                                <Card>
                                    <CardBody>
                                        <Heading size="sm" mb={4}>Timeline</Heading>
                                        <VStack align="stretch" spacing={3}>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500">Created</Text>
                                                <Text fontSize="sm" fontWeight="600">
                                                    {new Date(inspection.created_at).toLocaleString()}
                                                </Text>
                                            </Box>
                                            {inspection?.updated_at && (
                                                <Box>
                                                    <Text fontSize="xs" color="gray.500">Last Updated</Text>
                                                    <Text fontSize="sm" fontWeight="600">
                                                        {new Date(inspection.updated_at).toLocaleString()}
                                                    </Text>
                                                </Box>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            )}
                        </VStack>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
};

export default InspectionDetailPage;
