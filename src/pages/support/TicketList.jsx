import { useContext, useEffect, useState } from 'react';
import {
  Box, Container, Heading, Button, VStack, HStack, Text,
  Badge, Select, Input, useToast, Spinner, Flex, Icon,
  Card, CardBody, Stack, Divider, Tag, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalStore } from '../../App';
import supportService from '../../services/supportService';
import { MdAdd, MdSearch, MdFilterList, MdPhone, MdEmail } from 'react-icons/md';

const TicketList = () => {
  const { authUser } = useContext(GlobalStore);
  const navigate = useNavigate();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    search: ''
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.severity) params.severity = filters.severity;
      
      const data = await supportService.listTickets(params);
      setTickets(data.results || data);
    } catch (error) {
      toast({
        title: 'Error loading tickets',
        description: error.response?.data?.message || 'Failed to load tickets',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.severity]);

  const getStatusColor = (status) => {
    const colors = {
      open: 'blue',
      'in-progress': 'orange',
      'awaiting-user': 'purple',
      resolved: 'green'
    };
    return colors[status] || 'gray';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'red',
      moderate: 'orange',
      low: 'green'
    };
    return colors[severity] || 'gray';
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(filters.search.toLowerCase())
  );

  const isBusinessUser = authUser?.user_type === 'mechanic' || authUser?.user_type === 'dealer';

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Heading size="lg">Support Tickets</Heading>
          {!isBusinessUser && (
            <Button
              leftIcon={<MdAdd />}
              colorScheme="blue"
              onClick={() => navigate('/support/create')}
            >
              Create Ticket
            </Button>
          )}
        </Flex>

        {isBusinessUser && (
          <Card variant="outline" borderColor="blue.200" bg="blue.50">
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="md" color="blue.700">Contact Support</Heading>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
                  <HStack 
                    as="a" 
                    href="https://wa.me/2349035735555" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Icon as={MdPhone} color="green.500" boxSize={5} />
                    <Text fontWeight="medium">WhatsApp: +234 903 573 5555</Text>
                  </HStack>
                  <HStack 
                    as="a" 
                    href="mailto:veyultd@gmail.com,info.veyu@gmail.com"
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Icon as={MdEmail} color="blue.500" boxSize={5} />
                    <Text fontWeight="medium">Email: veyultd@gmail.com, info.veyu@gmail.com</Text>
                  </HStack>
                </Stack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <InputGroup flex={2}>
                <InputLeftElement>
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </InputGroup>

              <Select
                placeholder="All Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                flex={1}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="awaiting-user">Awaiting User</option>
                <option value="resolved">Resolved</option>
              </Select>

              <Select
                placeholder="All Severity"
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                flex={1}
              >
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </Select>
            </Stack>
          </CardBody>
        </Card>

        {/* Tickets List */}
        {loading ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : filteredTickets.length === 0 ? (
          <Card>
            <CardBody>
              <VStack py={12} spacing={4}>
                <Icon as={MdFilterList} boxSize={16} color="gray.300" />
                <Text color="gray.500">No tickets found</Text>
                {!isBusinessUser && (
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate('/support/create')}
                  >
                    Create Your First Ticket
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                as={Link}
                to={`/support/tickets/${ticket.id}`}
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <CardBody>
                  <Stack spacing={3}>
                    <Flex justify="space-between" align="start" flexWrap="wrap" gap={2}>
                      <VStack align="start" spacing={1} flex={1}>
                        <Heading size="sm">{ticket.subject}</Heading>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={getStatusColor(ticket.status)}>
                            {ticket.status_display || ticket.status}
                          </Badge>
                          <Badge colorScheme={getSeverityColor(ticket.severity_level)}>
                            {ticket.severity_display || ticket.severity_level}
                          </Badge>
                          {ticket.is_overdue && (
                            <Badge colorScheme="red">Overdue</Badge>
                          )}
                        </HStack>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(ticket.date_created).toLocaleDateString()}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {ticket.days_open} days open
                        </Text>
                      </VStack>
                    </Flex>

                    {ticket.category && (
                      <HStack>
                        <Tag size="sm" colorScheme="purple">
                          {ticket.category.name}
                        </Tag>
                      </HStack>
                    )}

                    {ticket.tags && ticket.tags.length > 0 && (
                      <HStack flexWrap="wrap">
                        {ticket.tags.map((tag) => (
                          <Tag key={tag.id} size="sm" variant="outline">
                            {tag.name}
                          </Tag>
                        ))}
                      </HStack>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default TicketList;
