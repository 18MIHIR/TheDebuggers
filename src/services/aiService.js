const axios = require('axios');
require('dotenv').config();

async function predictSpoilage({ crop, quantity, temp, humidity }) {
  try {
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/predict-spoilage`, {
      crop: crop,
      quantity_kg: quantity,
      temperature_c: temp || 30,
      humidity_pct: humidity || 75,
    });
    return response.data;
  } catch (err) {
    // If AI service is not running yet, return a default prediction
    console.log('AI service not available, using default prediction');
    return {
      shelf_hours: 24,
      risk: 'MEDIUM',
      crop: crop
    };
  }
}

module.exports = { predictSpoilage };