import {
  Box, Button, FormControl, FormLabel, Input, Select,
  VStack, Heading, HStack, Text, FormErrorMessage,
  NumberInput, NumberInputField, SimpleGrid,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { GlobalStore } from "../../../../App";
import locationService from "../../../../services/locationService";

const INITIAL_LOCATION_STATE = {
  state: "",
  address: "",
  country: "NG",
  city: "",
  zip_code: "",
  lat: "",
  lng: "",
  google_place_id: "",
};

const COUNTRY_OPTIONS = [
  { value: "NG", label: "Nigeria (NG)" },
  { value: "GH", label: "Ghana (GH)" },
  { value: "KE", label: "Kenya (KE)" },
  { value: "ZA", label: "South Africa (ZA)" },
  { value: "US", label: "United States (US)" },
  { value: "GB", label: "United Kingdom (GB)" },
];

const LocationSettings = () => {
  const { notify } = useContext(GlobalStore);
  const [location, setLocation] = useState(INITIAL_LOCATION_STATE);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCoordinateChange = (name, value) => {
    setLocation(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!location.state || location.state.trim().length < 2) {
      newErrors.state = "State is required (minimum 2 characters)";
    }

    if (!location.address || location.address.trim().length < 5) {
      newErrors.address = "Address is required (minimum 5 characters)";
    }

    if (location.lat !== "" && location.lat !== null) {
      const lat = parseFloat(location.lat);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.lat = "Latitude must be between -90 and 90";
      }
    }

    if (location.lng !== "" && location.lng !== null) {
      const lng = parseFloat(location.lng);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.lng = "Longitude must be between -180 and 180";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      notify({
        title: "Validation Error",
        body: "Please fix the errors in the form",
        color: "red",
      });
      return;
    }

    setIsLoading(true);
    try {
      const locationData = {
        state: location.state.trim(),
        address: location.address.trim(),
        country: location.country || "NG",
        city: location.city?.trim() || "",
        zip_code: location.zip_code?.trim() || "",
        lat: location.lat !== "" ? parseFloat(location.lat) : null,
        lng: location.lng !== "" ? parseFloat(location.lng) : null,
        google_place_id: location.google_place_id?.trim() || "",
      };

      await locationService.createLocation(locationData);

      notify({
        title: "Success",
        body: "Location created successfully",
        color: "green",
      });

      setLocation(INITIAL_LOCATION_STATE);
    } catch (error) {
      console.error("Failed to create location:", error);
      notify({
        title: "Error",
        body: error.message || "Failed to create location",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLocation(INITIAL_LOCATION_STATE);
    setErrors({});
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack>
        <FaMapMarkerAlt />
        <Heading size="md">Add New Location</Heading>
      </HStack>
      <Text color="gray.600">
        Create a new location for your dealership. This helps customers find you.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired isInvalid={!!errors.state}>
          <FormLabel>State/Province</FormLabel>
          <Input
            name="state"
            value={location.state}
            onChange={handleChange}
            placeholder="e.g., Lagos"
          />
          <FormErrorMessage>{errors.state}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.address}>
          <FormLabel>Street Address</FormLabel>
          <Input
            name="address"
            value={location.address}
            onChange={handleChange}
            placeholder="e.g., 123 Main Street"
          />
          <FormErrorMessage>{errors.address}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Country</FormLabel>
          <Select
            name="country"
            value={location.country}
            onChange={handleChange}
          >
            {COUNTRY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>City</FormLabel>
          <Input
            name="city"
            value={location.city}
            onChange={handleChange}
            placeholder="e.g., Ikeja"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Postal/ZIP Code</FormLabel>
          <Input
            name="zip_code"
            value={location.zip_code}
            onChange={handleChange}
            placeholder="e.g., 100001"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Google Place ID</FormLabel>
          <Input
            name="google_place_id"
            value={location.google_place_id}
            onChange={handleChange}
            placeholder="Optional"
          />
        </FormControl>

        <FormControl isInvalid={!!errors.lat}>
          <FormLabel>Latitude</FormLabel>
          <NumberInput
            min={-90}
            max={90}
            precision={6}
            value={location.lat}
            onChange={(value) => handleCoordinateChange("lat", value)}
          >
            <NumberInputField placeholder="e.g., 6.5244" />
          </NumberInput>
          <FormErrorMessage>{errors.lat}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lng}>
          <FormLabel>Longitude</FormLabel>
          <NumberInput
            min={-180}
            max={180}
            precision={6}
            value={location.lng}
            onChange={(value) => handleCoordinateChange("lng", value)}
          >
            <NumberInputField placeholder="e.g., 3.3792" />
          </NumberInput>
          <FormErrorMessage>{errors.lng}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      <HStack spacing={3}>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="Creating..."
        >
          Create Location
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </HStack>
    </VStack>
  );
};

export default LocationSettings;
