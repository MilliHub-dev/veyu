import {
  VStack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import BusinessProfile from "./BusinessProfile";
import LocationSettings from "./LocationSettings";

const MechanicSettings = () => {
  return (
    <VStack spacing={6} align="stretch" p={6} w="100%" mx="auto">
      <Heading size="lg">Mechanic Settings</Heading>

      <Tabs variant="enclosed">
        <TabList>
          <Tab fontWeight="600">Profile</Tab>
          <Tab fontWeight="600">Location</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BusinessProfile />
          </TabPanel>

          <TabPanel>
            <LocationSettings />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default MechanicSettings;
