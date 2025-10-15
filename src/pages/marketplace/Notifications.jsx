import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  IconButton,
  Divider,
  Badge,
  Flex,
  Button,
  ButtonGroup,
  useColorModeValue,
} from '@chakra-ui/react'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { useContext, useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import { objectifyJSON, jsonifyObject } from '../../utils'
import { GlobalStore } from '../../App'

function NotificationCard({ type, title, message, action, onClose, read }) {
  const borderColors = {
    info: 'blue.500',
    success: 'green.500',
    error: 'red.500',
    warning: 'orange.500',
  }

  const icons = {
    info: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
  }

  const Icon = icons[type]
  const borderColor = borderColors[type]
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Box
      w="full"
      bg={bgColor}
      borderRadius="5px"
      borderColor={read ? 'gray.100' : 'lavender'}
      borderWidth="1px"
      borderLeftWidth={4}
      borderLeftColor={borderColor}
      boxShadow={read ? 'none' : 'sm'}
      position="relative"
      overflow="hidden"
    >
      <Flex gap={4} justifyContent="space-between" p={4} alignItems="flex-start" _hover={{ bg: 'gray.50' }}>
        <Icon size="17px" />
        
        <Box flex={1} borderRight="1px solid lavender">
          <Text className="bold" mb={1} color={read ? 'gray.700' : 'black'}> {title} </Text>
          <Text color="gray.600" fontSize="sm"> {message} </Text>
          {action?.link && (
            <Link to={action?.link}>
              <Button
                size="sm"
                colorScheme={
                  type === 'info'
                    ? 'blue'
                    : type === 'success'
                    ? 'green'
                    : type === 'error'
                    ? 'red'
                    : 'orange'
                }
                mt={3}
              >
                {action?.label}
              </Button>
            </Link>
          )}
        </Box>

        <IconButton
          icon={<X size="20px" />}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close notification"
        />

      </Flex>
    </Box>
  )
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const {axios} = useContext(GlobalStore);

  async function init(){
    const res = await axios.get('/accounts/notifications/');
    const data = objectifyJSON(res.data);
    if (res.status === 200){
      setNotifications(data.data)
    }
  }


  async function readNotification(notification_id){
    const res = await axios.post('/accounts/notifications/', jsonifyObject({notification_id}));
    const data = objectifyJSON(res.data);
    if (res.status === 200){
      setNotifications(data.data)
    }
  }

  async function markAllAsRead(){
    const unread = (notifications || []).filter(n => !n?.is_read);
    if (unread.length === 0) return;
    await Promise.all(unread.map(n => axios.post('/accounts/notifications/', jsonifyObject({ notification_id: n?.uuid }))));
    await init();
  }

  

  useEffect(() => {
    init()
  }, [])

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={8}>
        <HStack mb={3} alignItems="center" justify="space-between" flexWrap="wrap" rowGap={3}>
          <HStack>
            <Text fontSize="2xl" fontWeight="bold"> Notifications </Text>
            <Badge px={3} colorScheme="blue" color="primary" py={"5px"} borderRadius="30px" fontSize="sm"> {notifications?.length} </Badge>
          </HStack>
          <ButtonGroup size="sm" isAttached>
            <Button variant={filter === 'all' ? 'solid' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'unread' ? 'solid' : 'outline'} onClick={() => setFilter('unread')}>Unread</Button>
            <Button variant={filter === 'read' ? 'solid' : 'outline'} onClick={() => setFilter('read')}>Read</Button>
          </ButtonGroup>
        </HStack>

        <HStack justify="space-between" align="center" mb={6} flexWrap="wrap" rowGap={2}>
          <Text color="gray.600">
            You have {(notifications || []).filter(n => !n?.is_read)?.length || 0} unread messages.
          </Text>
          <Button onClick={markAllAsRead} variant="outline" size="sm">Mark all as read</Button>
        </HStack>

          <Box mb={8}>
            <Container maxW="700px">
              {((notifications || []).length === 0) && (
                <VStack py={12} color="gray.500">
                  <Text>No notifications yet.</Text>
                </VStack>
              )}
              <VStack spacing={4} align="stretch">
                {(notifications || [])
                  .filter(n => filter === 'all' ? true : filter === 'unread' ? !n?.is_read : !!n?.is_read)
                  .map((notification) => (
                  <NotificationCard
                    key={notification?.id}
                    type={notification?.level}
                    title={notification?.subject}
                    message={notification?.message}
                    action={{link: notification?.cta_link, label: notification?.cta_text}}
                    read={!!notification?.is_read}
                    onClose={() => readNotification(notification?.uuid)}
                  />
                ))}
              </VStack>
            </Container>
          </Box>
        
      </Container>
    </Box>
  )
}

export default NotificationsPage

