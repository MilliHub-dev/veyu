import {
    Box, Heading,
    Button,
    Container,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Stack,
    Image,
    Text,
    Avatar,
    Badge,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    List,
    ListItem,
    Card,
    CardBody,
    Tag,
    Icon,
    VStack,
    HStack,
    Checkbox,
 } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { GlobalStore } from "../../App";
import { jsonifyObject, objectifyJSON } from "../../utils";
import { useSearchParams, NavLink, Link } from "react-router-dom";
// import { SearchIcon, StarIcon, ZapIcon } from '@chakra-ui/icons';
import { RiGasStationLine, RiHeart2Fill, RiHeart2Line, RiMessage2Line, RiSearch2Line } from 'react-icons/ri'
import { motion } from "framer-motion";
import { MechanicListSkeleton } from "../../components/loaders";
import ScheduleInspectionModal from "../../components/ScheduleInspectionModal";
import { 
    ShoppingCart, 
    Car, 
    KeyRound, 
    Wrench, 
    ClipboardCheck, 
    Package, 
    AlertCircle, 
    CheckCircle, 
    ExternalLink,
    Calendar,
    MapPin,
    DollarSign,
    FileText,
    CreditCard,
} from "lucide-react";



export const CartPage = ({ props }) => {
    const [cart, setCart] = useState({
        itemsCount: 0,
        cars: [],
        rentals: [],
        services: [],
        orders: [],
    });
    const [loading, setLoading] = useState(true);
    const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const {axios, authUser, commaInt, notify, redirect, } = useContext(GlobalStore);

    function openInspectionModal(order) {
        setSelectedOrder(order);
        setInspectionModalOpen(true);
    }

    function closeInspectionModal() {
        setInspectionModalOpen(false);
        setSelectedOrder(null);
    }

    function handleInspectionSuccess(inspectionSlip) {
        notify({
            title: 'Inspection Scheduled',
            body: 'Your inspection has been scheduled successfully',
            color: 'green'
        });
        closeInspectionModal();
        getData(); // Refresh cart data
    }

    function init(){
        getData();
        setTimeout(() => setLoading(false), 2500);
    }

    async function removeFromCart( item ){
        setLoading(true);

        try {
            const res = await axios.post(`/accounts/cart/`, {
                action: 'remove-from-cart',
                item: item.uuid,
            });

            const data = objectifyJSON(res.data);
            if (res.status === 200){
                notify({
                    title: 'Success',
                    body: `${item?.vehicle?.name || 'Item'} removed from your cart.`,
                    color: 'green'
                });
                getData();
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
            notify({
                title: 'Error',
                body: error?.response?.data?.message || 'Failed to remove item from cart',
                color: 'red'
            });
        } finally {
            setTimeout(() => setLoading(false), 1200);
        }
    }

    async function getData(){
        const res = await axios.get(`/accounts/cart/`);
        const data = objectifyJSON(res.data);

        if (res.status === 200){
            console.log("Cart Data:", data.data);
            let cars, rentals, bookings, orders;

            cars = data?.data?.cars;
            rentals = data?.data?.rentals;
            bookings = data?.data?.bookings;
            orders = data?.data?.orders;

            setCart({
                itemsCount: (cars?.length + rentals?.length + bookings?.length),
                cars,
                rentals,
                bookings,
                orders,
            })
        }

    }

    useEffect(() => {
        init();
    }, []);

    if (loading){
        return <MechanicListSkeleton />;
    }

    return (
        <Box px={4} py={4}>
            <Container maxW="container.xl" py={4}>
                <Heading className="subtitle" size={'lg'} mb={5}>Your Cart</Heading>

                <Tabs variant="unstyled">
                <TabList
                    border="1px solid"
                    borderColor="gray.200"
                    bg="gray.50"
                    borderRadius="xl"
                    className="hidden-scroll"
                    overflowX="auto"
                    overflowY="hidden"
                    whiteSpace="nowrap"
                    display="flex"
                    px={2}
                    py={2}
                    alignItems="center"
                    minHeight="fit-content"
                    gap={1}
                >
                    <Tab
                      className="subtitle"
                      px={3}
                      py={2}
                      borderRadius="full"
                      _selected={{ bg: 'white', border: '1px solid', borderColor: 'blue.200', boxShadow: 'sm' }}
                    >
                        <HStack spacing={2} align="center">
                          <ShoppingCart size={16} />
                          <Text as="span">Orders</Text>
                          <Badge borderRadius="30px" className="subtitle" px="2" color="primary">
                            {cart?.orders?.length}
                          </Badge>
                        </HStack>
                    </Tab>
                    <Tab
                      className="subtitle"
                      px={3}
                      py={2}
                      borderRadius="full"
                      _selected={{ bg: 'white', border: '1px solid', borderColor: 'blue.200', boxShadow: 'sm' }}
                    >
                        <HStack spacing={2} align="center">
                          <Car size={16} />
                          <Text as="span">Cars</Text>
                          <Badge borderRadius="30px" className="subtitle" px="2" color="primary">
                            {cart?.cars?.length}
                          </Badge>
                        </HStack>
                    </Tab>
                    <Tab
                      className="subtitle"
                      px={3}
                      py={2}
                      borderRadius="full"
                      _selected={{ bg: 'white', border: '1px solid', borderColor: 'blue.200', boxShadow: 'sm' }}
                    >
                        <HStack spacing={2} align="center">
                          <KeyRound size={16} />
                          <Text as="span">Rentals</Text>
                          <Badge borderRadius="30px" className="subtitle" px="2" color="primary">
                            {cart?.rentals?.length}
                          </Badge>
                        </HStack>
                    </Tab>
                    <Tab
                      className="subtitle"
                      px={3}
                      py={2}
                      borderRadius="full"
                      _selected={{ bg: 'white', border: '1px solid', borderColor: 'blue.200', boxShadow: 'sm' }}
                    >
                        <HStack spacing={2} align="center">
                          <Wrench size={16} />
                          <Text as="span">Mechanics</Text>
                          <Badge borderRadius="30px" className="subtitle" px="2" color="primary">
                            {cart?.bookings?.length}
                          </Badge>
                        </HStack>
                    </Tab>
                    </TabList>


                    <TabPanels>
                        <TabPanel>
                            <VStack spacing={4} align="stretch">
                                {cart?.orders?.length === 0 ? (
                                    <Card>
                                        <CardBody>
                                            <VStack spacing={4} py={8}>
                                                <ShoppingCart size={48} color="gray" />
                                                <Heading size="md" color="gray.600">No orders in cart</Heading>
                                                <Text color="gray.500" textAlign="center">
                                                    Your order cart is empty. Start shopping for vehicles!
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ) : (
                                    cart?.orders?.map((order, idx) => {
                                        const vehicle = order?.order_item?.vehicle;
                                        const hasInspection = order?.includes_inspection || order?.purchase_type === 'With Inspection';
                                        const inspectionScheduled = order?.inspection_scheduled;
                                        const inspectionSlipRef = order?.inspection_slip_reference;
                                        const purchaseType = order?.purchase_type || (hasInspection ? 'With Inspection' : 'Direct Purchase');
                                        const dealer = vehicle?.dealer;

                                        // Debug log
                                        console.log('Order Debug:', {
                                            orderId: order?.id,
                                            includes_inspection: order?.includes_inspection,
                                            purchase_type: order?.purchase_type,
                                            hasInspection,
                                            inspectionScheduled,
                                            inspectionSlipRef,
                                            order
                                        });

                                        return (
                                            <Card 
                                                key={order.uuid || idx}
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                _hover={{ shadow: 'md', borderColor: 'blue.300' }}
                                                transition="all 0.2s"
                                            >
                                                <CardBody>
                                                    <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                                                        {/* Vehicle Image */}
                                                        <Box flexShrink={0}>
                                                            <Image
                                                                src={vehicle?.images?.[0]?.url || "/placeholder.jpg"}
                                                                alt={vehicle?.name || "Vehicle"}
                                                                w={{ base: '100%', lg: '220px' }}
                                                                h="160px"
                                                                objectFit="cover"
                                                                borderRadius="lg"
                                                            />
                                                        </Box>

                                                        {/* Order Details */}
                                                        <Flex flex={1} direction="column" gap={3}>
                                                            {/* Header */}
                                                            <Flex justify="space-between" align="start" flexWrap="wrap" gap={2}>
                                                                <Box>
                                                                    <HStack spacing={2} mb={1}>
                                                                        <Car size={18} />
                                                                        <Heading size="md">{vehicle?.name}</Heading>
                                                                    </HStack>
                                                                    {vehicle?.condition && (
                                                                        <Badge colorScheme="purple" mr={2}>
                                                                            {vehicle.condition}
                                                                        </Badge>
                                                                    )}
                                                                    <Text fontSize="sm" color="gray.600" mt={1}>
                                                                        Order #{order?.id}
                                                                    </Text>
                                                                </Box>
                                                                <Badge
                                                                    colorScheme={order?.order_status === 'completed' ? 'green' : 'yellow'}
                                                                    fontSize="sm"
                                                                    px={3}
                                                                    py={1}
                                                                    borderRadius="full"
                                                                >
                                                                    {order?.order_status || 'Pending'}
                                                                </Badge>
                                                            </Flex>

                                                            {/* Info Grid */}
                                                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                                                                {/* Purchase Type */}
                                                                <Box flex={1}>
                                                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                                                        Purchase Type
                                                                    </Text>
                                                                    <HStack spacing={1}>
                                                                        {hasInspection ? (
                                                                            <ClipboardCheck size={16} color="blue" />
                                                                        ) : (
                                                                            <Package size={16} color="green" />
                                                                        )}
                                                                        <Text fontSize="sm" fontWeight="600">
                                                                            {purchaseType}
                                                                        </Text>
                                                                    </HStack>
                                                                </Box>

                                                                {/* Amount */}
                                                                <Box flex={1}>
                                                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                                                        Total Amount
                                                                    </Text>
                                                                    <HStack spacing={1}>
                                                                        <DollarSign size={16} color="green" />
                                                                        <Text fontSize="sm" fontWeight="700" color="green.600">
                                                                            ₦{commaInt(order?.total || order?.sub_total || order?.order_item?.price)}
                                                                        </Text>
                                                                    </HStack>
                                                                    {order?.paid ? (
                                                                        <Badge colorScheme="green" size="xs" mt={1}>
                                                                            Paid
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge colorScheme="red" size="xs" mt={1}>
                                                                            Unpaid
                                                                        </Badge>
                                                                    )}
                                                                </Box>

                                                                {/* Dealer */}
                                                                <Box flex={1}>
                                                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                                                        Dealer
                                                                    </Text>
                                                                    <HStack spacing={1}>
                                                                        <MapPin size={16} />
                                                                        <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                                                            {dealer?.business_name || 'N/A'}
                                                                        </Text>
                                                                    </HStack>
                                                                </Box>
                                                            </Stack>

                                                            {/* Inspection Status */}
                                                            {hasInspection && (
                                                                <Box
                                                                    bg={inspectionScheduled ? 'green.50' : 'orange.50'}
                                                                    borderWidth="1px"
                                                                    borderColor={inspectionScheduled ? 'green.200' : 'orange.200'}
                                                                    borderRadius="md"
                                                                    p={3}
                                                                >
                                                                    <HStack spacing={2}>
                                                                        {inspectionScheduled ? (
                                                                            <>
                                                                                <CheckCircle size={18} color="green" />
                                                                                <Text fontSize="sm" color="green.700" fontWeight="600" flex={1}>
                                                                                    Inspection Scheduled
                                                                                </Text>
                                                                                {inspectionSlipRef && (
                                                                                    <Button
                                                                                        as={Link}
                                                                                        to={`/inspections/slip/${inspectionSlipRef}`}
                                                                                        size="sm"
                                                                                        colorScheme="green"
                                                                                        variant="outline"
                                                                                        rightIcon={<ExternalLink size={14} />}
                                                                                    >
                                                                                        View Slip
                                                                                    </Button>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <AlertCircle size={18} color="orange" />
                                                                                <Text fontSize="sm" color="orange.700" fontWeight="600" flex={1}>
                                                                                    Inspection Not Scheduled
                                                                                </Text>
                                                                                <Button
                                                                                    onClick={() => openInspectionModal(order)}
                                                                                    size="sm"
                                                                                    colorScheme="orange"
                                                                                    rightIcon={<Calendar size={14} />}
                                                                                >
                                                                                    Schedule Now
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </HStack>
                                                                </Box>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <Flex gap={2} flexWrap="wrap" pt={2}>
                                                                {/* Inspection Slip Button - Always show if inspection is included */}
                                                                {hasInspection && inspectionScheduled && inspectionSlipRef && (
                                                                    <Button
                                                                        as={Link}
                                                                        to={`/inspections/slip/${inspectionSlipRef}`}
                                                                        colorScheme="teal"
                                                                        leftIcon={<FileText size={18} />}
                                                                        flex={{ base: '1', md: 'initial' }}
                                                                    >
                                                                        View Inspection Slip
                                                                    </Button>
                                                                )}

                                                                {/* Schedule Inspection Button - Show if inspection included but not scheduled */}
                                                                {hasInspection && !inspectionScheduled && (
                                                                    <Button
                                                                        onClick={() => openInspectionModal(order)}
                                                                        colorScheme="orange"
                                                                        leftIcon={<Calendar size={18} />}
                                                                        flex={{ base: '1', md: 'initial' }}
                                                                    >
                                                                        Schedule Inspection
                                                                    </Button>
                                                                )}

                                                                {/* Add Inspection Button - Show for direct purchase orders */}
                                                                {!hasInspection && order?.order_type === 'sale' && (
                                                                    <Button
                                                                        onClick={() => openInspectionModal(order)}
                                                                        colorScheme="purple"
                                                                        variant="outline"
                                                                        leftIcon={<ClipboardCheck size={18} />}
                                                                        flex={{ base: '1', md: 'initial' }}
                                                                    >
                                                                        Add Inspection
                                                                    </Button>
                                                                )}

                                                                {order?.order_type === 'sale' && (
                                                                    <>
                                                                        {order?.order_status === 'awaiting-inspection' || order?.order_status === 'inspecting' ? (
                                                                            <Button
                                                                                as={Link}
                                                                                to={`/checkout/inspection/?listingId=${order?.order_item?.uuid}`}
                                                                                colorScheme="yellow"
                                                                                leftIcon={<ClipboardCheck size={18} />}
                                                                                flex={{ base: '1', md: 'initial' }}
                                                                            >
                                                                                Finish Inspection
                                                                            </Button>
                                                                        ) : !order?.paid ? (
                                                                            <Button
                                                                                as={Link}
                                                                                to={`/orders/${order.uuid}`}
                                                                                colorScheme="blue"
                                                                                leftIcon={<CreditCard size={18} />}
                                                                                flex={{ base: '1', md: 'initial' }}
                                                                            >
                                                                                Pay Now
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                as={Link}
                                                                                to={`/orders/${order.uuid}`}
                                                                                colorScheme="green"
                                                                                variant="outline"
                                                                                leftIcon={<FileText size={18} />}
                                                                                flex={{ base: '1', md: 'initial' }}
                                                                            >
                                                                                View Order
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {order?.order_type === 'rental' && (
                                                                    <Button
                                                                        colorScheme="red"
                                                                        variant="outline"
                                                                        flex={{ base: '1', md: 'initial' }}
                                                                    >
                                                                        Cancel Rental
                                                                    </Button>
                                                                )}
                                                            </Flex>
                                                        </Flex>
                                                    </Flex>
                                                </CardBody>
                                            </Card>
                                        );
                                    })
                                )}
                            </VStack>
                        </TabPanel>

                        <TabPanel>
                            <VStack spacing={4} align="stretch">
                                {cart?.cars?.length === 0 ? (
                                    <Card>
                                        <CardBody>
                                            <VStack spacing={4} py={8}>
                                                <Car size={48} color="gray" />
                                                <Heading size="md" color="gray.600">No cars in cart</Heading>
                                                <Text color="gray.500" textAlign="center">
                                                    Your car cart is empty. Browse our inventory!
                                                </Text>
                                                <Button as={Link} to="/buy" colorScheme="blue">
                                                    Browse Cars
                                                </Button>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ) : (
                                    cart?.cars?.map((car, idx) => {
                                        const vehicle = car?.vehicle;
                                        const dealer = vehicle?.dealer;

                                        return (
                                            <Card 
                                                key={car.uuid || idx}
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                _hover={{ shadow: 'md', borderColor: 'blue.300' }}
                                                transition="all 0.2s"
                                            >
                                                <CardBody>
                                                    <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                                                        {/* Vehicle Image */}
                                                        <Box flexShrink={0}>
                                                            <Image
                                                                src={vehicle?.images?.[0]?.url || "/placeholder.jpg"}
                                                                alt={vehicle?.name || "Vehicle"}
                                                                w={{ base: '100%', lg: '220px' }}
                                                                h="160px"
                                                                objectFit="cover"
                                                                borderRadius="lg"
                                                            />
                                                        </Box>

                                                        {/* Car Details */}
                                                        <Flex flex={1} direction="column" gap={3}>
                                                            {/* Header */}
                                                            <Box>
                                                                <HStack spacing={2} mb={1}>
                                                                    <Car size={18} />
                                                                    <Heading size="md">{vehicle?.name}</Heading>
                                                                </HStack>
                                                                {vehicle?.condition && (
                                                                    <Badge colorScheme="purple">
                                                                        {vehicle.condition}
                                                                    </Badge>
                                                                )}
                                                            </Box>

                                                            {/* Info Grid */}
                                                            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                                                                {/* Price */}
                                                                <Box flex={1}>
                                                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                                                        Price
                                                                    </Text>
                                                                    <HStack spacing={1}>
                                                                        <DollarSign size={16} color="green" />
                                                                        <Text fontSize="lg" fontWeight="700" color="green.600">
                                                                            ₦{commaInt(car?.price)}
                                                                        </Text>
                                                                    </HStack>
                                                                </Box>

                                                                {/* Dealer */}
                                                                <Box flex={1}>
                                                                    <Text fontSize="xs" color="gray.500" mb={1}>
                                                                        Dealer
                                                                    </Text>
                                                                    <HStack spacing={1}>
                                                                        <MapPin size={16} />
                                                                        <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                                                            {dealer?.business_name || 'N/A'}
                                                                        </Text>
                                                                    </HStack>
                                                                </Box>

                                                                {/* Location */}
                                                                {dealer?.location && (
                                                                    <Box flex={1}>
                                                                        <Text fontSize="xs" color="gray.500" mb={1}>
                                                                            Location
                                                                        </Text>
                                                                        <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                                                                            {dealer.location}
                                                                        </Text>
                                                                    </Box>
                                                                )}
                                                            </Stack>

                                                            {/* Action Buttons */}
                                                            <Flex gap={2} flexWrap="wrap" pt={2}>
                                                                <Button
                                                                    colorScheme="red"
                                                                    variant="outline"
                                                                    onClick={() => removeFromCart(car)}
                                                                    flex={{ base: '1', md: 'initial' }}
                                                                >
                                                                    Remove
                                                                </Button>
                                                                <Button
                                                                    as={NavLink}
                                                                    to={`/checkout/pay?listingId=${car?.uuid}`}
                                                                    colorScheme="blue"
                                                                    leftIcon={<CreditCard size={18} />}
                                                                    flex={{ base: '1', md: 'initial' }}
                                                                >
                                                                    Proceed to Checkout
                                                                </Button>
                                                            </Flex>
                                                        </Flex>
                                                    </Flex>
                                                </CardBody>
                                            </Card>
                                        );
                                    })
                                )}
                            </VStack>
                        </TabPanel>

                        <TabPanel>
                            <List px="3" py="3">
                                {
                                    cart?.rentals?.map((rental, idx) => 
                                        <ListItem my={5}>
                                            <Flex gap={4}>
                                                <Box w={'150px'} h={'75px'} rounded={'lg'}>
                                                    <Image lazy w={'100%'}  rounded={'lg'} src={rental?.vehicle?.images[0]?.url} />
                                                </Box>

                                                <Box flex={1}>
                                                    <Heading size="sm"  my={1}> {rental?.vehicle?.name} <Tag> {rental?.vehicle?.condition} </Tag> </Heading>
                                                    <Text my={1} className="bold"> ₦{commaInt(rental?.price)}/{rental?.cycle} </Text>
                                                    {/* <Text my={1}> {rental?.status} </Text> */}
                                                </Box>

                                                
                                                <Flex>
                                                    <Button bgColor="primary" px={4} colorScheme="red"> Remove </Button>
                                                    <NavLink to={`/checkout/pay?listingId=${rental?.uuid}`}>
                                                        <Button bgColor="primary" px={4} colorScheme="blue"> Pay Now </Button>
                                                    </NavLink>
                                                </Flex>
                                            </Flex>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </TabPanel>

                        <TabPanel>
                            <List px="3" py="3">
                                {
                                    cart?.bookings?.map((booking, idx) => 
                                        <ListItem my={5}>
                                            <Flex gap={4}>
                                                {/*<Box w={'150px'} h={'75px'} rounded={'lg'}>
                                                    <Image lazy w={'100%'}  rounded={'lg'} src={service?.service?.service?.mechanic[0]?.image} />
                                                </Box>*/}

                                                <Box flex={1}>
                                                    <Heading size="sm"  my={1}> {booking?.mechanic} </Heading>
                                                    <Text my={1}> ₦{commaInt(booking?.sub_total)} <Text as="small">(sub total)</Text></Text>
                                                    {
                                                        booking?.services?.map((service, idx) => 
                                                            <Tag key={service}> {service} </Tag>
                                                        )
                                                    }
                                                </Box>

                                                <Flex gap={2} flexWrap={'wrap'}>
                                                    <Button bgColor="danger" px={4} colorScheme="red"> Cancel Booking </Button>
                                                    {booking?.status === 'completed' && <Button bgColor="primary" px={4} colorScheme="blue"> Pay Mechanic </Button>}
                                                </Flex>
                                            </Flex>
                                        </ListItem>
                                    )
                                }
                            </List>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

            </Container>

            {/* Inspection Scheduling Modal */}
            {selectedOrder && (
                <ScheduleInspectionModal
                    isOpen={inspectionModalOpen}
                    onClose={closeInspectionModal}
                    listingId={selectedOrder?.order_item?.uuid}
                    listingType="buy"
                    vehicleInfo={{
                        name: selectedOrder?.order_item?.vehicle?.name,
                        condition: selectedOrder?.order_item?.vehicle?.condition,
                    }}
                    alreadyPaid={selectedOrder?.paid}
                    onSuccess={handleInspectionSuccess}
                />
            )}
        </Box>
    )
}

export default CartPage;

