import { useContext, useEffect, useState } from 'react';
import {
  Box, Container, Heading, Button, VStack, HStack, Text, Badge,
  useToast, Spinner, Flex, Icon, Card, CardBody, Stack, Divider,
  Tag, Avatar, Input, IconButton
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlobalStore } from '../../App';
import supportService from '../../services/supportService';
import { MdArrowBack, MdSend } from 'react-icons/md';

const TicketDetail = () => {
  const { id } = useParams();
  const { authUser } = useContext(GlobalStore);
  const navigate = useNavigate();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await supportService.getTicket(id);
      setTicket(data);
    } catch (error) {
      toast({
        title: 'Error loading ticket',
        description: error.response?.data?.message || 'Failed to load ticket',
        status: 'error',
        duration: 3000
      });
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Container>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <IconButton
            icon={<MdArrowBack />}
            onClick={() => navigate('/support')}
            variant="ghost"
            aria-label="Back to tickets"
          />
          <Heading size="lg">Ticket Details</Heading>
        </HStack>

        <Card>
          <CardBody>
            <Stack spacing={4}>
              <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={2} flex={1}>
                  <Heading size="md">{ticket.subject}</Heading>
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
                  <Text fontSize="sm" fontWeight="semibold">
                    Ticket #{ticket.id}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Created {new Date(ticket.date_created).toLocaleDateString()}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {ticket.days_open} days open
                  </Text>
                </VStack>
              </Flex>

              <Divider />

              <Stack spacing={3}>
                <HStack>
                  <Text fontWeight="semibold" minW="120px">Customer:</Text>
                  <HStack>
                    <Avatar size="sm" name={ticket.customer_name} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">{ticket.customer_name}</Text>
                      <Text fontSize="xs" color="gray.500">{ticket.customer_email}</Text>
                    </VStack>
                  </HStack>
                </HStack>

                {ticket.category && (
                  <HStack>
                    <Text fontWeight="semibold" minW="120px">Category:</Text>
                    <Tag colorScheme="purple">{ticket.category.name}</Tag>
                  </HStack>
                )}

                {ticket.tags && ticket.tags.length > 0 && (
                  <HStack align="start">
                    <Text fontWeight="semibold" minW="120px">Tags:</Text>
                    <HStack flexWrap="wrap">
                      {ticket.tags.map((tag) => (
                        <Tag key={tag.id} size="sm" variant="outline">
                          {tag.name}
                        </Tag>
                      ))}
                    </HStack>
                  </HStack>
                )}

                {ticket.correspondents && ticket.correspondents.length > 0 && (
                  <HStack align="start">
                    <Text fontWeight="semibold" minW="120px">Assigned Staff:</Text>
                    <VStack align="start" spacing={1}>
                      {ticket.correspondents.map((staff) => (
                        <HStack key={staff.id}>
                          <Avatar size="xs" name={staff.name} />
                          <Text fontSize="sm">{staff.name}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </HStack>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        {/* Chat Section */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm">Live Chat</Heading>
              <Text color="gray.500" fontSize="sm">
                Chat room: {ticket.chat_room}
              </Text>
              <Divider />
              
              <Box
                minH="300px"
                maxH="500px"
                overflowY="auto"
                p={4}
                bg="gray.50"
                borderRadius="md"
              >
                <VStack spacing={3} align="stretch">
                  <Text color="gray.500" textAlign="center" fontSize="sm">
                    Chat messages will appear here
                  </Text>
                </VStack>
              </Box>

              <HStack>
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && message.trim()) {
                      // Handle send message
                      setMessage('');
                    }
                  }}
                />
                <IconButton
                  icon={<MdSend />}
                  colorScheme="blue"
                  aria-label="Send message"
                  isDisabled={!message.trim()}
                  onClick={() => {
                    // Handle send message
                    setMessage('');
                  }}
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default TicketDetail;
