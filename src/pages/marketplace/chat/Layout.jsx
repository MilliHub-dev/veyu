import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  Button,
  IconButton,
  Divider,
  Badge,
  useMediaQuery,
  useColorModeValue,
  Heading,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Search, MessageCircle, MoreVertical, CheckCheck, Clock } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { GlobalStore } from '../../../App';
import { objectifyJSON } from '../../../utils';
import { useParams, Outlet, Link, useNavigate } from 'react-router-dom';
import { FaInbox } from 'react-icons/fa';
import { ChevronLeftIcon } from '@chakra-ui/icons';

function ChatSidebar({ conversations, activeId, onSelect, ...props }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { authUser } = useContext(GlobalStore);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');

  const handleBack = () => {
    if (authUser?.user_type === 'dealer') {
      navigate('/dealer/dashboard');
    } else if (authUser?.user_type === 'mechanic') {
      navigate('/mechanic/dashboard');
    } else {
      navigate('/');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const name = conv?.recipient?.name || conv?.participant?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Box
      w={{ base: '100%', md: '360px' }}
      borderRightWidth={1}
      borderColor={borderColor}
      position="relative"
      h="100%"
      overflow="hidden"
      bg={bgColor}
      {...props}
    >
      {/* Header */}
      <VStack
        spacing={4}
        align="stretch"
        px={5}
        py={5}
        borderBottomWidth={1}
        borderColor={borderColor}
        bg={bgColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <IconButton
              icon={<ChevronLeftIcon w={6} h={6} />}
              variant="ghost"
              onClick={handleBack}
              aria-label="Back"
              size="sm"
            />
            <Heading size="lg" color="gray.800">
              Messages
            </Heading>
          </HStack>
          <HStack spacing={2}>
            <Badge
              colorScheme="blue"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {conversations?.length || 0}
            </Badge>
            <IconButton
              icon={<MoreVertical size={18} />}
              size="sm"
              variant="ghost"
              borderRadius="full"
            />
          </HStack>
        </HStack>

        {/* Search */}
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search conversations..."
            borderRadius="xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={useColorModeValue('gray.50', 'gray.700')}
            border="none"
            _focus={{
              bg: useColorModeValue('white', 'gray.600'),
              boxShadow: 'sm',
            }}
          />
        </InputGroup>
      </VStack>

      {/* Conversations List */}
      <Box overflowY="auto" h="calc(100% - 140px)">
        {filteredConversations.length === 0 ? (
          <Center h="300px">
            <VStack spacing={3} color="gray.500">
              <FaInbox size={48} />
              <Text fontSize="sm" textAlign="center">
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </Text>
              {!searchQuery && (
                <Text fontSize="xs" color="gray.400" textAlign="center" px={8}>
                  Start a conversation by messaging a dealer about a vehicle
                </Text>
              )}
            </VStack>
          </Center>
        ) : (
          <VStack spacing={0} align="stretch">
            {filteredConversations.map((conversation) => {
              const isActive = activeId === conversation.uuid;
              const unread = conversation?.unread_count || 0;
              const hasUnread = unread > 0;

              return (
                <Box
                  key={conversation.id || conversation.uuid}
                  as={Link}
                  to={`${conversation.uuid}`}
                  px={5}
                  py={4}
                  cursor="pointer"
                  bg={isActive ? activeBg : 'transparent'}
                  borderLeftWidth={isActive ? 3 : 0}
                  borderLeftColor="blue.500"
                  _hover={{ bg: isActive ? activeBg : hoverBg }}
                  transition="all 0.2s"
                  onClick={() => onSelect(conversation)}
                >
                  <HStack spacing={3} align="start">
                    {/* Avatar with online status */}
                    <Box position="relative" flexShrink={0}>
                      <Avatar
                        size="md"
                        name={conversation?.recipient?.name || conversation?.participant?.name || 'User'}
                        src={conversation?.recipient?.image || conversation?.participant?.image || conversation?.participant?.avatar}
                        border="2px"
                        borderColor={hasUnread ? 'blue.500' : 'transparent'}
                      />
                      {(conversation?.recipient?.online || conversation?.participant?.online) && (
                        <Box
                          position="absolute"
                          bottom={0}
                          right={0}
                          boxSize="12px"
                          bg="green.500"
                          borderRadius="full"
                          border="2px solid white"
                        />
                      )}
                    </Box>

                    {/* Content */}
                    <VStack flex={1} align="stretch" spacing={1} minW={0}>
                      <HStack justify="space-between" align="start">
                        <Text
                          fontWeight={hasUnread ? 'bold' : 'semibold'}
                          fontSize="md"
                          noOfLines={1}
                          color={hasUnread ? 'gray.900' : 'gray.700'}
                        >
                          {conversation?.recipient?.name || conversation?.participant?.name || 'Unknown User'}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={hasUnread ? 'blue.500' : 'gray.500'}
                          fontWeight={hasUnread ? 'semibold' : 'normal'}
                          flexShrink={0}
                        >
                          {formatTime(conversation?.last_message?.created_at || conversation?.last_message?.date)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" align="center">
                        <HStack spacing={1} flex={1} minW={0}>
                          {conversation?.last_message?.is_read && (
                            <CheckCheck size={14} color="#3182CE" />
                          )}
                          <Text
                            fontSize="sm"
                            color={hasUnread ? 'gray.700' : 'gray.500'}
                            fontWeight={hasUnread ? 'medium' : 'normal'}
                            noOfLines={1}
                          >
                            {conversation?.last_message?.message || 'No messages yet'}
                          </Text>
                        </HStack>
                        {hasUnread && (
                          <Badge
                            colorScheme="blue"
                            borderRadius="full"
                            fontSize="xs"
                            minW="20px"
                            textAlign="center"
                          >
                            {unread > 99 ? '99+' : unread}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
}

function ChatLayout() {
  const { room } = useParams();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { authUser, axios, notify } = useContext(GlobalStore);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoadingState] = useState(true);

  // Pass authUser down to ChatSidebar if needed, but it uses context now
  // However, we need to make sure GlobalStore context is available inside ChatSidebar
  // ChatSidebar is defined in same file but outside ChatLayout component
  // It uses useContext(GlobalStore) so it should work if it's rendered within GlobalStore.Provider
  // App.jsx wraps everything in GlobalStore.Provider so it's fine.


  async function getData() {
    try {
      // Try the documented endpoint first: /chat/chats/
      let res;
      try {
        res = await axios.get(`/chat/chats/`);
      } catch (e) {
        if (e.response?.status === 404) {
          // If 404, try fallback endpoint: /chats/
          console.log('Trying fallback endpoint /chats/');
          res = await axios.get(`/chats/`);
        } else {
          throw e;
        }
      }

      const data = objectifyJSON(res.data);
      console.log('Chat List Response:', data);

      // Handle various response structures
      let chats = [];
      if (Array.isArray(data)) {
        chats = data;
      } else if (Array.isArray(data?.data)) {
        chats = data.data;
      } else if (Array.isArray(data?.results)) {
        chats = data.results;
      } else if (Array.isArray(data?.data?.results)) {
        chats = data.data.results;
      } else if (Array.isArray(data?.chats)) {
        chats = data.chats;
      } else if (Array.isArray(data?.data?.chats)) {
        chats = data.data.chats;
      }

      console.log('Parsed chats:', chats.length);
      setConversations(chats);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      // Show user-friendly error message
      if (err.response?.status === 500) {
        notify({
          title: 'Server Error',
          body: 'Unable to load conversations. The chat service is currently unavailable. Please try again later.',
          color: 'red',
          duration: 5000,
        });
      } else if (err.response?.status === 404) {
        // No conversations yet - this is okay
        console.log('No conversations found yet');
      } else {
        notify({
          title: 'Error Loading Chats',
          body: 'Failed to load your conversations. Please refresh the page.',
          color: 'orange',
          duration: 4000,
        });
      }

      setConversations([]);
    }
  }

  function init() {
    getData();
  }

  useEffect(() => {
    setLoadingState(true);
    init();
    setTimeout(() => setLoadingState(false), 500);
  }, []);

  useEffect(() => {
    if (authUser?.token) {
      getData();
    }
  }, [authUser?.token]);

  if (loading) {
    return (
      <Center h="70vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading conversations...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box w="100%" bg={bgColor} h="100vh">
      <Flex h="100%">
        {/* Sidebar - Hide on mobile when room is selected */}
        {room && isMobile ? null : (
          <ChatSidebar
            conversations={conversations}
            activeId={room}
            onSelect={setActiveConversation}
          />
        )}

        {/* Chat Area */}
        <Box
          flex={1}
          w={room ? { base: '100%', md: 'calc(100% - 360px)' } : '100%'}
          h="100%"
          position="relative"
          bg={useColorModeValue('white', 'gray.800')}
        >
          {room ? (
            <Outlet />
          ) : (
            !isMobile && (
              <Center h="100%">
                <VStack spacing={4} color="gray.500">
                  <MessageCircle size={64} strokeWidth={1.5} />
                  <Heading size="md" color="gray.600">
                    Select a conversation
                  </Heading>
                  <Text fontSize="sm" color="gray.500" textAlign="center" maxW="300px">
                    Choose a conversation from the sidebar to start chatting
                  </Text>
                </VStack>
              </Center>
            )
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default ChatLayout;
