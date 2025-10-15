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
  Flex,
  Button,
  IconButton,
  Divider,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { Search, Phone, Send, Smile, Mic, MoreVertical, Check, PlayCircle } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import {GlobalStore} from '../../../App';
import {objectifyJSON} from '../../../utils';
import {useParams, Link} from 'react-router-dom';
import {ChevronLeftIcon, CloseIcon} from '@chakra-ui/icons';


function ChatRoom() {
  const DEBUG = JSON.parse(import.meta.env.VITE_DEBUG) || false;
  const [chatRoom, setChatRoom] = useState({});
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const {authUser, axios} = useContext(GlobalStore);
  const [socket, setSocket] = useState(null);
  const {room} = useParams();
  const socketUrl = DEBUG ? 'ws://localhost:8000' : 'wss://server.motaa.net'

  async function getData(){
    try{
      const res = await axios.get(`/chat/chats/${room}/`);
      const data = objectifyJSON(res.data);

      setChatRoom(data?.data || {});
      setMessages(Array.isArray(data?.data?.messages) ? data?.data?.messages : []);
      setMembers(Array.isArray(data?.data?.members) ? data?.data?.members : []);
    }catch(err){
      console.error('Failed to load chat room:', err);
      setChatRoom({});
      setMessages([]);
      setMembers([]);
    }
  }

  
  useEffect(() => {
    getData();
    if (!room || !authUser?.token) return;

    const chatSocket = new WebSocket(`${socketUrl}/chat/${room}/?token=${authUser?.token}`);
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

  function sendMessage() {
    if (!message.trim()) return;
    if (!socket) return;

    socket.send(
      JSON.stringify({
        message_type: 'text', // text | image | document
        message,
        attachments
      })
    );
    setMessage('');
    setAttachments([])
  }

  const currentUserEmail = authUser?.email || '';
  const otherPerson = members?.find(mem => mem?.email && mem.email !== currentUserEmail) || members?.[0] || null;

  if (!room) {
    return (
      <VStack align="center" justify="center" h="60vh">
        <Text>Invalid chat room.</Text>
      </VStack>
    );
  }

  if (!authUser?.token) {
    return (
      <VStack align="center" justify="center" h="60vh">
        <Text>You need to be signed in to use chat.</Text>
        <Button as={Link} to="/login" colorScheme="blue">Login</Button>
      </VStack>
    );
  }

  return (
    <VStack position="fixed" h="calc(100vh - 65px)" left="0px" zIndex={1} bg="white" spacing={0} w="100%">
      {/* Chat Header */}
      <HStack w="full" px={5} py={3} borderBottomWidth={1} justify="space-between" bg="white" position="sticky" top={0} zIndex={2}>
        <HStack spacing={3}>
          <Button as={Link} to="/chat/" variant="ghost" size="sm">
            <CloseIcon />
          </Button>
          <Avatar size="sm" name={otherPerson?.name} src={otherPerson?.image} />
          <Box>
            <Text textTransform="capitalize" fontWeight="600">{otherPerson?.name}</Text>
            <Text fontSize="xs" color="green.500">Online</Text>
          </Box>
        </HStack>
        <HStack>
          <IconButton icon={<MoreVertical size={18} />} variant="ghost" aria-label="More options" />
        </HStack>
      </HStack>

      {/* Messages */}
      <VStack flex={1} spacing={3} align="stretch" p={4} w="100%" overflowY="auto" maxH="calc(100vh - 126px)">
        {messages?.map((msg, index) => {
          const sent = (msg?.sender || msg?.from) === currentUserEmail;
          const bubbleBg = sent ? 'primary' : 'gray.100';
          const bubbleColor = sent ? 'white' : 'gray.900';
          return (
            <Box key={index} alignSelf={sent ? 'flex-end' : 'flex-start'} maxW="70%">
              <Box bg={bubbleBg} color={bubbleColor} px={4} py={2.5} fontSize="15px" borderRadius="lg">
                {msg?.text || msg?.message || msg?.content}
              </Box>
              <HStack spacing={1} justify={sent ? 'flex-end' : 'flex-start'} fontSize="xs" color="gray.500" mt={1}>
                {sent && <Check size="12px" />}
              </HStack>
            </Box>
          );
        })}
      </VStack>

      {/* Message Input */}
      <HStack as={Flex} w="full" p={3} borderTopWidth={1} spacing={3} bg="white" position="sticky" bottom="0">
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

