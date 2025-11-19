import {useState, useEffect, useContext} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {GlobalStore} from '../../../../App';
import {objectifyJSON, jsonifyObject} from '../../../../utils';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Checkbox,
  Avatar,
  AvatarGroup,
  Progress,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tag,
  Tr,
  Th,
  Td,
  SimpleGrid,
  IconButton,
  Menu,
  MenuButton,
  Card, CardBody,
  MenuList,
  MenuItem,
  Badge,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  ButtonGroup,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaEye } from "react-icons/fa";
import {DealershipContext} from '../Layout';


function ListingsAdmin({children, ...props}) {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const {dealership, } = useContext(DealershipContext);
  const [loading, setLoadingState] = useState(true);
  const [listings, setListings] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [draftListings, setDraftListings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  async function init(){
    // get the dealership
    try{
      setLoadingState(true);
      const res = await axios.get(`/admin/dealership/listings/`);
      const data = objectifyJSON(res.data);

      if (res?.status === 200){
        const items = data.data;
        console.log("Listings:", items)
        setListings(items);
        setActiveListings(items.filter(item => item.approved === true));
        setDraftListings(items.filter(item => item.approved === false));
        setMatches(items);
        setPage(1);
      }

      setLoadingState(false);

    }catch(error){
      console.log("error getting dealership:", error)
      setLoadingState(false);
    }
  }

  useEffect(() => {
    init();

  }, [])

  function onSearch(e){
    const val = e.target.value.toLowerCase();
    setSearchValue(val);
    if (!val){
      setMatches([...listings]);
      return setPage(1);
    }
    const filtered = listings.filter(l =>
      (l?.title || '').toLowerCase().includes(val) ||
      (l?.vehicle?.name || '').toLowerCase().includes(val)
    );
    setMatches(filtered);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const paginated = matches.slice((page-1)*pageSize, page*pageSize);

  if (loading){
    return (
      <Box minH="100vh" position="relative">
        <Heading my={5} size="md"> Inventory </Heading>
        <SimpleGrid minChildWidth={'200px'} maxChildWidth={'350px'} columns={{ base: 1, md: 3}} spacing={4}>
          {[1,2,3].map(i => (
            <VStack key={i} rowGap={8} w="100%">
              <Card borderWidth="1px" w="100%" borderColor="gray.200" borderRadius="10px" boxShadow="sm">
                <CardBody>
                  <Skeleton height='14px' width='40%' mb={2} />
                  <Skeleton height='28px' width='60%' />
                </CardBody>
              </Card>
            </VStack>
          ))}
        </SimpleGrid>

        <Box my={4}>
          <Skeleton height='36px' width='100%' />
        </Box>

        <TableContainer borderWidth='1px' borderColor='gray.200' borderRadius='lg' bg='white' boxShadow='sm' p={4}>
          <Table>
            <Thead bg='gray.50'>
              <Tr>
                {[...Array(5)].map((_,i)=>(<Th key={i}><Skeleton height='16px' /></Th>))}
              </Tr>
            </Thead>
            <Tbody>
              {[...Array(6)].map((_,ri)=>(
                <Tr key={ri}>
                  {[...Array(5)].map((__,ci)=>(<Td key={ci}><Skeleton height='16px' /></Td>))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  return (
    <Box minH="100vh" position="relative">
      <Heading my={5} size="md"> Inventory </Heading>
      
      <SimpleGrid minChildWidth={'200px'} maxChildWidth={'350px'} columns={{ base: 1, md: 3}} spacing={4}>
        <VStack rowGap={8} w="100%">
          <Card borderWidth="1px" w="100%" borderColor="gray.200" borderRadius="10px" boxShadow="sm" bg="white">
            <CardBody>
              <Text color="gray.500" fontWeight="thin"> Total Listings </Text>
              <Heading> {listings?.length} </Heading>
            </CardBody>
          </Card>
        </VStack>

        <VStack rowGap={8} w="100%">
          <Card borderWidth="1px" w="100%" borderColor="gray.200" borderRadius="10px" boxShadow="sm" bg="white">
            <CardBody>
              <Text color="gray.500" fontWeight="thin"> Active Listings </Text>
              <Heading> {activeListings?.length} </Heading>
            </CardBody>
          </Card>
        </VStack>

        <VStack rowGap={8} w="100%">
          <Card borderWidth="1px" w="100%" borderColor="gray.200" borderRadius="10px" boxShadow="sm" bg="white">
            <CardBody>
              <Text color="gray.500" fontWeight="thin"> Drafts </Text>
              <Heading> {draftListings?.length} </Heading>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>

      {/* Controls */}
      <Flex mb={5} mt={3} align="center" justify="space-between" gap={3} flexWrap="wrap">
        <InputGroup maxW="380px">
          <InputLeftElement pointerEvents="none">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="#667085" strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="7" stroke="#667085" strokeWidth="2"/></svg>
          </InputLeftElement>
          <Input value={searchValue} onInput={onSearch} placeholder="Search listings" borderColor="gray.200" bg="white" />
        </InputGroup>
        <ButtonGroup>
          <Button isDisabled={!dealership?.verified_business} onClick={() => navigate('/inventory/add/')} variant="solid" colorScheme="blue">Add Listing</Button>
          <Button isDisabled={!dealership?.verified_business} onClick={() => navigate('/inventory/boost/')} variant="outline" colorScheme="orange">Boost Listing</Button>
          <Button variant="outline" colorScheme="black" onClick={init}>Refresh</Button>
        </ButtonGroup>
      </Flex>

      <Heading my={3} size="md"> Listings </Heading>
      <ListingTable listings={paginated} total={matches.length} page={page} totalPages={totalPages} onPrev={() => setPage(p => Math.max(1, p-1))} onNext={() => setPage(p => Math.min(totalPages, p+1))} />
    </Box>
  )
}



function ListingTable({ listings, total, page, totalPages, onPrev, onNext }) {
  const {axios, notify, commaInt} = useContext(GlobalStore);
  const [selected, setSelected] = useState([])
  
  function toggleSelectAll(e){
    const _selected = []

    if (selected.length === listings.length){
      return setSelected([..._selected])
    }

    for(let item of listings){
      _selected.push(item.uuid)
    }
    setSelected([..._selected])
  }

  function toggleSelect(uuid){
    const _selected = selected

    if(_selected.includes(uuid)){
      _selected.splice(_selected.indexOf(uuid), 1);
      return setSelected([..._selected]);
    }

    _selected.push(uuid);
    setSelected([..._selected]);

  }

  if (!listings || listings.length === 0){
    return (
      <Box p={8} textAlign='center' bg='white' borderWidth='1px' borderColor='gray.200' borderRadius='lg' boxShadow='sm'>
        <Text color='gray.600'>No listings found.</Text>
      </Box>
    )
  }

  return (
    <>
    <TableContainer my={5} w={'100%'} borderWidth='1px' borderColor='gray.200' borderRadius='lg' bg='white' boxShadow='sm'>
      <Table variant="simple" overflowX={'scroll'} className="hidden-scroll">
        <Thead bg='gray.50'>
          <Tr>
            <Th gap={2} alignItems="center"> # - <Checkbox isChecked={selected?.length === listings?.length} onChange={toggleSelectAll} /> </Th>
            <Th columns={3}> Listing</Th>
            <Th>Status</Th>
            <Th>Views</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {listings?.map((listing, index) => (
            <Tr key={index}>
              <Td placeItems="center" placeContent="center" alignItems="center"> {index+1} - <Checkbox onChange={e => toggleSelect(listing?.uuid)} isChecked={selected.includes(listing?.uuid)} /> </Td>
              <Td columns={3}>
                <Flex align="center" gap={2}>
                  <Image src={listing?.vehicle?.images[0]?.url} objectFit="cover" boxSize="70px" borderRadius="md" />
                  <Box>
                    <Text fontWeight="bold">{listing?.title}</Text>
                    <Text fontSize="sm">{commaInt(listing?.price)} {listing?.listing_type === 'rental' && `/${listing.payment_cycle}`}</Text>
                    <Text fontSize="xs" color="gray.500">{listing?.vehicle?.dealership?.location}</Text>
                  </Box>
                </Flex>
              </Td>
              <Td>
                <Tag size="lg" colorScheme={(listing?.approved && listing?.verified) ? "green" : !listing?.verified ? "purple" : "yellow"}>
                  {(listing?.approved && listing?.verified) ? 'Active' : !listing?.verified ? 'Draft' : 'Requires approval'}
                </Tag>
              </Td>
              <Td>{listing?.viewers?.length}</Td>
              <Td>
                <Flex gap={2}>
                  <Button size="sm" colorScheme="green">Boost</Button>
                  <IconButton as={Link} to={`edit/${listing?.uuid}`} aria-label="Edit" icon={<EditIcon />} size="sm" />
                  <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" colorScheme="red" />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
    <Flex justify='space-between' align='center' mt={3}>
      <Text color='gray.600' fontSize='sm'>Page {page} of {totalPages} • Total {total} items</Text>
      <ButtonGroup size='sm'>
        <Button variant='outline' isDisabled={page<=1} onClick={onPrev}>Previous</Button>
        <Button variant='outline' isDisabled={page>=totalPages} onClick={onNext}>Next</Button>
      </ButtonGroup>
    </Flex>
    </>
  );
}


export default ListingsAdmin;

