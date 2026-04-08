import {
  Box, Button, Checkbox, FormControl, FormLabel,
  Input, Stack, Switch, Textarea, VStack, Heading,
  Image, Tabs, TabList, TabPanels, Tab, TabPanel,
  IconButton, Select, Avatar, HStack, Text, Divider,
} from "@chakra-ui/react";
import { useState, useEffect, useContext } from "react";
import { FaUpload } from "react-icons/fa";
import { Outlet } from 'react-router-dom';
import BusinessProfile from './BusinessProfile';
import LocationSettings from './LocationSettings';
import { objectifyJSON } from '../../../../utils';
import { GlobalStore } from '../../../../contexts/GlobalStore';


const DealershipSettings = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("manager");
  const [team, setTeam] = useState([]);
  const [notif, setNotif] = useState({
    product_updates: true,
    listing_activity: true,
    new_messages: true,
    payouts: true,
    marketing: false,
  });
  const [integrations, setIntegrations] = useState({
    webhook_url: "",
    slack_webhook: "",
    api_key: "",
  });

  return (
    <VStack spacing={6} align="stretch" p={6} w="100%" mx="auto">
      <Heading size="lg">Dealership Settings</Heading>

      <Tabs variant="enclosed">
        <TabList>
          <Tab fontWeight="600">Profile</Tab>
          <Tab fontWeight="600">Location</Tab>
          <Tab fontWeight="600">Team</Tab>
          <Tab fontWeight="600">Notifications</Tab>
          <Tab fontWeight="600">Integrations</Tab>
          <Tab fontWeight="600">Security</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BusinessProfile />
          </TabPanel>

          <TabPanel>
            <LocationSettings />
          </TabPanel>

          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Team members</Heading>
              <HStack align="end" spacing={3} flexWrap="wrap">
                <FormControl maxW="320px">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@company.com" />
                </FormControl>
                <FormControl maxW="200px">
                  <FormLabel>Role</FormLabel>
                  <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option value="manager">Manager</option>
                    <option value="sales">Sales</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                </FormControl>
                <Button onClick={() => {
                  if (!inviteEmail) return;
                  setTeam([...team, { email: inviteEmail, role: inviteRole }]);
                  setInviteEmail("");
                }} colorScheme="blue">Invite</Button>
              </HStack>

              <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
                <VStack align="stretch" spacing={3}>
                  {team.length === 0 && <Text color="gray.500">No team members yet.</Text>}
                  {team.map((m, i) => (
                    <HStack key={`${m.email}-${i}`} justify="space-between">
                      <HStack>
                        <Avatar name={m.email} size="sm" />
                        <Text>{m.email}</Text>
                      </HStack>
                      <HStack>
                        <Select size="sm" value={m.role} onChange={(e) => {
                          const t = [...team];
                          t[i].role = e.target.value;
                          setTeam(t);
                        }}>
                          <option value="manager">Manager</option>
                          <option value="sales">Sales</option>
                          <option value="viewer">Viewer</option>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => {
                          const t = [...team];
                          t.splice(i,1);
                          setTeam(t);
                        }}>Remove</Button>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Email notifications</Heading>
              <Stack>
                <HStack justify="space-between">
                  <Text>Product updates</Text>
                  <Switch isChecked={notif.product_updates} onChange={(e) => setNotif({ ...notif, product_updates: e.target.checked })} />
                </HStack>
                <HStack justify="space-between">
                  <Text>Listing activity</Text>
                  <Switch isChecked={notif.listing_activity} onChange={(e) => setNotif({ ...notif, listing_activity: e.target.checked })} />
                </HStack>
                <HStack justify="space-between">
                  <Text>New messages</Text>
                  <Switch isChecked={notif.new_messages} onChange={(e) => setNotif({ ...notif, new_messages: e.target.checked })} />
                </HStack>
                <HStack justify="space-between">
                  <Text>Payouts</Text>
                  <Switch isChecked={notif.payouts} onChange={(e) => setNotif({ ...notif, payouts: e.target.checked })} />
                </HStack>
                <HStack justify="space-between">
                  <Text>Marketing</Text>
                  <Switch isChecked={notif.marketing} onChange={(e) => setNotif({ ...notif, marketing: e.target.checked })} />
                </HStack>
              </Stack>
              <HStack>
                <Button colorScheme="blue">Save</Button>
              </HStack>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Integrations</Heading>
              <FormControl>
                <FormLabel>Webhook URL</FormLabel>
                <Input value={integrations.webhook_url} onChange={(e) => setIntegrations({ ...integrations, webhook_url: e.target.value })} placeholder="https://example.com/webhook" />
              </FormControl>
              <FormControl>
                <FormLabel>Slack webhook</FormLabel>
                <Input value={integrations.slack_webhook} onChange={(e) => setIntegrations({ ...integrations, slack_webhook: e.target.value })} placeholder="https://hooks.slack.com/services/..." />
              </FormControl>
              <FormControl>
                <FormLabel>API Key</FormLabel>
                <Input value={integrations.api_key} onChange={(e) => setIntegrations({ ...integrations, api_key: e.target.value })} placeholder="••••••" type="password" />
              </FormControl>
              <HStack>
                <Button colorScheme="blue">Save</Button>
              </HStack>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Security</Heading>
              <FormControl>
                <FormLabel>Change password</FormLabel>
                <HStack>
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                </HStack>
              </FormControl>
              <HStack>
                <Button colorScheme="blue">Update password</Button>
              </HStack>
              <Divider />
              <Heading size="sm">Billing & Payouts</Heading>
              <Text color="gray.600">Manage billing and payout accounts in Wallet settings.</Text>
              <HStack>
                <Button as="a" href="/dashboard/wallet" variant="outline">Open Wallet</Button>
              </HStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default DealershipSettings;
