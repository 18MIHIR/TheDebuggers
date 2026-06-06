const axios = require('axios');
require('dotenv').config();

const LOCATION_COORDS = {
  'SEHORE':       { lat: 23.1920, lon: 77.0846 },
  'VIDISHA':      { lat: 23.5251, lon: 77.8096 },
  'HOSHANGABAD':  { lat: 22.7512, lon: 77.7266 },
  'RAISEN':       { lat: 23.3316, lon: 77.7879 },
  'BHOPAL':       { lat: 23.2599, lon: 77.4126 },
  'INDORE':       { lat: 22.7196, lon: 75.8577 },
  'GWALIOR':      { lat: 26.2183, lon: 78.1828 },
  'JABALPUR':     { lat: 23.1815, lon: 79.9864 },
  'UJJAIN':       { lat: 23.1765, lon: 75.7885 },
  'DEWAS':        { lat: 22.9623, lon: 76.0516 },
  'ASHTA':        { lat: 23.0195, lon: 76.9192 },
  'NASRULLAGANJ': { lat: 22.6870, lon: 77.2567 },
  'SANCHI':       { lat: 23.4793, lon: 77.7350 },
  'MANDIDEEP':    { lat: 23.1038, lon: 77.5422 },
};

async function getWeatherForLocation(location) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_actual_key_here') {
      console.log('OpenWeather API key not set, using defaults');
      return getDefaultWeather(location);
    }

    // Check if we have coords for this location
    const coords = LOCATION_COORDS[location.toUpperCase()];
    
    let url;
    if (coords) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${location},IN&appid=${apiKey}&units=metric`;
    }

    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data;

    return {
      temp: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like * 10) / 10,
      description: data.weather[0].description,
      windSpeed: data.wind.speed,
      location: data.name,
      success: true
    };
  } catch (err) {
    console.log(`Weather API error for ${location}: ${err.message}`);
    return getDefaultWeather(location);
  }
}

function getDefaultWeather(location) {
  // Realistic defaults for MP in June (summer)
  return {
    temp: 38,
    humidity: 45,
    feelsLike: 40,
    description: 'hot and dry',
    windSpeed: 12,
    location: location,
    success: false,
    note: 'Default values — OpenWeather API unavailable'
  };
}

module.exports = { getWeatherForLocation };