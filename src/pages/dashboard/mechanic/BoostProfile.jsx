"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Heading,
  Icon,
  Image,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Container,
  Avatar,
  HStack,
  Badge,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react"
import { ChevronDown, Info, Minus, Zap, TrendingUp, Eye, Search, Star } from "lucide-react"

const BoostProfile = () => {
  const [selectedBoosts, setSelectedBoosts] = useState({
    visibility: true,
    homepage: true,
    search: false,
  })

  const [durations, setDurations] = useState({
    visibility: "2 days",
    homepage: "10 days",
    search: "0 days",
  })

  const handleBoostToggle = (boostType) => {
    setSelectedBoosts({
      ...selectedBoosts,
      [boostType]: !selectedBoosts[boostType],
    })
  }

  const handleDurationChange = (boostType, value) => {
    setDurations({
      ...durations,
      [boostType]: value,
    })
  }

  const totalAmount = 56765.0

  return (
    <Container maxW="6xl" py={8}>
      {/* Modern Header */}
      <Box mb={8}>
        <Heading as="h1" size="xl" color="gray.900" mb={2}>
          Boost Your Profile
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Increase your visibility and attract more customers with targeted promotions
        </Text>
      </Box>

      {/* Boost Benefits Overview */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card shadow="sm" textAlign="center">
          <CardBody p={6}>
            <Box p={3} bg="blue.50" borderRadius="full" w="fit-content" mx="auto" mb={4}>
              <Eye size={24} color="var(--chakra-colors-blue-500)" />
            </Box>
            <Heading size="sm" mb={2}>Increased Visibility</Heading>
            <Text fontSize="sm" color="gray.600">
              Get featured in prime locations across the platform
            </Text>
          </CardBody>
        </Card>

        <Card shadow="sm" textAlign="center">
          <CardBody p={6}>
            <Box p={3} bg="green.50" borderRadius="full" w="fit-content" mx="auto" mb={4}>
              <TrendingUp size={24} color="var(--chakra-colors-green-500)" />
            </Box>
            <Heading size="sm" mb={2}>More Bookings</Heading>
            <Text fontSize="sm" color="gray.600">
              Attract up to 3x more customers with boosted listings
            </Text>
          </CardBody>
        </Card>

        <Card shadow="sm" textAlign="center">
          <CardBody p={6}>
            <Box p={3} bg="purple.50" borderRadius="full" w="fit-content" mx="auto" mb={4}>
              <Star size={24} color="var(--chakra-colors-purple-500)" />
            </Box>
            <Heading size="sm" mb={2}>Premium Placement</Heading>
            <Text fontSize="sm" color="gray.600">
              Stand out from competitors with priority positioning
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList mb={6}>
          <Tab fontWeight="semibold">New Campaign</Tab>
          <Tab fontWeight="semibold">Active Campaigns</Tab>
          <Tab fontWeight="semibold">Campaign History</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <VStack spacing={8} align="stretch">
              {/* Profile Preview Card */}
              <Card shadow="sm">
                <CardHeader>
                  <Heading size="md">Profile Preview</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    This is how your boosted profile will appear to customers
                  </Text>
                </CardHeader>
                <CardBody>
                  <Flex align="center" p={4} bg="gradient-to-r from-blue.50 to-purple.50" borderRadius="lg" border="2px solid" borderColor="blue.200">
                    <Avatar
                      src="https://via.placeholder.com/80"
                      name="Kingsley Okafor"
                      size="lg"
                      mr={4}
                      border="3px solid"
                      borderColor="blue.400"
                    />
                    <Box flex={1}>
                      <Flex align="center" mb={2}>
                        <Heading as="h3" size="md" fontWeight="bold" mr={2}>
                          Kingsley Okafor
                        </Heading>
                        <Badge colorScheme="blue" px={2} py={1} borderRadius="full" fontSize="xs">
                          BOOSTED
                        </Badge>
                      </Flex>
                      <Text color="gray.600" fontSize="sm" mb={2}>
                        LAGOS, NIGERIA
                      </Text>
                      <HStack fontSize="sm" color="gray.500" spacing={4}>
                        <Text>09012345678</Text>
                        <Text>sales@costa.com</Text>
                      </HStack>
                    </Box>
                    <VStack align="end" spacing={1}>
                      <Badge colorScheme="green" variant="solid">Featured</Badge>
                      <Text fontSize="xs" color="gray.500">Top Result</Text>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>

              {/* Boost Options */}
              <Card shadow="sm">
                <CardHeader>
                  <Heading size="md">Choose Your Boost Package</Heading>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Select the promotion options that work best for your business
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Visibility Boost */}
                    <Box p={4} border="2px solid" borderColor={selectedBoosts.visibility ? "blue.300" : "gray.200"} borderRadius="lg" bg={selectedBoosts.visibility ? "blue.50" : "white"}>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Checkbox
                          isChecked={selectedBoosts.visibility}
                          onChange={() => handleBoostToggle("visibility")}
                          colorScheme="blue"
                          size="lg"
                        >
                          <Box ml={3}>
                            <Text fontWeight="semibold" fontSize="md">Visibility Boost</Text>
                            <Text fontSize="sm" color="gray.600">Appears in the homepage carousel and featured sections</Text>
                          </Box>
                        </Checkbox>
                        <VStack align="end" spacing={1}>
                          <Select
                            value={durations.visibility}
                            onChange={(e) => handleDurationChange("visibility", e.target.value)}
                            w="120px"
                            size="sm"
                          >
                            <option value="1 day">1 day</option>
                            <option value="2 days">2 days</option>
                            <option value="3 days">3 days</option>
                            <option value="7 days">7 days</option>
                          </Select>
                          <Text fontSize="xs" color="gray.500">₦5,000/day</Text>
                        </VStack>
                      </Flex>
                    </Box>

                    {/* Homepage Featured */}
                    <Box p={4} border="2px solid" borderColor={selectedBoosts.homepage ? "blue.300" : "gray.200"} borderRadius="lg" bg={selectedBoosts.homepage ? "blue.50" : "white"}>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Checkbox
                          isChecked={selectedBoosts.homepage}
                          onChange={() => handleBoostToggle("homepage")}
                          colorScheme="blue"
                          size="lg"
                        >
                          <Box ml={3}>
                            <Text fontWeight="semibold" fontSize="md">Homepage Featured</Text>
                            <Text fontSize="sm" color="gray.600">Ranks in the top 5 search results consistently</Text>
                          </Box>
                        </Checkbox>
                        <VStack align="end" spacing={1}>
                          <Select
                            value={durations.homepage}
                            onChange={(e) => handleDurationChange("homepage", e.target.value)}
                            w="120px"
                            size="sm"
                          >
                            <option value="5 days">5 days</option>
                            <option value="10 days">10 days</option>
                            <option value="15 days">15 days</option>
                            <option value="30 days">30 days</option>
                          </Select>
                          <Text fontSize="xs" color="gray.500">₦3,000/day</Text>
                        </VStack>
                      </Flex>
                    </Box>

                    {/* Search Top Spot */}
                    <Box p={4} border="2px solid" borderColor={selectedBoosts.search ? "blue.300" : "gray.200"} borderRadius="lg" bg={selectedBoosts.search ? "blue.50" : "white"}>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Checkbox
                          isChecked={selectedBoosts.search}
                          onChange={() => handleBoostToggle("search")}
                          colorScheme="blue"
                          size="lg"
                        >
                          <Box ml={3}>
                            <Text fontWeight="semibold" fontSize="md">Search Top Spot</Text>
                            <Text fontSize="sm" color="gray.600">Listed in a dedicated trending section with premium badge</Text>
                          </Box>
                        </Checkbox>
                        <VStack align="end" spacing={1}>
                          <Select
                            value={durations.search}
                            onChange={(e) => handleDurationChange("search", e.target.value)}
                            w="120px"
                            size="sm"
                          >
                            <option value="0 days">0 days</option>
                            <option value="3 days">3 days</option>
                            <option value="7 days">7 days</option>
                            <option value="14 days">14 days</option>
                          </Select>
                          <Text fontSize="xs" color="gray.500">₦7,000/day</Text>
                        </VStack>
                      </Flex>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Promo Code & Checkout */}
              <Card shadow="sm">
                <CardBody>
                  <VStack spacing={6}>
                    {/* Promo Code */}
                    <Flex gap={4} w="full" direction={{ base: "column", md: "row" }}>
                      <Input placeholder="Enter Promo Code" borderColor="gray.300" flex={1} />
                      <Button colorScheme="blue" variant="outline" minW={{ base: "full", md: "120px" }}>
                        Apply Code
                      </Button>
                    </Flex>

                    <Divider />

                    {/* Total */}
                    <Flex justify="space-between" align="center" w="full" p={4} bg="gray.50" borderRadius="lg">
                      <Text fontSize="xl" fontWeight="bold" color="gray.900">
                        Total Campaign Cost:
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        ₦{totalAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </Text>
                    </Flex>

                    {/* Action Buttons */}
                    <HStack spacing={4} w="full">
                      <Button
                        colorScheme="green"
                        size="lg"
                        flex={1}
                        h="50px"
                        leftIcon={<Zap size={20} />}
                        bg="green.500"
                        _hover={{ bg: "green.600" }}
                      >
                        Launch Campaign
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        flex={1}
                        h="50px"
                        colorScheme="gray"
                      >
                        Save as Draft
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <Box textAlign="center" py={12}>
              <TrendingUp size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg" mb={2}>No active campaigns</Text>
              <Text color="gray.400" fontSize="sm">
                Your active boost campaigns will appear here
              </Text>
            </Box>
          </TabPanel>

          <TabPanel>
            <Box textAlign="center" py={12}>
              <Star size={48} color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px" }} />
              <Text color="gray.500" fontSize="lg" mb={2}>No campaign history</Text>
              <Text color="gray.400" fontSize="sm">
                Your completed campaigns will be listed here
              </Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default BoostProfile

