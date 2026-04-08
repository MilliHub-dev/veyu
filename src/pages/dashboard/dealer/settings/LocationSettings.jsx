import {
  Box, Button, FormControl, FormLabel, Input,
  VStack, Heading, HStack, Text, SimpleGrid,
  Alert, AlertIcon, Badge, Divider, Skeleton,
  IconButton, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Card, CardBody, Tooltip,
  AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from "@chakra-ui/react";
import { useState, useContext, useRef, useEffect, useCallback } from "react";
import { FaMapMarkerAlt, FaSearch, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Map, Marker, APIProvider, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { GlobalStore } from "../../../../contexts/GlobalStore";
import locationService from "../../../../services/locationService";

const GOOGLE_MAPS_API_KEY = "AIzaSyBcwRVb-mzVQuHVJyaOkgbGXtmFT-c_II0";

// Default center (Lagos, Nigeria)
const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

const INITIAL_LOCATION_STATE = {
  id: null,
  state: "",
  address: "",
  country: "",
  countryCode: "NG",
  city: "",
  zip_code: "",
  lat: null,
  lng: null,
  google_place_id: "",
  formatted_address: "",
};

// Places Autocomplete Component
const PlacesAutocomplete = ({ onPlaceSelect, inputValue, setInputValue }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const inputRef = useRef(null);

  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !window.google) return;

    if (!autocompleteService.current) {
      autocompleteService.current = new placesLib.AutocompleteService();
    }

    if (!placesService.current) {
      const dummyDiv = document.createElement('div');
      const dummyMap = new window.google.maps.Map(dummyDiv);
      placesService.current = new placesLib.PlacesService(dummyMap);
    }
  }, [placesLib]);

  const fetchPredictions = useCallback((input) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    autocompleteService.current.getPlacePredictions(
      { input, types: ['establishment', 'geocode'] },
      (results) => {
        setPredictions(results || []);
        setLoading(false);
        setShowDropdown(true);
      }
    );
  }, []);

  const handleSelect = (place) => {
    setInputValue(place.description);
    setPredictions([]);
    setShowDropdown(false);

    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: place.place_id,
        fields: ['geometry', 'address_components', 'formatted_address', 'name', 'place_id']
      },
      (details, status) => {
        if (status === "OK" && details?.geometry) {
          const lat = details.geometry.location.lat();
          const lng = details.geometry.location.lng();

          const components = details.address_components || [];
          const getComponent = (type) => {
            const comp = components.find(c => c.types.includes(type));
            return comp ? { long: comp.long_name, short: comp.short_name } : null;
          };

          const country = getComponent('country');
          const state = getComponent('administrative_area_level_1');
          const city = getComponent('administrative_area_level_2') || getComponent('locality');
          const postalCode = getComponent('postal_code');
          const streetNumber = getComponent('street_number');
          const route = getComponent('route');

          let streetAddress = '';
          if (streetNumber) streetAddress += streetNumber.long + ' ';
          if (route) streetAddress += route.long;
          if (!streetAddress) streetAddress = details.name || '';

          onPlaceSelect({
            google_place_id: place.place_id,
            country: country?.long || '',
            countryCode: country?.short || 'NG',
            state: state?.long || '',
            city: city?.long || '',
            address: streetAddress.trim(),
            formatted_address: details.formatted_address || place.description,
            zip_code: postalCode?.long || '',
            lat,
            lng,
          });
        }
      }
    );
  };

  return (
    <Box position="relative" w="100%">
      <HStack bg="white" borderWidth="2px" borderColor="primary" borderRadius="lg" px={4} py={2}>
        <FaSearch color="#F4A950" />
        <Input
          ref={inputRef}
          placeholder="Search for location..."
          value={inputValue}
          border="none"
          _focus={{ boxShadow: "none" }}
          onChange={(e) => {
            setInputValue(e.target.value);
            fetchPredictions(e.target.value);
          }}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
      </HStack>

      {loading && <Text fontSize="sm" color="gray.500" mt={2}>Searching...</Text>}

      {showDropdown && predictions.length > 0 && (
        <Box
          position="absolute"
          width="100%"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          zIndex={1000}
          mt={1}
          borderRadius="lg"
          boxShadow="lg"
          maxH="300px"
          overflowY="auto"
        >
          {predictions.map((place) => (
            <Box
              key={place.place_id}
              px={4}
              py={3}
              cursor="pointer"
              _hover={{ bg: "orange.50" }}
              onClick={() => handleSelect(place)}
              borderBottomWidth="1px"
              borderColor="gray.100"
            >
              <HStack>
                <FaMapMarkerAlt color="#F4A950" />
                <Text fontSize="sm">{place.description}</Text>
              </HStack>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Interactive Map Component
const InteractiveMap = ({ location, onLocationChange }) => {
  const map = useMap();
  const [marker, setMarker] = useState(location);

  useEffect(() => {
    if (location && location.lat && location.lng) {
      setMarker(location);
      if (map) {
        map.panTo(location);
        map.setZoom(16);
      }
    }
  }, [location, map]);

  const handleMapClick = useCallback((e) => {
    if (e.detail?.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      setMarker({ lat, lng });

      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const details = results[0];
            const components = details.address_components || [];
            const getComponent = (type) => {
              const comp = components.find(c => c.types.includes(type));
              return comp ? { long: comp.long_name, short: comp.short_name } : null;
            };

            const country = getComponent('country');
            const state = getComponent('administrative_area_level_1');
            const city = getComponent('administrative_area_level_2') || getComponent('locality');
            const postalCode = getComponent('postal_code');
            const streetNumber = getComponent('street_number');
            const route = getComponent('route');

            let streetAddress = '';
            if (streetNumber) streetAddress += streetNumber.long + ' ';
            if (route) streetAddress += route.long;

            onLocationChange({
              google_place_id: details.place_id || '',
              country: country?.long || '',
              countryCode: country?.short || 'NG',
              state: state?.long || '',
              city: city?.long || '',
              address: streetAddress.trim(),
              formatted_address: details.formatted_address,
              zip_code: postalCode?.long || '',
              lat,
              lng,
            });
          }
        });
      }
    }
  }, [onLocationChange]);

  return (
    <Map
      mapId="dealer-location-map"
      style={{ width: "100%", height: "100%" }}
      defaultCenter={location || DEFAULT_CENTER}
      defaultZoom={location?.lat ? 16 : 12}
      gestureHandling="greedy"
      onClick={handleMapClick}
    >
      {marker && marker.lat && marker.lng && <Marker position={marker} />}
    </Map>
  );
};

// Location Card Component
const LocationCard = ({ location, onEdit, onDelete, isPrimary }) => {
  // Parse lat/lng as floats (API returns strings)
  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);

  return (
    <Card
      variant="outline"
      borderColor={isPrimary ? "green.300" : "gray.200"}
      bg={isPrimary ? "green.50" : "white"}
    >
      <CardBody>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <HStack>
              <FaMapMarkerAlt color="#F4A950" />
              <Text fontWeight="600" fontSize="md">
                {location.address || location.full_address || location.formatted_address || "Location"}
              </Text>
              {isPrimary && (
                <Badge colorScheme="green" fontSize="xs">Primary</Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {[location.city, location.state, location.country].filter(Boolean).join(", ")}
            </Text>
            {location.zip_code && (
              <Text fontSize="xs" color="gray.500">Postal: {location.zip_code}</Text>
            )}
            <HStack mt={1} spacing={2}>
              <Badge colorScheme="blue" fontSize="xs">
                {!isNaN(lat) ? lat.toFixed(4) : '--'}, {!isNaN(lng) ? lng.toFixed(4) : '--'}
              </Badge>
            </HStack>
          </VStack>
          <HStack spacing={1}>
            <Tooltip label="Edit location">
              <IconButton
                icon={<FaEdit />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={() => onEdit(location)}
                aria-label="Edit location"
              />
            </Tooltip>
            <Tooltip label="Delete location">
              <IconButton
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(location)}
                aria-label="Delete location"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

// Location Form Modal
const LocationFormModal = ({ isOpen, onClose, location, onSave, isLoading }) => {
  const [formData, setFormData] = useState(INITIAL_LOCATION_STATE);
  const [searchValue, setSearchValue] = useState("");
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (location) {
        // Parse lat/lng as floats (API returns strings)
        const lat = location.lat ? parseFloat(location.lat) : null;
        const lng = location.lng ? parseFloat(location.lng) : null;
        // Use full_address from API or fallback to address
        const displayAddress = location.full_address || location.formatted_address || location.address || '';

        setFormData({
          id: location.id || null,
          state: location.state || '',
          address: location.address || location.street_address || '',
          country: location.country_name || location.country || '',
          countryCode: location.country || 'NG',
          city: location.city || '',
          zip_code: location.zip_code || location.postal_code || '',
          lat: lat,
          lng: lng,
          google_place_id: location.google_place_id || '',
          formatted_address: displayAddress,
        });
        setSearchValue(displayAddress);
        setHasSelected(lat !== null && lng !== null);
      } else {
        setFormData(INITIAL_LOCATION_STATE);
        setSearchValue("");
        setHasSelected(false);
      }
    }
  }, [isOpen, location]);

  const handlePlaceSelect = (placeData) => {
    setFormData(prev => ({ ...placeData, id: prev.id }));
    setSearchValue(placeData.formatted_address || "");
    setHasSelected(true);
  };

  const handleMapLocationChange = (placeData) => {
    setFormData(prev => ({ ...placeData, id: prev.id }));
    setSearchValue(placeData.formatted_address || "");
    setHasSelected(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const mapCenter = formData.lat && formData.lng
    ? { lat: formData.lat, lng: formData.lng }
    : DEFAULT_CENTER;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>
          {location ? "Edit Location" : "Add New Location"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Search */}
            <Box>
              <FormLabel fontWeight="600">Search Location</FormLabel>
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                inputValue={searchValue}
                setInputValue={setSearchValue}
              />
            </Box>

            {/* Map */}
            <Box>
              <FormLabel fontWeight="600">
                Select on Map
                <Text as="span" fontWeight="normal" color="gray.500" ml={2} fontSize="sm">
                  (Click to set location)
                </Text>
              </FormLabel>
              <Box
                h="300px"
                borderRadius="lg"
                overflow="hidden"
                borderWidth="2px"
                borderColor={hasSelected ? "green.400" : "gray.200"}
              >
                <InteractiveMap
                  location={mapCenter}
                  onLocationChange={handleMapLocationChange}
                />
              </Box>
            </Box>

            {/* Selected Info */}
            {hasSelected && formData.lat && (
              <Alert status="success" borderRadius="md" size="sm">
                <AlertIcon />
                <Box>
                  <Text fontSize="sm" fontWeight="600">
                    {formData.formatted_address || formData.address}
                  </Text>
                  <HStack spacing={2} mt={1}>
                    <Badge colorScheme="blue" fontSize="xs">
                      {formData.lat?.toFixed(6)}, {formData.lng?.toFixed(6)}
                    </Badge>
                  </HStack>
                </Box>
              </Alert>
            )}

            <Divider />

            {/* Editable Fields */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Street Address</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">City</FormLabel>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">State/Province</FormLabel>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Country</FormLabel>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Postal/ZIP Code</FormLabel>
                <Input
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                  size="sm"
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!hasSelected || !formData.lat}
          >
            {location ? "Update Location" : "Add Location"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Main Location Settings Component
const LocationSettings = () => {
  const { notify } = useContext(GlobalStore);
  const [locations, setLocations] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

  // Fetch all locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsFetching(true);
    try {
      const data = await locationService.getLocations();
      console.log('Fetched locations:', data);
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      notify({
        title: "Error",
        body: "Failed to load locations",
        color: "red",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    onFormOpen();
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    onFormOpen();
  };

  const handleDeleteClick = (location) => {
    setDeletingLocation(location);
    onDeleteOpen();
  };

  const handleSave = async (formData) => {
    setIsLoading(true);
    try {
      // Round lat/lng to 6 decimal places to stay within API's 10 digit limit
      const roundCoord = (val) => val ? Math.round(val * 1000000) / 1000000 : null;

      const locationData = {
        state: formData.state || '',
        address: formData.address || formData.formatted_address,
        country: formData.countryCode || 'NG',
        city: formData.city || '',
        zip_code: formData.zip_code || '',
        lat: roundCoord(formData.lat),
        lng: roundCoord(formData.lng),
        google_place_id: formData.google_place_id || '',
      };

      console.log('Saving location data:', locationData);

      if (formData.id) {
        // Update existing
        await locationService.updateLocation(formData.id, locationData);
        notify({
          title: "Success",
          body: "Location updated successfully",
          color: "green",
        });
      } else {
        // Create new
        await locationService.createLocation(locationData);
        notify({
          title: "Success",
          body: "Location added successfully",
          color: "green",
        });
      }

      onFormClose();
      await fetchLocations();
    } catch (error) {
      console.error("Failed to save location:", error);
      notify({
        title: "Error",
        body: error.message || "Failed to save location",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLocation?.id) return;

    setIsLoading(true);
    try {
      await locationService.deleteLocation(deletingLocation.id);
      notify({
        title: "Success",
        body: "Location deleted successfully",
        color: "green",
      });
      onDeleteClose();
      setDeletingLocation(null);
      await fetchLocations();
    } catch (error) {
      console.error("Failed to delete location:", error);
      notify({
        title: "Error",
        body: error.message || "Failed to delete location",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading skeleton
  if (isFetching) {
    return (
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <Skeleton w="24px" h="24px" borderRadius="full" />
            <Skeleton h="24px" w="200px" />
          </HStack>
          <Skeleton h="40px" w="150px" borderRadius="md" />
        </HStack>
        <Skeleton h="20px" w="80%" />
        <VStack spacing={3}>
          <Skeleton h="100px" w="100%" borderRadius="lg" />
          <Skeleton h="100px" w="100%" borderRadius="lg" />
        </VStack>
      </VStack>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap" gap={2}>
          <HStack>
            <FaMapMarkerAlt color="#F4A950" size={24} />
            <Heading size="md">Dealership Locations</Heading>
            <Badge colorScheme="blue" fontSize="sm">{locations.length}</Badge>
          </HStack>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="orange"
            onClick={handleAddNew}
          >
            Add Location
          </Button>
        </HStack>

        <Text color="gray.600">
          Manage your dealership locations. Customers will be able to see these locations on your profile.
        </Text>

        {/* Locations List */}
        {locations.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="gray.300"
            borderRadius="xl"
            bg="gray.50"
          >
            <VStack spacing={3}>
              <FaMapMarkerAlt size={40} color="#CBD5E0" />
              <Text color="gray.500" fontWeight="500">No locations added yet</Text>
              <Text color="gray.400" fontSize="sm">
                Add your dealership locations so customers can find you
              </Text>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="orange"
                variant="outline"
                onClick={handleAddNew}
                mt={2}
              >
                Add Your First Location
              </Button>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {locations.map((location, index) => (
              <LocationCard
                key={location.id || index}
                location={location}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                isPrimary={index === 0}
              />
            ))}
          </VStack>
        )}

        {/* Add/Edit Modal */}
        <LocationFormModal
          isOpen={isFormOpen}
          onClose={onFormClose}
          location={editingLocation}
          onSave={handleSave}
          isLoading={isLoading}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Location
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this location?
                <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                  <Text fontWeight="500">
                    {deletingLocation?.address || deletingLocation?.formatted_address}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {[deletingLocation?.city, deletingLocation?.state].filter(Boolean).join(", ")}
                  </Text>
                </Box>
                <Text mt={3} fontSize="sm" color="red.500">
                  This action cannot be undone.
                </Text>
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  ml={3}
                  isLoading={isLoading}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </VStack>
    </APIProvider>
  );
};

export default LocationSettings;
