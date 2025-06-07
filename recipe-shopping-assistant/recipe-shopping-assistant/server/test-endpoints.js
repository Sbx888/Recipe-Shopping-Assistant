const axios = require('axios');

const BASE_URL = 'http://localhost:3005/api';
let authToken;

async function testEndpoints() {
  try {
    // 1. Try to register or login
    console.log('\nTesting user authentication...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/users/register`, {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User'
      });
      console.log('Registration successful:', registerResponse.data);
      authToken = registerResponse.data.token;
    } catch (error) {
      if (error.response?.data?.error === 'Email already registered') {
        console.log('User exists, trying to login...');
        const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
          email: 'test@example.com',
          password: 'test123'
        });
        console.log('Login successful:', loginResponse.data);
        authToken = loginResponse.data.token;
      } else {
        throw error;
      }
    }

    // 2. Test pantry endpoints
    console.log('\nTesting pantry endpoints...');
    
    // Add ingredients
    console.log('\nAdding ingredients to pantry...');
    const addResponse = await axios.post(
      `${BASE_URL}/pantry/ingredients`,
      {
        ingredient: 'flour',
        quantity: 1000,
        unit: 'g',
        notes: 'All-purpose flour'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Add ingredient response:', addResponse.data);

    // Get pantry
    console.log('\nGetting pantry contents...');
    const getResponse = await axios.get(
      `${BASE_URL}/pantry`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Get pantry response:', getResponse.data);

    // Check ingredients
    console.log('\nChecking ingredient availability...');
    const checkResponse = await axios.post(
      `${BASE_URL}/pantry/check-ingredients`,
      {
        ingredients: [
          { ingredient: 'flour', quantity: 500, unit: 'g' }
        ]
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Check ingredients response:', checkResponse.data);

    // Use ingredients
    console.log('\nUsing ingredients from pantry...');
    const useResponse = await axios.post(
      `${BASE_URL}/pantry/use-ingredients`,
      {
        ingredients: [
          { ingredient: 'flour', quantity: 500, unit: 'g' }
        ]
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Use ingredients response:', useResponse.data);

    // Delete ingredient
    console.log('\nDeleting ingredient from pantry...');
    const deleteResponse = await axios.delete(
      `${BASE_URL}/pantry/ingredients/${encodeURIComponent('flour')}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('Delete ingredient response:', deleteResponse.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEndpoints(); 