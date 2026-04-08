import {GlobalStore} from '../../../../contexts/GlobalStore'
import {objectifyJSON, jsonifyObject} from '../../../../utils'
import {StatusBadge} from '../../../../components'
import { useState, useEffect, useContext } from "react"
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  TableContainer,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  Avatar,
  Skeleton,
  ButtonGroup,
} from "@chakra-ui/react"
import {
  MdSearch,
  MdHome,
  MdBarChart,
  MdPeople,
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


const OrderListAdmin = () => {
  const [orderList, setOrderList] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const {axios} = useContext(GlobalStore);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function getData(){
    setLoading(true);
    const res = await axios.get('/admin/dealership/orders/');
    const data = objectifyJSON(res.data)
    if (res.status === 200){
      setOrderList(data.data);
      setMatches(data.data);
      setPage(1);
    }
    setLoading(false);
  }

  function exportOrdersCsv(){
    const rows = [
      ['Car', 'Order Type', 'Price', 'Status', 'Client', 'Last Updated'],
      ...matches.map(o => [
        o?.order_item?.vehicle?.name,
        o?.order_type,
        o?.order_item?.price,
        o?.order_status,
        o?.customer,
        o?.last_updated,
      ])
    ];
    const csv = rows.map(r => r.map(v => (v === undefined || v === null) ? '' : String(v).replace(/"/g,'""')).map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleSearch(e){
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim() !== ''){
      const found = orderList.filter(elem => elem.order_item.vehicle.name.toLowerCase().includes(value));
      setMatches([...found])
    }else{
      setMatches([...orderList])
    }
  }

  function filterMatches(filter){
    setActiveFilter(filter);

    if(filter === 'All'){
      setMatches([ ...orderList ])
      return setPage(1)
    }
    const filteredMatches = orderList.filter(item => item.order_status.toLowerCase() === filter.toLowerCase())
    setMatches([...filteredMatches]);
    setPage(1);
  }

  useEffect(() => {
    getData();
  }, [])

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const paginated = matches.slice((page-1)*pageSize, page*pageSize);

  if (loading){
    return (
      <Box flex={1} p={6} bg="white" color="black">
        <Box py={5} borderBottom={'1px solid #e2e8f0'}> <Skeleton height='24px' width='160px' /></Box>
        <Flex justify="space-between" my={4}>
          <Skeleton height='36px' width='160px' />
          <Skeleton height='36px' width='200px' />
        </Flex>
        <TableContainer borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden" minH={400} bg="white">
          <Table>
            <Thead bg="gray.50">
              <Tr>
                {[...Array(6)].map((_, i) => <Th key={i}><Skeleton height='16px' /></Th>)}
              </Tr>
            </Thead>
            <Tbody>
              {[...Array(6)].map((_, r) => (
                <Tr key={r}>
                  {[...Array(6)].map((__, c) => <Td key={c}><Skeleton height='16px' /></Td>)}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  return (
    <Box flex={1} p={6} bg="white" color="black">
      <Box py={5} borderBottom={'1px solid #e2e8f0'}>
        <Heading size="lg"> Orders </Heading>
      </Box>

      {/* Controls */}
      <Flex justify="space-between" mt={4} mb={3} align="center">
        <HStack spacing={2}>
          <ButtonGroup size='sm' isAttached>
            <Button variant={activeFilter === "All" ? "solid" : "outline"} onClick={() => filterMatches("All")} colorScheme={activeFilter === "All" ? 'blue' : undefined}>All</Button>
            <Button variant={activeFilter === "Pending" ? "solid" : "outline"} onClick={() => filterMatches("Pending")} colorScheme={activeFilter === "Pending" ? 'blue' : undefined}>Pending</Button>
            <Button variant={activeFilter === "awaiting-inspection" ? "solid" : "outline"} onClick={() => filterMatches("awaiting-inspection")} colorScheme={activeFilter === "awaiting-inspection" ? 'blue' : undefined}>Inspection</Button>
            <Button variant={activeFilter === "completed" ? "solid" : "outline"} onClick={() => filterMatches("completed")} colorScheme={activeFilter === "completed" ? 'blue' : undefined}>Sold</Button>
          </ButtonGroup>
        </HStack>
        <ButtonGroup size='sm'>
          <Button variant='outline' onClick={exportOrdersCsv}>Export CSV</Button>
          <Button colorScheme='blue' onClick={getData}>Refresh</Button>
        </ButtonGroup>
      </Flex>

      {/* Status summary */}
      <HStack spacing={4} mb={4}>
        <Badge colorScheme='gray' px={3} py={1} borderRadius='full'>All: {orderList.length}</Badge>
        <Badge colorScheme='blue' px={3} py={1} borderRadius='full'>Pending: {orderList.filter(o => o.order_status?.toLowerCase()==='pending').length}</Badge>
        <Badge colorScheme='yellow' px={3} py={1} borderRadius='full'>Inspection: {orderList.filter(o => o.order_status?.toLowerCase()==='awaiting-inspection').length}</Badge>
        <Badge colorScheme='green' px={3} py={1} borderRadius='full'>Sold: {orderList.filter(o => o.order_status?.toLowerCase()==='completed').length}</Badge>
      </HStack>

      {/* Filter Tabs */}
      <Flex justify="space-between" mb={6}>
        <HStack spacing={2}>
          <Button
            size="md"
            variant={activeFilter === "All" ? "solid" : "outline"}
            bg={activeFilter === "All" ? "blue.50" : "white"}
            color={activeFilter === "All" ? "blue.500" : "gray.700"}
            borderColor="gray.200"
            onClick={() => filterMatches("All")}
          >
            All
          </Button>
          <Button
            size="md"
            variant={activeFilter === "Pending" ? "solid" : "outline"}
            bg={activeFilter === "Pending" ? "blue.50" : "white"}
            color={activeFilter === "Pending" ? "blue.500" : "gray.700"}
            borderColor="gray.200"
            onClick={() => filterMatches("Pending")}
          >
            Pending
          </Button>
          <Button
            size="md"
            variant={activeFilter === "awaiting-inspection" ? "solid" : "outline"}
            bg={activeFilter === "awaiting-inspection" ? "blue.50" : "white"}
            color={activeFilter === "awaiting-inspection" ? "blue.500" : "gray.700"}
            borderColor="gray.200"
            onClick={() => filterMatches("awaiting-inspection")}
          >
            Locked (Inspection)
          </Button>
          <Button
            size="md"
            variant={activeFilter === "completed" ? "solid" : "outline"}
            bg={activeFilter === "completed" ? "blue.50" : "white"}
            color={activeFilter === "completed" ? "blue.500" : "gray.700"}
            borderColor="gray.200"
            onClick={() => filterMatches("completed")}
          >
            Sold
          </Button>
        </HStack>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <MdSearch size={18} color="#667085" />
          </InputLeftElement>
          <Input onInput={handleSearch} value={searchValue} placeholder="Search" borderColor="gray.200" />
        </InputGroup>
      </Flex>

      {/* Transactions Table */}
      <TableContainer borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="auto" pb={4} minH={400} bg="white">
        {(!paginated || paginated.length === 0) ? (
          <Box p={8} textAlign='center'>
            <Text color='gray.600'>No orders to display.</Text>
          </Box>
        ) : (
        <Table variant="simple" color="black">
          <Thead bg="gray.50">
            <Tr columns={9}>
              <Th columns={3}> Listings</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Client</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginated?.map((order) => (
              <Tr key={order?.uuid}>
                <Td columnSpan={4}>
                  <Flex align="center">
                    <Image
                      src={order?.order_item?.vehicle?.images[0]?.url}
                      alt={order?.order_item?.vehicle.name}
                      w="80px"
                      h="50px"
                      objectFit="cover"
                      borderRadius="md"
                      mr={3}
                    />
                    <Box>
                      <Text fontWeight="medium" textOverflow="ellipsis">{order?.order_item.vehicle.name}</Text>
                      <Text color="gray.700" fontWeight="medium">
                        {order?.order_type}
                      </Text>
                      <Flex align="center" color="gray.500" fontSize="xs">
                        <MdLocationOn size={12} style={{ marginRight: "4px" }} />
                        {order?.order_item?.vehicle?.dealer?.location}
                      </Flex>
                    </Box>
                  </Flex>
                </Td>
                <Td>
                  <Text color="green.500" fontWeight="medium">
                    {parseInt(order?.order_item?.price).toLocaleString()}
                  </Text>
                </Td>
                <Td>
                  <Text>{new Date(order?.last_updated).toLocaleDateString()}</Text>
                  <Text color="gray.500" fontSize="sm">
                    {new Date(order?.last_updated).toLocaleTimeString()}
                  </Text>
                </Td>
                <Td>
                  <StatusBadge status={order?.order_status} />
                </Td>
                <Td>
                  <Avatar size="sm" name={order?.customer} />
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<MdMoreVert size={16} />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList bg="white" color="black" borderColor="gray.200">
                      <MenuItem color="black">View details</MenuItem>
                      <MenuItem color="black">Contact client</MenuItem>
                      <MenuItem color="black">Download invoice</MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        )}
      </TableContainer>

      {/* Pagination */}
      <Flex justify='space-between' align='center' mt={3}>
        <Text color='gray.600' fontSize='sm'>Page {page} of {totalPages}</Text>
        <ButtonGroup size='sm'>
          <Button variant='outline' isDisabled={page<=1} onClick={()=> setPage(p => Math.max(1, p-1))}>Previous</Button>
          <Button variant='outline' isDisabled={page>=totalPages} onClick={()=> setPage(p => Math.min(totalPages, p+1))}>Next</Button>
        </ButtonGroup>
      </Flex>
    </Box>
  )
}

export default OrderListAdmin

