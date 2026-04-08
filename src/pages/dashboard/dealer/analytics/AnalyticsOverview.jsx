import {
  Box, Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Select,
  Flex,
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
import {GlobalStore} from '../../../../contexts/GlobalStore';
import {objectifyJSON, jsonifyObject} from '../../../../utils';
import { useState, useContext, useEffect, useRef} from 'react';



// **Register the required components**
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);



// import "chart.js/auto";


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: { display: true, grid: { display: false } },
    y: { display: true },
  },
  elements: {
    bar: {
      borderRadius: 8, // Makes the bars rounded
    }
  }
};



export default function AnalyticsDashboard() {
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
    try{
      const res = await axios.get('/admin/dealership/analytics/?charts=all')
      const data = objectifyJSON(res.data);
      if (res.status === 200){
        console.log("Analytics Data:", data.data);
        setChartsData(data.data || {});
      }else{
        notify({ title: 'An error occured', body: data?.message, color: 'red' })
      }
    }catch(error){
      notify({ title: 'Failed to load analytics', body: error?.message, color: 'red' });
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
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold">Analytics Dashboard</Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} my={5}>
        <Stat>
          <StatLabel>Total Revenue</StatLabel>
          <StatNumber>
            ₦{Number(chartsData?.revenue?.amount || 0).toLocaleString()}
          </StatNumber>
          {/*<StatHelpText>
            <StatArrow type="increase" /> 10% increase this month
          </StatHelpText>*/}
        </Stat>
      </SimpleGrid>

      <Box my={5} height="300px">
         {Array.isArray(chartsData?.revenue?.chart_data?.datasets)
            ? <Bar data={chartsData.revenue.chart_data} options={chartOptions} />
            : Array.isArray(chartsData?.revenue_chart?.datasets)
              ? <Bar data={chartsData.revenue_chart} options={chartOptions} />
              : <Flex align="center" justify="center" h="100%" color="gray.500">No revenue chart data</Flex>}
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} my={5}>
        <Stat borderColor="gray.200" px={5} py={5} borderRadius="lg" borderWidth={2}>
          <StatLabel>Fulfilled Orders</StatLabel>
          <StatNumber>{chartsData?.orders?.fulfilled || 0}</StatNumber>
        </Stat>
        <Stat borderColor="gray.200" px={5} py={5} borderRadius="lg" borderWidth={2}>
          <StatLabel>Pending Orders </StatLabel>
          <StatNumber>{chartsData?.orders?.pending || 0}</StatNumber>
        </Stat>
        <Stat borderColor="gray.200" px={5} py={5} borderRadius="lg" borderWidth={2}>
          <StatLabel>Canceled Orders</StatLabel>
          <StatNumber>{chartsData?.orders?.cancelled || 0}</StatNumber>
        </Stat>
      </SimpleGrid>

      <Stat>
        <StatLabel>Total Deals</StatLabel>
        <StatNumber>{Number(chartsData?.deals?.count || 0).toLocaleString()}</StatNumber>
        {/*<StatHelpText>
          <StatArrow type="decrease" /> 13% decrease this month
        </StatHelpText>*/}
      </Stat>

      <Box my={5} height="300px">
        {Array.isArray(chartsData?.sales?.chart_data?.datasets)
          ? <Line data={chartsData.sales.chart_data} options={chartOptions} />
          : Array.isArray(chartsData?.sales_chart?.datasets)
            ? <Line data={chartsData.sales_chart} options={chartOptions} />
            : <Flex align="center" justify="center" h="100%" color="gray.500">No sales chart data</Flex>}
      </Box>

    </Box>
  );
}
