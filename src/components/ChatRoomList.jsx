import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalStore } from '../contexts/GlobalStore';
import chatService from '../services/chatService';

function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { authUser } = useContext(GlobalStore);
  const navigate = useNavigate();

  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchQuery, chatRooms]);

  async function loadChatRooms() {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      
      if (response?.success && response?.data?.chats) {
        const rooms = response.data.chats;
        // Sort by most recent activity
        const sortedRooms = rooms.sort((a, b) => {
          const timeA = new Date(a.last_message?.timestamp || 0);
          const timeB = new Date(b.last_message?.timestamp || 0);
          return timeB - timeA;
        });
        setChatRooms(sortedRooms);
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterRooms() {
    if (!searchQuery.trim()) {
      setFilteredRooms(chatRooms);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chatRooms.filter(room => {
      const participantName = room.participant?.name?.toLowerCase() || '';
      const lastMessage = room.last_message?.content?.toLowerCase() || '';
      return participantName.includes(query) || lastMessage.includes(query);
    });
    setFilteredRooms(filtered);
  }

  function handleRoomSelect(roomId) {
    navigate(`/chat/${roomId}`);
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <VStack spacing={0} align="stretch" w="full">
      {/* Search Bar */}
      <Box p={4} borderBottomWidth={1} borderColor={borderColor}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="lg"
          />
        </InputGroup>
      </Box>

      {/* Chat Room List */}
      <VStack spacing={0} align="stretch" overflowY="auto" maxH="calc(100vh - 200px)">
        {filteredRooms.length === 0 ? (
          <Center py={10}>
            <Text color="gray.500">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </Text>
          </Center>
        ) : (
          filteredRooms.map((room) => (
            <Box
              key={room.room_id}
              p={4}
              borderBottomWidth={1}
              borderColor={borderColor}
              cursor="pointer"
              _hover={{ bg: bgHover }}
              onClick={() => handleRoomSelect(room.room_id)}
              transition="background 0.2s"
            >
              <HStack spacing={3} align="start">
                <Avatar
                  size="md"
                  name={room.participant?.name}
                  src={room.participant?.avatar}
                />
                <VStack flex={1} align="stretch" spacing={1}>
                  <HStack justify="space-between">
                    <Text fontWeight="600" fontSize="sm" noOfLines={1}>
                      {room.participant?.name || 'Unknown User'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatTimestamp(room.last_message?.timestamp)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" align="center">
                    <Text
                      fontSize="sm"
                      color={room.last_message?.is_read ? 'gray.500' : 'gray.900'}
                      fontWeight={room.last_message?.is_read ? 'normal' : '600'}
                      noOfLines={1}
                      flex={1}
                    >
                      {room.last_message?.content || 'No messages yet'}
                    </Text>
                    {room.unread_count > 0 && (
                      <Badge
                        colorScheme="blue"
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {room.unread_count}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          ))
        )}
      </VStack>
    </VStack>
  );
}

export default ChatRoomList;
