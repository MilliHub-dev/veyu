import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Skeleton,
  useColorModeValue,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../services/api';
import { objectifyJSON, formatCurrency } from '../../../utils';
import { Link } from 'react-router-dom';

export default function ListingCard({ url }) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        // Extract UUID and Type
        // Matches: /buy/uuid or /rent/uuid
        // We also handle full URLs by checking for the last segment being a UUID-like string after buy/rent
        // Regex: (?:buy|rent)\/([a-zA-Z0-9-]+)
        const match = url.match(/(?:buy|rent)\/([a-zA-Z0-9-]+)/);
        
        if (!match) {
          setError(true);
          setLoading(false);
          return;
        }

        const fullMatch = match[0]; // e.g. buy/1234...
        const type = fullMatch.startsWith('buy') ? 'buy' : 'rent';
        const uuid = match[1];

        let endpoint = '';
        if (type === 'buy') {
          // Try generic listing endpoint first
          endpoint = `/listings/${uuid}/`;
        } else {
          endpoint = `/listings/rentals/${uuid}/`;
        }

        let res;
        try {
            res = await apiClient.get(endpoint);
        } catch(e) {
            // Fallback for buy if generic fails
             if (type === 'buy') {
                 try {
                    res = await apiClient.get(`/listings/buy/${uuid}/`);
                 } catch(e2) {
                    console.log("Secondary fetch failed", e2);
                 }
             }
        }

        if (res && res.status === 200) {
          const data = objectifyJSON(res.data);
          const item = data.data?.listing || data.listing || data.data || data;
          setListing(item);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch listing card", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (url) {
        fetchListing();
    }
  }, [url]);

  if (error) {
    return (
        <Text 
          as="a" 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          color="blue.300" 
          textDecoration="underline"
          _hover={{ color: 'blue.400' }}
        >
            {url}
        </Text>
    );
  }

  if (loading) {
    return (
      <Box w={{ base: "220px", md: "300px" }} maxW="100%" p={2} borderRadius="lg" bg={cardBg} borderWidth={1} borderColor={borderColor} my={2}>
        <HStack spacing={3}>
          <Skeleton w="80px" h="60px" borderRadius="md" />
          <VStack align="start" flex={1} spacing={2}>
            <Skeleton h="14px" w="80%" />
            <Skeleton h="12px" w="50%" />
          </VStack>
        </HStack>
      </Box>
    );
  }

  if (!listing) return null;

  // Normalization logic
  const vehicle = listing.vehicle || listing;
  const images = vehicle.images || vehicle.photos || [];
  
  // Handle image object/string variations
  let imageUrl = '';
  if (images.length > 0) {
      const firstImg = images[0];
      if (typeof firstImg === 'string') imageUrl = firstImg;
      else if (firstImg.url) imageUrl = firstImg.url;
      else if (firstImg.file) imageUrl = firstImg.file;
  }

  const title = listing.title || vehicle.name || vehicle.title || 'Vehicle';
  const price = listing.price || listing.asking_price || listing.sale_price || 0;
  const year = vehicle.year || '';
  const make = vehicle.make || '';
  const model = vehicle.model || '';
  
  // Construct a display title
  const displayTitle = year && make && model ? `${year} ${make} ${model}` : title;

  return (
    <LinkBox 
      as="article" 
      maxW="100%" 
      w={{ base: "220px", md: "300px" }} 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      bg={cardBg}
      borderColor={borderColor}
      _hover={{ shadow: 'md', borderColor: 'blue.400' }}
      transition="all 0.2s"
      my={2}
    >
      <HStack spacing={0} align="stretch" h="90px">
        <Image 
            src={imageUrl || "/placeholder.svg"} 
            alt={displayTitle} 
            w="110px" 
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/110x90?text=No+Image"
        />
        <VStack p={2} align="start" justify="center" spacing={1} flex={1} overflow="hidden">
           <LinkOverlay as={Link} to={url} target="_blank">
              <Text fontWeight="bold" fontSize="sm" noOfLines={2} title={displayTitle} lineHeight="1.2">
                {displayTitle}
              </Text>
           </LinkOverlay>
           <Text fontWeight="bold" color="blue.500" fontSize="sm">
             {formatCurrency(price)}
           </Text>
        </VStack>
      </HStack>
    </LinkBox>
  );
}
