import {
    Modal, ModalOverlay, ModalContent, ModalCloseButton,
    Button, Textarea, useToast, IconButton, Flex, Box, Heading, 
    Text, VStack, HStack, Badge, Divider, Avatar, useColorModeValue
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { GlobalStore } from "../contexts/GlobalStore";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { FaCar, FaCheckCircle } from "react-icons/fa";
import { MdSpeed, MdLocalGasStation } from "react-icons/md";
import { BsGearFill, BsCalendar3 } from "react-icons/bs";

export const ChatPopup = ({ isOpen, onClose, recipient_type, recipient_id, vehicleDetails }) => {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { axios, commaInt } = useContext(GlobalStore);
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const cardBg = useColorModeValue('gray.50', 'gray.700');

    async function sendMessage() {
        if (!message.trim()) return;

        setIsSending(true);

        try {
            // Build message with vehicle details if provided
            let fullMessage = message;
            if (vehicleDetails) {
                fullMessage = `${message}\n\n--- Vehicle Inquiry ---\nVehicle: ${vehicleDetails.title || 'N/A'}\nPrice: ₦${commaInt(vehicleDetails.price) || 'N/A'}\nYear: ${vehicleDetails.year || 'N/A'}\nMake/Model: ${vehicleDetails.make || ''} ${vehicleDetails.model || ''}\nMileage: ${vehicleDetails.mileage ? commaInt(vehicleDetails.mileage) + ' mi' : 'N/A'}\nTransmission: ${vehicleDetails.transmission || 'N/A'}\nFuel: ${vehicleDetails.fuel_system || 'N/A'}\nListing: ${vehicleDetails.url || ''}`;
            }

            const payload = {
                 message: fullMessage,
                 other_member: recipient_type,
            }
            
            // Add vehicle metadata if available
            if (vehicleDetails) {
                payload['metadata'] = {
                    listing_id: vehicleDetails.listing_id,
                    vehicle_title: vehicleDetails.title,
                    vehicle_price: vehicleDetails.price,
                    vehicle_url: vehicleDetails.url
                };
            }
            
            switch(recipient_type){
                case "dealer": 
                    payload['dealer_id'] = recipient_id
                    break;
                case "mechanic": 
                    payload['mechanic_id'] = recipient_id
                    break;
                case "customer": 
                    payload['customer_id'] = recipient_id
                    break;
                default: 
                    payload['dealer_id'] = recipient_id
                    break;
            }

            console.log('💬 Sending message with payload:', payload);
            const res = await axios.post(`/chat/message/`, payload);
            if (res.status === 200) {
                toast({
                    title: "Message sent successfully!",
                    description: "The dealer will respond to you shortly.",
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                    position: "top-right",
                    icon: <FaCheckCircle />
                });
                setMessage("");
                onClose();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Failed to send message",
                description: error.response?.data?.message || "Please try again later.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top-right"
            });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
            <ModalContent 
                borderRadius="2xl" 
                boxShadow="2xl" 
                bg={bgColor}
                mx={4}
                overflow="hidden"
            >
                {/* Header */}
                <Box 
                    bg="linear-gradient(135deg, #F4A950 0%, #E09940 100%)"
                    px={6}
                    py={5}
                    position="relative"
                >
                    <Flex align="center" justify="space-between">
                        <HStack spacing={3}>
                            <Avatar 
                                size="sm" 
                                bg="white" 
                                color="#F4A950"
                                icon={<FaCar />}
                            />
                            <VStack align="start" spacing={0}>
                                <Heading size="md" color="white">
                                    Contact Dealer
                                </Heading>
                                <Text fontSize="xs" color="whiteAlpha.900">
                                    Send an inquiry about this vehicle
                                </Text>
                            </VStack>
                        </HStack>
                        <IconButton
                            icon={<IoMdClose />}
                            size="sm"
                            onClick={onClose}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'whiteAlpha.200' }}
                            borderRadius="full"
                        />
                    </Flex>
                </Box>

                {/* Body */}
                <VStack spacing={4} p={6} align="stretch">
                    {/* Vehicle Details Card */}
                    {vehicleDetails && (
                        <Box 
                            p={4} 
                            bg={cardBg}
                            borderRadius="xl" 
                            border="1px" 
                            borderColor={borderColor}
                            transition="all 0.2s"
                            _hover={{ shadow: 'md' }}
                        >
                            <HStack spacing={1} mb={3}>
                                <FaCar color="#F4A950" size="14px" />
                                <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                                    Vehicle Details
                                </Text>
                            </HStack>

                            <Flex gap={4}>
                                {vehicleDetails.image && (
                                    <Box
                                        w="120px"
                                        h="90px"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        flexShrink={0}
                                        bg="gray.200"
                                        backgroundImage={`url(${vehicleDetails.image})`}
                                        backgroundSize="cover"
                                        backgroundPosition="center"
                                        border="2px"
                                        borderColor={borderColor}
                                    />
                                )}
                                <VStack align="start" spacing={2} flex={1}>
                                    <Heading size="sm" noOfLines={2} lineHeight="1.3">
                                        {vehicleDetails.title}
                                    </Heading>
                                    <Text fontSize="xl" fontWeight="bold" color="#F4A950">
                                        ₦{commaInt(vehicleDetails.price)}
                                    </Text>
                                    
                                    {/* Vehicle Specs */}
                                    <Flex gap={3} flexWrap="wrap" fontSize="xs" color="gray.600">
                                        {vehicleDetails.year && (
                                            <HStack spacing={1}>
                                                <BsCalendar3 />
                                                <Text>{vehicleDetails.year}</Text>
                                            </HStack>
                                        )}
                                        {vehicleDetails.mileage && (
                                            <HStack spacing={1}>
                                                <MdSpeed />
                                                <Text>{commaInt(vehicleDetails.mileage)} mi</Text>
                                            </HStack>
                                        )}
                                        {vehicleDetails.transmission && (
                                            <HStack spacing={1}>
                                                <BsGearFill />
                                                <Text>{vehicleDetails.transmission}</Text>
                                            </HStack>
                                        )}
                                        {vehicleDetails.fuel_system && (
                                            <HStack spacing={1}>
                                                <MdLocalGasStation />
                                                <Text>{vehicleDetails.fuel_system}</Text>
                                            </HStack>
                                        )}
                                    </Flex>
                                </VStack>
                            </Flex>
                        </Box>
                    )}

                    <Divider />

                    {/* Message Input */}
                    <VStack align="stretch" spacing={3}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                            Your Message
                        </Text>
                        <Textarea
                            placeholder="Hi, I'm interested in this vehicle. Is it still available?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            resize="none"
                            rows={5}
                            borderRadius="lg"
                            borderColor={borderColor}
                            _focus={{
                                borderColor: '#F4A950',
                                boxShadow: '0 0 0 1px #F4A950'
                            }}
                            fontSize="sm"
                        />
                        <Text fontSize="xs" color="gray.500">
                            The dealer will receive your message along with the vehicle details above.
                        </Text>
                    </VStack>

                    {/* Action Buttons */}
                    <Flex gap={3} pt={2}>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            flex={1}
                            borderRadius="lg"
                            borderColor={borderColor}
                            _hover={{ bg: cardBg }}
                        >
                            Cancel
                        </Button>
                        <Button
                            bg="#F4A950"
                            color="white"
                            onClick={sendMessage}
                            isDisabled={!message.trim()}
                            isLoading={isSending}
                            loadingText="Sending..."
                            flex={2}
                            borderRadius="lg"
                            rightIcon={<IoMdSend />}
                            _hover={{ bg: '#E09940' }}
                            _active={{ bg: '#D08930' }}
                        >
                            Send Message
                        </Button>
                    </Flex>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
