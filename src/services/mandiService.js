const axios = require('axios');

// Crop name mappings for Agmarknet API
const CROP_MAPPINGS = {
  'TOMATO': 'Tomato',
  'POTATO': 'Potato',
  'ONION': 'Onion',
  'MANGO': 'Mango',
  'APPLE': 'Apple',
  'BANANA': 'Banana',
  'CAULIFLOWER': 'Cauliflower',
  'GRAPE': 'Grapes'
};

// Fallback prices based on seasonal averages (June 2026)
const FALLBACK_PRICES = {
  'TOMATO':      { min: 800,  max: 1800, avg: 1200, unit: 'per quintal' },
  'POTATO':      { min: 600,  max: 1200, avg: 900,  unit: 'per quintal' },
  'ONION':       { min: 400,  max: 1200, avg: 700,  unit: 'per quintal' },
  'MANGO':       { min: 2000, max: 5000, avg: 3000, unit: 'per quintal' },
  'APPLE':       { min: 4000, max: 8000, avg: 6000, unit: 'per quintal' },
  'BANANA':      { min: 1000, max: 2500, avg: 1500, unit: 'per quintal' },
  'CAULIFLOWER': { min: 400,  max: 1200, avg: 700,  unit: 'per quintal' },
  'GRAPE':       { min: 3000, max: 7000, avg: 4500, unit: 'per quintal' },
};

async function getMandiRates(crop, location) {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;
    
    if (!apiKey) {
      return getFallbackRates(crop, location);
    }

    const cropName = CROP_MAPPINGS[crop.toUpperCase()] || crop;
    
    const response = await axios.get(
      'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      {
        params: {
          'api-key': apiKey,
          'format': 'json',
          'limit': 10,
          'filters[State]': 'Madhya Pradesh',
          'filters[Commodity]': cropName,
        },
        timeout: 8000
      }
    );

    if (response.data && response.data.records && response.data.records.length > 0) {
      const records = response.data.records;
      const prices = records.map(r => ({
        market: r.Market,
        district: r.District,
        minPrice: parseFloat(r.Min_Price),
        maxPrice: parseFloat(r.Max_Price),
        modalPrice: parseFloat(r.Modal_Price),
        date: r.Arrival_Date
      }));

      // Find best market
      const bestMarket = prices.reduce((best, p) =>
        p.modalPrice > best.modalPrice ? p : best
      , prices[0]);

      return {
        success: true,
        crop,
        prices,
        bestMarket,
        localPrice: prices[0],
        source: 'Agmarknet Live'
      };
    }

    return getFallbackRates(crop, location);

  } catch (err) {
    console.log(`Mandi API error: ${err.message}`);
    return getFallbackRates(crop, location);
  }
}

function getFallbackRates(crop, location) {
  const rates = FALLBACK_PRICES[crop.toUpperCase()] || 
                { min: 500, max: 2000, avg: 1000, unit: 'per quintal' };
  
  // Simulate local vs city price difference
  const localPrice = rates.avg;
  const cityPrice = Math.round(rates.avg * 1.25);
  const coldStoredPrice = Math.round(rates.avg * 1.45);

  return {
    success: false,
    crop,
    source: 'Estimated (seasonal average)',
    localPrice: { modalPrice: localPrice, market: location },
    bestMarket: { modalPrice: cityPrice, market: 'Bhopal' },
    coldStoredPrice,
    priceAdvice: getPriceAdvice(crop, localPrice, cityPrice, coldStoredPrice)
  };
}

function getPriceAdvice(crop, local, city, stored) {
  const cityGain = city - local;
  const storageGain = stored - local;
  
  if (storageGain > cityGain) {
    return {
      recommendation: 'STORE',
      message: `Store for 2-3 weeks → sell at ₹${stored}/qtl (earn ₹${storageGain} more per quintal)`
    };
  } else {
    return {
      recommendation: 'SELL_CITY',
      message: `Sell in Bhopal now → ₹${city}/qtl (earn ₹${cityGain} more than local mandi)`
    };
  }
}

module.exports = { getMandiRates, getFallbackRates };