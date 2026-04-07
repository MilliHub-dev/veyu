import {
    Box, Card, CardBody, Flex, Heading, Text, HStack, VStack, Badge,
    Button, Icon, Tag, Divider, useColorModeValue, Tooltip,
    SimpleGrid, Stat, StatLabel, StatNumber, useBreakpointValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Award, Shield } from "lucide-react";
import { TopRatedBadgeIcon } from "./icons";
import { motion } from "framer-motion";
import { BusinessLogo } from "./BusinessLogo";
import { formatCurrency } from "../utils";

const MotionCard = motion(Card);

function resolveLocation(loc) {
    if (!loc) return 'Location not specified';
    if (typeof loc === 'string') return loc;
    return loc.city || loc.state || loc.full_address || loc.address || loc.country || 'Location not specified';
}

export const MechanicCard = ({ mechanic, ...props }) => {
    const bgColor = useColorModeValue('white', 'gray.800');
    const statBg = useColorModeValue('gray.50', 'gray.700');

    if (!mechanic) return null;

    const rating = typeof mechanic?.rating === 'number' ? mechanic.rating : 4.5;
    const reviewCount = mechanic?.reviews?.length || mechanic?.review_count || 0;
    const services = mechanic?.services || [];
    const displayServices = services.slice(0, 3);
    const remainingServices = services.length - 3;

    return (
        <Box
            as={motion.div}
            whileHover={{ y: -4 }}
            transition="0.3s ease"
            h="100%"
            {...props}
        >
            <MotionCard
                bg={bgColor}
                border="2px solid"
                borderColor="transparent"
                borderRadius="2xl"
                overflow="hidden"
                shadow="md"
                h="100%"
                _hover={{
                    shadow: '2xl',
                    borderColor: '#F4A950',
                }}
                transition="all 0.3s ease"
                cursor="pointer"
            >
                <CardBody p={{ base: 4, md: 5 }}>
                    <VStack align="stretch" spacing={{ base: 3, md: 4 }} h="100%">

                        {/* ── Header ── */}
                        <Flex gap={{ base: 3, md: 4 }} align="flex-start">
                            {/* Avatar — shrinks slightly on mobile */}
                            <Link to={`/mechanics/${mechanic?.uuid}`} style={{ flexShrink: 0 }}>
                                <BusinessLogo
                                    logoUrl={mechanic?.logo}
                                    businessName={mechanic?.business_name || mechanic?.user?.name}
                                    size={{ base: 'lg', md: 'xl' }}
                                    borderRadius="50%"
                                />
                            </Link>

                            <Box flex={1} minW={0}>
                                {/* Name */}
                                <Link to={`/mechanics/${mechanic?.uuid}`}>
                                    <Heading
                                        size={{ base: 'sm', md: 'md' }}
                                        fontWeight="bold"
                                        mb={1}
                                        noOfLines={2}
                                        color="gray.900"
                                        _hover={{ color: '#F4A950' }}
                                        transition="color 0.2s"
                                    >
                                        {mechanic?.business_name || mechanic?.user?.name}
                                    </Heading>
                                </Link>

                                {/* Headline */}
                                <Text
                                    color="gray.500"
                                    fontSize={{ base: 'xs', md: 'sm' }}
                                    mb={2}
                                    noOfLines={2}
                                >
                                    {mechanic?.headline || 'Professional automotive service provider'}
                                </Text>

                                {/* Rating + Level badge — wraps naturally */}
                                <Flex flexWrap="wrap" gap={2} align="center" mb={2}>
                                    <HStack spacing={1}>
                                        <Icon as={Star} color="#F4A950" fill="#F4A950" boxSize={{ base: 3, md: 4 }} />
                                        <Text fontWeight="bold" fontSize={{ base: 'xs', md: 'sm' }}>
                                            {rating.toFixed(1)}
                                        </Text>
                                        <Text color="gray.400" fontSize={{ base: 'xs', md: 'sm' }}>
                                            ({reviewCount})
                                        </Text>
                                    </HStack>
                                    <Badge
                                        bg="#F4A950"
                                        color="white"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                        fontSize="10px"
                                        fontWeight="bold"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <TopRatedBadgeIcon viewBox="0 0 27 28" w="11px" h="11px" />
                                        {mechanic?.level || 'Pro'}
                                    </Badge>
                                </Flex>

                                {/* Location — truncates long strings */}
                                <Flex align="center" gap={1} color="gray.500" minW={0}>
                                    <Icon as={MapPin} boxSize={3} color="#F4A950" flexShrink={0} />
                                    <Text fontSize={{ base: 'xs', md: 'sm' }} noOfLines={1} flex={1} minW={0}>
                                        {resolveLocation(mechanic?.location)}
                                    </Text>
                                    {mechanic?.distance && (
                                        <Text fontSize="xs" color="gray.400" flexShrink={0} ml={1}>
                                            · {mechanic.distance}
                                        </Text>
                                    )}
                                </Flex>
                            </Box>
                        </Flex>

                        {/* ── Services ── */}
                        {services.length > 0 && (
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1.5} textTransform="uppercase" letterSpacing="wide">
                                    Services
                                </Text>
                                <Flex flexWrap="wrap" gap={1.5}>
                                    {displayServices.map((service, idx) => (
                                        <Tag
                                            key={idx}
                                            size="sm"
                                            bg="orange.50"
                                            color="orange.700"
                                            borderRadius="full"
                                            px={2.5}
                                            py={0.5}
                                            fontSize="xs"
                                            fontWeight="medium"
                                        >
                                            {service?.service || service?.name || service}
                                        </Tag>
                                    ))}
                                    {remainingServices > 0 && (
                                        <Tag
                                            size="sm"
                                            bg="#F4A950"
                                            color="white"
                                            borderRadius="full"
                                            px={2.5}
                                            py={0.5}
                                            fontSize="xs"
                                            fontWeight="bold"
                                        >
                                            +{remainingServices}
                                        </Tag>
                                    )}
                                </Flex>
                            </Box>
                        )}

                        {/* ── Stats ── */}
                        <SimpleGrid
                            columns={3}
                            spacing={2}
                            py={3}
                            px={2}
                            bg={statBg}
                            borderRadius="xl"
                        >
                            <Stat textAlign="center">
                                <StatNumber
                                    fontSize={{ base: 'sm', md: 'md' }}
                                    fontWeight="bold"
                                    color="#F4A950"
                                    isTruncated
                                >
                                    {formatCurrency(mechanic?.price_start || 5000, mechanic?.currency)}
                                </StatNumber>
                                <StatLabel fontSize={{ base: '9px', md: 'xs' }} color="gray.500" lineHeight="1.2">
                                    From
                                </StatLabel>
                            </Stat>

                            <Stat textAlign="center">
                                <StatNumber fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color="#F4A950">
                                    {mechanic?.completed_jobs || '50+'}
                                </StatNumber>
                                <StatLabel fontSize={{ base: '9px', md: 'xs' }} color="gray.500" lineHeight="1.2">
                                    Jobs
                                </StatLabel>
                            </Stat>

                            <Stat textAlign="center">
                                <StatNumber fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color="#F4A950">
                                    {mechanic?.response_time || '< 1hr'}
                                </StatNumber>
                                <StatLabel fontSize={{ base: '9px', md: 'xs' }} color="gray.500" lineHeight="1.2">
                                    Response
                                </StatLabel>
                            </Stat>
                        </SimpleGrid>

                        <Divider />

                        {/* ── Buttons ── */}
                        <Flex gap={2} mt="auto">
                            <Button
                                as={Link}
                                to={`/mechanics/${mechanic?.uuid}`}
                                variant="outline"
                                colorScheme="orange"
                                flex={1}
                                size={{ base: 'sm', md: 'md' }}
                                borderRadius="lg"
                                fontWeight="bold"
                                _hover={{ bg: 'orange.50', borderColor: '#F4A950', transform: 'translateY(-1px)' }}
                            >
                                View
                            </Button>
                            <Button
                                as={Link}
                                to={`/mechanics/${mechanic?.uuid}`}
                                bg="#F4A950"
                                color="white"
                                flex={1}
                                size={{ base: 'sm', md: 'md' }}
                                borderRadius="lg"
                                fontWeight="bold"
                                _hover={{ bg: '#E09940', transform: 'translateY(-1px)' }}
                                _active={{ transform: 'translateY(0)' }}
                            >
                                Book Now
                            </Button>
                        </Flex>

                        {/* ── Trust badges ── */}
                        <Flex
                            flexWrap="wrap"
                            gap={3}
                            justify="center"
                            pt={2}
                            borderTop="1px"
                            borderColor="gray.100"
                        >
                            <Tooltip label="Verified mechanic">
                                <HStack spacing={1}>
                                    <Icon as={Shield} boxSize={3} color="green.500" />
                                    <Text fontSize="xs" color="gray.500">Verified</Text>
                                </HStack>
                            </Tooltip>
                            <Tooltip label="Quick response time">
                                <HStack spacing={1}>
                                    <Icon as={Clock} boxSize={3} color="blue.500" />
                                    <Text fontSize="xs" color="gray.500">Fast Response</Text>
                                </HStack>
                            </Tooltip>
                            <Tooltip label="Professional service">
                                <HStack spacing={1}>
                                    <Icon as={Award} boxSize={3} color="#F4A950" />
                                    <Text fontSize="xs" color="gray.500">Professional</Text>
                                </HStack>
                            </Tooltip>
                        </Flex>

                    </VStack>
                </CardBody>
            </MotionCard>
        </Box>
    );
};
