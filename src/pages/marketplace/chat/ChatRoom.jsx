import {
  Box,
  VStack,
  HStack,
  Input,
  Avatar,
  Text,
  Button,
  IconButton,
  Flex,
  Divider,
  Badge,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { Search, Phone, Send, Smile, Mic, MoreVertical, Check, PlayCircle } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import {GlobalStore} from '../../../App';
import {objectifyJSON} from '../../../utils';
import {useParams, Link} from 'react-router-dom';
import {ChevronLeftIcon, CloseIcon} from '@chakra-ui/icons';
import { TokenManager } from '../../../services/api';
import ListingCard from './ListingCard';


function ChatRoom() {
  const DEBUG = import.meta.env.VITE_DEBUG === 'true' || false;
  const [chatRoom, setChatRoom] = useState({});
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const {authUser, axios} = useContext(GlobalStore);
  const [socket, setSocket] = useState(null);
  const {room} = useParams();
  const socketUrl = DEBUG ? 'ws://localhost:8000' : 'wss://server.motaa.net'
  const messagesEndRef = useRef(null);

  async function getData(){
    try{
      let res;
      try {
        res = await axios.get(`/chat/chats/${room}/`);
      } catch (e) {
        if (e.response?.status === 404) {
           console.log('Trying fallback endpoint /chats/:room/');
           res = await axios.get(`/chats/${room}/`);
        } else {
           throw e;
        }
      }
      
      const data = objectifyJSON(res.data);

      console.log('Chat room data full:', data);
      
      const roomData = data?.data || {};
      setChatRoom(roomData);

      // Handle various response structures for messages
      let msgs = [];
      if (Array.isArray(roomData?.messages)) {
        msgs = roomData.messages;
      } else if (Array.isArray(roomData?.results)) { // Handle DRF pagination
        msgs = roomData.results;
      } else if (Array.isArray(data?.messages)) { // Fallback to root
        msgs = data.messages;
      }
      
      console.log('Parsed messages:', msgs.length);
      setMessages(msgs);

      // API might return 'participants' or 'members'
      setMembers(Array.isArray(roomData?.participants) ? roomData?.participants : 
                 Array.isArray(roomData?.members) ? roomData?.members : []);
    }catch(err){
      console.error('Failed to load chat room:', err);
      setChatRoom({});
      setMessages([]);
      setMembers([]);
    }
  }

  
  useEffect(() => {
    getData();
    
    // Get token from TokenManager instead of authUser
    const token = TokenManager.getAccessToken();
    if (!room || !token) return;

    const chatSocket = new WebSocket(`${socketUrl}/chat/${room}/?token=${token}`);
    setSocket(chatSocket);

    chatSocket.onmessage = function (ev) {
      const data = JSON.parse(ev.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    chatSocket.onclose = function () {
      console.error('Chat socket closed unexpectedly');
    };

    return () => {
      chatSocket.close();
    };
  }, [room]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  async function sendMessage() {
    if (!message.trim()) return;

    const payload = {
      message_type: 'text',
      message,
      attachments
    };

    // Optimistic update - show message immediately
    const optimisticMsg = {
      text: message,
      sender: authUser?.email,
      user_id: authUser?.id, // Add ID for robust check
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      setMessage('');
      setAttachments([]);
      return;
    }

    try {
      const res = await axios.post(`/chat/message/`, {
        message,
        room_id: room,
        chat_id: room
      });

      const data = objectifyJSON(res.data);
      const newMessage = data?.data || data?.message || data;

      // Only add if not already added (though HTTP fallback usually implies socket failed)
      // If we used optimistic update, we might want to replace it or update status
      // For now, we'll just ensure we don't duplicate if logic changes
      // But since we returned early for socket, this block only runs if socket closed
      // So we should add it here too if we didn't add optimistic msg (but we did above)
      // Actually, if we add optimistic msg above, we don't need to add it here again
      // unless we want to update it with server response (like ID)
      
      // Let's just clear input and attachments here since we added optimistic msg
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message via HTTP:', error);
    }
  }

  const currentUserEmail = authUser?.email || '';
  const otherPerson = members?.find(mem => mem?.email && mem.email !== currentUserEmail) || members?.[0] || null;
  
  // Determine display name and avatar based on user type
  const getDisplayInfo = (person) => {
    if (!person) return { name: 'Unknown', avatar: null, isDealer: false };
    
    const isDealer = person?.user_type === 'dealer' || person?.user_type === 'mechanic';
    
    return {
      name: isDealer ? (person?.business_name || person?.name) : person?.name,
      avatar: isDealer ? (person?.business_logo || person?.image) : person?.image,
      isDealer
    };
  };
  
  const otherPersonInfo = getDisplayInfo(otherPerson);

  if (!room) {
    return (
      <VStack align="center" justify="center" h="60vh">
        <Text>Invalid chat room.</Text>
      </VStack>
    );
  }

  // Check authentication using TokenManager instead of authUser.token
  if (!authUser || !TokenManager.isAuthenticated()) {
    return (
      <VStack align="center" justify="center" h="60vh">
        <Text>You need to be signed in to use chat.</Text>
        <Button as={Link} to="/login" colorScheme="blue">Login</Button>
      </VStack>
    );
  }

  // Function to render message text with clickable links
  const renderMessageWithLinks = (text) => {
    if (!text) return null;
    
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlPattern);
    
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        // Check if it's a listing URL (contains /buy/UUID or /rent/UUID)
        // We match stricter pattern to avoid false positives, but keeping it flexible enough
        if (part.match(/(?:buy|rent)\/([a-zA-Z0-9-]+)/)) {
           return <ListingCard key={index} url={part} />;
        }

        return (
          <Text
            key={index}
            as="a"
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="underline"
            color="blue.300"
            _hover={{ color: 'blue.400' }}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index} as="span">{part}</Text>;
    });
  };

  const messagesBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <VStack h="100vh" bg="white" spacing={0} w="100%" overflow="hidden">
      {/* Chat Header */}
      <HStack
        w="full"
        px={5}
        py={3}
        borderBottomWidth={1}
        justify="space-between"
        bg="white"
        position="sticky"
        top={0}
        zIndex={2}
      >
        <HStack spacing={3}>
          <Button as={Link} to="/chat/" variant="ghost" size="sm" p={0}>
            <ChevronLeftIcon w={8} h={8} />
          </Button>
          {otherPersonInfo.isDealer && otherPersonInfo.avatar ? (
            <Image 
              src={otherPersonInfo.avatar} 
              alt={otherPersonInfo.name}
              boxSize="40px"
              borderRadius="md"
              objectFit="cover"
            />
          ) : (
            <Avatar size="sm" name={otherPersonInfo.name} src={otherPersonInfo.avatar} />
          )}
          <Box>
            <Text textTransform="capitalize" fontWeight="600">{otherPersonInfo.name}</Text>
            <Text fontSize="xs" color="green.500">Online</Text>
          </Box>
        </HStack>
        <HStack>
          <IconButton icon={<MoreVertical size={18} />} variant="ghost" aria-label="More options" />
        </HStack>
      </HStack>

      {/* Messages */}
      <Box flex={1} w="100%" overflowY="auto" px={4} py={4} bg={messagesBg}>
        <VStack
          spacing={3}
          align="unset"
          justify="flex-end"
          minH="100%"
        >
        {messages?.map((msg, index) => {
          // Robust sender identification
          const candidateId = msg?.user_id || msg?.sender?.id || (typeof msg?.sender === 'number' || (typeof msg?.sender === 'string' && !msg?.sender.includes('@')) ? msg?.sender : null);
          const candidateEmail = msg?.sender?.email || msg?.from || (typeof msg?.sender === 'string' && msg?.sender.includes('@') ? msg?.sender : null);
          
          let sent = false;
          if (authUser?.id && candidateId && String(candidateId) === String(authUser.id)) {
             sent = true;
          } else if (authUser?.email && candidateEmail && candidateEmail === authUser.email) {
             sent = true;
          } else if (msg?.isOptimistic) {
             sent = true;
          } else if (msg?.sender === authUser?.email) { // Direct string match fallback
             sent = true;
          }

          const bubbleBg = sent ? 'primary' : 'gray.100';
          const bubbleColor = sent ? 'white' : 'gray.900';
          
          // Get sender info for displaying avatar/logo
          let sender;
          if (typeof msg?.sender === 'object' && msg?.sender !== null) {
            // Sender is already an object with full info
            sender = msg.sender;
          } else {
            // Sender is just an email or ID, find in members
            sender = members?.find(mem => 
               (candidateEmail && mem?.email === candidateEmail) || 
               (candidateId && String(mem?.id) === String(candidateId)) ||
               (candidateId && String(mem?.user_id) === String(candidateId))
            );
          }
          
          const senderInfo = getDisplayInfo(sender);
          
          console.log('Message sender info:', { senderEmail, sent, senderInfo, sender });
          
          return (
            <HStack key={index} alignSelf={sent ? 'flex-end' : 'flex-start'} maxW="70%" spacing={2}>
              {!sent && (
                senderInfo.isDealer && senderInfo.avatar ? (
                  <Image 
                    src={senderInfo.avatar} 
                    alt={senderInfo.name}
                    boxSize="32px"
                    borderRadius="md"
                    objectFit="cover"
                    alignSelf="flex-end"
                  />
                ) : (
                  <Avatar size="xs" name={senderInfo.name} src={senderInfo.avatar} alignSelf="flex-end" />
                )
              )}
              <Box>
                <Box bg={bubbleBg} color={bubbleColor} px={4} py={2.5} fontSize="15px" borderRadius="lg" wordBreak="break-word">
                  {renderMessageWithLinks(msg?.text || msg?.message || msg?.content)}
                </Box>
                <HStack spacing={1} justify={sent ? 'flex-end' : 'flex-start'} fontSize="xs" color="gray.500" mt={1}>
                  {sent && <Check size="12px" />}
                </HStack>
              </Box>
              {sent && (
                authUser?.user_type === 'dealer' || authUser?.user_type === 'mechanic' ? (
                  authUser?.business_logo ? (
                    <Image 
                      src={authUser.business_logo} 
                      alt={authUser.business_name}
                      boxSize="32px"
                      borderRadius="md"
                      objectFit="cover"
                      alignSelf="flex-end"
                    />
                  ) : (
                    <Avatar size="xs" name={authUser?.business_name || authUser?.name} src={authUser?.image} alignSelf="flex-end" />
                  )
                ) : (
                  <Avatar size="xs" name={authUser?.name} src={authUser?.image} alignSelf="flex-end" />
                )
              )}
            </HStack>
          );
        })}
        <Box ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Message Input */}
      <HStack
        as={Flex}
        w="full"
        p={3}
        borderTopWidth={1}
        spacing={3}
        bg="white"
        position="sticky"
        bottom="0"
      >
        <IconButton icon={<Smile size={18} />} variant="ghost" aria-label="Add emoji" />
        <Input onInput={(e) => setMessage(e.target.value)} value={message} placeholder="Type a message" borderRadius="full" />
        <Button colorScheme="blue" bg="primary" rightIcon={<Send size={16} />} onClick={sendMessage} borderRadius="full" px={6}>
          Send
        </Button>
      </HStack>
    </VStack>
  )
}


export default ChatRoom

