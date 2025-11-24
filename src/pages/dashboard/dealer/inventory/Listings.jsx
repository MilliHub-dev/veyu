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
  useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaEye } from "react-icons/fa";
import {DealershipContext} from '../Layout';
import BoostModal from '../../../../components/boost/BoostModal';
import BoostBadge from '../../../../components/boost/BoostBadge';
import BoostPayment from '../../../../components/boost/BoostPayment';
import boostService from '../../../../services/boostService';


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
  const { isOpen: isBoostModalOpen, onOpen: onBoostModalOpen, onClose: onBoostModalClose } = useDisclosure();
  const { isOpen: isPaymentModalOpen, onOpen: onPaymentModalOpen, onClose: onPaymentModalClose } = useDisclosure();
  const [selectedListing, setSelectedListing] = useState(null);
  const [boostStatuses, setBoostStatuses] = useState({});
  const [pendingBoostData, setPendingBoostData] = useState(null);

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
        
        // Load boost statuses for all listings
        loadBoostStatuses(items);
      }

      setLoadingState(false);

    }catch(error){
      console.log("error getting dealership:", error)
      setLoadingState(false);
    }
  }

  async function loadBoostStatuses(listingsArray) {
    const statuses = {};
    for (const listing of listingsArray) {
      try {
        const response = await boostService.getBoostStatus(listing.uuid);
        if (response?.data) {
          statuses[listing.uuid] = response.data;
        }
      } catch (error) {
        // Listing doesn't have a boost, that's okay
        statuses[listing.uuid] = null;
      }
    }
    setBoostStatuses(statuses);
  }

  function handleBoostClick(listing) {
    setSelectedListing(listing);
    onBoostModalOpen();
  }

  async function handleBoostSuccess(boostData) {
    // Store boost data and open payment modal
    setPendingBoostData(boostData);
    onPaymentModalOpen();
  }

  async function handlePaymentSuccess() {
    notify({
      title: 'Boost Activated',
      body: 'Your listing is now boosted!',
      color: 'green',
      duration: 3000,
    });
    
    // Refresh listings to show updated boost status
    init();
    setPendingBoostData(null);
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
      <ListingTable 
        listings={paginated} 
        total={matches.length} 
        page={page} 
        totalPages={totalPages} 
        onPrev={() => setPage(p => Math.max(1, p-1))} 
        onNext={() => setPage(p => Math.min(totalPages, p+1))}
        onBoostClick={handleBoostClick}
        boostStatuses={boostStatuses}
      />
      
      {selectedListing && (
        <BoostModal
          isOpen={isBoostModalOpen}
          onClose={onBoostModalClose}
          listing={selectedListing}
          onSuccess={handleBoostSuccess}
        />
      )}

      {pendingBoostData && (
        <BoostPayment
          isOpen={isPaymentModalOpen}
          onClose={onPaymentModalClose}
          boostData={pendingBoostData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  )
}



function ListingTable({ listings, total, page, totalPages, onPrev, onNext, onBoostClick, boostStatuses }) {
  const {axios, notify, commaInt} = useContext(GlobalStore);
  const [selected, setSelected] = useState([])
  const navigate = useNavigate();
  
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

  async function handleDelete(uuid, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Use the DELETE endpoint as per API docs
      const res = await axios.delete(`/admin/dealership/listings/${uuid}/`);
      
      if (res.status === 200 || res.status === 204) {
        notify({
          title: "Listing deleted",
          body: "The listing has been successfully deleted.",
          color: "green",
          duration: 3000,
        });
        
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      console.error('Delete listing failed:', error);
      const errorData = error?.response?.data;
      notify({
        title: "Unable to delete listing",
        body: errorData?.message || error?.message || "An error occurred while deleting the listing.",
        color: "red",
        duration: 5000,
      });
    }
  }

  function handleBoost(uuid) {
    navigate(`/inventory/boost/?listing=${uuid}`);
  }

  async function handlePublishToggle(uuid, currentlyVerified, title) {
    const action = currentlyVerified ? 'unpublish' : 'publish';
    const actionText = currentlyVerified ? 'unpublish' : 'publish';
    
    if (!window.confirm(`Are you sure you want to ${actionText} "${title}"?`)) {
      return;
    }

    try {
      const payload = new FormData();
      payload.append('action', action);
      payload.append('listing', uuid);

      const res = await axios.post('/admin/dealership/listings/', payload);
      
      if (res.status === 200) {
        notify({
          title: `Listing ${actionText}ed`,
          body: `The listing has been successfully ${actionText}ed.`,
          color: "green",
          duration: 3000,
        });
        
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      console.error(`${actionText} listing failed:`, error);
      const errorData = error?.response?.data;
      notify({
        title: `Unable to ${actionText} listing`,
        body: errorData?.message || error?.message || `An error occurred while ${actionText}ing the listing.`,
        color: "red",
        duration: 5000,
      });
    }
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
                    <HStack>
                      <Text fontWeight="bold">{listing?.title}</Text>
                      {boostStatuses[listing?.uuid] && (
                        <BoostBadge boost={boostStatuses[listing?.uuid]} showDetails />
                      )}
                    </HStack>
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
                <Flex gap={2} flexWrap="wrap">
                  <Button 
                    size="sm" 
                    colorScheme={listing?.verified ? "orange" : "blue"} 
                    onClick={() => handlePublishToggle(listing?.uuid, listing?.verified, listing?.title)}
                  >
                    {listing?.verified ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme={boostStatuses[listing?.uuid]?.active ? "orange" : "green"}
                    onClick={() => onBoostClick(listing)}
                  >
                    {boostStatuses[listing?.uuid]?.active ? 'Boosted' : 'Boost'}
                  </Button>
                  <IconButton as={Link} to={`/inventory/edit/${listing?.uuid}`} aria-label="Edit" icon={<EditIcon />} size="sm" />
                  <IconButton 
                    aria-label="Delete" 
                    icon={<DeleteIcon />} 
                    size="sm" 
                    colorScheme="red" 
                    onClick={() => handleDelete(listing?.uuid, listing?.title)}
                  />
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

