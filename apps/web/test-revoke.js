const fetch = require('node-fetch');

async function testRevoke() {
  try {
    const response = await fetch('http://localhost:3000/api/revoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=your-session-token' // You'll need to get this from browser
      },
      body: JSON.stringify({
        docHash: '0xabb936ab2c2d53d95d6bfa390e6e8ff8065f207cc4ca1836f484373c18b02556',
        wallet: '0x9b3B275B3934571729d4528499BE268B15F80c5e'
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRevoke();