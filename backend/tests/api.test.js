import axios from 'axios';

const API_URL = 'http://localhost:5002';

// Test response format
const validatePetitionFormat = (petition) => {
  const requiredFields = [
    'petition_id',
    'status',
    'petition_title',
    'petition_text',
    'petitioner',
    'signatures',
    'response'
  ];

  requiredFields.forEach(field => {
    if (!(field in petition)) {
      throw new Error(`Missing required field: ${field}`);
    }
  });

  // Validate types
  if (typeof petition.petition_id !== 'string') throw new Error('petition_id should be string');
  if (!['open', 'closed'].includes(petition.status)) throw new Error('Invalid status');
  if (typeof petition.petition_title !== 'string') throw new Error('petition_title should be string');
  if (typeof petition.petition_text !== 'string') throw new Error('petition_text should be string');
  if (typeof petition.petitioner !== 'string') throw new Error('petitioner should be string');
  if (typeof petition.signatures !== 'string') throw new Error('signatures should be string');
  if (typeof petition.response !== 'string') throw new Error('response should be string');
};

const runTests = async () => {
  try {
    console.log('Starting API Tests...\n');

    // Test 1: GET /slpp/petitions
    console.log('Test 1: GET /slpp/petitions');
    const allPetitionsResponse = await axios.get(`${API_URL}/slpp/petitions`);
    console.log('Status:', allPetitionsResponse.status === 200 ? '✅ 200 OK' : '❌ Failed');
    console.log('Has petitions array:', Array.isArray(allPetitionsResponse.data.petitions) ? '✅ Yes' : '❌ No');
    
    if (allPetitionsResponse.data.petitions.length > 0) {
      console.log('Validating petition format...');
      validatePetitionFormat(allPetitionsResponse.data.petitions[0]);
      console.log('Format validation: ✅ Passed\n');
    }

    // Test 2: GET /slpp/petitions?status=open
    console.log('Test 2: GET /slpp/petitions?status=open');
    const openPetitionsResponse = await axios.get(`${API_URL}/slpp/petitions?status=open`);
    console.log('Status:', openPetitionsResponse.status === 200 ? '✅ 200 OK' : '❌ Failed');
    console.log('Has petitions array:', Array.isArray(openPetitionsResponse.data.petitions) ? '✅ Yes' : '❌ No');
    
    // Verify all returned petitions are open
    const allOpen = openPetitionsResponse.data.petitions.every(p => p.status === 'open');
    console.log('All petitions are open:', allOpen ? '✅ Yes' : '❌ No');

    if (openPetitionsResponse.data.petitions.length > 0) {
      console.log('Validating petition format...');
      validatePetitionFormat(openPetitionsResponse.data.petitions[0]);
      console.log('Format validation: ✅ Passed\n');
    }

    console.log('All tests completed successfully! ✅');

  } catch (error) {
    console.error('Test failed ❌');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Run the tests
runTests();