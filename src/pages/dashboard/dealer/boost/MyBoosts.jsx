import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import boostService from '../../../../services/boostService';
import { LoadingSpinner } from '../../../../components/loaders';

const MyBoosts = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [boosts, setBoosts] = useState({ active_boosts: [], inactive_boosts: [] });

  useEffect(() => {
    loadBoosts();
  }, []);

  const loadBoosts = async () => {
    setLoading(true);
    try {
      const response = await boostService.getMyBoosts();
      if (response?.data) {
        setBoosts(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error loading boosts',
        description: error.message || 'Failed to load your boosts',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBoost = async (listingUuid) => {
    if (!confirm('Are you sure you want to cancel this boost?')) {
      return;
    }

    try {
      await boostService.cancelBoost(listingUuid);
      toast({
        title: 'Boost cancelled',
        status: 'success',
        duration: 3000,
      });
      loadBoosts();
    } catch (error) {
      toast({
        title: 'Error cancelling boost',
        description: error.message || 'Failed to cancel boost',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const BoostCard = ({ boost, isActive }) => (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Heading size="sm">{boost.listing_title}</Heading>
            <Badge colorScheme={isActive ? 'green' : 'gray'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>

          <SimpleGrid columns={2} spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.600">Duration</Text>
              <Text fontWeight="semibold">
                {boost.duration_count} {boost.duration_display}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">Amount Paid</Text>
              <Text fontWeight="semibold">{boost.formatted_amount}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">Start Date</Text>
              <Text fontWeight="semibold">
                {new Date(boost.start_date).toLocaleDateString()}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">End Date</Text>
              <Text fontWeight="semibold">
                {new Date(boost.end_date).toLocaleDateString()}
              </Text>
            </Box>
          </SimpleGrid>

          {isActive && (
            <>
              <Divider />
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Days Remaining: <strong>{boost.days_remaining}</strong>
                </Text>
                <Badge colorScheme="blue">{boost.payment_status_display}</Badge>
              </HStack>
            </>
          )}

          {!isActive && boost.payment_status === 'pending' && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => handleCancelBoost(boost.listing_uuid)}
            >
              Cancel Boost
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner fullscreen message="Loading your boosts..." />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>My Boosts</Heading>
          <Text color="gray.600">
            Manage your listing boosts and track their performance
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Boosts</StatLabel>
                <StatNumber>{boosts.total_active || 0}</StatNumber>
                <StatHelpText>Currently running</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Inactive Boosts</StatLabel>
                <StatNumber>{boosts.total_inactive || 0}</StatNumber>
                <StatHelpText>Expired or cancelled</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Boosts</StatLabel>
                <StatNumber>
                  {(boosts.total_active || 0) + (boosts.total_inactive || 0)}
                </StatNumber>
                <StatHelpText>All time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Tabs colorScheme="green">
          <TabList>
            <Tab>Active Boosts ({boosts.total_active || 0})</Tab>
            <Tab>Inactive Boosts ({boosts.total_inactive || 0})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {boosts.active_boosts?.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {boosts.active_boosts.map((boost) => (
                    <BoostCard key={boost.id} boost={boost} isActive={true} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={10}>
                  <TrendingUp size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
                  <Text mt={4} color="gray.600">
                    No active boosts
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Boost your listings to get more visibility
                  </Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel px={0}>
              {boosts.inactive_boosts?.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {boosts.inactive_boosts.map((boost) => (
                    <BoostCard key={boost.id} boost={boost} isActive={false} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text color="gray.600">No inactive boosts</Text>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default MyBoosts;
