import {
  Box, Flex, IconButton, Heading,
  Badge, Text, Divider,
  Stack, HStack, VStack,
  PinInput,
  PinInputField,
  Card,
  CardBody,
  Button,
  Input,
  CardHeader,
  Image,
  Icon,
  FormLabel,
  FormControl,
  Grid,
  Fade,
  LinkBox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Tag,
  AspectRatio,
  Avatar,
  Select,
  useColorModeValue,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  BreadcrumbItem,
  BreadcrumbLink,
  Breadcrumb,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Progress,  
  List,
  ListItem,
  Alert,
  AlertTitle,
  AlertIcon,
  useOutsideClick,
} from '@chakra-ui/react';
import { BusinessLogo } from './BusinessLogo';
import {Fragment, useContext, useEffect, useState, useRef} from 'react';
import { RiGasStationLine, RiHeart2Fill, RiHeart2Line, RiSearch2Line } from 'react-icons/ri'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa6'
import { HiMiniReceiptPercent } from 'react-icons/hi2'
import { LuMapPin } from 'react-icons/lu'
import { RxCaretLeft, RxCaretRight, RxTimer } from 'react-icons/rx';
import { TbManualGearbox } from 'react-icons/tb';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import { GlobalStore } from '../App';
import { FcCheckmark } from 'react-icons/fc';
import VerificationFormModal from './VerificationFormModal';
import authService from '../services/authService';
import { Leaf, Star, Edit } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, StarIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { addMonths, endOfMonth, format, isSameDay, isSameMonth, isToday, startOfMonth, subMonths } from "date-fns"
import {
  MdSearch,
  MdHome,
  MdBarChart,
  MdPeople,
  MdWarning,
  MdSettings,
  MdMoreVert,
  MdFilterList,
  MdShare,
  MdMessage,
  MdNotifications,
  MdBolt,
  MdLock,
  MdLocationOn,
  MdKeyboardArrowDown,
  MdInventory,
  MdCalendarMonth,
} from "react-icons/md"
import { BsWallet2 } from "react-icons/bs"


export const ComboBox = ({ defaultOptions, onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(defaultOptions);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const ref = useRef(null);

  useOutsideClick({
    ref,
    handler: () => setIsOpen(false),
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const matched = defaultOptions.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(matched);
    setIsOpen(true);
  };

  const handleSelect = (value) => {
    setInputValue(value);
    setSelected(value);
    setIsOpen(false);
    onSelect(value)
  };

  const showCreateOption =
    inputValue.trim() !== '' &&
    !defaultOptions.some(
      option => option.toLowerCase() === inputValue.trim().toLowerCase()
    );

  return (
    <VStack ref={ref} align="stretch" position="relative" spacing={1}>
      <Input
        placeholder="Select an option or type..."
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (filteredOptions.length > 0 || showCreateOption) && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="md"
          zIndex="1"
          maxHeight="200px"
          overflowY="auto"
        >
          <List spacing={0}>
            {filteredOptions.map(option => (
              <ListItem
                key={option}
                px={4}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => handleSelect(option)}
              >
                {option}
              </ListItem>
            ))}
            {showCreateOption && (
              <ListItem
                px={4}
                py={2}
                bg="gray.50"
                color="blue.600"
                fontStyle="italic"
                cursor="pointer"
                _hover={{ bg: 'blue.50' }}
                onClick={() => handleSelect(inputValue.trim())}
              >
                Create "{inputValue.trim()}"
              </ListItem>
            )}
          </List>
        </Box>
      )}
      {selected && (
        <Text fontSize="sm" color="gray.600">
          Selected: <strong>{selected}</strong>
        </Text>
      )}
    </VStack>
  );
}


export const VerificationNotice = ({ businessType, user, onRefresh, ...props }) => {
  const { } = useContext(GlobalStore);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('not_submitted');
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVerificationStatus = async () => {
    try {
      // Use authService to get verification status
      const result = await authService.getVerificationStatus();
      setStatus(result.status || 'not_submitted');
      setRejectionReason(result.rejection_reason);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      if (error.response?.status === 404) {
        // Endpoint doesn't exist - assume not submitted
        console.log('Verification endpoint not available - defaulting to not_submitted');
        setStatus('not_submitted');
      } else {
        setStatus('not_submitted');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    fetchVerificationStatus();
    if (onRefresh) onRefresh();
  };

  // Don't show if verified
  if (status === 'verified' || loading) return null;

  const getAlertConfig = () => {
    switch (status) {
      case 'pending':
        return {
          colorScheme: 'orange',
          title: 'Verification Pending',
          message: 'Your business verification is currently under review by our admin team. You will be notified once approved.',
          buttonText: null,
          icon: '⏳'
        };
      case 'rejected':
        return {
          colorScheme: 'red',
          title: 'Verification Rejected',
          message: rejectionReason || 'Your verification was rejected. Please review and resubmit with correct information.',
          buttonText: 'Resubmit Verification',
          icon: '❌'
        };
      default: // not_submitted
        return {
          colorScheme: 'yellow',
          title: 'Complete Your Business Verification',
          message: `You must complete your verification before you can ${businessType === 'dealership' || businessType === 'dealer' ? 'add listings' : 'add services'}.`,
          buttonText: 'Submit Verification',
          icon: '⚠️'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <>
      <Alert my={4} colorScheme={config.colorScheme} rounded="lg" as={Stack} alignItems="start" placeItems="start">
        <AlertIcon as={MdWarning} w={30} h={30} />
        <Flex width="100%" alignItems="start" flexDirection="column" gap={2}>
          <Flex width="100%" alignItems="center" flexWrap="wrap" justify="space-between" gap={2}>
            <Box>
              <AlertTitle size="sm" display="flex" alignItems="center" gap={2}>
                <span>{config.icon}</span>
                {config.title}
              </AlertTitle>
              <Text fontSize="sm" mt={1}>{config.message}</Text>
            </Box>
            {config.buttonText && (
              <Button 
                onClick={() => setShowForm(true)} 
                colorScheme={config.colorScheme} 
                variant="outline"
                size="sm"
              >
                {config.buttonText}
              </Button>
            )}
          </Flex>
          {status === 'rejected' && rejectionReason && (
            <Box 
              w="100%" 
              p={3} 
              bg="red.50" 
              borderRadius="md" 
              borderLeft="4px solid" 
              borderColor="red.500"
            >
              <Text fontSize="sm" fontWeight="semibold" mb={1}>Rejection Reason:</Text>
              <Text fontSize="sm">{rejectionReason}</Text>
            </Box>
          )}
        </Flex>
      </Alert>

      {showForm && (
        <VerificationFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          businessType={businessType}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

// Status Badge Component
export const StatusBadge = ({ status }) => {
  let color, bg, icon

  switch (status) {
    case "Successful":
      color = "green.600"
      bg = "green.50"
      break
    case "Locked":
      color = "blue.500"
      bg = "blue.50"
      icon = <MdLock size={12} style={{ marginRight: "4px" }} />
      break
    case "Pending":
      color = "orange.500"
      bg = "orange.50"
      break
    default:
      color = "gray.500"
      bg = "gray.50"
  }

  return (
    <Badge
      display="flex"
      alignItems="center"
      px={3}
      py={1}
      borderRadius="full"
      color={color}
      bg={bg}
      fontWeight="medium"
      fontSize="sm"
    >
      {icon}
      {status}
    </Badge>
  )
}


export const RatingCard = ({ avg_rating, ratings }) => {
  const categories = {}
  let count = 0;

  if (ratings){
    console.log("Ratings: ", ratings)
    for(let rating of ratings){
      count++;
      if (rating){
        const keys = Object.keys(rating);
        for(let key of keys){
          if (typeof categories[key] === Number){
            categories[`${key}`] += rating[`${key}`]
          }else{
            categories[`${key}`] = rating[`${key}`]
          }
        }
      }
    }
    
    const keys = Object.keys(categories);
    for(let key of keys){
      console.log(key, "has", categories[key])
      categories[`${key}`] = categories[`${key}`]/count
    }
  }




  return(
    <Box mb={8}>
      <Heading size="md" mb={4} fontWeight={'500'}>Ratings & reviews</Heading>
      <HStack spacing={2} mb={6}>
        <Heading size="lg">{avg_rating}</Heading>
        <Icon as={StarIcon} color="yellow.400" w={6} h={6} />
      </HStack>

      <VStack align="stretch" spacing={2} mb={8}>
        {Object.keys(categories)?.map((category, idx) => (
          <Box key={idx}>
            <SimpleGrid columns={2} justify="space-between" alignItems="center" spacing={2}>
              <Text flex={1} colSpan={3} textTransform="capitalize">{category}</Text>
              <Flex alignItems="center" gap={2}>
                <Progress size="sm" value={(categories[category] * 20)} borderRadius="lg" flex={1} colorScheme="blue" />
                <Text color="gray.500">({categories[category]})</Text>
              </Flex>
            </SimpleGrid>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}


// Review Card Component
export function ReviewCard({ review }) {
  // const {reviewer, avg_rating, date, comment} = review;

  return (
    <Box pb={6} borderBottom="1px solid lavender">
      <HStack mb={2}>
        <Avatar size="sm" name={review?.reviewer?.name} src={review?.reviewer?.image} />
        <VStack spacing={-1} placeItems="flex-start">
          <HStack>
            <Text fontWeight="bold">{review?.reviewer?.name}</Text>
            <HStack spacing={1}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  as={Star}
                  color={i < review?.avg_rating ? "yellow.400" : "gray.300"}
                  fill={i < review?.avg_rating ? "currentColor" : "none"}
                  w={3}
                  h={3}
                />
              ))}
            </HStack>
          </HStack>
          <Text fontSize="sm" color="gray.500"> {review?.date} </Text>
        </VStack>
      </HStack>
      <Text color="gray.600" fontSize="sm">
        {review?.comment}
      </Text>
    </Box>
  )
}


export function CalendarPicker({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  numberOfMonths = 1,
  defaultMonth = new Date(),
  fromDate,
  toDate,
  ...props
}) {
  const [month, setMonth] = useState(defaultMonth)
  const [selectedDates, setSelectedDates] = useState(() => {
    if (mode === "single" && selected instanceof Date) {
      return [selected]
    }
    if (mode === "multiple" && Array.isArray(selected)) {
      return selected
    }
    if (mode === "range" && Array.isArray(selected)) {
      return selected
    }
    return []
  })
  const [hoverDate, setHoverDate] = useState(null)

  // Generate years for the select (10 years before and after current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  // Generate months for the select
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleDateSelect = (day) => {
    if (disabled?.(day)) return

    let newSelectedDates = []

    if (mode === "single") {
      newSelectedDates = [day]
    } else if (mode === "multiple") {
      newSelectedDates = [...selectedDates]
      const index = newSelectedDates.findIndex((d) => d instanceof Date && isSameDay(d, day))

      if (index !== -1) {
        newSelectedDates.splice(index, 1)
      } else {
        newSelectedDates.push(day)
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0) {
        newSelectedDates = [day]
      } else if (selectedDates.length === 1) {
        const startDate = selectedDates[0]
        if (startDate instanceof Date) {
          if (day < startDate) {
            newSelectedDates = [day, startDate]
          } else {
            newSelectedDates = [startDate, day]
          }
        }
      } else {
        newSelectedDates = [day]
      }
    }

    setSelectedDates(newSelectedDates)
    onSelect?.(mode === "single" ? newSelectedDates[0] : newSelectedDates)
  }

  const handleMonthChange = (event) => {
    const value = event.target.value
    const newMonth = new Date(month)
    newMonth.setMonth(months.indexOf(value))
    setMonth(newMonth)
  }

  const handleYearChange = (event) => {
    const value = event.target.value
    const newMonth = new Date(month)
    newMonth.setFullYear(Number.parseInt(value))
    setMonth(newMonth)
  }

  const isDateSelected = (day) => {
    if (mode === "single") {
      return selectedDates[0] instanceof Date && isSameDay(selectedDates[0], day)
    }

    if (mode === "multiple") {
      return selectedDates.some((d) => d instanceof Date && isSameDay(d, day))
    }

    if (mode === "range") {
      if (selectedDates.length === 1) {
        return selectedDates[0] instanceof Date && isSameDay(selectedDates[0], day)
      }

      if (selectedDates.length === 2) {
        const [start, end] = selectedDates
        return day >= start && day <= end
      }
    }

    return false
  }

  const isDateInRange = (day) => {
    if (mode !== "range" || selectedDates.length !== 2) return false

    const [start, end] = selectedDates
    return day > start && day < end
  }

  const isDateRangeStart = (day) => {
    if (mode !== "range" || selectedDates.length !== 2) return false

    const [start] = selectedDates
    return isSameDay(start, day)
  }

  const isDateRangeEnd = (day) => {
    if (mode !== "range" || selectedDates.length !== 2) return false

    const [, end] = selectedDates
    return isSameDay(end, day)
  }

  const isDateHovered = (day) => {
    if (mode !== "range" || selectedDates.length !== 1 || !hoverDate) return false

    const start = selectedDates[0]
    return (day > start && day <= hoverDate) || (day < start && day >= hoverDate)
  }

  const handleMouseEnter = (day) => {
    if (mode === "range" && selectedDates.length === 1) {
      setHoverDate(day)
    }
  }

  const handleMouseLeave = () => {
    setHoverDate(null)
  }

  // Colors
  const todayBg = useColorModeValue("tertiary", "tertiary")
  const selectedBg = useColorModeValue("primary", "primary")
  const selectedColor = useColorModeValue("white", "white")
  const inRangeBg = useColorModeValue("blue.100", "blue.700")
  const hoveredBg = useColorModeValue("tertiary", "tertiary")
  const mutedColor = useColorModeValue("gray.400", "gray.500")

  const renderCalendarMonth = (monthDate, index) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const startDate = new Date(monthStart)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    const endDate = new Date(monthEnd)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDate = startDate

    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return (
      <Box key={index} mb={8}>
        <Grid templateColumns="repeat(7, 1fr)" gap={1} textAlign="center" fontSize="xs" mb={2}>
          <Box>Su</Box>
          <Box>Mo</Box>
          <Box>Tu</Box>
          <Box>We</Box>
          <Box>Th</Box>
          <Box>Fr</Box>
          <Box>Sa</Box>
        </Grid>
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {days.map((day, dayIndex) => {
            const isSelected = isDateSelected(day)
            const isInRange = isDateInRange(day)
            const isRangeStart = isDateRangeStart(day)
            const isRangeEnd = isDateRangeEnd(day)
            const isHovered = isDateHovered(day)
            const isDisabled = disabled?.(day) || false
            const isCurrentMonth = isSameMonth(day, monthDate)

            return (
              <Button
                key={dayIndex}
                size="sm"
                variant="ghost"
                h="50px"
                w="100%"
                maxW={'60px'}
                mx="auto"
                p={0}
                fontWeight="normal"
                fontSize="lg"
                bg={
                  isSelected
                    ? selectedBg
                    : isInRange
                      ? inRangeBg
                      : isHovered
                        ? hoveredBg
                        : isToday(day)
                          ? todayBg
                          : "transparent"
                }
                color={isSelected ? selectedColor : isCurrentMonth ? "inherit" : mutedColor}
                opacity={!isCurrentMonth ? 0.5 : 1}
                borderLeftRadius={isRangeStart ? "md" : undefined}
                borderRightRadius={isRangeEnd ? "md" : undefined}
                isDisabled={isDisabled}
                onClick={() => handleDateSelect(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseLeave={handleMouseLeave}
                _hover={{
                  bg: isSelected ? selectedBg : hoveredBg,
                }}
              >
                {format(day, "d")}
              </Button>
            )
          })}
        </Grid>
      </Box>
    )
  }

  return (
    <Box p={3} {...props}>
      <Flex justifyContent={{base: 'center', md: "space-between"}} flexWrap="wrap-reverse" alignItems="center" mb={4}>
        <Flex alignItems="center">
          <Select value={format(month, "MMMM")} onChange={handleMonthChange} size="sm" width="120px" mr={2}>
            {months.map((monthName) => (
              <option key={monthName} value={monthName}>
                {monthName}
              </option>
            ))}
          </Select>
          <Select value={format(month, "yyyy")} onChange={handleYearChange} size="sm" width="90px">
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </Select>
        </Flex>

        <Flex alignItems="center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(subMonths(month, 1))}
            isDisabled={fromDate ? subMonths(month, 1) < startOfMonth(fromDate) : false}
            mr={2}
          >
            <ChevronLeftIcon />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date())} mr={2}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(addMonths(month, 1))}
            isDisabled={toDate ? addMonths(month, 1) > startOfMonth(toDate) : false}
          >
            <ChevronRightIcon />
          </Button>
        </Flex>
      </Flex>
      <Box>
        {Array.from({ length: numberOfMonths }).map((_, i) => {
          const monthToRender = addMonths(month, i)
          return renderCalendarMonth(monthToRender, i)
        })}
      </Box>
    </Box>
  )
}


export function TimePicker({ value, onChange, format = "12h", showSeconds = false, ...props }) {
  // Parse initial value or set default to current time
  const parseInitialTime = () => {
    if (!value) {
      const now = new Date()
      return {
        hours: format === "12h" ? now.getHours() % 12 || 12 : now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        period: now.getHours() >= 12 ? "PM" : "AM",
      }
    }

    if (typeof value === "string") {
      // Parse time string (e.g. "10:30 AM")
      const [timePart, periodPart] = value.split(" ")
      const [hoursPart, minutesPart, secondsPart] = timePart.split(":")

      return {
        hours: Number.parseInt(hoursPart, 10),
        minutes: Number.parseInt(minutesPart, 10),
        seconds: secondsPart ? Number.parseInt(secondsPart, 10) : 0,
        period: periodPart || (Number.parseInt(hoursPart, 10) >= 12 ? "PM" : "AM"),
      }
    }

    if (value instanceof Date) {
      return {
        hours: format === "12h" ? value.getHours() % 12 || 12 : value.getHours(),
        minutes: value.getMinutes(),
        seconds: value.getSeconds(),
        period: value.getHours() >= 12 ? "PM" : "AM",
      }
    }

    return { hours: 12, minutes: 0, seconds: 0, period: "AM" }
  }

  const [time, setTime] = useState(parseInitialTime)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Update input value when time changes
  useEffect(() => {
    let formattedTime = `${time.hours.toString().padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}`

    if (showSeconds) {
      formattedTime += `:${time.seconds.toString().padStart(2, "0")}`
    }

    if (format === "12h") {
      formattedTime += ` ${time.period}`
    }

    setInputValue(formattedTime)
  }, [time, format, showSeconds])

  // Notify parent component when time changes
  useEffect(() => {
    if (onChange) {
      let hours = time.hours

      // Convert to 24-hour format for the Date object
      if (format === "12h" && time.period === "PM" && hours < 12) {
        hours += 12
      } else if (format === "12h" && time.period === "AM" && hours === 12) {
        hours = 0
      }

      const date = new Date()
      date.setHours(hours)
      date.setMinutes(time.minutes)
      date.setSeconds(time.seconds)
      date.setMilliseconds(0)

      onChange(date)
    }
  }, [time, onChange, format])

  // Handle direct input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value)

    // Try to parse the input
    const timeRegex =
      format === "12h"
        ? /^(0?[1-9]|1[0-2]):([0-5][0-9])(?::([0-5][0-9]))?\s?(AM|PM|am|pm)$/
        : /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/

    const match = e.target.value.match(timeRegex)

    if (match) {
      const newTime = {
        hours: Number.parseInt(match[1], 10),
        minutes: Number.parseInt(match[2], 10),
        seconds: match[3] ? Number.parseInt(match[3], 10) : 0,
        period: format === "12h" ? match[4].toUpperCase() : Number.parseInt(match[1], 10) >= 12 ? "PM" : "AM",
      }

      setTime(newTime)
    }
  }

  // Increment/decrement handlers
  const incrementHours = () => {
    setTime((prev) => ({
      ...prev,
      hours: format === "12h" ? (prev.hours % 12) + 1 : (prev.hours + 1) % 24,
    }))
  }

  const decrementHours = () => {
    setTime((prev) => ({
      ...prev,
      hours: format === "12h" ? ((prev.hours - 2 + 12) % 12) + 1 : (prev.hours - 1 + 24) % 24,
    }))
  }

  const incrementMinutes = () => {
    setTime((prev) => ({
      ...prev,
      minutes: (prev.minutes + 1) % 60,
    }))
  }

  const decrementMinutes = () => {
    setTime((prev) => ({
      ...prev,
      minutes: (prev.minutes - 1 + 60) % 60,
    }))
  }

  const incrementSeconds = () => {
    setTime((prev) => ({
      ...prev,
      seconds: (prev.seconds + 1) % 60,
    }))
  }

  const decrementSeconds = () => {
    setTime((prev) => ({
      ...prev,
      seconds: (prev.seconds - 1 + 60) % 60,
    }))
  }

  const togglePeriod = () => {
    setTime((prev) => ({
      ...prev,
      period: prev.period === "AM" ? "PM" : "AM",
    }))
  }

  // Quick time selections
  const quickTimes = [
    { label: "Morning", hours: 9, minutes: 0, period: "AM" },
    { label: "Noon", hours: 12, minutes: 0, period: "PM" },
    { label: "Afternoon", hours: 3, minutes: 0, period: "PM" },
    { label: "Evening", hours: 6, minutes: 0, period: "PM" },
    { label: "Night", hours: 9, minutes: 0, period: "PM" },
  ]

  const setQuickTime = (quickTime) => {
    setTime({
      hours: quickTime.hours,
      minutes: quickTime.minutes,
      seconds: 0,
      period: quickTime.period,
    })
  }

  // Colors
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const hoverBg = useColorModeValue("gray.100", "gray.700")
  const activeBg = useColorModeValue("blue.50", "blue.900")

  return (
    <Box {...props}>
      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom" autoFocus={false}>
        <PopoverTrigger width="100%" flex={1}>
          <Flex flexDirection="row" flex={1}>
            <Text
              value={inputValue}
              textAlign="left"
              px={2}
              onClick={() => setIsOpen(true)}
              cursor="pointer"
              pr="4.5rem"
              flex={1}
              width="100%"
            >{inputValue}</Text>
            <IconButton
              aria-label="Select time"
              icon={<TimeIcon />}
              size="sm"
              flex={1}
              position="absolute"
              right="8px"
              top="50%"
              transform="translateY(-50%)"
              zIndex={1}
              onClick={() => setIsOpen(!isOpen)}
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent width="300px" p={0}>
          <PopoverBody p={4}>
            <Flex direction="column">
              <Flex justify="space-between" mb={4}>
                <VStack spacing={2} align="center" flex={1}>
                  <IconButton
                    size="sm"
                    icon={<ChevronUpIcon />}
                    aria-label="Increment hours"
                    onClick={incrementHours}
                  />
                  <Box
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    px={3}
                    py={2}
                    textAlign="center"
                    minWidth="60px"
                  >
                    {time.hours.toString().padStart(2, "0")}
                  </Box>
                  <IconButton
                    size="sm"
                    icon={<ChevronDownIcon />}
                    aria-label="Decrement hours"
                    onClick={decrementHours}
                  />
                  <Text fontSize="sm" color="gray.500">
                    Hours
                  </Text>
                </VStack>

                <Text fontSize="xl" alignSelf="center" mx={2} mt={-4}>
                  :
                </Text>

                <VStack spacing={2} align="center" flex={1}>
                  <IconButton
                    size="sm"
                    icon={<ChevronUpIcon />}
                    aria-label="Increment minutes"
                    onClick={incrementMinutes}
                  />
                  <Box
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    px={3}
                    py={2}
                    textAlign="center"
                    minWidth="60px"
                  >
                    {time.minutes.toString().padStart(2, "0")}
                  </Box>
                  <IconButton
                    size="sm"
                    icon={<ChevronDownIcon />}
                    aria-label="Decrement minutes"
                    onClick={decrementMinutes}
                  />
                  <Text fontSize="sm" color="gray.500">
                    Minutes
                  </Text>
                </VStack>

                {showSeconds && (
                  <>
                    <Text fontSize="xl" alignSelf="center" mx={2} mt={-4}>
                      :
                    </Text>

                    <VStack spacing={2} align="center" flex={1}>
                      <IconButton
                        size="sm"
                        icon={<ChevronUpIcon />}
                        aria-label="Increment seconds"
                        onClick={incrementSeconds}
                      />
                      <Box
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        px={3}
                        py={2}
                        textAlign="center"
                        minWidth="60px"
                      >
                        {time.seconds.toString().padStart(2, "0")}
                      </Box>
                      <IconButton
                        size="sm"
                        icon={<ChevronDownIcon />}
                        aria-label="Decrement seconds"
                        onClick={decrementSeconds}
                      />
                      <Text fontSize="sm" color="gray.500">
                        Seconds
                      </Text>
                    </VStack>
                  </>
                )}

                {format === "12h" && (
                  <VStack spacing={2} align="center" flex={1}>
                    <Button
                      size="sm"
                      onClick={togglePeriod}
                      colorScheme={time.period === "AM" ? "blue" : "gray"}
                      variant={time.period === "AM" ? "solid" : "outline"}
                    >
                      AM
                    </Button>
                    <Button
                      size="sm"
                      onClick={togglePeriod}
                      colorScheme={time.period === "PM" ? "blue" : "gray"}
                      variant={time.period === "PM" ? "solid" : "outline"}
                    >
                      PM
                    </Button>
                    <Text fontSize="sm" color="gray.500">
                      Period
                    </Text>
                  </VStack>
                )}
              </Flex>

              <Box mt={4}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Quick Select
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {quickTimes.map((quickTime) => (
                    <Button key={quickTime.label} size="sm" variant="outline" onClick={() => setQuickTime(quickTime)}>
                      {quickTime.label}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const now = new Date()
                      setTime({
                        hours: format === "12h" ? now.getHours() % 12 || 12 : now.getHours(),
                        minutes: now.getMinutes(),
                        seconds: now.getSeconds(),
                        period: now.getHours() >= 12 ? "PM" : "AM",
                      })
                    }}
                  >
                    Now
                  </Button>
                </Grid>
              </Box>

              <HStack justifyContent="flex-end" mt={4}>
                <Button w="50%" colorScheme="blue" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Done
                </Button>
              </HStack>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}


export const ListingItemCard = ({ listing, ...props }) => {
    const {commaInt, authUser} = useContext(GlobalStore);
    const navigate = useNavigate();

    // Check if current user is the owner
    const isOwner = authUser?.id && (
        authUser.id === listing?.user_id || 
        authUser.id === listing?.dealer_id ||
        authUser.id === listing?.vehicle?.dealer?.user_id
    );
    
    // Add defensive checks for listing and vehicle
    if (!listing) {
        return null;
    }
    
    // Debug: Log listing ID and location fields
    console.log('🔍 ListingItemCard - Listing data:', {
        uuid: listing?.uuid,
        id: listing?.id,
        listing_id: listing?.listing_id,
        location: listing?.location,
        address: listing?.address,
        city: listing?.city,
        dealer_location: listing?.vehicle?.dealer?.location,
        dealer_address: listing?.vehicle?.dealer?.address,
        dealer_city: listing?.vehicle?.dealer?.city
    });
    
    const vehicle = listing?.vehicle || {};
    const [image, setImage] = useState({});
    const [index, setIndex] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    function discount(price, dprice){
        const percent = (dprice / price) * 100
        return percent
    }

    useEffect(() => {
        if (!listing || !vehicle) {
            setImage({});
            setIsImageLoading(false);
            return;
        }
        
        const images = vehicle?.images || [];
        const firstImage = images[0];
        
        if (firstImage?.url) {
            setImage(firstImage);
            setIsImageLoading(false); // Don't show loading for initial image
        } else {
            setImage({});
            setIsImageLoading(false);
        }
    }, [listing, vehicle]);

    function nextImage(idx){
        if (!vehicle || !vehicle.images) return;
        
        let images = vehicle.images || []
        if (images.length === 0) return;
        
        let newIndex = index + idx;
        if (newIndex >= images.length){
            newIndex = 0
        }
        if (newIndex < 0){
            newIndex = (images.length - 1)
        }

        setIndex(newIndex)
        const newImage = images[newIndex];
        
        if (!newImage) return;
        
        setImage(newImage);
        
        if (newImage?.url) {
            // Simple loading state for navigation
            setIsImageLoading(true);
            setTimeout(() => {
                setIsImageLoading(false);
            }, 500); // Short loading state for smooth transition
        } else {
            setIsImageLoading(false);
        }
    }

    let type = 'buy';

    if (listing?.listing_type === 'sale'){
        type = 'buy';
    }
    if (listing?.listing_type === 'rental'){
        type = 'rent';
    }

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    return(
        <NavLink to={`/${type}/${listing?.uuid || listing?.id || listing?.listing_id}`} style={{ textDecoration: 'none' }}>
            <Box 
                position="relative" 
                as={motion.div}
                whileHover={{ y: -8 }}
                transition="0.3s ease"
                {...props}
            >
                <Card 
                    shadow="xl" 
                    p={0} 
                    w="100%" 
                    borderRadius="2xl"
                    overflow="hidden"
                    borderWidth="2px"
                    borderColor="transparent"
                    bg="white"
                    _hover={{
                        shadow: '2xl',
                        borderColor: '#F4A950',
                        transform: 'translateY(-4px)'
                    }}
                    transition="all 0.3s ease"
                    cursor="pointer"
                >
                    <CardHeader p={0} position="relative">
                        {/* Gradient Overlay for better text visibility */}
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            height="80px"
                            bgGradient="linear(to-b, blackAlpha.400, transparent)"
                            zIndex={1}
                            pointerEvents="none"
                        />

                        {/* Condition Badge */}
                        <Badge 
                            position="absolute" 
                            top={4} 
                            right={4} 
                            zIndex={3}
                            bg="white"
                            color="gray.800"
                            px={4}
                            py={2}
                            borderRadius="full"
                            fontWeight="bold"
                            fontSize="xs"
                            textTransform="uppercase"
                            boxShadow="lg"
                            border="1px solid"
                            borderColor="gray.200"
                        >
                            {vehicle?.condition || 'New'}
                        </Badge>

                        {/* Edit Button for Owner */}
                        {isOwner && (
                            <IconButton
                                position="absolute"
                                top={4}
                                right={24}
                                zIndex={3}
                                icon={<Edit size={16} />}
                                size="md"
                                bg="white"
                                color="blue.500"
                                borderRadius="full"
                                boxShadow="lg"
                                border="1px solid"
                                borderColor="blue.200"
                                _hover={{ 
                                    bg: 'blue.50',
                                    color: 'blue.600',
                                    transform: 'scale(1.1)',
                                    borderColor: 'blue.300'
                                }}
                                _active={{ transform: 'scale(0.95)' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/dashboard/inventory/edit/${listing?.uuid || listing?.id}`);
                                }}
                                aria-label="Edit listing"
                                title="Edit Listing"
                            />
                        )}

                        {/* Heart Icon for Favorites */}
                        <IconButton
                            position="absolute"
                            top={4}
                            left={4}
                            zIndex={3}
                            icon={isFavorited ? <RiHeart2Fill /> : <RiHeart2Line />}
                            size="md"
                            bg="white"
                            color={isFavorited ? "red.500" : "gray.600"}
                            borderRadius="full"
                            boxShadow="lg"
                            border="1px solid"
                            borderColor="gray.200"
                            _hover={{ 
                                bg: isFavorited ? 'red.50' : 'gray.50',
                                color: isFavorited ? 'red.600' : 'red.500',
                                transform: 'scale(1.1)',
                                borderColor: isFavorited ? 'red.200' : 'red.300'
                            }}
                            _active={{ transform: 'scale(0.95)' }}
                            onClick={handleFavoriteClick}
                            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        />

                        {/* Main Image Container */}
                        <Box
                            width="100%"
                            height="280px"
                            position="relative"
                            overflow="hidden"
                            bg="gray.100"
                        >
                          <LinkBox
                            flex={1} 
                            w="100%" 
                            height="280px"
                            position="relative"
                            sx={{
                              backgroundImage: image?.url ? `url(${image.url})` : 'none',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              transition: 'transform 0.4s ease',
                              '&:hover': {
                                transform: 'scale(1.08)'
                              }
                            }}
                          >
                            {/* Loading placeholder */}
                            {isImageLoading && image?.url && (
                                <Flex
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    align="center"
                                    justify="center"
                                    bg="gray.100"
                                    zIndex={1}
                                >
                                    <VStack spacing={3} color="gray.400">
                                        <Box 
                                            fontSize="3xl"
                                            animation="pulse 2s infinite"
                                            sx={{
                                                '@keyframes pulse': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0.5 }
                                                }
                                            }}
                                        >
                                            🚗
                                        </Box>
                                        <Text fontSize="sm">Loading...</Text>
                                    </VStack>
                                </Flex>
                            )}
                            
                            {/* No image placeholder */}
                            {!image?.url && (
                                <Flex
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    align="center"
                                    justify="center"
                                    bg="gray.50"
                                >
                                    <VStack spacing={3} color="gray.400">
                                        <Box fontSize="4xl">🚗</Box>
                                        <Text fontSize="sm" fontWeight="medium">No Image Available</Text>
                                    </VStack>
                                </Flex>
                            )}
                          </LinkBox>
                        
                        {/* Image Navigation Arrows */}
                        {vehicle?.images?.length > 1 && (
                            <Flex
                                position="absolute"
                                w="100%"
                                justifyContent="space-between"
                                px={4}
                                top="50%"
                                transform="translateY(-50%)"
                                gap={2}
                                zIndex={2}
                            >
                                <IconButton
                                    icon={<RxCaretLeft />}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        nextImage(-1);
                                    }}
                                    size="md"
                                    borderRadius="full"
                                    bg="whiteAlpha.900"
                                    color="gray.800"
                                    _hover={{ 
                                        bg: 'white', 
                                        transform: 'scale(1.1)',
                                        shadow: 'xl'
                                    }}
                                    boxShadow="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    aria-label="Previous image"
                                />
                                <IconButton
                                    icon={<RxCaretRight />}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        nextImage(1);
                                    }}
                                    size="md"
                                    borderRadius="full"
                                    bg="whiteAlpha.900"
                                    color="gray.800"
                                    _hover={{ 
                                        bg: 'white', 
                                        transform: 'scale(1.1)',
                                        shadow: 'xl'
                                    }}
                                    boxShadow="lg"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    aria-label="Next image"
                                />
                            </Flex>
                        )}

                        {/* Image Counter */}
                        {vehicle?.images?.length > 1 && (
                            <Badge
                                position="absolute"
                                bottom={4}
                                right={4}
                                bg="blackAlpha.800"
                                color="white"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="xs"
                                fontWeight="bold"
                                zIndex={2}
                            >
                                {index + 1} / {vehicle?.images?.length}
                            </Badge>
                        )}

                        {/* Quick Action Buttons */}
                        <HStack
                            position="absolute"
                            bottom={4}
                            left={4}
                            spacing={2}
                            zIndex={2}
                        >
                            {listing?.listing_type === 'sale' && (
                                <Badge
                                    bg="#F4A950"
                                    color="white"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Icon as={HiMiniReceiptPercent} boxSize={3} />
                                    <Text>+0.5% fee</Text>
                                </Badge>
                            )}
                        </HStack>
                    </Box>
                </CardHeader>

                <CardBody p={6}>
                    {/* Title and Year */}
                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Heading 
                                size="md" 
                                fontWeight="bold" 
                                mb={2}
                                noOfLines={2}
                                color="gray.900"
                                lineHeight="1.3"
                            >
                                {listing?.title}
                            </Heading>
                            
                            {/* Vehicle Year and Make */}
                            <HStack spacing={2} mb={3}>
                                <Badge 
                                    colorScheme="gray" 
                                    variant="subtle"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                >
                                    {vehicle?.year || '2020'}
                                </Badge>
                                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    {vehicle?.make} {vehicle?.model}
                                </Text>
                            </HStack>
                        </Box>

                        {/* Vehicle Specs */}
                        {listing?.listing_type === 'sale' ? (
                            vehicle?.kind === 'uav' ? (
                                // UAV-specific specs
                                <SimpleGrid columns={3} spacing={3} fontSize="sm">
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">🕐</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Flight Time</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center">
                                            {vehicle?.max_flight_time || 0} min
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">📏</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Range</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.max_range || 0} km
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">📷</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Camera</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.camera_resolution || 'N/A'}
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            ) : vehicle?.kind === 'plane' ? (
                                // Aircraft-specific specs
                                <SimpleGrid columns={3} spacing={3} fontSize="sm">
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">✈️</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Type</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.aircraft_type || 'N/A'}
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">📏</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Range</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.range || 0} km
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">💺</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Seats</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center">
                                            {vehicle?.seats || 0}
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            ) : vehicle?.kind === 'boat' ? (
                                // Boat-specific specs
                                <SimpleGrid columns={3} spacing={3} fontSize="sm">
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">⚓</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Hull</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.hull_material || 'N/A'}
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">📏</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Length</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.length || 0} ft
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">🔧</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Engines</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center">
                                            {vehicle?.engine_count || 1}
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            ) : vehicle?.kind === 'bike' ? (
                                // Motorcycle-specific specs
                                <SimpleGrid columns={3} spacing={3} fontSize="sm">
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">🏍️</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Type</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.bike_type || 'N/A'}
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Text fontSize="lg">⚙️</Text>
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Engine</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.engine_capacity || 0} cc
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Icon as={RiGasStationLine} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Fuel</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.fuel_system || 'Petrol'}
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            ) : (
                                // Default car specs
                                <SimpleGrid columns={3} spacing={3} fontSize="sm">
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Icon as={RxTimer} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Mileage</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center">
                                            {commaInt(vehicle?.mileage) || 0}mi
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Icon as={TbManualGearbox} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Trans.</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.transmission || 'Auto'}
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center" p={3} bg="gray.50" borderRadius="lg">
                                        <Icon as={RiGasStationLine} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" fontSize="xs" textAlign="center">Fuel</Text>
                                        <Text fontWeight="bold" fontSize="xs" textAlign="center" noOfLines={1}>
                                            {vehicle?.fuel_system || 'Petrol'}
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            )
                        ) : (
                            <VStack spacing={3} p={4} bg="gradient-to-br from-orange-50 to-yellow-50" borderRadius="xl" border="1px" borderColor="orange.100">
                                {/* Host Rating and Status */}
                                <HStack spacing={4} justify="space-between" w="100%">
                                    <HStack spacing={2}>
                                        <Box
                                            w="8px"
                                            h="8px"
                                            borderRadius="full"
                                            bg="green.400"
                                            boxShadow="0 0 0 2px rgba(72, 187, 120, 0.3)"
                                        />
                                        <Text fontSize="xs" color="green.600" fontWeight="bold">
                                            Available Now
                                        </Text>
                                    </HStack>
                                    <Badge 
                                        bg="#F4A950" 
                                        color="white" 
                                        variant="solid" 
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        Instant Book
                                    </Badge>
                                </HStack>

                                {/* Host Rating */}
                                <HStack spacing={4} justify="space-between" w="100%">
                                    <HStack spacing={1}>
                                        <StarIcon color="#F4A950" boxSize={4} />
                                        <Text fontWeight="bold" color="gray.800" fontSize="sm">
                                            {(vehicle?.dealer?.rating) || '4.8'}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                            ({vehicle?.trips || '25'} trips)
                                        </Text>
                                    </HStack>
                                    <Badge 
                                        colorScheme="blue" 
                                        variant="subtle" 
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                        fontSize="xs"
                                    >
                                        {vehicle?.dealer?.level || 'Pro Host'}
                                    </Badge>
                                </HStack>

                                {/* Rental Features */}
                                <SimpleGrid columns={3} spacing={2} w="100%" fontSize="xs">
                                    <VStack spacing={1} align="center">
                                        <Icon as={RiGasStationLine} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" textAlign="center" noOfLines={1}>
                                            {vehicle?.fuel_system || 'Petrol'}
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center">
                                        <Icon as={TbManualGearbox} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" textAlign="center" noOfLines={1}>
                                            {vehicle?.transmission || 'Auto'}
                                        </Text>
                                    </VStack>
                                    <VStack spacing={1} align="center">
                                        <Icon as={RxTimer} color="#F4A950" boxSize={4} />
                                        <Text color="gray.600" textAlign="center" noOfLines={1}>
                                            {vehicle?.seats || '5'} Seats
                                        </Text>
                                    </VStack>
                                </SimpleGrid>

                                {/* Rental Perks */}
                                <HStack spacing={2} justify="center" flexWrap="wrap">
                                    <Badge 
                                        colorScheme="green" 
                                        variant="subtle" 
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        Free Cancel
                                    </Badge>
                                    <Badge 
                                        colorScheme="purple" 
                                        variant="subtle" 
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        Insurance
                                    </Badge>
                                    <Badge 
                                        colorScheme="blue" 
                                        variant="subtle" 
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        24/7 Support
                                    </Badge>
                                </HStack>
                            </VStack>
                        )}

                        {/* Price Section */}
                        <Flex alignItems="center" justifyContent="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="2xl" fontWeight="bold" color="#F4A950">
                                    ₦{commaInt(listing?.price)}
                                </Text>
                                {listing?.listing_type === 'rental' && (
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                        per {listing?.payment_cycle || 'day'}
                                    </Text>
                                )}
                            </VStack>
                            
                            {/* Quick Action Button */}
                            <Button
                                size="sm"
                                bg="#F4A950"
                                color="white"
                                _hover={{ 
                                    bg: 'orange.600',
                                    transform: 'translateY(-2px)',
                                    shadow: 'lg'
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                borderRadius="full"
                                px={6}
                                fontWeight="bold"
                                fontSize="xs"
                            >
                                {listing?.listing_type === 'sale' ? 'View Details' : 'Book Now'}
                            </Button>
                        </Flex>

                        <Divider />

                        {/* Location and Badges */}
                        <Flex justifyContent="space-between" alignItems="center">
                            <HStack spacing={2} fontSize="sm" color="gray.600" flex={1} minW={0}>
                                <Icon as={LuMapPin} flexShrink={0} color="#F4A950" />
                                <Text noOfLines={1} fontWeight="medium">
                                    {vehicle?.dealer?.location || 
                                     vehicle?.dealer?.address || 
                                     vehicle?.dealer?.city || 
                                     listing?.location || 
                                     listing?.address || 
                                     listing?.city || 
                                     'Location not specified'}
                                </Text>
                            </HStack>
                            
                            <HStack spacing={2} flexShrink={0}>
                                {listing?.listing_type === 'sale' ? (
                                    <>
                                        <Badge 
                                            colorScheme="blue" 
                                            variant="subtle"
                                            display="flex" 
                                            alignItems="center" 
                                            gap={1}
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                        >
                                            <Icon as={BsFillPatchCheckFill} boxSize={2} />
                                            <Text>Verified</Text>
                                        </Badge>
                                        {vehicle?.custom_duty && (
                                            <Badge 
                                                colorScheme="purple" 
                                                variant="subtle"
                                                display="flex" 
                                                alignItems="center" 
                                                gap={1}
                                                px={2}
                                                py={1}
                                                borderRadius="full"
                                                fontSize="xs"
                                            >
                                                <Icon as={BsFillPatchCheckFill} boxSize={2} />
                                                <Text>Duty</Text>
                                            </Badge>
                                        )}
                                    </>
                                ) : (
                                    <Badge 
                                        colorScheme="green" 
                                        variant="subtle"
                                        display="flex" 
                                        alignItems="center" 
                                        gap={1}
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                    >
                                        <Icon as={Leaf} boxSize={3} />
                                        <Text fontSize="xs">{vehicle?.fuel_system || 'Eco'}</Text>
                                    </Badge>
                                )}
                            </HStack>
                        </Flex>
                    </VStack>
                </CardBody>
            </Card>
        </Box>
        </NavLink>
    )
}


export const CustomerSearchBar = ({ onSearch, ...props }) => {
  const {notify, redirect} = useContext(GlobalStore);
  const [menuOpen, setMenuState] = useState(false);
  const [target, setTarget] = useState('cars');
  const [query, setQuery] = useState('');
  const nav = useNavigate();

    function handleSearch(e){
        e.preventDefault();
        nav(`/search/${target}/?find=${query}`);
    }

    useEffect(() => {
        return () => {
            setQuery('');
        }
    }, [])

    return (
      <form method='post' onSubmit={handleSearch}>
        <Flex
          alignItems="center"
          gap={2}
          pl={3}
          pr={2}
          py={1}
          bg="white"
          borderWidth={1}
          borderColor="gray.200"
          rounded="full"
          boxShadow="sm"
          _hover={{ boxShadow: 'md' }}
          _focusWithin={{ borderColor: 'primary', boxShadow: '0 0 0 3px rgba(243,159,72,0.25)' }}
          {...props}
        >
          <Icon className='icon' color="gray.500" fontSize={'18px'}><RiSearch2Line /></Icon>

          <Input
            type='search'
            value={query}
            placeholder='Search cars, rentals, mechanics...'
            onInput={(e) => setQuery(e.target.value)}
            variant="unstyled"
            flex={1}
            px={2}
          />

          <Menu>
            <Select
              color="inherit"
              minW="90px"
              maxW={'max-content'}
              onClick={() => setMenuState(!menuOpen)}
              type='button'
              rounded={'full'}
              as={MenuButton}
              textTransform={'capitalize'}
              borderWidth={1}
              borderColor="gray.200"
              px={3}
              py={1}
            >
              <option value={target}>{target}</option>
            </Select>
            <MenuList minW={'max-content'} py={0}>
              <MenuItem color="inherit" as={motion.button} type='button' onClick={() => setTarget('cars')}>Cars</MenuItem>
              <MenuItem color="inherit" as={motion.button} type='button' onClick={() => setTarget('mechanics')}>Mechanics</MenuItem>
            </MenuList>
          </Menu>

          <Button type='submit' colorScheme='blue' bgColor='primary' rounded='full' size='sm'>Search</Button>
        </Flex>
      </form>
  )
}


export const DashboardSearchBar = ({ onSearch, ...props }) => {
    const {notify, redirect} = useContext(GlobalStore);
    const [menuOpen, setMenuState] = useState(false);
    const [query, setQuery] = useState('');
    const nav = useNavigate();

    function handleSearch(e){
        e.preventDefault();
        nav(`/search/${target}/?find=${query}`);
    }

    useEffect(() => {
        return () => {
            setQuery('');
        }
    }, [])

    return (
        <form method='post' onSubmit={handleSearch}>
            <Flex rounded="md" alignItems={'center'} zIndex={'100'} gap={2} justifyContent={'space-between'} pl={4} pr={0} py={0} border={'1px solid lightgrey'} {...props}>
                <Icon className='icon' color="inherit" fontSize={'20px'}><RiSearch2Line /> </Icon>
                <Input
                 type='search'
                 value={query} pl={0}
                 rounded={'30px'} flex={1}
                 className='no-style ellipsis small'
                 placeholder='Search for cars, rentals or mechanics...'
                 onInput={(e) => setQuery(e.target.value)}
                />
            </Flex>
        </form>
    )
}



export const DatePicker = ({ defaultValue, onChange, ...props }) => {
    const input = useRef(null);
    let date = new Date();
    if (defaultValue){
        date = new Date(defaultValue);
    }
    const [value, setValue] = useState(date);
    const [open, setOpenState] = useState(false);
    const [label, setLabel] = useState(`${date.toLocaleDateString()}`);

    const changeVal = (e) => {
        setValue(e.target.value);
        const dateValue = new Date(e.target.value);
        if (!dateValue) return; // Prevent empty values

        onChange(`${dateValue}`);
        setLabel(`${dateValue.toLocaleDateString()}`);
    };

    const openPicker = () => {
        if (input.current) {
            window.datepicker = input.current;
            if(!open){
                if (input.current.showPicker) {
                    input.current.showPicker(); // Works in modern browsers
                } else {
                    input.current.click(); // Fallback for older browsers
                }
            }else{
                input.current.blur();
            }
        }
    };

    return (
        <Button
            rightIcon={<ChevronDownIcon />}
            onClick={openPicker}
            variant="outline"
            className="small"
            position="relative"
            {...props}
        >
            {label}
            <Input
                type="date"
                ref={input}
                onInput={changeVal}
                value={value}
                position="absolute"
                inset="0"
                opacity="0"
                cursor="pointer"
            />
        </Button>
    );
}


export const CenteredLayout = ({ children, wrapperProps, ...props }) => {
    return(
        <Box placeItems="center" placeContent="center" w={'100%'} justifyContent={'center'} align={'center'} minH={'80vh'} {...wrapperProps}>
            {children}
        </Box>
    )
}


export const PinField = ({ onChange, value}) => {
    return(
        <HStack my={3} alignItems={'center'} justifyContent={'center'}>
            <PinInput otp size={'lg'} value={value} onChange={onChange}>
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
            </PinInput>
        </HStack>
    )
}

export const OTPField = ({ onChange, value}) => {
    return(
        <HStack my={3} alignItems={'center'} justifyContent={'center'}>
            <PinInput otp size={'lg'} value={value} onChange={onChange}>
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
            </PinInput>
        </HStack>
    )
}


export const DNDUploadField = ({ accept, multiple=true, onUpload, ...props}) => {
    const [uploads, setUploads] = useState([]);

    function handleInput(e){
        const files = e.target.files;

        for (let _file of files){
            const file = new File(_file)
            const data = {
                'name': file.name,
                'size': file.size,
            }
            setUploads([
                ...uploads,
                data
            ])
            onUpload({...data});
        }

    }

    return(
        <Box border={'2px dashed grey'} py={5} px={3}>
            <Input type='file' hidden={true} multiple={multiple} onInput={handleInput} />
        </Box>
    )
}



export function ImageCarousel({ images, ...props }) {
  const [currentImage, setCurrentImage] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!images){
    return null;
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images?.length)
  }

  const previousImage = () => {
    setCurrentImage((prev) => (prev - 1 + images?.length) % images?.length)
  }

  return (
    <Box>
        <Box position="relative" mb={4}>
            <Box
                sx={{
                    backgroundImage: `url(${images[currentImage]?.url})`,
                    borderRadius: '10px',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPositionX: '50%',
                    backgroundPositionY: '45%',
                }}
                w={'100%'}
                minH={'400px'}
                cursor="zoom-in"
                onClick={onOpen}
            ></Box>

            <IconButton
            fontSize={"35px"}
            rounded={"full"}
            style={{background: 'rgba(0, 0, 0, 0.43)', color: '#fff'}}
            aria-label="Previous image"
            icon={<ChevronLeftIcon />}
            position="absolute"
            left={2}
            top="50%"
            transform="translateY(-50%)"
            onClick={previousImage}
            bg="white"
            _hover={{ bg: 'gray.100' }}
            />
        
            <IconButton
            fontSize={"35px"}
            rounded={"full"}
            style={{background: 'rgba(0, 0, 0, 0.43)', color: '#fff'}}
            aria-label="Next image"
            icon={<ChevronRightIcon />}
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            onClick={nextImage}
            bg="white"
            _hover={{ bg: 'gray.100' }}
            />
        </Box>

        <HStack spacing={2} overflowX="scroll" w='100%' pb={2}>
        {images?.map((img, index) => (
            <AspectRatio
            key={index}
            ratio={4/3}
            w="24"
            minW="24"
            cursor="pointer"
            onClick={() => setCurrentImage(index)}
            >
            {
                images?.length > 4 ? (
                    <Fragment>
                        {
                            index > 3 ? (null):(
                                <Image
                                    src={img?.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    objectFit="cover"
                                    borderRadius="md"
                                    borderWidth={2}
                                    borderColor={currentImage === index ? 'blue.500' : 'transparent'}
                                />
                            )
                        }
                        {index === 3 &&
                        <Image
                                src={img.url}
                                alt={`Thumbnail ${index + 1}`}
                                objectFit="cover"
                                borderRadius="md"
                                borderWidth={2}
                                borderColor={currentImage === index ? 'blue.500' : 'transparent'}
                            />
                        }
                    </Fragment>
                ) : (
                    <Image
                        src={img?.url}
                        alt={`Thumbnail ${index + 1}`}
                        objectFit="cover"
                        borderRadius="md"
                        borderWidth={2}
                        borderColor={currentImage === index ? 'blue.500' : 'transparent'}
                    />
                )
            }
            </AspectRatio>
        ))}
        </HStack>

        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
            <ModalBody p={0}>
            <AspectRatio ratio={4/3}>
                <Box position="relative">
                <Image
                    src={images[currentImage].url}
                    alt={`Car image ${currentImage + 1}`}
                    objectFit="cover"
                />
                <IconButton
                    aria-label="Previous image"
                    icon={<ChevronLeftIcon />}
                    position="absolute"
                    left={2}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={previousImage}
                />
                <IconButton
                    aria-label="Next image"
                    icon={<ChevronRightIcon />}
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={nextImage}
                />
                </Box>
            </AspectRatio>
            </ModalBody>
        </ModalContent>
        </Modal>
    </Box>
  )
}



export const LocationBreadcrumb = ({ label }) => {
  const path = window.location.pathname;

  // If on home, return only the home breadcrumb
  if (path === '/' || path === '/home/') {
    return (
      <Breadcrumb alignItems="center" separator={<ChevronRightIcon />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    );
  }

  // Split path into segments and remove empty strings
  const pathSegments = path.split('/').filter(segment => segment);

  // Generate breadcrumb links (excluding last segment)
  const breadcrumbItems = pathSegments.slice(0, -1).map((segment, index) => {
    const routeTo = '/' + pathSegments.slice(0, index + 1).join('/');

    return (
      <BreadcrumbItem key={index}>
        <BreadcrumbLink as={Link} to={routeTo} textTransform="capitalize">
          {segment.replace(/-/g, ' ')}
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
  });

  // Add final non-clickable label
  breadcrumbItems.push(
    <BreadcrumbItem key="current" isCurrentPage>
      <BreadcrumbLink>{label}</BreadcrumbLink>
    </BreadcrumbItem>
  );

  return (
    <Breadcrumb alignItems={'center'} separator={<ChevronRightIcon />}>
      {/*{breadcrumbItems &&
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
      }*/}
      {breadcrumbItems}
    </Breadcrumb>
  );
};




// Export MechanicCard
export { MechanicCard } from './MechanicCard';
// Export new inspection components
export { default as InspectionBooking } from './InspectionBooking';
export { default as InspectionSlip } from './InspectionSlip';
export { default as ScheduleInspectionModal } from './ScheduleInspectionModal';
export { default as CreateInspectionModal } from './inspections/CreateInspectionModal';
export { default as InspectionPhotos } from './inspections/InspectionPhotos';
export { default as InspectionData } from './inspections/InspectionData';

// Export new inspection document components
export { default as DocumentPreview } from './DocumentPreview';
export { default as DocumentSigning } from './DocumentSigning';


// Export WalletOverview component
export { default as WalletOverview } from './WalletOverview';

// Export wallet transaction modals
export { default as DepositModal } from './DepositModal';
export { default as WithdrawModal } from './WithdrawModal';
export { default as TransferModal } from './TransferModal';

// Export error handling components
export { InlineError, EmptyStateError, FullPageError, ErrorToast } from './ErrorDisplay';

// Export BusinessLogo component
export { BusinessLogo } from './BusinessLogo';

// Export dealer verification component (new)
export { default as DealerInspectionVerification } from './DealerInspectionVerification';
