const axios = require('axios');

const BASE_URL = 'http://localhost:3005/api';
let authToken;

const testUser = {
  email: 'test@example.com',
  password: 'test123',
  name: 'Test User',
  postcode: 'SW1A 1AA',
  preferredSupermarket: 'tesco',
  useMetric: true
};

async function runTests() {
  console.log('\n🚀 Starting API Tests\n');

  try {
    // 1. Test User Registration
    console.log('1️⃣ Testing User Registration');
    try {
      console.log('Sending registration request:', testUser);
      const registerResponse = await axios.post(`${BASE_URL}/users/register`, testUser);
      console.log('✓ Registration successful');
      console.log('User:', registerResponse.data.user);
      authToken = registerResponse.data.token;
    } catch (error) {
      if (error.response?.data?.error === 'Email already registered') {
        console.log('ℹ User exists, trying login...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✓ Login successful');
        console.log('User:', loginResponse.data.user);
        authToken = loginResponse.data.token;
      } else {
        console.error('Registration/Login Error:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        throw error;
      }
    }

    // 2. Test User Profile
    console.log('\n2️⃣ Testing User Profile');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Profile retrieved');
    console.log('Profile:', profileResponse.data);

    // 3. Test Pantry Management
    console.log('\n3️⃣ Testing Pantry Management');

    // Add ingredients
    console.log('\nAdding ingredients:');
    const ingredients = [
      { ingredient: 'flour', quantity: 1000, unit: 'g', notes: 'All-purpose flour' },
      { ingredient: 'sugar', quantity: 500, unit: 'g', notes: 'White sugar' },
      { ingredient: 'eggs', quantity: 12, unit: 'piece', notes: 'Large eggs' }
    ];

    for (const ing of ingredients) {
      const addResponse = await axios.post(
        `${BASE_URL}/pantry/ingredients`,
        ing,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`✓ Added ${ing.ingredient}`);
    }

    // Get pantry contents
    console.log('\nGetting pantry contents:');
    const getResponse = await axios.get(
      `${BASE_URL}/pantry`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✓ Retrieved pantry contents');
    console.log('Pantry:', getResponse.data);

    // Check ingredients
    console.log('\nChecking ingredient availability:');
    const checkResponse = await axios.post(
      `${BASE_URL}/pantry/check-ingredients`,
      {
        ingredients: [
          { ingredient: 'flour', quantity: 500, unit: 'g' },
          { ingredient: 'sugar', quantity: 200, unit: 'g' }
        ]
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✓ Checked ingredients');
    console.log('Availability:', checkResponse.data);

    // Use ingredients
    console.log('\nUsing ingredients:');
    const useResponse = await axios.post(
      `${BASE_URL}/pantry/use-ingredients`,
      {
        ingredients: [
          { ingredient: 'flour', quantity: 300, unit: 'g' },
          { ingredient: 'sugar', quantity: 150, unit: 'g' }
        ]
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('✓ Used ingredients');
    console.log('Updated pantry:', useResponse.data);

    // Delete ingredient
    console.log('\nDeleting ingredients:');
    for (const ing of ingredients) {
      const deleteResponse = await axios.delete(
        `${BASE_URL}/pantry/ingredients/${encodeURIComponent(ing.ingredient)}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log(`✓ Deleted ${ing.ingredient}`);
    }

    console.log('\n✨ All tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received - server may be down');
    }
    process.exit(1);
  }
}

// Run the tests
runTests(); 