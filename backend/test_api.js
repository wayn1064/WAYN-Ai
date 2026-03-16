const axios = require('axios');

async function testApi() {
  const PROD_URL = 'https://wayn-ai-backend-585555077661.asia-northeast3.run.app';
  
  const testEmail = `test_${Date.now()}@example.com`;
  
  // 1. Create registration
  try {
    const resCreate = await axios.post(`${PROD_URL}/api/registrations`, {
      hospitalName: 'Test Hospital',
      ceoName: 'Test CEO',
      contactNumber: '010-1234-5678',
      email: testEmail,
      password: 'password123',
      businessRegistrationNumber: '111-22-33333',
      address: 'Seoul',
      accessibleMenus: ['director', 'clinic', 'desk'],
      status: 'PENDING'
    });
    console.log('Create Response:', resCreate.status, 'ID:', resCreate.data.data.approval.id);
  } catch (err) {
    console.error('Create Error:', err.response ? err.response.data : err.message);
  }

  // 2. Fetch registrations
  try {
    const resGet = await axios.get(`${PROD_URL}/api/registrations`);
    const myReq = resGet.data.data.find(r => r.email === testEmail);
    console.log('Fetched Registration accessibleMenus:', JSON.stringify(myReq.accessibleMenus));
  } catch (err) {
    console.error('Get Error:', err.response ? err.response.data : err.message);
  }
}

testApi();
