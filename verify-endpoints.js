
const axios = require('axios');

const BASE_URL = 'https://dev.veyu.autos/api/v1';

async function testEndpoints() {
  console.log('Testing Listing Endpoints...');
  
  try {
    // 1. Get Buy Listings to get an ID
    console.log('\n1. Fetching Buy Listings...');
    const listRes = await axios.get(`${BASE_URL}/listings/buy/`);
    
    if (listRes.status === 200) {
      const data = listRes.data;
      const results = data.data?.results || data.results || [];
      
      if (results.length > 0) {
        const firstListing = results[0];
        const id = firstListing.uuid || firstListing.id;
        console.log('Testing with Listing ID:', id);
        
        // 4. Test Search by ID
        console.log(`\n4. Fetching Search with q=${id}...`);
        try {
            const searchRes = await axios.get(`${BASE_URL}/listings/find/?q=${id}`);
            console.log('Search Status:', searchRes.status);
            const searchResults = searchRes.data?.data?.results || searchRes.data?.results || [];
            console.log(`Search Found ${searchResults.length} results`);
            if (searchResults.length > 0) {
                console.log('First result ID:', searchResults[0].uuid);
            }
        } catch (searchErr) {
            console.log('Search Failed:', searchErr.response?.status);
        }

      }
    }
  } catch (err) {
    console.error('List Fetch Failed:', err.response?.status, err.message);
  }
}

testEndpoints();
