import {
    Box, Card, CardBody, Flex, Avatar, Heading, Text, HStack, VStack, Badge, Button, Icon,
    Tag, Divider, useColorModeValue, Tooltip, IconButton, SimpleGrid, Stat, StatLabel, StatNumber
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Award, MessageCircle, Calendar, Wrench, Shield } from "lucide-react";
import { TopRatedBadgeIcon } from "./icons";
import { motion } from "framer-motion";
import { BusinessLogo } from "./BusinessLogo";

const MotionCard = motion(Card);

export const MechanicCard = ({ mechanic, ...props }) => {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    if (!mechanic) return null;

    const rating = mechanic?.rating || 4.5;
    const reviewCount = mechanic?.reviews?.length || 0;
    const services = mechanic?.services || [];
    const displayServices = services.slice(0, 3);
    const remainingServices = services.length - 3;

    return (
        <Box 
            as={motion.div}
            whileHover={{ y: -4 }}
            transition="0.3s ease"
            {...props}
        >
            <MotionCard
                bg={bgColor}
                border="2px solid"
                borderColor="transparent"
                borderRadius="2xl"
                overflow="hidden"
                shadow="lg"
                _hover={{
                    shadow: '2xl',
                    borderColor: '#F4A950',
                    transform: 'translateY(-2px)'
                }}
                transition="all 0.3s ease"
                cursor="pointer"
            >
                <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                        {/* Header Section */}
                        <Flex gap={4} align="flex-start">
                            <Link to={`/mechanics/${mechanic?.uuid}`}>
                                <BusinessLogo
                                    logoUrl={mechanic?.logo}
                                    businessName={mechanic?.business_name || mechanic?.user?.name}
                                    size="xl"
                                    borderRadius="50%"
                                />
                            </Link>
                            
                            <Box flex={1} minW={0}>
                                <Link to={`/mechanics/${mechanic?.uuid}`}>
                                    <Heading 
                                        size="md" 
                                        fontWeight="bold" 
                                        mb={2}
                                        noOfLines={2}
                                        color="gray.900"
                                        _hover={{ color: "#F4A950" }}
                                        transition="color 0.2s"
                                    >
                                        {mechanic?.business_name || mechanic?.user?.name}
                                    </Heading>
                                </Link>
                                
                                <Text 
                                    color="gray.600" 
                                    fontSize="sm" 
                                    mb={3}
                                    noOfLines={2}
                                >
                                    {mechanic?.headline || "Professional automotive service provider"}
                                </Text>

                                {/* Rating and Level */}
                                <HStack spacing={3} mb={3}>
                                    <HStack spacing={1}>
                                        <Icon as={Star} color="#F4A950" fill="#F4A950" boxSize={4} />
                                        <Text fontWeight="bold" fontSize="sm">
                                            {rating.toFixed(1)}
                                        </Text>
                                        <Text color="gray.500" fontSize="sm">
                                            ({reviewCount} reviews)
                                        </Text>
                                    </HStack>
                                    
                                    <Badge 
                                        bg="#F4A950" 
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <TopRatedBadgeIcon viewBox="0 0 27 28" w="14px" h="14px" />
                                        {mechanic?.level || 'Pro'}
                                    </Badge>
                                </HStack>

                                {/* Location */}
                                <HStack spacing={2} color="gray.600" mb={3}>
                                    <Icon as={MapPin} boxSize={4} color="#F4A950" />
                                    <Text fontSize="sm" noOfLines={1}>
                                        {mechanic?.location || 'Location not specified'}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        • {mechanic?.distance || '< 5km away'}
                                    </Text>
                                </HStack>
                            </Box>
                        </Flex>

                        {/* Services Section */}
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                Services Offered:
                            </Text>
                            <HStack spacing={2} flexWrap="wrap">
                                {displayServices.map((service, idx) => (
                                    <Tag 
                                        key={idx}
                                        size="sm" 
                                        bg="gray.100"
                                        color="gray.700"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="medium"
                                    >
                                        {service?.service}
                                    </Tag>
                                ))}
                                {remainingServices > 0 && (
                                    <Tag 
                                        size="sm" 
                                        bg="#F4A950"
                                        color="white"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        +{remainingServices} more
                                    </Tag>
                                )}
                            </HStack>
                        </Box>

                        {/* Stats Section */}
                        <SimpleGrid columns={3} spacing={4} py={3} bg="gray.50" borderRadius="lg">
                            <Stat textAlign="center">
                                <StatNumber fontSize="lg" fontWeight="bold" color="#F4A950">
                                    ₦{parseInt(mechanic?.price_start || 5000).toLocaleString()}
                                </StatNumber>
                                <StatLabel fontSize="xs" color="gray.600">Starting from</StatLabel>
                            </Stat>
                            
                            <Stat textAlign="center">
                                <StatNumber fontSize="lg" fontWeight="bold" color="#F4A950">
                                    {mechanic?.completed_jobs || '50+'}
                                </StatNumber>
                                <StatLabel fontSize="xs" color="gray.600">Jobs Done</StatLabel>
                            </Stat>
                            
                            <Stat textAlign="center">
                                <StatNumber fontSize="lg" fontWeight="bold" color="#F4A950">
                                    {mechanic?.response_time || '< 1hr'}
                                </StatNumber>
                                <StatLabel fontSize="xs" color="gray.600">Response</StatLabel>
                            </Stat>
                        </SimpleGrid>

                        <Divider />

                        {/* Action Buttons */}
                        <Flex gap={3}>
                            <Button
                                as={Link}
                                to={`/mechanics/${mechanic?.uuid}`}
                                variant="outline"
                                colorScheme="orange"
                                flex={1}
                                size="md"
                                borderRadius="lg"
                                fontWeight="bold"
                                _hover={{ 
                                    bg: "orange.50",
                                    borderColor: "#F4A950",
                                    transform: "translateY(-1px)"
                                }}
                            >
                                View Profile
                            </Button>
                            
                            <Button
                                as={Link}
                                to={`/mechanics/${mechanic?.uuid}`}
                                bg="#F4A950"
                                color="white"
                                flex={1}
                                size="md"
                                borderRadius="lg"
                                fontWeight="bold"
                                _hover={{ 
                                    bg: "#E09940",
                                    transform: "translateY(-1px)"
                                }}
                                _active={{ transform: "translateY(0)" }}
                            >
                                Book Now
                            </Button>
                        </Flex>

                        {/* Trust Indicators */}
                        <HStack spacing={4} justify="center" pt={2} borderTop="1px" borderColor="gray.100">
                            <Tooltip label="Verified mechanic">
                                <HStack spacing={1}>
                                    <Icon as={Shield} boxSize={3} color="green.500" />
                                    <Text fontSize="xs" color="gray.600">Verified</Text>
                                </HStack>
                            </Tooltip>
                            
                            <Tooltip label="Quick response time">
                                <HStack spacing={1}>
                                    <Icon as={Clock} boxSize={3} color="blue.500" />
                                    <Text fontSize="xs" color="gray.600">Fast Response</Text>
                                </HStack>
                            </Tooltip>
                            
                            <Tooltip label="Professional service">
                                <HStack spacing={1}>
                                    <Icon as={Award} boxSize={3} color="#F4A950" />
                                    <Text fontSize="xs" color="gray.600">Professional</Text>
                                </HStack>
                            </Tooltip>
                        </HStack>
                    </VStack>
                </CardBody>
            </MotionCard>
        </Box>
    );
};