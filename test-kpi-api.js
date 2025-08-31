const fetch = require('node-fetch')

async function testKpiApi() {
  try {
    console.log('Testing KPI API directly...')
    
    // Test the KPI API endpoint
    const response = await fetch('http://localhost:3000/api/kpis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail due to authentication, but we can see the response
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const data = await response.text()
    console.log('Response body:', data)
    
    if (response.status === 401) {
      console.log('\n✓ API requires authentication (expected)')
    } else if (response.ok) {
      console.log('\n✓ API returned data successfully')
      try {
        const jsonData = JSON.parse(data)
        console.log('Parsed JSON:', jsonData)
      } catch (e) {
        console.log('Could not parse as JSON')
      }
    } else {
      console.log('\n✗ Unexpected response status')
    }
    
  } catch (error) {
    console.error('Error testing KPI API:', error.message)
  }
}

testKpiApi()