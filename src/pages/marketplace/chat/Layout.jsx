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
} from '@chakra-ui/react';
import { Search, Phone, Send, Smile, Mic, MoreVertical, Check, PlayCircle } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import {GlobalStore} from '../../../App';
import {objectifyJSON} from '../../../utils';
import {useParams, Outlet, Link} from 'react-router-dom';


function ChatSidebar({ conversations, activeId, onSelect, ...props }) {

  return (
    <Box
      w="300px"
      borderRightWidth={1}
      position="relative"
      h="100%"
      overflow="hidden"
      {...props}
    >
      <VStack spacing={3} align="stretch" px={4} py={4} borderBottomWidth={1} bg="white" position="sticky" top={0} zIndex={1}>
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold">Messages</Text>
          <Badge colorScheme="blue">{conversations?.length || 0}</Badge>
        </HStack>

        <InputGroup size="sm">
          <InputLeftElement>
            <Search className="w-4 h-4 text-gray-400" />
          </InputLeftElement>
          <Input onInput={console.log} placeholder="Search conversations" borderRadius="full" />
        </InputGroup>
      </VStack>

      <Box overflowY="auto" h="calc(100% - 84px)">
        <VStack spacing={0} align="stretch">
          {(conversations || []).map((conversation) => {
            const isActive = activeId === conversation.id;
            const unread = conversation?.unread_count || 0;
            return (
              <Box
                key={conversation.id}
                px={4}
                py={3}
                cursor="pointer"
                as={Link}
                to={`${conversation.uuid}`}
                bg={isActive ? 'blue.50' : 'transparent'}
                _hover={{ bg: 'gray.50' }}
                onClick={() => onSelect(conversation)}
              >
                <HStack spacing={3}>
                  <Box position="relative">
                    <Avatar
                      size="md"
                      name={conversation?.recipient?.name}
                      src={conversation?.recipient?.image}
                    />
                    {conversation?.online && (
                      <Badge
                        position="absolute"
                        bottom={0}
                        right={0}
                        colorScheme="green"
                        borderRadius="full"
                        boxSize="3"
                      />
                    )}
                  </Box>
                  <Box flex={1} minW={0}>
                    <HStack justify="space-between" align="start">
                      <Text fontWeight={unread ? 'bold' : 'medium'} noOfLines={1}>{conversation?.recipient?.name}</Text>
                      <Text fontSize="xs" color="gray.500">{conversation?.last_message?.date}</Text>
                    </HStack>
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.600" noOfLines={1}>
                        {conversation?.last_message?.message}
                      </Text>
                      {unread > 0 && (
                        <Badge colorScheme="blue" borderRadius="full">{unread}</Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            )
          })}
        </VStack>
      </Box>
    </Box>
  )
}

function ChatLayout() {
  const {room} = useParams();
  const bgColor = useColorModeValue('white', 'gray.800');
  const [isMobile] = useMediaQuery('(max-width: 568px)')
  const {authUser, axios, apiUrl, notify} = useContext(GlobalStore);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoadingState] = useState(true);


  async function getData(){
    try{
      const res = await axios.get(`/chat/chats/`);
      const data = objectifyJSON(res.data);
      setConversations(Array.isArray(data?.data) ? data?.data : []);
    }catch(err){
      console.error('Failed to load conversations:', err);
      setConversations([]);
    }
  }

  function init(){
    getData();
  }

  useEffect(() => {
    setLoadingState(true);
    init();
    setTimeout(()=> setLoadingState(false), 500)
  }, [])

  useEffect(() => {
    if (authUser?.token) {
      getData();
    }
  }, [authUser?.token])

  if (loading){
    return null
  }

  return (
    <Box w="100%" bg="white">
      <HStack spacing={0} align="stretch" minH={{ base: '70vh', md: '70vh' }}>
      {room && isMobile ? null :
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversation}
          onSelect={setActiveConversation}
          width={isMobile ? '100%' : '300px'}
        />
      }

        <Box flex={1} w={room ? { base: '100%', md: 'calc(100% - 300px)' } : '100%'} h="100%" position="relative" bg="white">
          {
            room &&
            <Outlet />
          }
        </Box>

        {(!room && !isMobile) && 
          <Box flex={1} h="100%">
            <VStack h="full" justify="center" spacing={4} color="gray.500">
              <Text>Select a conversation to start chatting</Text>
            </VStack>
          </Box>
        }
      </HStack>
    </Box>
  )
}

export default ChatLayout

