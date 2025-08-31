require('dotenv').config({ path: '.env.local' });

async function testVerifyAPI() {
  try {
    console.log('Testing VERIFY activity API call...');
    
    const testData = {
      type: 'VERIFY',
      docHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'success'
    };
    
    console.log('Sending request with data:', testData);
    
    const response = await fetch('http://localhost:3000/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ VERIFY activity API call successful!');
    } else {
      console.log('❌ VERIFY activity API call failed:', responseData);
    }
    
  } catch (error) {
    console.error('❌ Error testing VERIFY API:', error);
  }
}

testVerifyAPI();