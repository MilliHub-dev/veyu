import {
  Box, Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Select,
  Flex, Heading, Card, CardBody, CardHeader, Container, HStack,
  useColorModeValue, VStack, Divider,
} from "@chakra-ui/react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {GlobalStore} from '../../../App';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import { useState, useContext, useEffect, useRef} from 'react';
import { TrendingUp, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';



// **Register the required components**
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);



// import "chart.js/auto";


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { 
      display: false 
    },
    tooltip: { 
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
    }
  },
  scales: {
    x: { 
      display: true, 
      grid: { display: false },
      ticks: { color: '#6B7280' }
    },
    y: { 
      display: true,
      grid: { color: 'rgba(107, 114, 128, 0.1)' },
      ticks: { color: '#6B7280' }
    },
  },
  elements: {
    bar: {
      borderRadius: 8,
    }
  }
};

// Modern Stat Card Component
const ModernStatCard = ({ title, value, icon: IconComponent, color = "blue", change }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Card bg={bgColor} borderColor={borderColor} shadow="sm" _hover={{ shadow: "md", transform: "translateY(-2px)" }} transition="all 0.2s">
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
              {title}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              {value}
            </Text>
          </Box>
          <Box p={3} bg={`${color}.50`} borderRadius="lg">
            <IconComponent size={20} color={`var(--chakra-colors-${color}-500)`} />
          </Box>
        </Flex>
        
        {change && (
          <Stat>
            <StatHelpText>
              <Flex align="center">
                <StatArrow type={change > 0 ? "increase" : "decrease"} />
                <Text as="span" fontSize="sm" color={change > 0 ? "green.500" : "red.500"} fontWeight="medium" mr={1}>
                  {change > 0 ? "+" : ""}{change}%
                </Text>
                <Text as="span" fontSize="sm" color="gray.500">
                  this month
                </Text>
              </Flex>
            </StatHelpText>
          </Stat>
        )}
      </CardBody>
    </Card>
  );
};



export default function MechanicAnalytics() {
  const [charts, setCharts] = useState({});
  const [loading, setLoadingState] = useState(true);
  const [chartsData, setChartsData] = useState({
    revenue_chart: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",],
      datasets: [{
        label: "Revenue",
        data: [0, 0, 0, 0, 0, 0, 0, null, null, null, null, null],
        backgroundColor: "#3182CE",
      }],
    },
    sales_chart: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Deals",
        data: [0, 0, 0, 0, 0, 0, 0, null, null, null, null, null],
        borderColor: "#E53E3E",
        fill: false,
      }],
    }
  });
  const {axios, notify} = useContext(GlobalStore);

  async function getChartData(){
    const res = await axios.get('/admin/mechanics/analytics/?charts=all')
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      console.log("Analytics Data:", data.data);
      setChartsData(data.data);
    }else{
      notify({
        title: 'An error occured',
        body: data?.message,
        color: 'red'
      })
    }

  }

  function makeCharts(){

  }


  function init(){
    getChartData();
    setTimeout(() => setLoadingState(false), 2000)
  }

  useEffect(() => {
    init();
  }, [])


  if (loading){
    return null
  }

  return (
    <Container maxW="7xl" py={8}>
      {/* Modern Header */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={2}>
          <Box>
            <Heading as="h1" size="xl" color="gray.900" mb={2}>
              Analytics Dashboard
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Track your business performance and growth metrics
            </Text>
          </Box>
          <HStack>
            <Select size="sm" defaultValue="30" maxW="120px">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
            <Button colorScheme="blue" size="sm" leftIcon={<BarChart3 size={16} />}>
              Export
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Revenue Overview */}
      <Card mb={8} shadow="sm">
        <CardHeader>
          <Heading size="md" color="gray.900">Revenue Overview</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
            <ModernStatCard
              title="Total Revenue"
              value={`₦${parseInt(chartsData?.revenue?.amount || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
              change={15}
            />
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Job Statistics */}
      <Card mb={8} shadow="sm">
        <CardHeader>
          <Heading size="md" color="gray.900">Job Statistics</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <ModernStatCard
              title="Total Hires"
              value={chartsData?.jobs?.hires || 0}
              icon={Users}
              color="blue"
              change={8}
            />
            <ModernStatCard
              title="Pending Requests"
              value={chartsData?.jobs?.pending || 0}
              icon={Calendar}
              color="orange"
              change={-5}
            />
            <ModernStatCard
              title="Canceled Jobs"
              value={chartsData?.jobs?.canceled || 0}
              icon={TrendingUp}
              color="red"
              change={-12}
            />
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Revenue Chart */}
      <Card shadow="sm">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" color="gray.900">Revenue Trends</Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>
                Monthly revenue breakdown
              </Text>
            </Box>
            <Select size="sm" defaultValue="revenue" maxW="150px">
              <option value="revenue">Revenue</option>
              <option value="bookings">Bookings</option>
              <option value="customers">Customers</option>
            </Select>
          </Flex>
        </CardHeader>
        <CardBody>
          <Box height="400px">
            <Bar data={{...chartsData?.revenue?.chart_data}} options={chartOptions} />
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
}

